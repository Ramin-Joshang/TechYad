import { api } from '@/lib/api';
import { User } from '../stores/auth.store';

// Define the response formats based on the backend sendSuccess structure
interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

interface AuthResponse {
  user: User;
}

export const authApi = {
  login: async (credentials: any) => {
    return api.post<any, ApiResponse<AuthResponse>>('/auth/login', credentials);
  },
  
  register: async (userData: any) => {
    return api.post<any, ApiResponse<AuthResponse>>('/auth/register', userData);
  },

  logout: async () => {
    return api.post<any, ApiResponse<null>>('/auth/logout');
  },

  getMe: async () => {
    return api.get<any, ApiResponse<User>>('/auth/me', {
      headers: { 'X-Hide-Error-Toast': 'true' }
    });
  },
  
  updateProfile: async (userData: any) => {
    return api.patch<any, ApiResponse<User>>('/auth/me', userData);
  },

  forgotPassword: async (email: string) => {
    return api.post<any, ApiResponse<any>>('/auth/forgot-password', { email });
  },

  resetPassword: async (data: any) => {
    return api.post<any, ApiResponse<any>>('/auth/reset-password', data);
  }
};
