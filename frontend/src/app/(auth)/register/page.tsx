'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/features/auth/api/auth.api';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { GuestGuard } from '@/features/auth/components/guards/GuestGuard';
import { AuthCardLayout } from '@/features/auth/components/AuthCardLayout';
import Link from 'next/link';
import { Mail, Lock, User, Eye, EyeOff, Loader2, AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password.length < 6) {
      setError('رمز عبور باید حداقل ۶ کاراکتر باشد.');
      return;
    }

    setLoading(true);
    
    try {
      const response = await authApi.register(formData);
      if (response.success) {
        setAuth(response.data.user);
        
        const role = response.data.user.role;
        if (role === 'super-admin' || role === 'admin') router.push('/admin');
        else if (role === 'instructor') router.push('/instructor');
        else router.push('/student');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'خطا در ثبت‌نام. لطفاً دوباره تلاش کنید.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <GuestGuard>
      <AuthCardLayout
        title="ایجاد حساب کاربری جدید"
        subtitle="به جمع بزرگ دانشجویان و پژوهشگران پیشرو در تک‌یاد بپیوندید"
      >
        {error && (
          <div className="mb-5 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs sm:text-sm font-medium flex items-center gap-2.5 animate-in fade-in duration-200">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-bold text-[var(--neo-text-main)] mb-1.5">
                نام
              </label>
              <div className="relative">
                <input 
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full pl-3 pr-9 py-3 rounded-xl border border-[var(--neo-border)] bg-[var(--neo-surface)] text-[var(--neo-text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--neo-primary)] focus:border-transparent transition-all text-right text-sm"
                  placeholder="علی"
                  required 
                />
                <User className="w-4 h-4 text-[var(--neo-text-muted)] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-bold text-[var(--neo-text-main)] mb-1.5">
                نام خانوادگی
              </label>
              <div className="relative">
                <input 
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full pl-3 pr-9 py-3 rounded-xl border border-[var(--neo-border)] bg-[var(--neo-surface)] text-[var(--neo-text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--neo-primary)] focus:border-transparent transition-all text-right text-sm"
                  placeholder="محمدی"
                  required 
                />
                <User className="w-4 h-4 text-[var(--neo-text-muted)] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-bold text-[var(--neo-text-main)] mb-1.5">
              آدرس ایمیل
            </label>
            <div className="relative">
              <input 
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-[var(--neo-border)] bg-[var(--neo-surface)] text-[var(--neo-text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--neo-primary)] focus:border-transparent transition-all dir-ltr text-left text-sm"
                placeholder="name@example.com"
                required 
              />
              <Mail className="w-5 h-5 text-[var(--neo-text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-bold text-[var(--neo-text-main)] mb-1.5">
              رمز عبور (حداقل ۶ کاراکتر)
            </label>
            <div className="relative">
              <input 
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
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

          <div className="text-[11px] text-[var(--neo-text-muted)] leading-relaxed flex items-center gap-1.5 pt-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>با ثبت‌نام، قوانین و مقررات حریم خصوصی تک‌یاد را می‌پذیرید.</span>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 px-4 bg-[var(--neo-primary)] hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-md shadow-[var(--neo-primary)]/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--neo-primary)] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>در حال ساخت حساب...</span>
              </>
            ) : (
              <>
                <span>تکمیل و ایجاد حساب کاربری</span>
                <ArrowLeft className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Bottom login link */}
        <div className="mt-8 text-center text-xs sm:text-sm text-[var(--neo-text-secondary)] pt-4 border-t border-[var(--neo-border)]">
          قبلاً ثبت‌نام کرده‌اید؟{' '}
          <Link href="/login" className="font-bold text-[var(--neo-primary)] hover:underline">
            وارد حساب خود شوید
          </Link>
        </div>
      </AuthCardLayout>
    </GuestGuard>
  );
}
