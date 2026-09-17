'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/features/auth/api/auth.api';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { GuestGuard } from '@/features/auth/components/guards/GuestGuard';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authApi.login({ email, password });
      if (response.success) {
        setAuth(response.data.user);
        
        // Redirect based on role
        const role = response.data.user.role;
        if (role === 'super-admin' || role === 'admin') router.push('/admin');
        else if (role === 'instructor') router.push('/instructor');
        else router.push('/student');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'خطا در ورود به حساب کاربری');
    } finally {
      setLoading(false);
    }
  };

  return (
    <GuestGuard>
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-[var(--neo-border)] p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[var(--neo-text-main)] mb-2">ورود به تک‌یاد</h1>
          <p className="text-[var(--neo-text-muted)] text-sm">برای ادامه ایمیل و رمز عبور خود را وارد کنید</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-[var(--neo-text-secondary)] mb-1.5">ایمیل</label>
            <input 
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-[var(--neo-border)] focus:outline-none focus:ring-2 focus:ring-[var(--neo-primary)] focus:border-transparent transition-all dir-ltr text-left"
              placeholder="user@example.com"
              required 
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-sm font-medium text-[var(--neo-text-secondary)]">رمز عبور</label>
              <Link href="/forgot-password" className="text-xs font-medium text-[var(--neo-primary)] hover:text-opacity-80">
                فراموشی رمز؟
              </Link>
            </div>
            <input 
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-[var(--neo-border)] focus:outline-none focus:ring-2 focus:ring-[var(--neo-primary)] focus:border-transparent transition-all dir-ltr text-left"
              placeholder="••••••••"
              required 
            />
          </div>
          <button 
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-[var(--neo-primary)] text-white font-medium rounded-xl hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--neo-primary)] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? 'در حال ورود...' : 'ورود به حساب'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-[var(--neo-text-muted)]">
          حساب کاربری ندارید؟{' '}
          <Link href="/register" className="font-medium text-[var(--neo-primary)] hover:text-opacity-80">
            ثبت‌نام کنید
          </Link>
        </div>
      </div>
    </main>
    </GuestGuard>
  );
}
