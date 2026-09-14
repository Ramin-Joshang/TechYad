import { api } from '@/lib/api';

export interface Course {
  _id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  status: string;
  instructors: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    bio?: string;
  }[];
  categoryId: {
    _id: string;
    name: string;
    slug: string;
  };
  thumbnail?: string;
  tags?: string[];
  levelId?: string;
  createdAt: string;
}

export interface Chapter {
  _id: string;
  title: string;
  description?: string;
  order: number;
  courseId: string;
}

export interface Lesson {
  _id: string;
  title: string;
  description?: string;
  content?: string;
  videoUrl?: string;
  type?: string;
  duration?: number;
  isFree: boolean;
  order: number;
  chapterId: string;
  courseId: string;
}

interface PaginatedResponse<T> {
  success: boolean;
  message?: string;
  data: {
    courses: T[];
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

interface SingleResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

interface ListResponse<T> {
  success: boolean;
  message?: string;
  data: T[];
}

export const coursesApi = {
  getCourses: async (params?: any) => {
    return api.get<any, PaginatedResponse<Course>>('/courses', { params });
  },

  getCourseBySlug: async (slug: string) => {
    return api.get<any, SingleResponse<Course>>(`/courses/${slug}`);
  },

  getCourseChapters: async (courseId: string) => {
    return api.get<any, ListResponse<Chapter>>(`/courses/${courseId}/chapters`);
  },

  getChapterLessons: async (chapterId: string) => {
    return api.get<any, ListResponse<Lesson>>(`/chapters/${chapterId}/lessons`);
  }
};
