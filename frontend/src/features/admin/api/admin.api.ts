import { api } from '@/lib/api';

export const adminApi = {
  getDashboardStats: async () => {
    return api.get<any, any>('/admin/dashboard');
  },
  getRoles: async () => {
    return api.get<any, any>('/admin/roles');
  },
  getUsers: async (params?: any) => {
    return api.get<any, any>('/admin/users', { params });
  },
  createUser: async (data: any) => {
    return api.post<any, any>('/admin/users', data);
  },
  getUserById: async (id: string) => {
    return api.get<any, any>(`/admin/users/${id}`);
  },
  updateUser: async (id: string, data: any) => {
    return api.patch<any, any>(`/admin/users/${id}`, data);
  },
  updateUserStatus: async (id: string, status: string) => {
    return api.patch<any, any>(`/admin/users/${id}/status`, { status });
  },
  getOrders: async (params?: any) => {
    return api.get<any, any>('/admin/orders', { params });
  },
  getOrderById: async (id: string) => {
    return api.get<any, any>(`/admin/orders/${id}`);
  },
  updateOrderStatus: async (id: string, status: string) => {
    return api.patch<any, any>(`/admin/orders/${id}/status`, { status });
  },
  
  // Coupons
  getCoupons: async () => {
    return api.get<any, any>('/admin/coupons');
  },
  createCoupon: async (data: any) => {
    return api.post<any, any>('/admin/coupons', data);
  },
  updateCoupon: async (id: string, data: any) => {
    return api.patch<any, any>(`/admin/coupons/${id}`, data);
  },
  toggleCoupon: async (id: string) => {
    return api.patch<any, any>(`/admin/coupons/${id}/toggle`);
  },
  deleteCoupon: async (id: string) => {
    return api.delete<any, any>(`/admin/coupons/${id}`);
  },

  getTickets: async (params?: any) => {
    return api.get<any, any>('/admin/tickets', { params });
  },
  getTicketDetails: async (id: string) => {
    return api.get<any, any>(`/admin/tickets/${id}`);
  },
  replyToTicket: async (id: string, data: { message: string; status?: string }) => {
    return api.post<any, any>(`/admin/tickets/${id}/reply`, data);
  },
  updateTicketStatus: async (id: string, status: string, priority?: string) => {
    return api.patch<any, any>(`/admin/tickets/${id}/status`, { status, priority });
  },
  getClasses: async (params?: any) => {
    return api.get<any, any>('/admin/classes', { params });
  },
  createClass: async (data: any) => {
    return api.post<any, any>('/admin/classes', data);
  },
  updateClass: async (id: string, data: any) => {
    return api.patch<any, any>(`/admin/classes/${id}`, data);
  },
  deleteClass: async (id: string) => {
    return api.delete<any, any>(`/admin/classes/${id}`);
  },
  approveClass: async (id: string) => {
    return api.post<any, any>(`/admin/classes/${id}/approve`);
  },
  toggleClassRegistration: async (id: string, registrationOpen?: boolean) => {
    return api.post<any, any>(`/admin/classes/${id}/toggle-registration`, { registrationOpen });
  },
  rescheduleClass: async (id: string, days: number) => {
    return api.post<any, any>(`/admin/classes/${id}/reschedule`, { days });
  },
  getRevenueStats: async () => {
    return api.get<any, any>('/admin/revenue');
  },
  getComprehensiveReports: async (params?: any) => {
    return api.get<any, any>('/admin/reports/analytics', { params });
  },
  getCourses: async (params?: any) => {
    return api.get<any, any>('/admin/courses', { params });
  },
  createCourse: async (data: any) => {
    return api.post<any, any>('/courses', data);
  },
  getCourseById: async (id: string) => {
    return api.get<any, any>(`/admin/courses/${id}`);
  },
  updateCourse: async (id: string, data: any) => {
    return api.patch<any, any>(`/admin/courses/${id}`, data);
  },
  toggleCourseRegistration: async (id: string, isRegistrationOpen?: boolean) => {
    return api.patch<any, any>(`/admin/courses/${id}/toggle-registration`, { isRegistrationOpen });
  },
  deleteCourse: async (id: string) => {
    return api.delete<any, any>(`/admin/courses/${id}`);
  },
  publishCourse: async (id: string) => {
    return api.post<any, any>(`/admin/courses/${id}/publish`);
  },
  rejectCourse: async (id: string, reason: string) => {
    return api.post<any, any>(`/admin/courses/${id}/reject`, { reason });
  },

  // Broadcast Notifications & Campaigns
  sendBroadcast: async (data: {
    title: string;
    message: string;
    targetRole?: string;
    sendSms?: boolean;
    courseId?: string;
  }) => {
    return api.post<any, any>('/admin/broadcast', data);
  },

  // Settings
  getSettings: async () => {
    return api.get<any, any>('/admin/settings');
  },
  updateSettings: async (data: Record<string, any>) => {
    return api.patch<any, any>('/admin/settings', data);
  }
};
