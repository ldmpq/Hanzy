import * as dotenv from 'dotenv';
import readline from 'readline';
import { db } from '../config/database';
import {
  vocabularies, vocabularyMeanings, exampleSentences, exampleSentenceTranslations,
  characters, characterPronunciations, characterComponents, vocabularyCharacters,
  topics, vocabularyTopics, courses, lessons, decks, deckItems, quizzes, quizQuestions
} from '../shared/schema';
import { eq, isNull, isNotNull, and, asc, ilike, or } from 'drizzle-orm';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash-lite' });

const BATCH_SIZE = 20;
const DELAY_MS = 5000;
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const GITHUB_RAW_URL = 'https://raw.githubusercontent.com/drkameleon/complete-hsk-vocabulary/main/complete.json';
const MAKEMEAHANZI_URL = 'https://raw.githubusercontent.com/skishore/makemeahanzi/master/dictionary.txt';

const CORE_TOPICS = [
  "Giao tiếp & Giới thiệu", "Gia đình & Con người", "Thời gian & Số đếm",
  "Đời sống hằng ngày", "Ăn uống", "Học tập & Công việc",
  "Giao thông & Du lịch", "Mua sắm & Dịch vụ", "Giải trí & Sở thích",
  "Công nghệ", "Thiên nhiên & Địa điểm", "Cảm xúc & Miêu tả"
];

const hskConfigs = [
  { level: 1, totalWords: 500, units: 5, lessons: 25, wordsPerLesson: 20 },
  { level: 2, totalWords: 772, units: 8, lessons: 40, wordsPerLesson: 20 },
  { level: 3, totalWords: 973, units: 10, lessons: 50, wordsPerLesson: 20 },
  { level: 4, totalWords: 1000, units: 10, lessons: 50, wordsPerLesson: 20 },
  { level: 5, totalWords: 1071, units: 11, lessons: 55, wordsPerLesson: 20 },
  { level: 6, totalWords: 1140, units: 12, lessons: 60, wordsPerLesson: 20 },
  { level: 7, totalWords: 3697, units: 37, lessons: 185, wordsPerLesson: 20 },
  { level: 8, totalWords: 3697, units: 37, lessons: 185, wordsPerLesson: 20 },
  { level: 9, totalWords: 3698, units: 37, lessons: 185, wordsPerLesson: 20 },
];

const vocabCache: { id: number; simplified: string }[] = [];
const charIdCache = new Map<string, number>();

const generateSlug = (str: string) => {
  return str.toLowerCase()
    .normalize("NFD") 
    .replace(/[\u0300-\u036f]/g, "") 
    .replace(/đ/g, "d").replace(/Đ/g, "D") 
    .replace(/\s+/g, '-') 
    .replace(/[^a-z0-9-]/g, ''); 
};

// ============================================================================
// PHASE 1: DỌN DẸP DỮ LIỆU
// ============================================================================
async function step1_cleanDatabase() {
  console.log('\n[PHASE 1] 🗑️ Đang xoá sạch dữ liệu cũ...');
  // Xóa các bảng phụ thuộc trước để tránh lỗi Foreign Key
  await db.delete(quizQuestions);
  await db.delete(quizzes);
  await db.delete(deckItems);
  await db.delete(lessons);
  await db.delete(courses);
  await db.delete(decks);
  await db.delete(vocabularyTopics);
  await db.delete(topics); 
  await db.delete(exampleSentenceTranslations);
  await db.delete(exampleSentences);
  await db.delete(vocabularyMeanings);
  await db.delete(vocabularyCharacters);
  await db.delete(vocabularies);
  await db.delete(characterComponents);
  await db.delete(characterPronunciations);
  await db.delete(characters);
  console.log('✅ Đã xoá sạch cơ sở dữ liệu.\n');
}

// ============================================================================
// PHASE 2: NHẬP TỪ VỰNG (GITHUB)
// ============================================================================
async function step2_importVocabularies() {
  console.log('[PHASE 2] ⏳ Đang tải và nhập dataset từ vựng...');
  const response = await fetch(GITHUB_RAW_URL);
  if (!response.ok) throw new Error('Không thể tải dataset từ vựng');

  const rawData = await response.json();
  const items = Array.isArray(rawData) ? rawData : [];
  
  let successCount = 0;
  for (const item of items) {
    const simplifiedChar = item.simplified || 'N/A';
    const firstForm = (Array.isArray(item.forms) && item.forms.length > 0) ? item.forms[0] : {};
    const pinyinStr = firstForm.transcriptions?.pinyin || 'Chưa rõ';
    const englishMeaning = Array.isArray(firstForm.meanings) ? firstForm.meanings.join('; ') : '';
    
    let hskNumber = 1;
    if (Array.isArray(item.level)) {
      const targetLevelStr = item.level.find((l: any) => String(l).includes('new-')) || item.level[0] || '1';
      hskNumber = parseInt(String(targetLevelStr).match(/\d+/)?.[0] || '1', 10);
    }

    try {
      const [newVocab] = await db.insert(vocabularies).values({
        simplified: simplifiedChar,
        pinyin: pinyinStr,
        hskLevel: hskNumber,
      }).returning({ id: vocabularies.id });

      vocabCache.push({ id: newVocab.id, simplified: simplifiedChar }); 

      if (englishMeaning) {
        await db.insert(vocabularyMeanings).values({ vocabularyId: newVocab.id, languageCode: 'en', meaning: englishMeaning, displayOrder: 0 });
      }
      await db.insert(vocabularyMeanings).values({ vocabularyId: newVocab.id, languageCode: 'vi', meaning: 'Đang chờ AI...', displayOrder: 1 });

      successCount++;
      if (successCount % 200 === 0) process.stdout.write(`\rTiến độ: ${successCount}/${items.length}...`);
    } catch (err) {}
  }
  console.log(`\n🎉 Đã nhập ${successCount} từ vựng.\n`);
}

// ============================================================================
// PHASE 3: NHẬP HÁN TỰ CHUYÊN SÂU (MAKEMEAHANZI)
// ============================================================================
async function step3_importHanzi() {
  console.log('[PHASE 3] ⏳ Đang phân tích Hán tự từ MakeMeAHanzi...');
  const charResponse = await fetch(MAKEMEAHANZI_URL);
  const lines = (await charResponse.text()).split('\n').filter(l => l.trim() !== '');
  
  const batchSize = 100; 
  let count = 0;

  for (let i = 0; i < lines.length; i += batchSize) {
    const batchLines = lines.slice(i, i + batchSize);
    
    await Promise.all(batchLines.map(async (line) => {
      try {
        const charData = JSON.parse(line);
        const hanziChar = charData.character;

        let charId: number;
        if (charIdCache.has(hanziChar)) {
          charId = charIdCache.get(hanziChar)!;
          await db.update(characters).set({
            radical: charData.radical,
            strokeCount: charData.strokes,
            decomposition: charData.decomposition,
            etymology: charData.etymology?.type || null, 
          }).where(eq(characters.id, charId));
        } else {
          const [newC] = await db.insert(characters).values({
            hanzi: hanziChar,
            radical: charData.radical,
            strokeCount: charData.strokes,
            decomposition: charData.decomposition,
            etymology: charData.etymology?.type || null,
          }).returning({ id: characters.id });
          charId = newC.id;
          charIdCache.set(hanziChar, charId); 
        }

        if (Array.isArray(charData.pinyin) && charData.pinyin.length > 0) {
          const pronunPayloads = charData.pinyin.map((py: string, index: number) => ({ characterId: charId, pinyin: py, isPrimary: index === 0 }));
          await db.insert(characterPronunciations).values(pronunPayloads);
        }

        if (charData.decomposition) {
          const validComps = charData.decomposition.replace(/[^\u4e00-\u9fa5]/g, '').split('');
          for (let pos = 0; pos < validComps.length; pos++) {
            const compC = validComps[pos];
            let compId = charIdCache.get(compC);
            
            if (!compId) {
              const [newComp] = await db.insert(characters).values({ hanzi: compC }).returning({ id: characters.id });
              compId = newComp.id;
              charIdCache.set(compC, compId);
            }

            await db.insert(characterComponents).values({ characterId: charId, componentCharacterId: compId, position: pos + 1 }).onConflictDoNothing();
          }
        }
        count++;
      } catch (e) {}
    }));
    if ((i + batchSize) % 1000 === 0) process.stdout.write(`\rTiến độ: ${i + batchSize}/${lines.length}`);
  }
  console.log(`\n✅ Đã phân tích ${count} ký tự.\n`);
}

// ============================================================================
// PHASE 4: NỐI VOCABULARY_CHARACTERS
// ============================================================================
async function step4_linkVocabularyCharacters() {
  console.log('[PHASE 4] 🔗 Đang nối bảng Từ vựng và Ký tự...');
  let linkCount = 0;
  
  for (const vocab of vocabCache) {
    const chars = vocab.simplified.split('');
    
    for (let idx = 0; idx < chars.length; idx++) {
      const charStr = chars[idx];
      let charId = charIdCache.get(charStr); 
      
      if (!charId) {
        const [newChar] = await db.insert(characters).values({ hanzi: charStr }).returning({ id: characters.id });
        charId = newChar.id;
        charIdCache.set(charStr, charId);
      }

      await db.insert(vocabularyCharacters).values({ vocabularyId: vocab.id, characterId: charId, position: idx + 1 }).onConflictDoNothing();
      linkCount++;
    }
  }
  console.log(`🎉 Đã thiết lập ${linkCount} liên kết thành công.\n`);
}

// ============================================================================
// PHASE 5: LÀM GIÀU NGHĨA BỘ THỦ (AI)
// ============================================================================
async function step5_enrichRadicals() {
  console.log('[PHASE 5] 🔍 Đang nhờ AI dịch nghĩa các bộ thủ...');
  const rows = await db.selectDistinct({ radical: characters.radical }).from(characters).where(and(isNotNull(characters.radical), isNull(characters.radicalMeaning)));
  const radicals = rows.map(r => r.radical).filter(Boolean) as string[];

  if (radicals.length === 0) return console.log('✅ Bộ thủ đã đầy đủ dữ liệu.\n');

  for (let i = 0; i < radicals.length; i += 100) {
    const batch = radicals.slice(i, i + 100);
    const prompt = `Trả về JSON (KEY là chữ, VALUE là "Pinyin - Nghĩa Hán Việt" gốc của bộ thủ). Mẫu: {"勹": "bāo - Bao", "心": "xīn - Tâm"}. Dữ liệu: ${batch.join(',')}`;
    
    const res = await model.generateContent(prompt);
    const dataObj = JSON.parse(res.response.text().replace(/```json|```/gi, '').trim());

    await Promise.all(Object.keys(dataObj).map(rad => 
      db.update(characters).set({ radicalMeaning: dataObj[rad] }).where(eq(characters.radical, rad))
    ));
  }
  console.log('🎉 Hoàn tất làm giàu ý nghĩa bộ thủ.\n');
}

// ============================================================================
// PHASE 6: LÀM GIÀU TỪ VỰNG & PHÂN LOẠI CHỦ ĐỀ
// ============================================================================
async function step6_enrichVocabulariesAndTopics() {
  console.log('[PHASE 6] 🚀 Bắt đầu làm giàu từ vựng & phân loại chủ đề bằng AI...');
  const allWords = await db.select({ id: vocabularies.id, hanzi: vocabularies.simplified, pinyin: vocabularies.pinyin }).from(vocabularies).where(isNull(vocabularies.sinoVietnamese));

  for (let i = 0; i < allWords.length; i += BATCH_SIZE) {
    const batch = allWords.slice(i, i + BATCH_SIZE);
    const promptData = batch.map((w) => `ID: ${w.id} | Word: ${w.hanzi} (${w.pinyin})`).join('\n');

    const prompt = `
      Là chuyên gia Hán ngữ, xử lý danh sách sau trả về định dạng JSON.
      YÊU CẦU:
      1. "ch": Câu ví dụ (TUYỆT ĐỐI KHÔNG chứa tiếng Anh/Pinyin/Latin).
      2. "en": Dịch câu ví dụ sang Tiếng Việt.
      3. "tp": Mảng chứa 1-2 tên chủ đề phù hợp nhất. Chọn từ danh sách: ${JSON.stringify(CORE_TOPICS)}

      Mẫu JSON:
        {
          "ID": {
            "vi": "Nghĩa Tiếng Việt",
            "sv": "Âm Hán Việt",
            "tp": ["Giao tiếp & Giới thiệu"],
            "ex": [ {"ch": "他做生意很诚实。", "py": "Tā zuò shēngyì hěn chéngshí.", "en": "Anh ấy kinh doanh rất thành thật."} ]
          }
        }
      Dữ liệu:
      ${promptData}
    `;

    let retries = 3;
    while (retries > 0) {
      try {
        const result = await model.generateContent(prompt);
        let text = result.response.text().replace(/```json|```/gi, '').trim();
        const dataObj = JSON.parse(text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1));

        await Promise.all(Object.keys(dataObj).map(async (idStr) => {
          const wordId = parseInt(idStr);
          const aiData = dataObj[idStr];

          await db.update(vocabularies).set({ sinoVietnamese: aiData.sv }).where(eq(vocabularies.id, wordId));

          const meaningRecord = await db.query.vocabularyMeanings.findFirst({ where: and(eq(vocabularyMeanings.vocabularyId, wordId), eq(vocabularyMeanings.languageCode, 'vi')) });
          if (meaningRecord && aiData.vi) await db.update(vocabularyMeanings).set({ meaning: aiData.vi }).where(eq(vocabularyMeanings.id, meaningRecord.id));

          if (aiData.tp && Array.isArray(aiData.tp)) {
            for (const rawName of aiData.tp) {
              const normalizedRawName = rawName.toLowerCase().trim();
              const validTopicName = CORE_TOPICS.find(core => core.toLowerCase() === normalizedRawName || normalizedRawName.includes(core.toLowerCase()));
              if (!validTopicName) continue; 

              let topicRecord = await db.query.topics.findFirst({ where: eq(topics.name, validTopicName) });
              if (!topicRecord) {
                try {
                  const slug = generateSlug(validTopicName);
                  const [newTopic] = await db.insert(topics).values({ name: validTopicName, slug: slug }).returning({ id: topics.id });
                  topicRecord = newTopic as any;
                } catch (e) {
                  topicRecord = await db.query.topics.findFirst({ where: eq(topics.name, validTopicName) });
                }
              }
              if (topicRecord) {
                await db.insert(vocabularyTopics).values({ vocabularyId: wordId, topicId: topicRecord.id }).onConflictDoNothing();
              }
            }
          }

          if (aiData.ex && Array.isArray(aiData.ex)) {
            for (const ex of aiData.ex) {
              if (/[a-zA-Z]/.test(ex.ch)) continue; 
              const [inserted] = await db.insert(exampleSentences).values({ vocabularyId: wordId, chineseText: ex.ch, pinyinText: ex.py, source: 'ai_generated' }).returning({ id: exampleSentences.id });
              await db.insert(exampleSentenceTranslations).values({ sentenceId: inserted.id, languageCode: 'vi', translation: ex.en });
            }
          }
        }));
        console.log(`✅ Batch từ vựng ${i / BATCH_SIZE + 1} hoàn tất.`);
        break;
      } catch (err) {
        retries--;
        if (retries > 0) await sleep(DELAY_MS);
      }
    }
    await sleep(DELAY_MS);
  }
  console.log(`🎉 Làm giàu toàn diện từ vựng hoàn tất.\n`);
}

// ============================================================================
// PHASE 7: CHIA BỘ THẺ & TẠO KHÓA HỌC HSK
// ============================================================================
async function step7_seedHskCourses() {
  console.log('[PHASE 7] 🚀 Bắt đầu quá trình chia bộ thẻ và tạo khóa học HSK...');
  for (const config of hskConfigs) {
    const vocabs = await db.select().from(vocabularies)
      .where(eq(vocabularies.hskLevel, config.level))
      .orderBy(asc(vocabularies.id));

    if (vocabs.length === 0) continue;

    const [newCourse] = await db.insert(courses).values({
      name: `HSK ${config.level} Standard Course`,
      description: `Khóa học HSK ${config.level} tiêu chuẩn bao gồm ${vocabs.length} từ vựng, được chia thành ${config.units} Units và ${config.lessons} Lessons.`,
    }).returning();

    let vocabIndex = 0;
    let globalLessonIndex = 1;
    const lessonsPerUnit = config.lessons / config.units;

    for (let u = 1; u <= config.units; u++) {
      for (let l = 1; l <= lessonsPerUnit; l++) {
        const chunk = vocabs.slice(vocabIndex, vocabIndex + config.wordsPerLesson);
        if (chunk.length === 0) break;

        const lessonTitle = `Unit ${u} - Lesson ${l}`;
        
        const [newDeck] = await db.insert(decks).values({
          name: `HSK ${config.level} - ${lessonTitle}`,
          description: `Bộ thẻ từ vựng cho ${lessonTitle} thuộc HSK ${config.level}.`,
          hskLevel: config.level,
          isSystem: true, 
          isPublic: true,
        }).returning();

        const deckItemsData = chunk.map((v, idx) => ({
          deckId: newDeck.id,
          vocabularyId: v.id,
          displayOrder: idx,
        }));
        await db.insert(deckItems).values(deckItemsData);

        await db.insert(lessons).values({
          courseId: newCourse.id,
          title: lessonTitle,
          orderIndex: globalLessonIndex,
          deckId: newDeck.id,
        });

        vocabIndex += config.wordsPerLesson;
        globalLessonIndex++;
      }
    }
    console.log(`✅ Đã hoàn tất HSK ${config.level}: Tạo ${globalLessonIndex - 1} bộ thẻ.`);
  }
  console.log('🎉 Khởi tạo khóa học thành công.\n');
}

// ============================================================================
// PHASE 8: TẠO DỮ LIỆU QUIZ MẪU
// ============================================================================
async function step8_seedQuizzes() {
  console.log('[PHASE 8] ⏳ Đang tạo dữ liệu mẫu cho Quiz...');
  try {
    const insertedVocabs = await db.insert(vocabularies).values([
      { simplified: '你好', pinyin: 'nǐ hǎo', hskLevel: 1 },
      { simplified: '谢谢', pinyin: 'xiè xie', hskLevel: 1 },
      { simplified: '明白', pinyin: 'míng bai', hskLevel: 2 },
      { simplified: '因为', pinyin: 'yīn wèi', hskLevel: 2 },
      { simplified: '虽然', pinyin: 'suī rán', hskLevel: 3 },
    ]).returning({ id: vocabularies.id });

    const insertedQuizzes = await db.insert(quizzes).values([
      { title: 'HSK 1: Chào hỏi cơ bản', hskLevel: 1, quizType: 'hsk_mock' },
      { title: 'HSK 1: Đánh giá đầu vào', hskLevel: 1, quizType: 'placement' },
      { title: 'HSK 2: Động từ & Trạng từ', hskLevel: 2, quizType: 'hsk_mock' },
      { title: 'HSK 2: Cấu trúc nguyên nhân', hskLevel: 2, quizType: 'custom' },
      { title: 'HSK 3: Ngữ pháp quan trọng', hskLevel: 3, quizType: 'hsk_mock' },
    ]).returning({ id: quizzes.id });

    const questionsData = [
      { quizId: insertedQuizzes[0].id, vocabularyId: insertedVocabs[0].id, questionType: 'multiple_choice' as const, options: ['Tạm biệt', 'Xin chào', 'Cảm ơn', 'Xin lỗi'], correctAnswer: 'Xin chào' },
      { quizId: insertedQuizzes[0].id, vocabularyId: insertedVocabs[1].id, questionType: 'multiple_choice' as const, options: ['Không có gì', 'Tạm biệt', 'Cảm ơn', 'Ngày mai'], correctAnswer: 'Cảm ơn' },
      { quizId: insertedQuizzes[2].id, vocabularyId: insertedVocabs[2].id, questionType: 'multiple_choice' as const, options: ['Hiểu / Rõ ràng', 'Quên', 'Sáng sủa', 'Thông minh'], correctAnswer: 'Hiểu / Rõ ràng' },
      { quizId: insertedQuizzes[3].id, vocabularyId: insertedVocabs[3].id, questionType: 'multiple_choice' as const, options: ['Bởi vì', 'Cho nên', 'Nhưng mà', 'Tuy nhiên'], correctAnswer: 'Bởi vì' },
      { quizId: insertedQuizzes[4].id, vocabularyId: insertedVocabs[4].id, questionType: 'multiple_choice' as const, options: ['Đột nhiên', 'Mặc dù', 'Đương nhiên', 'Thỉnh thoảng'], correctAnswer: 'Mặc dù' }
    ];

    await db.insert(quizQuestions).values(questionsData);
    console.log('✅ Chèn dữ liệu Quiz mẫu thành công.\n');
  } catch (error) {
    console.error('❌ Lỗi khi Seed Quiz:', error);
  }
}

// ============================================================================
// PHASE 9: SỬA LỖI NGHĨA TỪ VỰNG (AI SYNC)
// ============================================================================
async function step9_syncAiTranslations() {
  console.log('[PHASE 9] 🔍 BẮT ĐẦU CHIẾN DỊCH: ĐỒNG BỘ & SỬA LỖI NGHĨA TỪ VỰNG...');
  try {
    const pendingMeanings = await db
      .select({
        meaningId: vocabularyMeanings.id,
        word: vocabularies.simplified,
        pinyin: vocabularies.pinyin
      })
      .from(vocabularyMeanings)
      .innerJoin(vocabularies, eq(vocabularyMeanings.vocabularyId, vocabularies.id))
      .where(
        or(
          ilike(vocabularyMeanings.meaning, '%Đang chờ%'),
          eq(vocabularyMeanings.meaning, ''),
          ilike(vocabularyMeanings.meaning, '%chưa có nghĩa%')
        )
      );

    if (pendingMeanings.length === 0) return console.log('✅ Không có từ vựng nào cần dịch lại.\n');
    console.log(`⚠️ Tìm thấy ${pendingMeanings.length} từ vựng cần cập nhật...`);

    let successCount = 0;
    for (let i = 0; i < pendingMeanings.length; i += BATCH_SIZE) {
      const batch = pendingMeanings.slice(i, i + BATCH_SIZE);
      const promptData = batch.map((m) => `ID: ${m.meaningId} | Word: ${m.word} (${m.pinyin})`).join('\n');

      const prompt = `Dịch nghĩa tiếng Việt định dạng JSON. KEY=ID, VALUE=Nghĩa Tiếng Việt. Mẫu: {"101": "Xin chào"}\nDữ liệu:\n${promptData}`;

      let retries = 3;
      while (retries > 0) {
        try {
          const result = await model.generateContent(prompt);
          let text = result.response.text().replace(/```json|```/gi, '').trim();
          const dataObj = JSON.parse(text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1));

          await Promise.all(Object.keys(dataObj).map(async (idStr) => {
            const aiTranslation = dataObj[idStr];
            if (aiTranslation) {
              await db.update(vocabularyMeanings).set({ meaning: aiTranslation }).where(eq(vocabularyMeanings.id, parseInt(idStr)));
              successCount++;
            }
          }));
          break; 
        } catch (err) {
          retries--;
          if (retries > 0) await sleep(DELAY_MS);
        }
      }
      await sleep(DELAY_MS);
    }
    console.log(`🎉 Cập nhật thành công ${successCount} từ vựng.\n`);
  } catch (error) {
    console.error('💥 Lỗi khi chạy Sync AI:', error);
  }
}

// ============================================================================
// TRÌNH ĐIỀU KHIỂN CHÍNH (MASTER CONTROLLER)
// ============================================================================
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

async function initDatabase() {
  console.log('\n========================================================');
  console.log('🚀 Leafyy MASTER PIPELINE INITIALIZER');
  console.log('========================================================\n');

  rl.question('⚠️ Xác nhận XOÁ TOÀN BỘ dữ liệu cũ và thiết lập lại hệ thống? (y/N): ', async (answer) => {
    if (answer.toLowerCase() === 'y') {
      try {
        await step1_cleanDatabase();
        await step2_importVocabularies();
        await step3_importHanzi();
        await step4_linkVocabularyCharacters();
        await step5_enrichRadicals();
        await step6_enrichVocabulariesAndTopics();
        await step7_seedHskCourses();
        await step8_seedQuizzes();
        await step9_syncAiTranslations();
        console.log('\n🎉 HỆ THỐNG ĐÃ ĐƯỢC KHỞI TẠO VÀ LÀM GIÀU DỮ LIỆU THÀNH CÔNG TỪ A-Z!');
      } catch (error) {
        console.error('\n❌ Lỗi Pipeline:', error);
      }
    }
    process.exit(0);
  });
}

initDatabase();