import { api } from '@/lib/api';

export interface CategoryItem {
  _id: string;
  name: string;
  slug: string;
  parentId?: string | { _id: string; name: string; slug: string; level: number } | null;
  level: number;
  description?: string;
  isActive: boolean;
  sortOrder: number;
  image?: string;
  icon?: string;
  seoTitle?: string;
  seoDescription?: string;
  courseCount?: number;
  classCount?: number;
  children?: CategoryItem[];
}

export const catalogApi = {
  getCategories: async (params?: { tree?: boolean; includeInactive?: boolean; parentId?: string }) => {
    return api.get<any, any>('/categories', { params });
  },
  getCategoryTree: async (params?: { includeInactive?: boolean }) => {
    return api.get<any, any>('/categories/tree', { params });
  },
  getCategoryById: async (id: string) => {
    return api.get<any, any>(`/categories/${id}`);
  },
  getCategoryBySlug: async (slug: string, params?: { includeInactive?: boolean }) => {
    return api.get<any, any>(`/categories/slug/${encodeURIComponent(slug)}`, { params });
  },
  getCategoryContent: async (slug: string, params?: { type?: string; price?: string; mode?: string; sort?: string; page?: number; limit?: number }) => {
    return api.get<any, any>(`/categories/slug/${encodeURIComponent(slug)}/content`, { params });
  },
  createCategory: async (data: any) => {
    return api.post<any, any>('/categories', data);
  },
  updateCategory: async (id: string, data: any) => {
    return api.patch<any, any>(`/categories/${id}`, data);
  },
  toggleStatus: async (id: string, isActive?: boolean) => {
    return api.patch<any, any>(`/categories/${id}/status`, { isActive });
  },
  reorderCategories: async (items: Array<{ id: string; sortOrder: number }>) => {
    return api.post<any, any>('/categories/reorder', { items });
  },
  deleteCategory: async (id: string) => {
    return api.delete<any, any>(`/categories/${id}`);
  },
};
