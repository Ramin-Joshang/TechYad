import fs from 'fs';
import path from 'path';
import { UPLOADS_ROOT, UploadFolder, getExtensionFromMime, initUploadDirectories } from './storage.config.js';
import { User } from '../auth/user.model.js';
import { Class } from '../classes/class.model.js';
import { Course } from '../courses/course.model.js';
import { Article } from '../blog/article.model.js';
import { InstructorProfile } from '../instructors/instructor-profile.model.js';
import { File } from './file.model.js';

export function saveBase64ToDisk(base64Str: string, folder: UploadFolder, idPrefix: string): string | null {
  if (!base64Str || typeof base64Str !== 'string') return null;
  if (!base64Str.startsWith('data:') || !base64Str.includes(';base64,')) {
    return null; // Not a base64 data URI
  }

  try {
    const matches = base64Str.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return null;
    }

    const mimeType = matches[1];
    const dataBuffer = Buffer.from(matches[2], 'base64');
    const ext = getExtensionFromMime(mimeType);
    const filename = `${folder}-migrated-${idPrefix}-${Date.now()}${ext}`;
    const targetDir = path.join(UPLOADS_ROOT, folder);

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const filePath = path.join(targetDir, filename);
    fs.writeFileSync(filePath, dataBuffer);

    return `/uploads/${folder}/${filename}`;
  } catch (err) {
    console.error(`Error saving base64 to disk for ${idPrefix}:`, err);
    return null;
  }
}

export async function cleanupAllBase64FromDatabase() {
  initUploadDirectories();
  console.log('🔄 Checking database for any legacy base64 files to migrate to disk...');

  let migratedCount = 0;

  try {
    // 1. Clean Users
    const users = await User.find({
      $or: [
        { avatar: { $regex: '^data:' } },
        { personnelPhoto: { $regex: '^data:' } }
      ]
    });

    for (const u of users) {
      let changed = false;
      if (u.avatar && u.avatar.startsWith('data:')) {
        const fileUrl = saveBase64ToDisk(u.avatar, 'avatars', u._id.toString());
        u.avatar = fileUrl || '';
        changed = true;
        migratedCount++;
      }
      if (u.personnelPhoto && u.personnelPhoto.startsWith('data:')) {
        const fileUrl = saveBase64ToDisk(u.personnelPhoto, 'personnel', u._id.toString());
        u.personnelPhoto = fileUrl || '';
        changed = true;
        migratedCount++;
      }
      if (changed) await u.save();
    }

    // 2. Clean Classes
    const classes = await Class.find({ thumbnail: { $regex: '^data:' } });
    for (const c of classes) {
      if (c.thumbnail && c.thumbnail.startsWith('data:')) {
        const fileUrl = saveBase64ToDisk(c.thumbnail, 'classes', c._id.toString());
        c.thumbnail = fileUrl || '';
        await c.save();
        migratedCount++;
      }
    }

    // 3. Clean Courses
    const courses = await Course.find({ thumbnail: { $regex: '^data:' } });
    for (const crs of courses) {
      if (crs.thumbnail && crs.thumbnail.startsWith('data:')) {
        const fileUrl = saveBase64ToDisk(crs.thumbnail, 'courses', crs._id.toString());
        crs.thumbnail = fileUrl || '';
        await crs.save();
        migratedCount++;
      }
    }

    // 4. Clean Articles
    const articles = await Article.find({ thumbnail: { $regex: '^data:' } });
    for (const art of articles) {
      if (art.thumbnail && art.thumbnail.startsWith('data:')) {
        const fileUrl = saveBase64ToDisk(art.thumbnail, 'blog', art._id.toString());
        art.thumbnail = fileUrl || '';
        await art.save();
        migratedCount++;
      }
    }

    // 5. Clean Instructor Profiles
    const instructors = await InstructorProfile.find({ avatar: { $regex: '^data:' } });
    for (const inst of instructors) {
      if (inst.avatar && inst.avatar.startsWith('data:')) {
        const fileUrl = saveBase64ToDisk(inst.avatar, 'avatars', inst._id.toString());
        inst.avatar = fileUrl || '';
        await inst.save();
        migratedCount++;
      }
    }

    // 6. Clean File Collection
    const files = await File.find({ url: { $regex: '^data:' } });
    for (const f of files) {
      if (f.url && f.url.startsWith('data:')) {
        const fileUrl = saveBase64ToDisk(f.url, 'general', f._id.toString());
        f.url = fileUrl || `/uploads/general/file-${f._id}`;
        await f.save();
        migratedCount++;
      }
    }

    console.log(`✅ Base64 cleanup completed. Total items migrated to disk files: ${migratedCount}`);
  } catch (err) {
    console.error('Error during base64 cleanup:', err);
  }
}
