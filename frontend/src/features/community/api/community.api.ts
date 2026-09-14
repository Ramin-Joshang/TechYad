import { api } from '@/lib/api';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export const communityApi = {
  getMyFavorites: async () => {
    return api.get<any, ApiResponse<any[]>>('/me/favorites');
  },
  toggleFavorite: async (courseId: string) => {
    return api.post<any, ApiResponse<any>>(`/me/favorites/${courseId}`);
  }
};
