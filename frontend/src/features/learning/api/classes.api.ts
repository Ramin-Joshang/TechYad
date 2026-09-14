import { api } from '@/lib/api';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export const classesApi = {
  getMyClasses: async () => {
    return api.get<any, ApiResponse<any[]>>('/me/classes');
  },
  joinClass: async (classId: string) => {
    return api.get<any, ApiResponse<any>>(`/classes/${classId}/join`);
  }
};
