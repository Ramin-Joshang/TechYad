import { api } from '@/lib/api';

export interface Category {
  id: string;
  title: string;
  icon: string;
  courseCount: number;
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  instructor: string;
  instructorAvatar: string;
  rating: number;
  studentsCount: number;
  price: number;
  originalPrice: number | null;
  duration: string;
  level: string;
  coverImage: string;
}

export interface Instructor {
  id: string;
  slug?: string;
  name: string;
  specialty: string;
  avatar: string;
  students: number;
  courses: number;
  rating: number;
}

export interface OnlineClass {
  id: string;
  title: string;
  startDate: string;
  capacity: number;
  enrolled: number;
  price: number;
  type: string;
}

export interface InPersonClass {
  id: string;
  title: string;
  startDate: string;
  location: string;
  capacity: number;
  enrolled: number;
  price: number;
  type: string;
}

export interface Testimonial {
  id: string;
  text: string;
  author: string;
  role: string;
  avatar: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  image: string;
  date: string;
  author: string;
  readTime: string;
}

export interface HomeData {
  categories: Category[];
  popularCourses: Course[];
  newCourses: Course[];
  freeCourses: Course[];
  topInstructors: Instructor[];
  onlineClasses: OnlineClass[];
  inPersonClasses: InPersonClass[];
  testimonials: Testimonial[];
  blogPosts: BlogPost[];
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export const homeApi = {
  getHomeData: async () => {
    return api.get<any, ApiResponse<HomeData>>('/home');
  }
};
