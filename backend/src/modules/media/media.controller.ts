import { Request, Response } from 'express';
import { MediaService } from './media.service.js';
import { sendSuccess } from '../../common/utils/response.js';
import { AuthRequest } from '../../common/middleware/auth.js';

export const uploadFile = async (req: AuthRequest, res: Response) => {
  const targetFolder = req.body?.folder || req.query?.folder || (req.file as any)?.targetFolder;
  const result = await MediaService.uploadFile(
    req.user._id as string,
    req.file as Express.Multer.File,
    targetFolder
  );
  sendSuccess(res, result, 'فایل با موفقیت در پوشه اختصاصی ذخیره شد', 201);
};
