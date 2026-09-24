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
  },
  // Instructor Methods
  getInstructorStats: async () => {
    return api.get<any, SingleResponse<any>>('/instructor/stats');
  },
  getInstructorCourses: async (params?: any) => {
    return api.get<any, PaginatedResponse<Course>>('/instructor/courses', { params });
  },
  createCourse: async (data: any) => {
    return api.post<any, SingleResponse<Course>>('/instructor/courses', data);
  },
  updateCourse: async (id: string, data: any) => {
    return api.patch<any, SingleResponse<Course>>(`/instructor/courses/${id}`, data);
  },
  requestCourseReview: async (id: string) => {
    return api.post<any, SingleResponse<Course>>(`/instructor/courses/${id}/request-review`);
  },
  createChapter: async (courseId: string, data: any) => {
    return api.post<any, SingleResponse<Chapter>>(`/instructor/courses/${courseId}/chapters`, data);
  },
  createLesson: async (chapterId: string, data: any) => {
    return api.post<any, SingleResponse<Lesson>>(`/instructor/chapters/${chapterId}/lessons`, data);
  },
  updateChapter: async (chapterId: string, data: any) => {
    return api.patch<any, SingleResponse<Chapter>>(`/instructor/chapters/${chapterId}`, data);
  },
  deleteChapter: async (chapterId: string) => {
    return api.delete<any, SingleResponse<any>>(`/instructor/chapters/${chapterId}`);
  },
  updateLesson: async (lessonId: string, data: any) => {
    return api.patch<any, SingleResponse<Lesson>>(`/instructor/lessons/${lessonId}`, data);
  },
  deleteLesson: async (lessonId: string) => {
    return api.delete<any, SingleResponse<any>>(`/instructor/lessons/${lessonId}`);
  },
  getCourseStudents: async (courseId: string, params?: any) => {
    return api.get<any, any>(`/instructor/courses/${courseId}/students`, { params });
  },
  getInstructorStudents: async (params?: any) => {
    return api.get<any, any>('/instructor/students', { params });
  }
};
