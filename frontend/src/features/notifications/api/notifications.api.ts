import { api } from '@/lib/api';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export const notificationsApi = {
  getNotifications: async () => {
    return api.get<any, ApiResponse<any[]>>('/me/notifications');
  },
  markAsRead: async (id: string) => {
    return api.patch<any, ApiResponse<any>>(`/me/notifications/${id}/read`);
  },
  markAllAsRead: async () => {
    return api.patch<any, ApiResponse<any>>('/me/notifications/read-all');
  }
};
