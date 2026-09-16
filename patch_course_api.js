const fs = require('fs');

let code = fs.readFileSync('frontend/src/features/courses/api/courses.api.ts', 'utf8');

const newMethods = `  createChapter: async (courseId: string, data: any) => {
    return api.post<any, any>(\`/instructor/courses/\${courseId}/chapters\`, data);
  },
  createLesson: async (chapterId: string, data: any) => {
    return api.post<any, any>(\`/instructor/chapters/\${chapterId}/lessons\`, data);
  },
  getCourseChapters:`;

code = code.replace("  getCourseChapters:", newMethods);

fs.writeFileSync('frontend/src/features/courses/api/courses.api.ts', code);
