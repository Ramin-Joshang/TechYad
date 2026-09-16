const fs = require('fs');
let code = fs.readFileSync('frontend/src/features/courses/api/courses.api.ts', 'utf8');

const newMethods = `
  // Instructor Methods
  getInstructorStats: async () => {
    return api.get<any, SingleResponse<any>>('/instructor/stats');
  },
  getInstructorCourses: async (params?: any) => {
    return api.get<any, PaginatedResponse<Course>>('/instructor/courses', { params });
  },
  createCourse: async (data: any) => {
    return api.post<any, SingleResponse<Course>>('/instructor/courses', data);
  },
  updateCourse: async (id: string, data: any) => {
    return api.patch<any, SingleResponse<Course>>(\`/instructor/courses/\${id}\`, data);
  },
  requestCourseReview: async (id: string) => {
    return api.post<any, SingleResponse<Course>>(\`/instructor/courses/\${id}/request-review\`);
  },
  createChapter: async (courseId: string, data: any) => {
    return api.post<any, SingleResponse<Chapter>>(\`/instructor/courses/\${courseId}/chapters\`, data);
  },
  createLesson: async (chapterId: string, data: any) => {
    return api.post<any, SingleResponse<Lesson>>(\`/instructor/chapters/\${chapterId}/lessons\`, data);
  }
};
`;

code = code.replace("};", newMethods);

fs.writeFileSync('frontend/src/features/courses/api/courses.api.ts', code);
