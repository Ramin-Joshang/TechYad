import { api } from '@/lib/api';

export interface Instructor {
  _id: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  bio?: string;
  jobTitle?: string;
}

interface ListResponse<T> {
  success: boolean;
  message?: string;
  data: T[];
}

interface SingleResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export const instructorsApi = {
  getInstructors: async () => {
    return api.get<any, ListResponse<Instructor>>('/instructors');
  },
  
  getInstructorById: async (id: string) => {
    return api.get<any, SingleResponse<Instructor>>(`/instructors/${id}`);
  },

  getMyProfile: async () => {
    return api.get<any, SingleResponse<any>>('/instructor/profile');
  },

  updateMyProfile: async (data: any) => {
    return api.put<any, SingleResponse<any>>('/instructor/profile', data);
  }
};
