import axios, { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import toast from 'react-hot-toast';

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

export const api = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue: any[] = [];

api.interceptors.request.use((config) => config as CustomAxiosRequestConfig);

api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;
    const hideToast = originalRequest?.headers?.['X-Hide-Error-Toast'] === 'true';

    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.error?.message || error.response.data?.message || 'خطایی رخ داده است';

      // Check if this request is /auth/me or /auth/refresh or auth checks where 401 is expected for guests
      const isAuthCheck = originalRequest?.url?.includes('/auth/me') || originalRequest?.url?.includes('/auth/refresh');
      const isAuthAction = originalRequest?.url?.includes('/auth/login') || originalRequest?.url?.includes('/auth/register');

      if (status === 401 && isAuthCheck) {
        // Silent rejection for initial auth check so guests don't see errors or refresh loops
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('auth:unauthorized'));
        }
        return Promise.reject(error);
      }

      if (status === 401 && isAuthAction) {
        // Login failed with 401 - do NOT retry or attempt token refresh!
        return Promise.reject(error);
      }

      if (status === 401 && originalRequest && !originalRequest._retry) {
        if (isRefreshing) {
          return new Promise(function(resolve, reject) {
            failedQueue.push({resolve, reject});
          }).then(() => {
            return api(originalRequest);
          }).catch(err => {
            return Promise.reject(err);
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          // Call the refresh endpoint to get new cookies
          await axios.post('/api/v1/auth/refresh', {}, {
            withCredentials: true,
            headers: { 'X-Hide-Error-Toast': 'true' }
          });
          
          failedQueue.forEach(prom => prom.resolve());
          failedQueue = [];
          
          return api(originalRequest);
        } catch (refreshError) {
          failedQueue.forEach(prom => prom.reject(refreshError));
          failedQueue = [];
          
          if (!hideToast) {
            toast.error('لطفاً دوباره وارد شوید');
          }
          
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('auth:unauthorized'));
          }
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      } else if (!hideToast && status !== 401) {
        switch (status) {
          case 403:
            toast.error(message || 'شما دسترسی لازم برای این عملیات را ندارید');
            break;
          case 404:
            toast.error(message || 'مورد یافت نشد');
            break;
          case 409:
            toast.error(message || 'تداخل اطلاعات. این عملیات قابل انجام نیست');
            break;
          case 422:
            toast.error(message || 'اطلاعات وارد شده نامعتبر است');
            break;
          case 500:
            toast.error(message || 'خطای سرور. لطفا مجددا تلاش کنید');
            break;
          default:
            toast.error(message);
        }
      }
    } else if (error.request) {
      if (!hideToast) toast.error('خطا در برقراری ارتباط با سرور');
    }

    return Promise.reject(error);
  }
);
