import { Router } from 'express';
import { VocabularyController } from './vocabulary.controller';
import { validate } from '../../shared/middlewares/validate.middleware';
import { authenticateJwt } from '../../shared/middlewares/auth.middleware';
import { getVocabulariesSchema, createVocabularySchema } from './vocabulary.validation';

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Vocabulary
 *     description: Quản lý kho từ vựng tiếng Trung (HSK), Ý nghĩa và Câu ví dụ
 */

/**
 * @swagger
 * /api/vocabularies:
 *   get:
 *     summary: Lấy danh sách từ vựng (Có phân trang & Lọc theo HSK)
 *     tags: [Vocabulary]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Số trang
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Số lượng từ mỗi trang
 *       - in: query
 *         name: hskLevel
 *         schema:
 *           type: integer
 *         description: Lọc theo cấp HSK (1 đến 9)
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         description: Tìm kiếm theo Hán tự hoặc Pinyin
 *     responses:
 *       200:
 *         description: Lấy danh sách thành công kèm phân trang.
 */
router.get('/', VocabularyController.getAll);

/**
 * @swagger
 * /api/vocabularies/{id}:
 *   get:
 *     summary: Lấy chi tiết 1 từ vựng theo ID (Kèm toàn bộ nghĩa & ví dụ)
 *     tags: [Vocabulary]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của từ vựng (BIGINT)
 *     responses:
 *       200:
 *         description: Trả về chi tiết từ vựng.
 *       404:
 *         description: Không tìm thấy từ vựng.
 */
router.get('/:id', VocabularyController.getById);

/**
 * @swagger
 * /api/vocabularies:
 *   post:
 *     summary: Thêm từ vựng mới vào hệ thống (Kèm nghĩa và ví dụ)
 *     tags: [Vocabulary]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - simplified
 *               - pinyin
 *               - hskLevel
 *               - meanings
 *             properties:
 *               simplified:
 *                 type: string
 *                 example: 你好
 *               traditional:
 *                 type: string
 *                 example: 你好
 *               pinyin:
 *                 type: string
 *                 example: nǐ hǎo
 *               hskLevel:
 *                 type: integer
 *                 example: 1
 *               partOfSpeech:
 *                 type: string
 *                 example: idiom / greeting
 *               audioUrl:
 *                 type: string
 *                 example: https://api.Hanzy.com/audio/nihao.mp3
 *               components:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     ch:
 *                       type: string
 *                       example: 女
 *                     py:
 *                       type: string
 *                       example: nǚ
 *                     meaning:
 *                       type: string
 *                       example: nữ (woman)
 *               meanings:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     languageCode:
 *                       type: string
 *                       example: vi
 *                     meaning:
 *                       type: string
 *                       example: Xin chào / Chào bạn
 *                     displayOrder:
 *                       type: integer
 *                       example: 0
 *               examples:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     chineseText:
 *                       type: string
 *                       example: 老师，你好！
 *                     pinyinText:
 *                       type: string
 *                       example: Lǎoshī, nǐ hǎo!
 *                     translation:
 *                       type: string
 *                       example: Em chào thầy/cô ạ!
 *     responses:
 *       201:
 *         description: Thêm mới thành công.
 *       400:
 *         description: Hán tự đã tồn tại hoặc dữ liệu lỗi.
 *       401:
 *         description: Thiếu Access Token.
 */
router.post('/', authenticateJwt, validate(createVocabularySchema), VocabularyController.create);

export default router;