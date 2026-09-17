import { api } from '@/lib/api';

export const catalogApi = {
  getCategories: async () => {
    return api.get<any, any>('/categories');
  },
  createCategory: async (data: any) => {
    return api.post<any, any>('/categories', data);
  },
  updateCategory: async (id: string, data: any) => {
    return api.patch<any, any>(`/categories/${id}`, data);
  },
  deleteCategory: async (id: string) => {
    return api.delete<any, any>(`/categories/${id}`);
  },
};
