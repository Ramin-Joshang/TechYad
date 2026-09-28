import { api } from '@/lib/api';

export interface ISessionSyllabus {
  sessionNumber: number;
  title: string;
  description?: string;
  date?: string;
  time?: string;
  durationMinutes?: number;
}

export interface ClassItem {
  _id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription?: string;
  type: 'public' | 'private';
  mode: 'online' | 'in_person';
  instructors: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    bio?: string;
  }[];
  price: number;
  discountPrice?: number;
  capacity: number;
  enrolledCount?: number;
  startDate: string;
  endDate: string;
  sessions?: number;
  totalHours?: number;
  thumbnail?: string;

  // Schedule & Calendar
  scheduleDays?: string[];
  scheduleTime?: string;

  // Venue / In-Person
  location?: string;
  address?: string;
  city?: string;
  venueDetails?: string;

  // Online
  meetingPlatform?: string;
  meetingLink?: string;

  // Pre-registration
  allowPreRegistration?: boolean;
  preRegistrationDeposit?: number;
  remainingPaymentDueAfterSession?: number;

  // Syllabus
  syllabus?: ISessionSyllabus[];

  // Audience & Prerequisites
  targetAudience?: string[];
  prerequisites?: string[];
  sessionDuration?: number;

  status: 'draft' | 'published' | 'completed' | 'cancelled';
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export const classesApi = {
  getClasses: async (params?: any) => {
    return api.get<any, ApiResponse<{ classes: ClassItem[]; total: number; page: number; pages: number }>>('/classes', { params });
  },
  getClassBySlug: async (slug: string) => {
    return api.get<any, ApiResponse<ClassItem>>(`/classes/${slug}`);
  },
  getMyClasses: async () => {
    return api.get<any, ApiResponse<any[]>>('/me/classes');
  },
  getClassEnrollmentStatus: async (classId: string) => {
    return api.get<any, ApiResponse<any>>(`/classes/${classId}/enrollment`);
  },
  joinClass: async (classId: string) => {
    return api.get<any, ApiResponse<{ meetingUrl?: string }>>(`/classes/${classId}/join`);
  },
  registerForClass: async (classId: string, data: { paymentType: 'full' | 'deposit' }) => {
    return api.post<any, ApiResponse<any>>(`/classes/${classId}/register`, data);
  },
  payRemainingBalance: async (classId: string) => {
    return api.post<any, ApiResponse<any>>(`/classes/${classId}/pay-remaining`, {});
  },
  getClassAttendance: async (classId: string) => {
    return api.get<any, ApiResponse<any>>(`/classes/${classId}/attendance`);
  },
  takeSessionAttendance: async (classId: string, data: {
    sessionNumber: number;
    sessionTitle?: string;
    sessionDate?: string;
    records: { userId: string; status: 'present' | 'absent' | 'late' | 'excused'; note?: string }[];
    notes?: string;
  }) => {
    return api.post<any, ApiResponse<any>>(`/classes/${classId}/attendance`, data);
  },
  getClassStudents: async (classId: string) => {
    return api.get<any, ApiResponse<any[]>>(`/classes/${classId}/students`);
  },
  enrollFreeClass: async (classId: string) => {
    return api.post<any, ApiResponse<any>>(`/classes/${classId}/enroll-free`, {});
  },
  // Instructor / Admin management
  getInstructorClasses: async () => {
    return api.get<any, ApiResponse<ClassItem[]>>('/instructor/classes');
  },
  createClass: async (data: any) => {
    return api.post<any, ApiResponse<ClassItem>>('/instructor/classes', data);
  },
  updateClass: async (classId: string, data: any) => {
    return api.patch<any, ApiResponse<ClassItem>>(`/instructor/classes/${classId}`, data);
  },
  deleteClass: async (classId: string) => {
    return api.delete<any, ApiResponse<any>>(`/instructor/classes/${classId}`);
  }
};
