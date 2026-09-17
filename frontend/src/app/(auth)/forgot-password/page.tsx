'use client';

import { useState } from 'react';
import { authApi } from '@/features/auth/api/auth.api';
import { GuestGuard } from '@/features/auth/components/guards/GuestGuard';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');
    
    try {
      const response = await authApi.forgotPassword(email);
      if (response.success) {
        setStatus('success');
        setMessage(response.message || 'لینک بازیابی رمز عبور به ایمیل شما ارسال شد.');
      }
    } catch (err: any) {
      setStatus('error');
      setMessage(err.response?.data?.message || 'خطا در ارسال لینک بازیابی');
    }
  };

  return (
    <GuestGuard>
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-[var(--neo-border)] p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-[var(--neo-text-main)] mb-2">فراموشی رمز عبور</h1>
            <p className="text-[var(--neo-text-muted)] text-sm">ایمیل خود را وارد کنید تا لینک بازیابی را برایتان ارسال کنیم</p>
          </div>

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
              <Link href="/login" className="inline-block w-full py-3 px-4 bg-[var(--neo-primary)] text-white font-medium rounded-xl hover:bg-opacity-90 transition-all">
                بازگشت به صفحه ورود
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
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

              <button 
                type="submit"
                disabled={status === 'loading'}
                className="w-full py-3 px-4 bg-[var(--neo-primary)] text-white font-medium rounded-xl hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--neo-primary)] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {status === 'loading' ? 'در حال ارسال...' : 'ارسال لینک بازیابی'}
              </button>
            </form>
          )}

          <div className="mt-8 text-center text-sm text-[var(--neo-text-muted)]">
            <Link href="/login" className="font-medium text-[var(--neo-primary)] hover:text-opacity-80">
              بازگشت به صفحه ورود
            </Link>
          </div>
        </div>
      </main>
    </GuestGuard>
  );
}
