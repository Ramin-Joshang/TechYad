'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authApi } from '@/features/auth/api/auth.api';
import { GuestGuard } from '@/features/auth/components/guards/GuestGuard';
import { AuthCardLayout } from '@/features/auth/components/AuthCardLayout';
import Link from 'next/link';
import { Lock, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setStatus('error');
      setMessage('رمز عبور جدید و تکرار آن یکسان نیستند.');
      return;
    }

    if (password.length < 6) {
      setStatus('error');
      setMessage('رمز عبور باید حداقل ۶ کاراکتر باشد.');
      return;
    }

    if (!token) {
      setStatus('error');
      setMessage('توکن بازیابی نامعتبر یا منقضی شده است.');
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
      setMessage(err.response?.data?.message || 'خطا در تغییر رمز عبور. لطفاً دوباره تلاش کنید.');
    }
  };

  if (!token) {
    return (
      <div className="text-center py-6">
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs sm:text-sm font-medium flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
          <span>لینک بازیابی نامعتبر است یا منقضی شده است.</span>
        </div>
        <Link 
          href="/forgot-password" 
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[var(--neo-primary)] text-white font-bold rounded-xl hover:bg-blue-700 transition text-sm"
        >
          <span>درخواست مجدد لینک بازیابی</span>
          <ArrowLeft className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <>
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
          <h3 className="text-lg font-bold text-[var(--neo-text-main)] mb-2">رمز عبور به‌روزرسانی شد</h3>
          <p className="text-xs sm:text-sm text-[var(--neo-text-secondary)] mb-2 leading-relaxed">
            {message}
          </p>
          <p className="text-xs text-[var(--neo-text-muted)]">در حال هدایت خودکار به صفحه ورود...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs sm:text-sm font-bold text-[var(--neo-text-main)] mb-1.5">
              رمز عبور جدید (حداقل ۶ کاراکتر)
            </label>
            <div className="relative">
              <input 
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-11 pr-11 py-3 rounded-xl border border-[var(--neo-border)] bg-[var(--neo-surface)] text-[var(--neo-text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--neo-primary)] focus:border-transparent transition-all dir-ltr text-left text-sm"
                placeholder="••••••••"
                required 
              />
              <Lock className="w-5 h-5 text-[var(--neo-text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--neo-text-muted)] hover:text-[var(--neo-text-main)] transition"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-bold text-[var(--neo-text-main)] mb-1.5">
              تکرار رمز عبور جدید
            </label>
            <div className="relative">
              <input 
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full pl-11 pr-11 py-3 rounded-xl border border-[var(--neo-border)] bg-[var(--neo-surface)] text-[var(--neo-text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--neo-primary)] focus:border-transparent transition-all dir-ltr text-left text-sm"
                placeholder="••••••••"
                required 
              />
              <Lock className="w-5 h-5 text-[var(--neo-text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
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
                <span>در حال ثبت تغییرات...</span>
              </>
            ) : (
              <>
                <span>ثبت رمز عبور جدید</span>
                <ArrowLeft className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      )}
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <GuestGuard>
      <AuthCardLayout
        title="تغییر رمز عبور"
        subtitle="رمز عبور جدید و امن خود را وارد و تأیید نمایید"
      >
        <Suspense fallback={<div className="text-center py-6 text-sm text-[var(--neo-text-muted)]">در حال اعتبارسنجی توکن...</div>}>
          <ResetPasswordForm />
        </Suspense>

        <div className="mt-8 text-center text-xs sm:text-sm text-[var(--neo-text-secondary)] pt-4 border-t border-[var(--neo-border)]">
          <Link href="/login" className="font-bold text-[var(--neo-primary)] hover:underline">
            بازگشت به صفحه ورود
          </Link>
        </div>
      </AuthCardLayout>
    </GuestGuard>
  );
}
