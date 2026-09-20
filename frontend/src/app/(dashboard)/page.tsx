'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/features/auth/stores/auth.store';

export default function DashboardIndexPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  useEffect(() => {
    if (user?.role === 'super-admin' || user?.role === 'admin') {
      router.replace('/admin');
    } else if (user?.role === 'instructor') {
      router.replace('/instructor');
    } else {
      router.replace('/student');
    }
  }, [user, router]);

  return <div className="p-8 text-center text-[var(--neo-text-secondary)]">در حال انتقال...</div>;
}
