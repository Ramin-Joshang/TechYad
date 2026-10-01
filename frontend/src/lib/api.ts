import axios, { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import toast from 'react-hot-toast';

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// Backend API Base URL running on Port 5000
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export const api = axios.create({
  baseURL: API_URL, // Backend server running on port 5000
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue: {
  resolve: (value?: unknown) => void;
  reject: (error: unknown) => void;
}[] = [];

api.interceptors.request.use(
  (config) => config as CustomAxiosRequestConfig
);

api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response.data;
  },

  async (error) => {
    const originalRequest =
      error.config as CustomAxiosRequestConfig;

    const hideToast =
      originalRequest?.headers?.['X-Hide-Error-Toast'] === 'true';

    if (error.response) {
      const status = error.response.status;

      const message =
        error.response.data?.error?.message ||
        error.response.data?.message ||
        'خطایی رخ داده است';

      const isAuthCheck =
        originalRequest?.url?.includes('/auth/me') ||
        originalRequest?.url?.includes('/auth/refresh');

      const isAuthAction =
        originalRequest?.url?.includes('/auth/login') ||
        originalRequest?.url?.includes('/auth/register');

      // 401 from auth check
      if (status === 401 && isAuthCheck) {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('auth:unauthorized')
          );
        }

        return Promise.reject(error);
      }

      // Login/Register failed
      if (status === 401 && isAuthAction) {
        return Promise.reject(error);
      }

      // Token expired
      if (status === 401 && originalRequest && !originalRequest._retry) {

        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then(() => {
              return api(originalRequest);
            })
            .catch((err) => {
              return Promise.reject(err);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          // مهم: اینجا هم باید به پورت 5000 برود
          await axios.post(
            `${API_URL}/auth/refresh`,
            {},
            {
              withCredentials: true,
              headers: {
                'X-Hide-Error-Toast': 'true',
              },
            }
          );

          failedQueue.forEach((prom) => prom.resolve());
          failedQueue = [];

          return api(originalRequest);

        } catch (refreshError) {

          failedQueue.forEach((prom) =>
            prom.reject(refreshError)
          );

          failedQueue = [];

          if (!hideToast) {
            toast.error('لطفاً دوباره وارد شوید');
          }

          if (typeof window !== 'undefined') {
            window.dispatchEvent(
              new CustomEvent('auth:unauthorized')
            );
          }

          return Promise.reject(refreshError);

        } finally {
          isRefreshing = false;
        }

      } else if (!hideToast && status !== 401) {

        switch (status) {
          case 403:
            toast.error(
              message ||
                'شما دسترسی لازم برای این عملیات را ندارید'
            );
            break;

          case 404:
            toast.error(
              message || 'مورد یافت نشد'
            );
            break;

          case 409:
            toast.error(
              message ||
                'تداخل اطلاعات. این عملیات قابل انجام نیست'
            );
            break;

          case 422:
            toast.error(
              message ||
                'اطلاعات وارد شده نامعتبر است'
            );
            break;

          case 500:
            toast.error(
              message ||
                'خطای سرور. لطفا مجددا تلاش کنید'
            );
            break;

          default:
            toast.error(message);
        }
      }

    } else if (error.request) {

      if (!hideToast) {
        toast.error('خطا در برقراری ارتباط با سرور');
      }
    }

    return Promise.reject(error);
  }
);