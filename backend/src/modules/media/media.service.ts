import fs from 'fs';
import path from 'path';
import { File } from './file.model.js';
import { AppError } from '../../common/errors/AppError.js';
import { FOLDER_SIZE_LIMITS, UploadFolder, sanitizeFolder, UPLOADS_ROOT } from './storage.config.js';

export class MediaService {
  static async uploadFile(
    userId: string,
    file: Express.Multer.File,
    requestedFolder?: string
  ) {
    if (!file) throw new AppError('فایلی ارسال نشده است', 400, 'BAD_REQUEST');

    const folder: UploadFolder = sanitizeFolder(requestedFolder || (file as any).targetFolder);

    // 1. Verify Folder Specific File Size Limit
    const maxAllowedSize = FOLDER_SIZE_LIMITS[folder] || FOLDER_SIZE_LIMITS.general;
    if (file.size > maxAllowedSize) {
      if (fs.existsSync(file.path)) {
        try { fs.unlinkSync(file.path); } catch (e) { /* ignore */ }
      }
      const maxMB = Math.round(maxAllowedSize / (1024 * 1024));
      throw new AppError(`حجم فایل ارسالی برای بخش «${folder}» بیش از حد مجاز است (حداکثر ${maxMB} مگابایت).`, 400, 'FILE_TOO_LARGE');
    }

    // 2. Validate MIME Type for Images
    const imageFolders: UploadFolder[] = ['avatars', 'personnel', 'courses', 'classes', 'blog'];
    if (imageFolders.includes(folder)) {
      const allowedImageMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
      if (!allowedImageMimes.includes(file.mimetype) && !file.mimetype.startsWith('image/')) {
        if (fs.existsSync(file.path)) {
          try { fs.unlinkSync(file.path); } catch (e) { /* ignore */ }
        }
        throw new AppError('تنها فرمت‌های تصویری (JPG, PNG, WebP) در این بخش مجاز هستند.', 400, 'INVALID_IMAGE_TYPE');
      }
    }

    // 3. Ensure target directory exists and file is in the right physical location
    const targetDir = path.join(UPLOADS_ROOT, folder);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const expectedFilePath = path.join(targetDir, file.filename);
    if (file.path && path.resolve(file.path) !== path.resolve(expectedFilePath)) {
      if (fs.existsSync(file.path)) {
        try {
          fs.renameSync(file.path, expectedFilePath);
          file.path = expectedFilePath;
        } catch (renameErr) {
          console.error('Failed to move uploaded file to target folder:', renameErr);
        }
      }
    }

    // 4. Store relative path URL in Database (NEVER BASE64, NEVER Windows absolute path!)
    const relativeUrl = `/uploads/${folder}/${file.filename}`;

    const newFile = await File.create({
      originalName: file.originalname,
      filename: file.filename,
      mimeType: file.mimetype,
      size: file.size,
      url: relativeUrl,
      path: relativeUrl,
      folder: folder,
      uploadedBy: userId,
    });

    return {
      _id: newFile._id,
      url: relativeUrl,
      path: relativeUrl,
      filename: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      folder: folder
    };
  }

  static async deleteFile(userId: string, relativeUrl: string, isAdmin: boolean = false) {
    if (!relativeUrl || typeof relativeUrl !== 'string') return false;

    const cleanUrl = relativeUrl.replace(/\\/g, '/');
    if (!cleanUrl.startsWith('/uploads/')) return false;

    const fileDoc = await File.findOne({ url: cleanUrl });
    if (fileDoc && !isAdmin && fileDoc.uploadedBy.toString() !== userId.toString()) {
      throw new AppError('شما دسترسی لازم برای حذف این فایل را ندارید', 403, 'FORBIDDEN');
    }

    const relativeSubPath = cleanUrl.replace(/^\/uploads\//, '');
    const absolutePath = path.resolve(UPLOADS_ROOT, relativeSubPath);
    if (!absolutePath.startsWith(path.resolve(UPLOADS_ROOT))) {
      throw new AppError('مسیر فایل نامعتبر است', 400, 'INVALID_PATH');
    }

    if (fs.existsSync(absolutePath)) {
      try {
        fs.unlinkSync(absolutePath);
      } catch (err) {
        console.error('Failed to unlink file:', absolutePath, err);
      }
    }

    if (fileDoc) {
      await File.deleteOne({ _id: fileDoc._id });
    }

    return true;
  }
}
