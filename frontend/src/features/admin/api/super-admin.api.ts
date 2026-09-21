import { api } from '@/lib/api';

export const superAdminApi = {
  getAdmins: async (params?: any) => {
    return api.get<any, any>('/super-admin/admins', { params });
  },
  createAdmin: async (data: any) => {
    return api.post<any, any>('/super-admin/admins', data);
  },
  updateAdmin: async (id: string, data: any) => {
    return api.patch<any, any>(`/super-admin/admins/${id}`, data);
  },
  updateAdminStatus: async (id: string, status: string) => {
    return api.patch<any, any>(`/super-admin/admins/${id}/status`, { status });
  },
  
  // Roles & Permissions
  getRoles: async () => {
    return api.get<any, any>('/super-admin/roles');
  },
  getRoleById: async (id: string) => {
    return api.get<any, any>(`/super-admin/roles/${id}`);
  },
  createRole: async (data: any) => {
    return api.post<any, any>('/super-admin/roles', data);
  },
  updateRole: async (id: string, data: any) => {
    return api.patch<any, any>(`/super-admin/roles/${id}`, data);
  },
  deleteRole: async (id: string) => {
    return api.delete<any, any>(`/super-admin/roles/${id}`);
  },
  
  // Global Settings
  getSettings: async () => {
    return api.get<any, any>('/super-admin/settings');
  },
  updateSettings: async (data: Record<string, any>) => {
    return api.patch<any, any>('/super-admin/settings', data);
  },

  // Settlements / Instructor Payouts
  getSettlements: async (params?: any) => {
    return api.get<any, any>('/admin/settlements', { params });
  },
  createSettlement: async (data: any) => {
    return api.post<any, any>('/admin/settlements', data);
  },
  updateSettlementStatus: async (id: string, data: { status: string; trackingCode?: string; rejectionReason?: string }) => {
    return api.patch<any, any>(`/admin/settlements/${id}/status`, data);
  },

  // Comments & Reviews Moderation
  getComments: async (params?: any) => {
    return api.get<any, any>('/admin/comments', { params });
  },
  moderateComment: async (id: string, data: { itemType: string; status: 'approved' | 'rejected' }) => {
    return api.patch<any, any>(`/admin/comments/${id}`, data);
  },
  deleteComment: async (id: string, itemType: string) => {
    return api.delete<any, any>(`/admin/comments/${id}`, { params: { itemType } });
  },

  // Broadcast Notifications & Campaigns
  sendBroadcast: async (data: {
    title: string;
    message: string;
    targetRole?: string;
    sendSms?: boolean;
    courseId?: string;
  }) => {
    return api.post<any, any>('/super-admin/broadcast', data);
  },

  // Audit Logs
  getAuditLogs: async (params?: any) => {
    return api.get<any, any>('/super-admin/audit-logs', { params });
  },

  // Security Overview
  getSecurityOverview: async () => {
    return api.get<any, any>('/super-admin/security');
  },
  updateSecurityConfig: async (data: any) => {
    return api.patch<any, any>('/super-admin/security', data);
  }
};

