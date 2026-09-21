'use client';

import { useState } from 'react';
import { authApi } from '@/features/auth/api/auth.api';
import { GuestGuard } from '@/features/auth/components/guards/GuestGuard';
import { AuthCardLayout } from '@/features/auth/components/AuthCardLayout';
import Link from 'next/link';
import { Mail, Loader2, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';

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
      <AuthCardLayout
        title="بازیابی رمز عبور"
      >
        {status === 'error' && (
          <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs sm:text-sm font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{message}</span>
          </div>
        )}

        {status === 'success' ? (
          <div className="text-center py-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <p className="text-xs sm:text-sm text-[var(--neo-text-secondary)] mb-5 leading-relaxed">
              {message}
            </p>
            <Link 
              href="/login" 
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-[var(--neo-primary)] text-white font-bold rounded-xl hover:bg-blue-700 transition text-sm"
            >
              <span>بازگشت به صفحه ورود</span>
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-xs text-[var(--neo-text-secondary)] leading-relaxed">
              ایمیل خود را وارد کنید تا لینک بازیابی رمز عبور برای شما ارسال شود.
            </p>
            <div>
              <div className="relative">
                <input 
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-[var(--neo-border)] bg-[var(--neo-surface)] text-[var(--neo-text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--neo-primary)] focus:border-transparent transition dir-ltr text-left text-sm"
                  placeholder="name@example.com"
                  required 
                />
                <Mail className="w-4 h-4 text-[var(--neo-text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <button 
              type="submit"
              disabled={status === 'loading'}
              className="w-full mt-2 py-3 px-4 bg-[var(--neo-primary)] hover:bg-blue-700 text-white font-bold rounded-xl transition shadow-md shadow-[var(--neo-primary)]/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--neo-primary)] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
            >
              {status === 'loading' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>در حال ارسال لینک...</span>
                </>
              ) : (
                <>
                  <span>ارسال لینک بازیابی</span>
                  <ArrowLeft className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        <div className="mt-6 text-center text-xs sm:text-sm text-[var(--neo-text-secondary)] pt-4 border-t border-[var(--neo-border)]">
          رمز عبور خود را به یاد دارید؟{' '}
          <Link href="/login" className="font-bold text-[var(--neo-primary)] hover:underline">
            ورود به حساب
          </Link>
        </div>
      </AuthCardLayout>
    </GuestGuard>
  );
}
