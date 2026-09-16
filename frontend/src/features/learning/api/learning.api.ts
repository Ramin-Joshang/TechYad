import { api } from '@/lib/api';

export const learningApi = {
  getStudentDashboard: async () => {
    return api.get('/dashboard');
  },
  getMyEnrollments: async () => {
    return api.get('/enrollments');
  },
  getMyEnrollmentDetails: async (courseId: string) => {
    return api.get(`/enrollments/${courseId}`);
  },
  getSecureLesson: async (lessonId: string) => {
    return api.get(`/lessons/${lessonId}`);
  },
  updateLessonProgress: async (lessonId: string, data: any) => {
    return api.post(`/progress/${lessonId}`, data);
  },
  getLessonProgress: async (lessonId: string) => {
    return api.get(`/progress/${lessonId}`);
  },
  getLessonComments: async (lessonId: string) => {
    return api.get(`/lessons/${lessonId}/comments`);
  },
  addLessonComment: async (lessonId: string, data: any) => {
    return api.post(`/lessons/${lessonId}/comments`, data);
  },
  createAssignment: async (lessonId: string, data: any) => {
    return api.post(`/instructor/lessons/${lessonId}/assignments`, data);
  },
  createQuiz: async (lessonId: string, data: any) => {
    return api.post(`/instructor/lessons/${lessonId}/quizzes`, data);
  }
};
