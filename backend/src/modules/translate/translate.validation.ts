import { z } from 'zod';

const translateText = z.object({
  body: z.object({
    text: z
      .string({
        error: 'Văn bản không được để trống',
      })
      .min(1, 'Văn bản không được để trống')
      .max(5000, 'Văn bản không được vượt quá 5000 ký tự'),

    // Chấp nhận cả viết hoa và viết thường
    source: z
      .enum(['vi', 'zh-CN', 'zh-TW', 'zh-cn', 'zh-tw', 'auto'])
      .default('auto'),

    target: z.enum(['vi', 'zh-CN', 'zh-TW', 'zh-cn', 'zh-tw'], {
      error: 'Phải chọn ngôn ngữ đích',
    }),
  }),
});

const convertText = z.object({
  body: z.object({
    text: z
      .string({
        error: 'Văn bản không được để trống',
      })
      .min(1, 'Văn bản không được để trống')
      .max(5000, 'Văn bản không được vượt quá 5000 ký tự'),

    type: z.enum(['s2t', 't2s'], {
      error: 'Loại chuyển đổi chỉ hỗ trợ s2t hoặc t2s',
    }),
  }),
});

export const translateValidation = {
  translateText,
  convertText,
};