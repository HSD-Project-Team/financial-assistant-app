import { Router, RequestHandler } from 'express';
import { uploadDocument } from '../controllers/document.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { upload } from '../middleware/upload.middleware';

const router = Router();

/**
 * @route   POST /api/documents/upload
 */
// @ts-ignore: Multer tip uyuşmazlığını geçici olarak görmezden geliyoruz
router.post(
  '/upload',
  authMiddleware as any,
  (upload as any).single('file'),
  uploadDocument as any,
);

export default router;
