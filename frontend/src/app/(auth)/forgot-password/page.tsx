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
        subtitle="ایمیل ثبت‌شده در سامانه را وارد کنید تا لینک تغییر رمز برای شما ارسال شود"
      >
        {status === 'error' && (
          <div className="mb-5 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs sm:text-sm font-medium flex items-center gap-2.5 animate-in fade-in duration-200">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
            <span>{message}</span>
          </div>
        )}

        {status === 'success' ? (
          <div className="text-center py-6 animate-in zoom-in-95 duration-200">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-[var(--neo-text-main)] mb-2">ایمیل با موفقیت ارسال شد</h3>
            <p className="text-xs sm:text-sm text-[var(--neo-text-secondary)] mb-6 max-w-sm mx-auto leading-relaxed">
              {message}
            </p>
            <Link 
              href="/login" 
              className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-4 bg-[var(--neo-primary)] text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-[var(--neo-primary)]/20 text-sm"
            >
              <span>بازگشت به صفحه ورود</span>
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-bold text-[var(--neo-text-main)] mb-1.5">
                آدرس ایمیل
              </label>
              <div className="relative">
                <input 
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-[var(--neo-border)] bg-[var(--neo-surface)] text-[var(--neo-text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--neo-primary)] focus:border-transparent transition-all dir-ltr text-left text-sm"
                  placeholder="name@example.com"
                  required 
                />
                <Mail className="w-5 h-5 text-[var(--neo-text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <button 
              type="submit"
              disabled={status === 'loading'}
              className="w-full mt-2 py-3.5 px-4 bg-[var(--neo-primary)] hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-md shadow-[var(--neo-primary)]/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--neo-primary)] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
            >
              {status === 'loading' ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>در حال ارسال لینک...</span>
                </>
              ) : (
                <>
                  <span>ارسال لینک بازیابی رمز</span>
                  <ArrowLeft className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        <div className="mt-8 text-center text-xs sm:text-sm text-[var(--neo-text-secondary)] pt-4 border-t border-[var(--neo-border)]">
          رمز عبور خود را به یاد آوردید؟{' '}
          <Link href="/login" className="font-bold text-[var(--neo-primary)] hover:underline">
            ورود به حساب
          </Link>
        </div>
      </AuthCardLayout>
    </GuestGuard>
  );
}
