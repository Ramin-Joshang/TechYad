import { File } from './file.model.js';
import { AppError } from '../../common/errors/AppError.js';

export class MediaService {
  static async uploadFile(userId: string, file: Express.Multer.File) {
    if (!file) throw new AppError('No file provided', 400, 'BAD_REQUEST');
    
    // In this mock environment, we convert the file buffer to a Base64 data URI
    // so it can be immediately served by the browser without an actual storage bucket.
    const base64String = file.buffer.toString('base64');
    const dataUri = `data:${file.mimetype};base64,${base64String}`;
    
    const newFile = await File.create({
      originalName: file.originalname,
      filename: file.filename || `${Date.now()}-${file.originalname}`,
      mimeType: file.mimetype,
      size: file.size,
      url: dataUri,
      uploadedBy: userId
    });
    
    return newFile;
  }
}
