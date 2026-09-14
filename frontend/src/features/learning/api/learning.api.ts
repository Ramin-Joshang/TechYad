import { api } from '@/lib/api';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export const learningApi = {
  getStudentDashboard: async () => {
    return api.get<any, ApiResponse<any>>('/dashboard');
  },
  getMyEnrollments: async () => {
    return api.get<any, ApiResponse<any[]>>('/enrollments');
  },
  getMyEnrollmentDetails: async (courseId: string) => {
    return api.get<any, ApiResponse<any>>(`/enrollments/${courseId}`);
  },
  enrollInFreeCourse: async (courseId: string) => {
    return api.post<any, ApiResponse<any>>(`/enrollments/free/${courseId}`);
  },
  getSecureLesson: async (lessonId: string) => {
    return api.get<any, ApiResponse<any>>(`/lessons/${lessonId}`);
  },
  updateLessonProgress: async (lessonId: string, data: any) => {
    return api.post<any, ApiResponse<any>>(`/progress/${lessonId}`, data);
  },
  getLessonProgress: async (lessonId: string) => {
    return api.get<any, ApiResponse<any>>(`/progress/${lessonId}`);
  }
};
