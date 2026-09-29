import translate from 'google-translate-api-x';
import * as OpenCC from 'opencc-js';
import { pinyin } from 'pinyin-pro';

const converterS2T = OpenCC.Converter({ from: 'cn', to: 'tw' });
const converterT2S = OpenCC.Converter({ from: 'tw', to: 'cn' });

export const translateService = {
  async processTranslation(text: string, source: string, target: string) {
    // 1. Dịch văn bản
    const transResult = await translate(text, { from: source, to: target });
    const translatedText = transResult.text;

    // 2. Lấy bính âm nếu target là tiếng Trung
    let pinyinResult = '';
    if (target.includes('zh')) {
      pinyinResult = pinyin(translatedText, { toneType: 'num' }); 
    }

    return { translatedText, pinyinResult };
  },

  async processConversion(text: string, type: 's2t' | 't2s') {
    let resultText = '';
    if (type === 's2t') {
      resultText = converterS2T(text);
    } else {
      resultText = converterT2S(text);
    }
    return { resultText };
  }
};