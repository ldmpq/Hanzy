import { Request, Response } from 'express';
import { translateService } from './translate.service';

export const translateController = {
  async translate(req: Request, res: Response) {
    try {
      const { text, source, target } = req.body;
      
      if (!text) {
        return res.status(400).json({ success: false, message: 'Văn bản không được để trống' });
      }

      const safeSource = source?.toLowerCase() === 'zh-cn' ? 'zh-CN' : (source?.toLowerCase() === 'zh-tw' ? 'zh-TW' : (source || 'auto'));
      const safeTarget = target?.toLowerCase() === 'zh-cn' ? 'zh-CN' : (target?.toLowerCase() === 'zh-tw' ? 'zh-TW' : target);

      const data = await translateService.processTranslation(text, safeSource, safeTarget);
      
      return res.status(200).json({ success: true, message: 'Dịch thuật thành công', data });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: 'Lỗi dịch thuật', error: error.message });
    }
  },

  async convert(req: Request, res: Response) {
    try {
      const { text, type } = req.body;
      if (!text) {
        return res.status(400).json({ success: false, message: 'Văn bản không được để trống' });
      }
      
      const data = await translateService.processConversion(text, type);
      
      return res.status(200).json({ success: true, message: 'Chuyển đổi thành công', data });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: 'Lỗi chuyển đổi', error: error.message });
    }
  }
};