'use client';

import { useEffect, useRef } from 'react';
import { useAuthStore } from '../stores/auth.store';
import { authApi } from '../api/auth.api';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setAuth, logout, setInitializing } = useAuthStore();
  const initAttempted = useRef(false);

  useEffect(() => {
    const initAuth = async () => {
      if (initAttempted.current) return;
      initAttempted.current = true;
      try {
        const response = await authApi.getMe();
        if (response.success && response.data) {
          setAuth(response.data);
        } else {
          logout();
        }
      } catch (error: any) {
        // Only log out if the backend explicitly reports 401 Unauthorized
        if (error?.response?.status === 401) {
          logout();
        }
      } finally {
        setInitializing(false);
      }
    };
    initAuth();
    
    const handleUnauthorized = () => logout();
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, [setAuth, logout, setInitializing]);

  return <>{children}</>;
}
