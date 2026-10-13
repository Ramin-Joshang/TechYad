export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  mobileVerified?: boolean;
  slug?: string;
  role: 'student' | 'instructor' | 'admin' | 'super-admin';
  avatar?: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Course {
  _id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  thumbnail: string;
  price: number;
  discountPrice?: number;
  status: 'draft' | 'pending' | 'published' | 'rejected';
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // in minutes
  instructor: User | string;
  category: any;
  tags: string[];
  features: string[];
  rating: number;
  studentsCount: number;
  curriculum: any[];
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<{
  docs: T[];
  totalDocs: number;
  limit: number;
  totalPages: number;
  page: number;
  pagingCounter: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage: number | null;
  nextPage: number | null;
}> {}
