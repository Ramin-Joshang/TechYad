import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Locate backend root and uploads folder
export const BACKEND_ROOT = path.resolve(__dirname, '../../..');
export const UPLOADS_ROOT = path.join(BACKEND_ROOT, 'uploads');

export const ALLOWED_FOLDERS = [
  'avatars',
  'personnel',
  'courses',
  'classes',
  'lessons',
  'blog',
  'assignments',
  'tickets',
  'resumes',
  'general'
] as const;

export type UploadFolder = typeof ALLOWED_FOLDERS[number];

export const FOLDER_SIZE_LIMITS: Record<UploadFolder, number> = {
  avatars: 5 * 1024 * 1024,      // 5MB max for user avatars
  personnel: 5 * 1024 * 1024,    // 5MB max for instructor personnel photos
  courses: 5 * 1024 * 1024,      // 5MB max for course thumbnails
  classes: 5 * 1024 * 1024,      // 5MB max for class thumbnails
  blog: 5 * 1024 * 1024,         // 5MB max for blog images
  assignments: 25 * 1024 * 1024, // 25MB max for assignments
  tickets: 25 * 1024 * 1024,     // 25MB max for ticket attachments
  resumes: 25 * 1024 * 1024,     // 25MB max for CVs & resumes
  lessons: 250 * 1024 * 1024,    // 250MB max for lesson videos / materials
  general: 50 * 1024 * 1024      // 50MB max fallback
};

export function sanitizeFolder(raw?: string): UploadFolder {
  if (!raw) return 'general';
  const clean = raw.toString().toLowerCase().trim() as UploadFolder;
  if (ALLOWED_FOLDERS.includes(clean)) {
    return clean;
  }
  return 'general';
}

export function initUploadDirectories() {
  if (!fs.existsSync(UPLOADS_ROOT)) {
    fs.mkdirSync(UPLOADS_ROOT, { recursive: true });
  }

  for (const folder of ALLOWED_FOLDERS) {
    const dir = path.join(UPLOADS_ROOT, folder);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
}

export function getExtensionFromMime(mime: string): string {
  switch (mime) {
    case 'image/jpeg':
    case 'image/jpg':
      return '.jpg';
    case 'image/png':
      return '.png';
    case 'image/webp':
      return '.webp';
    case 'image/gif':
      return '.gif';
    case 'image/svg+xml':
      return '.svg';
    case 'application/pdf':
      return '.pdf';
    case 'application/zip':
    case 'application/x-zip-compressed':
      return '.zip';
    case 'video/mp4':
      return '.mp4';
    case 'video/webm':
      return '.webm';
    case 'video/quicktime':
      return '.mov';
    case 'application/msword':
      return '.doc';
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      return '.docx';
    case 'text/plain':
      return '.txt';
    default:
      return '.bin';
  }
}
