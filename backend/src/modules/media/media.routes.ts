import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import * as Controller from './media.controller.js';
import { authenticate } from '../../common/middleware/auth.js';
import { asyncHandler } from '../../common/utils/asyncHandler.js';
import { UPLOADS_ROOT, sanitizeFolder, getExtensionFromMime, initUploadDirectories } from './storage.config.js';
import { AppError } from '../../common/errors/AppError.js';

initUploadDirectories();

const router = Router();
const requireAuth = asyncHandler(authenticate);

// Configure multer for disk storage in specific dedicated folders
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      const rawFolder = req.body?.folder || req.query?.folder;
      const folder = sanitizeFolder(rawFolder);
      (file as any).targetFolder = folder;
      
      const targetDir = path.join(UPLOADS_ROOT, folder);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      cb(null, targetDir);
    } catch (err: any) {
      cb(err, UPLOADS_ROOT);
    }
  },
  filename: (req, file, cb) => {
    try {
      const folder = (file as any).targetFolder || sanitizeFolder(req.body?.folder || req.query?.folder);
      const ext = path.extname(file.originalname).toLowerCase() || getExtensionFromMime(file.mimetype);
      const random = crypto.randomBytes(6).toString('hex');
      const safeFilename = `${folder}-${Date.now()}-${random}${ext}`;
      cb(null, safeFilename);
    } catch (err: any) {
      cb(err, `${Date.now()}-${file.originalname}`);
    }
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 250 * 1024 * 1024 } // 250MB maximum absolute limit
});

const handleUploadMiddleware = (req: Request, res: Response, next: NextFunction) => {
  upload.single('file')(req, res, (err: any) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(new AppError('حجم فایل ارسالی فراتر از حد مجاز سرور است (حداکثر ۲۵۰ مگابایت).', 400, 'FILE_TOO_LARGE'));
      }
      return next(new AppError(err.message || 'خطا در بارگذاری فایل روی سرور', 400, 'UPLOAD_ERROR'));
    }
    next();
  });
};

router.post('/upload', requireAuth, handleUploadMiddleware, asyncHandler(Controller.uploadFile));

export default router;
