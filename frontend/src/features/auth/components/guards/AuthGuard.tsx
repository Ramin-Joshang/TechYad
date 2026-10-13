'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '../../stores/auth.store';
import { PhoneVerificationGate } from '../PhoneVerificationGate';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isInitializing } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isInitializing && !isAuthenticated) {
      router.replace(`/login?redirect=${pathname}`);
    }
  }, [isInitializing, isAuthenticated, router, pathname]);

  if (isInitializing) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  // If user phone number is unverified, enforce verification modal
  if (user && !user.mobileVerified) {
    return (
      <>
        <PhoneVerificationGate />
        <div className="opacity-30 pointer-events-none filter blur-sm">
          {children}
        </div>
      </>
    );
  }

  return <>{children}</>;
}
