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
  
  getRoles: async () => {
    return api.get<any, any>('/super-admin/roles');
  }
};
