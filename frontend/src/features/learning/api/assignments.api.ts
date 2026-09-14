import { api } from '@/lib/api';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export const assignmentsApi = {
  getMyAssignments: async () => {
    return api.get<any, ApiResponse<any[]>>('/me/assignments');
  },
  getAssignmentDetails: async (id: string) => {
    return api.get<any, ApiResponse<any>>(`/me/assignments/${id}`);
  },
  submitAssignment: async (id: string, data: { answerText?: string, files?: string[] }) => {
    return api.post<any, ApiResponse<any>>(`/assignments/${id}/submit`, data);
  }
};
