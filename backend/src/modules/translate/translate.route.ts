import express from 'express';
import { translateController } from './translate.controller';

const router = express.Router();

// Bỏ qua validate middleware ngoài, xử lý trực tiếp an toàn ở Controller
router.post('/', translateController.translate);
router.post('/convert', translateController.convert);

export default router;