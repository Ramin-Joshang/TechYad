import { api } from '@/lib/api';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export const quizzesApi = {
  getMyQuizzes: async () => {
    return api.get<any, ApiResponse<any[]>>('/me/quizzes');
  },
  getQuiz: async (id: string) => {
    return api.get<any, ApiResponse<any>>(`/me/quizzes/${id}`);
  },
  startQuiz: async (id: string) => {
    return api.post<any, ApiResponse<any>>(`/me/quizzes/${id}/start`);
  },
  submitQuiz: async (id: string, answers: { questionId: string, selectedOptionIds: string[] }[]) => {
    return api.post<any, ApiResponse<any>>(`/me/quizzes/${id}/submit`, { answers });
  },
  getQuizResult: async (id: string) => {
    return api.get<any, ApiResponse<any>>(`/me/quizzes/${id}/result`);
  }
};
