import { api } from '@/lib/api';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export const notificationsApi = {
  getNotifications: async () => {
    return api.get<any, ApiResponse<any[]>>('/notifications');
  },
  markAsRead: async (id: string) => {
    return api.patch<any, ApiResponse<any>>(`/notifications/${id}/read`);
  },
  markAllAsRead: async () => {
    return api.patch<any, ApiResponse<any>>('/notifications/read-all');
  }
};
