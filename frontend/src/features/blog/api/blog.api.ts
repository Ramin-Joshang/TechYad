import { api } from '@/lib/api';

export interface BlogCategory {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  order: number;
  articlesCount?: number;
  createdAt: string;
}

export interface Article {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  authorId: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    role?: any;
    email?: string;
  };
  categoryId?: {
    _id: string;
    name: string;
    slug: string;
  };
  thumbnail?: string;
  tags?: string[];
  status: 'draft' | 'pending_review' | 'published' | 'rejected';
  rejectionReason?: string;
  publishedAt?: string;
  viewsCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminArticlesResponse {
  articles: Article[];
  stats: {
    total: number;
    published: number;
    pending: number;
    draft: number;
    rejected: number;
  };
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export const blogApi = {
  // Public
  getArticles: async (params?: any) => {
    return api.get<any, ApiResponse<Article[]>>('/blog/articles', { params });
  },
  
  getArticleBySlug: async (slug: string) => {
    return api.get<any, ApiResponse<Article>>(`/blog/articles/${slug}`);
  },

  getCategories: async (all = false) => {
    return api.get<any, ApiResponse<BlogCategory[]>>('/blog/categories', { params: { all } });
  },

  getTags: async () => {
    return api.get<any, ApiResponse<string[]>>('/blog/tags');
  },

  // Admin Article Management
  getAdminArticles: async (params?: any) => {
    return api.get<any, ApiResponse<AdminArticlesResponse>>('/blog/admin/articles', { params });
  },

  createAdminArticle: async (data: Partial<Article>) => {
    return api.post<any, ApiResponse<Article>>('/blog/admin/articles', data);
  },

  updateAdminArticle: async (id: string, data: Partial<Article>) => {
    return api.put<any, ApiResponse<Article>>(`/blog/admin/articles/${id}`, data);
  },

  changeArticleStatus: async (id: string, status: string, rejectionReason?: string) => {
    return api.patch<any, ApiResponse<Article>>(`/blog/admin/articles/${id}/status`, { status, rejectionReason });
  },

  deleteArticle: async (id: string) => {
    return api.delete<any, ApiResponse<any>>(`/blog/admin/articles/${id}`);
  },

  // Category Management
  createCategory: async (data: Partial<BlogCategory>) => {
    return api.post<any, ApiResponse<BlogCategory>>('/blog/admin/categories', data);
  },

  updateCategory: async (id: string, data: Partial<BlogCategory>) => {
    return api.put<any, ApiResponse<BlogCategory>>(`/blog/admin/categories/${id}`, data);
  },

  deleteCategory: async (id: string) => {
    return api.delete<any, ApiResponse<any>>(`/blog/admin/categories/${id}`);
  },

  // Instructor Article Management
  getInstructorArticles: async () => {
    return api.get<any, ApiResponse<AdminArticlesResponse>>('/blog/instructor/articles');
  },

  createInstructorArticle: async (data: Partial<Article> & { submitForReview?: boolean }) => {
    return api.post<any, ApiResponse<Article>>('/blog/instructor/articles', data);
  },

  updateInstructorArticle: async (id: string, data: Partial<Article> & { submitForReview?: boolean }) => {
    return api.put<any, ApiResponse<Article>>(`/blog/instructor/articles/${id}`, data);
  }
};
