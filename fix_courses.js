const fs = require('fs');
let code = fs.readFileSync('frontend/src/features/courses/api/courses.api.ts', 'utf8');

// The file should end with the original export and we add the new methods
// I'll just rewrite the file content up to `createLesson: async` and then append my methods
const originalMethods = code.split('createLesson: async (chapterId: string, data: any) => {')[0];
const suffix = `createLesson: async (chapterId: string, data: any) => {
    return api.post<any, SingleResponse<Lesson>>(\`/instructor/chapters/\${chapterId}/lessons\`, data);
  },
  updateChapter: async (chapterId: string, data: any) => {
    return api.patch<any, SingleResponse<Chapter>>(\`/instructor/chapters/\${chapterId}\`, data);
  },
  deleteChapter: async (chapterId: string) => {
    return api.delete<any, SingleResponse<any>>(\`/instructor/chapters/\${chapterId}\`);
  },
  updateLesson: async (lessonId: string, data: any) => {
    return api.patch<any, SingleResponse<Lesson>>(\`/instructor/lessons/\${lessonId}\`, data);
  },
  deleteLesson: async (lessonId: string) => {
    return api.delete<any, SingleResponse<any>>(\`/instructor/lessons/\${lessonId}\`);
  }
};
`;

fs.writeFileSync('frontend/src/features/courses/api/courses.api.ts', originalMethods + suffix);
