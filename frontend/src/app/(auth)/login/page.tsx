'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/features/auth/api/auth.api';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { GuestGuard } from '@/features/auth/components/guards/GuestGuard';
import { AuthCardLayout } from '@/features/auth/components/AuthCardLayout';
import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, ArrowLeft, UserCheck } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
        
        const params = new URLSearchParams(window.location.search);
        const redirectUrl = params.get('redirect');
        if (redirectUrl && !redirectUrl.startsWith('//') && redirectUrl.startsWith('/')) {
          router.push(redirectUrl);
          return;
        }

        // Redirect based on role
        const role = response.data.user.role;
        if (role === 'super-admin' || role === 'admin') router.push('/admin');
        else if (role === 'instructor') router.push('/instructor');
        else router.push('/student');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'ایمیل یا رمز عبور اشتباه است.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password123');
    setError('');
  };

  return (
    <GuestGuard>
      <AuthCardLayout
        title="ورود به حساب کاربری"
        subtitle="برای دسترسی به پنل و دوره‌ها، اطلاعات ورود خود را وارد نمایید"
      >
        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs sm:text-sm font-medium flex items-center gap-2.5 animate-in fade-in duration-200">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
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

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs sm:text-sm font-bold text-[var(--neo-text-main)]">
                رمز عبور
              </label>
              <Link 
                href="/forgot-password" 
                className="text-xs font-bold text-[var(--neo-primary)] hover:underline"
              >
                فراموشی رمز عبور؟
              </Link>
            </div>
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

          <button 
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 px-4 bg-[var(--neo-primary)] hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-md shadow-[var(--neo-primary)]/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--neo-primary)] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>در حال تأیید اطلاعات...</span>
              </>
            ) : (
              <>
                <span>ورود به حساب</span>
                <ArrowLeft className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Fast Demo Accounts */}
        <div className="mt-6 pt-5 border-t border-[var(--neo-border)]">
          <div className="text-xs font-bold text-[var(--neo-text-muted)] mb-2 flex items-center gap-1">
            <UserCheck className="w-3.5 h-3.5 text-[var(--neo-primary)]" />
            <span>تست سریع با حساب‌های پیش‌فرض:</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickFill('student@tekyad.com')}
              className="px-2 py-1.5 text-xs font-medium rounded-lg bg-[var(--neo-surface-2)] hover:bg-blue-50 hover:text-[var(--neo-primary)] border border-[var(--neo-border)] transition text-center truncate"
            >
              دانشجو
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('instructor@tekyad.com')}
              className="px-2 py-1.5 text-xs font-medium rounded-lg bg-[var(--neo-surface-2)] hover:bg-blue-50 hover:text-[var(--neo-primary)] border border-[var(--neo-border)] transition text-center truncate"
            >
              استاد
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('admin@tekyad.com')}
              className="px-2 py-1.5 text-xs font-medium rounded-lg bg-[var(--neo-surface-2)] hover:bg-blue-50 hover:text-[var(--neo-primary)] border border-[var(--neo-border)] transition text-center truncate"
            >
              مدیر
            </button>
          </div>
        </div>

        {/* Bottom register link */}
        <div className="mt-6 text-center text-xs sm:text-sm text-[var(--neo-text-secondary)]">
          حساب کاربری ندارید؟{' '}
          <Link href="/register" className="font-bold text-[var(--neo-primary)] hover:underline">
            ثبت‌نام رایگان کنید
          </Link>
        </div>
      </AuthCardLayout>
    </GuestGuard>
  );
}
