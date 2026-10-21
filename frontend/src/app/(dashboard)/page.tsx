'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/features/auth/stores/auth.store';

export default function DashboardIndexPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user) return;

    const roles: string[] = [
      ...(Array.isArray(user.roles) ? user.roles : []),
      ...(Array.isArray(user.rolesDetail) ? user.rolesDetail.map((r: any) => r.slug) : []),
      user.role || ''
    ].filter(Boolean);

    if (roles.includes('super-admin')) {
      router.replace('/super-admin');
    } else if (roles.includes('admin')) {
      router.replace('/admin');
    } else if (roles.includes('instructor') || !!user.canTeach) {
      router.replace('/instructor');
    } else if (roles.includes('accountant') || roles.includes('partner')) {
      router.replace('/accounting');
    } else {
      router.replace('/student');
    }
  }, [user, router]);

  return <div className="p-8 text-center text-[var(--neo-text-secondary)]">در حال انتقال...</div>;
}
