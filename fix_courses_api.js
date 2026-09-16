const fs = require('fs');
let content = fs.readFileSync('frontend/src/features/courses/api/courses.api.ts', 'utf8');

// The first patch inadvertently added createChapter and createLesson when they already existed (or were duplicated)
// Let's remove the first occurrence.
const lines = content.split('\n');
const start = lines.findIndex(l => l.includes('createChapter: async (courseId: string, data: any) => {'));
// If found twice, remove the first one
if (start !== -1 && lines.slice(start + 1).some(l => l.includes('createChapter: async (courseId: string, data: any) => {'))) {
  lines.splice(start, 6);
}

fs.writeFileSync('frontend/src/features/courses/api/courses.api.ts', lines.join('\n'));
