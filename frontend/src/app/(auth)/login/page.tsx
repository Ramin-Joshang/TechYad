'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/features/auth/api/auth.api';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { GuestGuard } from '@/features/auth/components/guards/GuestGuard';
import { AuthCardLayout } from '@/features/auth/components/AuthCardLayout';
import Link from 'next/link';
import { 
  Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, ArrowLeft, 
  Smartphone, KeyRound, RefreshCw, CheckCircle2, ShieldAlert 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { superAdminApi } from '@/features/admin/api/super-admin.api';
import { useQuery } from '@tanstack/react-query';

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [loginMethod, setLoginMethod] = useState<'password' | 'otp'>('password');
  
  // Password login state
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // OTP login state
  const [mobile, setMobile] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpStep, setOtpStep] = useState<'mobile' | 'code'>('mobile');
  const [countdown, setCountdown] = useState(0);
  const [devCode, setDevCode] = useState<string | null>(null);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { data: locksData } = useQuery({
    queryKey: ['public-platform-locks'],
    queryFn: () => superAdminApi.getPublicPlatformLocks().then(res => res.data),
    staleTime: 10000,
    retry: false
  });
  const platformLocks = locksData?.locks || {};
  const lockMessages = locksData?.messages || {};

  useEffect(() => {
    let timer: any;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const reason = params.get('reason');
      if (reason === 'inactivity') {
        setError('نشست کاری شما به دلیل عدم فعالیت جهت حفظ امنیت سامانه منقضی شد. لطفاً دوباره وارد شوید.');
      } else if (reason === 'revoked') {
        setError('نشست کاری شما باطل شده است. لطفاً مجدداً وارد حساب کاربری خود شوید.');
      }
    }
  }, []);

  const handleSuccessfulAuth = (user: any) => {
    setAuth(user);
    toast.success(`خوش آمدید، ${user.firstName || 'کاربر گرامی'}`);
    
    const params = new URLSearchParams(window.location.search);
    const redirectUrl = params.get('redirect');
    if (redirectUrl && !redirectUrl.startsWith('//') && redirectUrl.startsWith('/')) {
      router.push(redirectUrl);
      return;
    }

    const roles: string[] = [
      ...(Array.isArray(user.roles) ? user.roles : []),
      ...(Array.isArray(user.rolesDetail) ? user.rolesDetail.map((r: any) => r.slug) : []),
      user.role || ''
    ].filter(Boolean);

    if (roles.includes('super-admin')) router.push('/super-admin');
    else if (roles.includes('admin')) router.push('/admin');
    else if (roles.includes('instructor') || !!user.canTeach) router.push('/instructor');
    else if (roles.includes('accountant') || roles.includes('partner')) router.push('/accounting');
    else router.push('/student');
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanInput = identifier.trim();
    if (cleanInput.includes('@')) {
      setError('ورود با ایمیل غیرفعال است. لطفاً شماره موبایل خود را وارد نمایید.');
      return;
    }

    setLoading(true);

    try {
      const response = await authApi.login({ identifier: cleanInput, password });
      if (response.success) {
        if (!response.data.user.mobileVerified) {
          toast.error('شماره موبایل شما تایید نشده است. کد تایید پیامکی ارسال شد.');
          setMobile(cleanInput);
          setLoginMethod('otp');
          setOtpStep('code');
          setCountdown(180);
          setError('شماره موبایل شما تایید نشده است. لطفاً کد تایید پیامک‌شده را وارد نمایید.');
          return;
        }
        handleSuccessfulAuth(response.data.user);
      }
    } catch (err: any) {
      const errCode = err.response?.data?.error?.code || err.response?.data?.code;
      const errMsg = err.response?.data?.error?.message || err.response?.data?.message || 'شماره موبایل یا رمز عبور اشتباه است.';
      
      if (errCode === 'AUTH_PHONE_NOT_VERIFIED' || errMsg.includes('تایید نشده')) {
        toast.error('شماره موبایل شما تایید نشده است. کد تایید پیامکی ارسال شد.');
        setMobile(cleanInput);
        setLoginMethod('otp');
        setOtpStep('code');
        setCountdown(180);
        setError('شماره شما هنوز تایید نشده است. کد تایید پیامکی ارسال شد؛ لطفاً آن را وارد نمایید.');
      } else {
        setError(errMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');
    const cleanMobile = mobile.trim();
    if (!cleanMobile) {
      setError('لطفاً شماره موبایل خود را وارد نمایید');
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.sendOtp(cleanMobile, 'auth');
      toast.success(res.message || 'کد تایید با موفقیت پیامک شد');
      if (res.data?.devCode) {
        setDevCode(res.data.devCode);
      }
      setOtpStep('code');
      setCountdown(res.data?.expiresInSeconds || 180);
    } catch (err: any) {
      setError(err.response?.data?.message || 'خطا در ارسال کد تایید پیامکی');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!otpCode.trim()) {
      setError('لطفاً کد تایید پیامک‌شده را وارد نمایید');
      return;
    }

    setLoading(true);
    try {
      const response = await authApi.verifyOtp(mobile.trim(), otpCode.trim(), 'auth');
      if (response.success) {
        handleSuccessfulAuth(response.data.user);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'کد تایید اشتباه یا منقضی شده است');
    } finally {
      setLoading(false);
    }
  };

  return (
    <GuestGuard>
      <AuthCardLayout
        title="ورود به حساب کاربری"
      >
        {platformLocks.lockLogin && (
          <div className="mb-4 p-3.5 bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 rounded-2xl text-xs flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div>
              <p className="font-black text-amber-900 dark:text-amber-200">ورود به سامانه موقتاً محدود شده است</p>
              <p className="mt-0.5 leading-relaxed">
                {lockMessages.lockLogin || 'امکان ورود کاربران عادی موقتاً غیرفعال است (مدیران ارشد دسترسی دارند).'}
              </p>
            </div>
          </div>
        )}

        {platformLocks.lockSmsOtp && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 text-blue-800 rounded-2xl text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-blue-600 mt-0.5" />
            <p className="leading-relaxed">
              ارسال پیامک موقتاً محدود است. برای ورود از روش «رمز عبور» استفاده نمایید.
            </p>
          </div>
        )}

        {/* Method Toggle */}
        <div className="flex bg-[var(--neo-surface-2)] p-1 rounded-2xl mb-5 border border-[var(--neo-border)]">
          <button
            type="button"
            onClick={() => { setLoginMethod('password'); setError(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              loginMethod === 'password'
                ? 'bg-white text-[var(--neo-text-main)] shadow-xs'
                : 'text-[var(--neo-text-secondary)] hover:text-[var(--neo-text-main)]'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>رمز عبور</span>
          </button>
          <button
            type="button"
            onClick={() => { setLoginMethod('otp'); setError(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              loginMethod === 'otp'
                ? 'bg-white text-[var(--neo-primary)] shadow-xs'
                : 'text-[var(--neo-text-secondary)] hover:text-[var(--neo-text-main)]'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>پیامک یکبارمصرف (OTP)</span>
          </button>
        </div>

        {error && (
          <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs sm:text-sm font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {/* 1. Password Login Form */}
        {loginMethod === 'password' ? (
          <form onSubmit={handlePasswordLogin} className="space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-bold text-[var(--neo-text-main)] mb-1.5">
                شماره موبایل
              </label>
              <div className="relative">
                <input 
                  type="tel"
                  value={identifier}
                  onChange={e => setIdentifier(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-[var(--neo-border)] bg-[var(--neo-surface)] text-[var(--neo-text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--neo-primary)] focus:border-transparent transition dir-ltr text-left text-sm font-mono"
                  placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                  required 
                />
                <Smartphone className="w-4 h-4 text-[var(--neo-text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              <p className="text-[11px] text-[var(--neo-text-muted)] mt-1">
                ورود به سامانه فقط با شماره موبایل ثبت‌شده امکان‌پذیر است.
              </p>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs sm:text-sm font-bold text-[var(--neo-text-main)]">
                  رمز عبور
                </label>
                <Link 
                  href="/forgot-password" 
                  className="text-xs font-medium text-[var(--neo-primary)] hover:underline"
                >
                  فراموشی رمز عبور؟
                </Link>
              </div>
              <div className="relative">
                <input 
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-11 pr-11 py-2.5 rounded-xl border border-[var(--neo-border)] bg-[var(--neo-surface)] text-[var(--neo-text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--neo-primary)] focus:border-transparent transition dir-ltr text-left text-sm"
                  placeholder="••••••••"
                  required 
                />
                <Lock className="w-4 h-4 text-[var(--neo-text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
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
              className="w-full mt-2 py-3 px-4 bg-[var(--neo-primary)] hover:bg-blue-700 text-white font-bold rounded-xl transition shadow-md shadow-[var(--neo-primary)]/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--neo-primary)] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>در حال ورود...</span>
                </>
              ) : (
                <>
                  <span>ورود به حساب</span>
                  <ArrowLeft className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          /* 2. SMS OTP Login Form */
          <div className="space-y-4">
            {otpStep === 'mobile' ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-[var(--neo-text-main)] mb-1.5">
                    شماره موبایل
                  </label>
                  <div className="relative">
                    <input 
                      type="tel"
                      value={mobile}
                      onChange={e => setMobile(e.target.value)}
                      className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-[var(--neo-border)] bg-[var(--neo-surface)] text-[var(--neo-text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--neo-primary)] focus:border-transparent transition dir-ltr text-left text-sm font-mono"
                      placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                      required 
                      autoFocus
                    />
                    <Smartphone className="w-4 h-4 text-[var(--neo-text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                  <p className="text-[11px] text-[var(--neo-text-muted)] mt-1.5">
                    کد تایید پیامکی برای این شماره همراه ارسال خواهد شد.
                  </p>
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-[var(--neo-primary)] hover:bg-blue-700 text-white font-bold rounded-xl transition shadow-md shadow-[var(--neo-primary)]/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--neo-primary)] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>در حال ارسال پیامک...</span>
                    </>
                  ) : (
                    <>
                      <span>دریافت کد تایید پیامکی</span>
                      <ArrowLeft className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="text-gray-500">ارسال به شماره: </span>
                    <span className="font-bold text-gray-900 font-mono dir-ltr inline-block">{mobile}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setOtpStep('mobile'); setOtpCode(''); }}
                    className="text-[var(--neo-primary)] hover:underline font-bold text-[11px]"
                  >
                    ویرایش شماره
                  </button>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-bold text-[var(--neo-text-main)] mb-1.5">
                    کد تایید پیامک‌شده
                  </label>
                  <div className="relative">
                    <input 
                      type="text"
                      maxLength={6}
                      value={otpCode}
                      onChange={e => setOtpCode(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-[var(--neo-border)] bg-[var(--neo-surface)] text-[var(--neo-text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--neo-primary)] focus:border-transparent transition dir-ltr text-center font-mono tracking-widest text-lg font-bold"
                      placeholder="• • • • •"
                      required 
                      autoFocus
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  {countdown > 0 ? (
                    <span className="text-gray-400 font-mono text-[11px]">
                      ارسال مجدد تا {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSendOtp()}
                      disabled={loading}
                      className="text-[var(--neo-primary)] hover:underline font-bold flex items-center gap-1 text-[11px]"
                    >
                      <RefreshCw className="w-3 h-3" />
                      ارسال مجدد کد تایید
                    </button>
                  )}
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-[var(--neo-primary)] hover:bg-blue-700 text-white font-bold rounded-xl transition shadow-md shadow-[var(--neo-primary)]/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--neo-primary)] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>در حال اعتبارسنجی...</span>
                    </>
                  ) : (
                    <>
                      <span>تایید و ورود به سایت</span>
                      <CheckCircle2 className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Bottom register link */}
        <div className="mt-6 text-center text-xs sm:text-sm text-[var(--neo-text-secondary)] pt-4 border-t border-[var(--neo-border)]">
          حساب کاربری ندارید؟{' '}
          <Link href="/register" className="font-bold text-[var(--neo-primary)] hover:underline">
            ثبت‌نام کنید
          </Link>
        </div>
      </AuthCardLayout>
    </GuestGuard>
  );
}
