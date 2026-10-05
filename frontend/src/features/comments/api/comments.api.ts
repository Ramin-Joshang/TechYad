import { api } from '@/lib/api';

export interface CommentUser {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  avatar?: string;
  role?: string;
}

export interface CommentItem {
  _id: string;
  userId: CommentUser;
  courseId?: string;
  classId?: string;
  content: string;
  parentId?: string;
  status: 'pending' | 'approved' | 'rejected';
  isTeacherReply: boolean;
  rating?: number;
  replies?: CommentItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CommentsResponse {
  comments: CommentItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  stats: {
    averageRating: number;
    totalReviews: number;
    totalComments: number;
  };
}

export const commentsApi = {
  getApprovedComments: async (params: {
    courseId?: string;
    courseSlug?: string;
    classId?: string;
    classSlug?: string;
    page?: number;
    limit?: number;
  }) => {
    return api.get<any, { success: boolean; data: CommentsResponse }>('/comments', { params });
  },

  addComment: async (data: {
    courseId?: string;
    classId?: string;
    content: string;
    parentId?: string;
    rating?: number;
  }) => {
    return api.post<any, { success: boolean; data: CommentItem; message: string }>('/comments', data);
  },

  replyAsInstructor: async (commentId: string, content: string) => {
    return api.post<any, { success: boolean; data: CommentItem; message: string }>(`/comments/${commentId}/reply`, { content });
  },

  getAdminComments: async (params?: {
    status?: string;
    targetType?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) => {
    return api.get<any, any>('/admin/comments/v2', { params });
  },

  moderateComment: async (id: string, status: 'approved' | 'rejected') => {
    return api.patch<any, any>(`/admin/comments/v2/${id}/status`, { status });
  },

  deleteComment: async (id: string) => {
    return api.delete<any, any>(`/admin/comments/v2/${id}`);
  }
};
