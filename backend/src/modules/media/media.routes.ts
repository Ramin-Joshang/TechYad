import { Router } from 'express';
import multer from 'multer';
import * as Controller from './media.controller.js';
import { authenticate } from '../../common/middleware/auth.js';
import { asyncHandler } from '../../common/utils/asyncHandler.js';

const router = Router();
const requireAuth = asyncHandler(authenticate);

// Configure multer for memory storage (for demo purposes instead of disk)
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

router.post('/upload', requireAuth, upload.single('file'), asyncHandler(Controller.uploadFile));

export default router;
