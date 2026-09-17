import { api } from '@/lib/api';

export const adminApi = {
  getDashboardStats: async () => {
    return api.get<any, any>('/admin/dashboard');
  },
  getUsers: async (params?: any) => {
    return api.get<any, any>('/admin/users', { params });
  },
  updateUserStatus: async (id: string, status: string) => {
    return api.patch<any, any>(`/admin/users/${id}/status`, { status });
  },
  getOrders: async (params?: any) => {
    return api.get<any, any>('/admin/orders', { params });
  },
  
  // Coupons
  getCoupons: async () => {
    return api.get<any, any>('/admin/coupons');
  },
  createCoupon: async (data: any) => {
    return api.post<any, any>('/admin/coupons', data);
  },
  deleteCoupon: async (id: string) => {
    return api.delete<any, any>(`/admin/coupons/${id}`);
  },

  getTickets: async (params?: any) => {
    return api.get<any, any>('/admin/tickets', { params });
  },
  updateTicketStatus: async (id: string, status: string) => {
    return api.patch<any, any>(`/admin/tickets/${id}/status`, { status });
  },
  getClasses: async (params?: any) => {
    return api.get<any, any>('/admin/classes', { params });
  },
  getRevenueStats: async () => {
    return api.get<any, any>('/admin/revenue');
  },
  getCourses: async (params?: any) => {
    return api.get<any, any>('/admin/courses', { params });
  },
  publishCourse: async (id: string) => {
    return api.post<any, any>(`/admin/courses/${id}/publish`);
  },
  rejectCourse: async (id: string, reason: string) => {
    return api.post<any, any>(`/admin/courses/${id}/reject`, { reason });
  }
};
