'use client';

import { useEffect, useRef } from 'react';
import { useAuthStore } from '../stores/auth.store';
import { authApi } from '../api/auth.api';
import { superAdminApi } from '@/features/admin/api/super-admin.api';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setAuth, logout, setInitializing } = useAuthStore();
  const initAttempted = useRef(false);

  useEffect(() => {
    // Fetch and apply SEO settings to document
    superAdminApi.getPublicSettings().then((res: any) => {
      if (res?.data) {
        if (res.data.siteName && (!document.title || document.title.includes('تک‌یاد') || document.title.includes('TechYad'))) {
          // If on home page, update site name
          if (window.location.pathname === '/') {
            document.title = res.data.siteName;
          }
        }
        if (res.data.seoDescription) {
          let metaDesc = document.querySelector('meta[name="description"]');
          if (!metaDesc) {
            metaDesc = document.createElement('meta');
            metaDesc.setAttribute('name', 'description');
            document.head.appendChild(metaDesc);
          }
          metaDesc.setAttribute('content', res.data.seoDescription);
        }
        if (res.data.siteFavicon) {
          let linkIcon = document.querySelector("link[rel*='icon']");
          if (!linkIcon) {
            linkIcon = document.createElement('link');
            linkIcon.setAttribute('rel', 'shortcut icon');
            document.head.appendChild(linkIcon);
          }
          linkIcon.setAttribute('href', res.data.siteFavicon);
        }
      }
    }).catch(() => {});

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
