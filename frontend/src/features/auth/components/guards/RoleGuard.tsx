'use client';

import { useAuthStore } from '../../stores/auth.store';
import { AuthGuard } from './AuthGuard';
import { ReactNode } from 'react';

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: Array<'super-admin' | 'admin' | 'instructor' | 'student' | 'partner' | 'accountant' | string>;
  fallback?: ReactNode;
}

export function RoleGuard({ children, allowedRoles, fallback = null }: RoleGuardProps) {
  const { user, isInitializing } = useAuthStore();

  if (isInitializing) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const userRoles: string[] = [
    ...(user?.role ? [user.role] : []),
    ...(user?.roles || []),
    ...(Array.isArray(user?.rolesDetail) ? user.rolesDetail.map(r => r.slug) : []),
  ];

  // Super-admin has access to everything
  if (userRoles.includes('super-admin')) {
    return <AuthGuard>{children}</AuthGuard>;
  }

  // Instructor capability: users with instructor role or explicit canTeach flag can access instructor workspace
  if (allowedRoles.includes('instructor') && (userRoles.includes('instructor') || !!user?.canTeach)) {
    return <AuthGuard>{children}</AuthGuard>;
  }

  // Learner capability: all authenticated users have access to the student learning area
  if (allowedRoles.includes('student') && user) {
    return <AuthGuard>{children}</AuthGuard>;
  }

  if (user && userRoles.some((r) => allowedRoles.includes(r))) {
    return <AuthGuard>{children}</AuthGuard>;
  }

  return <>{fallback}</>;
}
