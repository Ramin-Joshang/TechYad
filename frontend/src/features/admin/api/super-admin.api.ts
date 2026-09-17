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
  }
};
