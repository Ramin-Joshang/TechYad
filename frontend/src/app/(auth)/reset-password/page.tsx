'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authApi } from '@/features/auth/api/auth.api';
import { GuestGuard } from '@/features/auth/components/guards/GuestGuard';
import Link from 'next/link';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setStatus('error');
      setMessage('رمز عبور و تکرار آن مطابقت ندارند');
      return;
    }

    if (!token) {
      setStatus('error');
      setMessage('توکن بازیابی نامعتبر است');
      return;
    }

    setStatus('loading');
    setMessage('');
    
    try {
      const response = await authApi.resetPassword({ token, newPassword: password });
      if (response.success) {
        setStatus('success');
        setMessage('رمز عبور شما با موفقیت تغییر کرد.');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      }
    } catch (err: any) {
      setStatus('error');
      setMessage(err.response?.data?.message || 'خطا در تغییر رمز عبور');
    }
  };

  if (!token) {
    return (
      <div className="text-center">
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
          لینک بازیابی نامعتبر است یا منقضی شده است.
        </div>
        <Link href="/forgot-password" className="font-medium text-[var(--neo-primary)] hover:text-opacity-80">
          درخواست مجدد لینک بازیابی
        </Link>
      </div>
    );
  }

  return (
    <>
      {status === 'error' && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
          {message}
        </div>
      )}

      {status === 'success' ? (
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-50 text-green-600 mb-6">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <p className="text-[var(--neo-text-secondary)] mb-6">{message}</p>
          <p className="text-sm text-[var(--neo-text-muted)]">در حال انتقال به صفحه ورود...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-[var(--neo-text-secondary)] mb-1.5">رمز عبور جدید</label>
            <input 
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-[var(--neo-border)] focus:outline-none focus:ring-2 focus:ring-[var(--neo-primary)] focus:border-transparent transition-all dir-ltr text-left"
              placeholder="••••••••"
              required 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--neo-text-secondary)] mb-1.5">تکرار رمز عبور جدید</label>
            <input 
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-[var(--neo-border)] focus:outline-none focus:ring-2 focus:ring-[var(--neo-primary)] focus:border-transparent transition-all dir-ltr text-left"
              placeholder="••••••••"
              required 
            />
          </div>

          <button 
            type="submit"
            disabled={status === 'loading'}
            className="w-full py-3 px-4 bg-[var(--neo-primary)] text-white font-medium rounded-xl hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--neo-primary)] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {status === 'loading' ? 'در حال ثبت...' : 'تغییر رمز عبور'}
          </button>
        </form>
      )}
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <GuestGuard>
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-[var(--neo-border)] p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-[var(--neo-text-main)] mb-2">تغییر رمز عبور</h1>
            <p className="text-[var(--neo-text-muted)] text-sm">رمز عبور جدید خود را وارد کنید</p>
          </div>
          <Suspense fallback={<div className="text-center py-4">در حال بررسی...</div>}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </main>
    </GuestGuard>
  );
}
