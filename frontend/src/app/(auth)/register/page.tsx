'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { authApi } from '@/features/auth/api/auth.api';
import { referralApi } from '@/features/referral/api/referral.api';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { GuestGuard } from '@/features/auth/components/guards/GuestGuard';
import { AuthCardLayout } from '@/features/auth/components/AuthCardLayout';
import { Lock, User, Eye, EyeOff, Loader2, AlertCircle, ArrowLeft, Gift, CheckCircle2, Phone, Smartphone, RefreshCw, ShieldAlert } from 'lucide-react';
import { toEnDigits } from '@/lib/utils';
import toast from 'react-hot-toast';
import { useQuery } from '@tanstack/react-query';
import { superAdminApi } from '@/features/admin/api/super-admin.api';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth } = useAuthStore();
  
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [registeredMobile, setRegisteredMobile] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [countdown, setCountdown] = useState(0);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    mobile: '',
    password: '',
    referralCode: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showReferralInput, setShowReferralInput] = useState(false);
  const [referrerInfo, setReferrerInfo] = useState<{ referrerName: string; discountPercent: number; welcomeCredit: number } | null>(null);
  const [checkingCode, setCheckingCode] = useState(false);

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
      timer = setInterval(() => setCountdown(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  useEffect(() => {
    let refCode = searchParams.get('ref');
    if (!refCode && typeof window !== 'undefined') {
      refCode = localStorage.getItem('tecyad_referral_code');
    }
    if (refCode) {
      setFormData(prev => ({ ...prev, referralCode: refCode!.trim().toUpperCase() }));
      setShowReferralInput(true);
      validateCode(refCode!.trim().toUpperCase());
    }
  }, [searchParams]);

  const validateCode = async (code: string) => {
    if (!code || code.length < 3) {
      setReferrerInfo(null);
      return;
    }
    setCheckingCode(true);
    try {
      const res = await referralApi.validateCode(code);
      if (res.data?.valid) {
        setReferrerInfo(res.data);
      } else {
        setReferrerInfo(null);
      }
    } catch {
      setReferrerInfo(null);
    } finally {
      setCheckingCode(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'mobile') {
      const clean = toEnDigits(value).replace(/[^\d+]/g, '');
      setFormData(prev => ({ ...prev, mobile: clean }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    if (name === 'referralCode') {
      const upper = value.trim().toUpperCase();
      if (upper.length >= 4) {
        validateCode(upper);
      } else {
        setReferrerInfo(null);
      }
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.firstName.trim().length < 2) {
      setError('نام باید حداقل ۲ کاراکتر باشد.');
      return;
    }
    if (formData.lastName.trim().length < 2) {
      setError('نام خانوادگی باید حداقل ۲ کاراکتر باشد.');
      return;
    }

    let cleanMobile = formData.mobile.trim();
    if (cleanMobile.startsWith('+98')) cleanMobile = '0' + cleanMobile.slice(3);
    else if (cleanMobile.startsWith('0098')) cleanMobile = '0' + cleanMobile.slice(4);
    else if (cleanMobile.startsWith('98') && cleanMobile.length === 12) cleanMobile = '0' + cleanMobile.slice(2);
    else if (!cleanMobile.startsWith('0') && cleanMobile.length === 10) cleanMobile = '0' + cleanMobile;

    if (!cleanMobile) {
      setError('لطفاً شماره موبایل خود را وارد نمایید.');
      return;
    }
    if (!/^09\d{9}$/.test(cleanMobile)) {
      setError('شماره موبایل نامعتبر است. فرمت صحیح: ۱۱ رقم با پیش‌شماره ۰۹ (مانند 09123456789)');
      return;
    }

    if (formData.password.length < 6) {
      setError('رمز عبور باید حداقل ۶ کاراکتر باشد.');
      return;
    }

    setLoading(true);

    const payload = {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      mobile: cleanMobile,
      password: formData.password,
      referralCode: formData.referralCode ? formData.referralCode.trim() : undefined,
    };
    
    try {
      const response = await authApi.register(payload);
      if (response.success) {
        setRegisteredMobile(cleanMobile);
        setStep('otp');
        setCountdown(180);
        toast.success('کد تایید پیامکی برای شماره همراه شما ارسال شد');
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || err.response?.data?.message || 'خطا در ثبت‌نام. لطفاً دوباره تلاش کنید.');
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
      const response = await authApi.verifyOtp(registeredMobile, otpCode.trim(), 'auth');
      if (response.success) {
        setAuth(response.data.user);
        toast.success(`ثبت‌نام با موفقیت انجام شد؛ خوش آمدید ${response.data.user.firstName || ''}`);
        
        const role = response.data.user.role;
        if (role === 'super-admin') router.push('/super-admin');
        else if (role === 'admin') router.push('/admin');
        else if (role === 'instructor') router.push('/instructor');
        else router.push('/student');
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || err.response?.data?.message || 'کد تایید اشتباه یا منقضی شده است');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await authApi.sendOtp(registeredMobile, 'auth');
      toast.success(res.message || 'کد تایید پیامکی مجدداً ارسال شد');
      setCountdown(180);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || err.response?.data?.message || 'خطا در ارسال مجدد کد پیامکی');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCardLayout title={step === 'form' ? "ایجاد حساب کاربری با شماره موبایل" : "تایید شماره همراه"}>
      {error && (
        <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs sm:text-sm font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      {step === 'form' ? (
        <>
          {platformLocks.lockRegistration && (
            <div className="mb-4 p-3.5 bg-rose-500/10 border border-rose-500/30 text-rose-800 dark:text-rose-300 rounded-2xl text-xs flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
              <div>
                <p className="font-black text-rose-900 dark:text-rose-200">ثبت‌نام کاربر جدید موقتاً غیرفعال است</p>
                <p className="mt-0.5 leading-relaxed">
                  {lockMessages.lockRegistration || 'در حال حاضر ثبت‌نام در سامانه متوقف شده است. لطفاً در زمان دیگری مراجعه فرمایید.'}
                </p>
              </div>
            </div>
          )}

          {platformLocks.lockSmsOtp && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
              <p className="leading-relaxed">
                سرویس پیامکی موقتاً محدود است. در صورت ثبت‌نام امکان ارسال پیامک کد تایید ممکن است با تاخیر مواجه شود.
              </p>
            </div>
          )}

          {referrerInfo && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs sm:text-sm flex items-start gap-2.5">
              <Gift className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">دعوت شده توسط: {referrerInfo.referrerName}</span>
                <p className="text-emerald-700 text-xs mt-0.5">
                  هدیه شما: {referrerInfo.discountPercent}٪ تخفیف اولین خرید
                  {referrerInfo.welcomeCredit > 0 && ` + ${referrerInfo.welcomeCredit.toLocaleString('fa-IR')} تومان اعتبار اولیه کیف پول`}
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
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
                    className="w-full pl-3 pr-9 py-2.5 rounded-xl border border-[var(--neo-border)] bg-[var(--neo-surface)] text-[var(--neo-text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--neo-primary)] focus:border-transparent transition text-right text-sm"
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
                    className="w-full pl-3 pr-9 py-2.5 rounded-xl border border-[var(--neo-border)] bg-[var(--neo-surface)] text-[var(--neo-text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--neo-primary)] focus:border-transparent transition text-right text-sm"
                    placeholder="محمدی"
                    required 
                  />
                  <User className="w-4 h-4 text-[var(--neo-text-muted)] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-bold text-[var(--neo-text-main)] mb-1.5">
                شماره موبایل
              </label>
              <div className="relative">
                <input 
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-[var(--neo-border)] bg-[var(--neo-surface)] text-[var(--neo-text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--neo-primary)] focus:border-transparent transition dir-ltr text-left text-sm font-mono tracking-wider"
                  placeholder="09123456789"
                  required 
                />
                <Smartphone className="w-4 h-4 text-[var(--neo-text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              <span className="text-[11px] text-[var(--neo-text-muted)] mt-1 block">
                کد تایید پیامکی به این شماره ارسال خواهد شد.
              </span>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-bold text-[var(--neo-text-main)] mb-1.5">
                رمز عبور
              </label>
              <div className="relative">
                <input 
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-11 pr-11 py-2.5 rounded-xl border border-[var(--neo-border)] bg-[var(--neo-surface)] text-[var(--neo-text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--neo-primary)] focus:border-transparent transition dir-ltr text-left text-sm"
                  placeholder="حداقل ۶ کاراکتر"
                  required 
                />
                <Lock className="w-4 h-4 text-[var(--neo-text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--neo-text-muted)] hover:text-[var(--neo-text-main)] transition cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Referral Code Field */}
            <div className="pt-1">
              {!showReferralInput ? (
                <button
                  type="button"
                  onClick={() => setShowReferralInput(true)}
                  className="text-xs font-semibold text-[var(--neo-primary)] hover:underline flex items-center gap-1.5 cursor-pointer"
                >
                  <Gift className="w-3.5 h-3.5" />
                  کد معرف دارید؟ اینجا کلیک کنید
                </button>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs sm:text-sm font-bold text-[var(--neo-text-main)]">
                      کد معرف (اختیاری)
                    </label>
                    {checkingCode && <Loader2 className="w-3.5 h-3.5 animate-spin text-[var(--neo-text-muted)]" />}
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      name="referralCode"
                      value={formData.referralCode}
                      onChange={handleChange}
                      placeholder="مثال: REF7X9K2"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--neo-border)] bg-[var(--neo-surface)] text-[var(--neo-text-main)] uppercase font-mono tracking-wider text-sm focus:outline-none focus:ring-2 focus:ring-[var(--neo-primary)] transition"
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2">
                      {referrerInfo ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Gift className="w-4 h-4 text-[var(--neo-text-muted)]" />
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button 
              type="submit"
              disabled={loading || !!platformLocks.lockRegistration}
              className="w-full mt-2 py-3 px-4 bg-[var(--neo-primary)] hover:bg-blue-700 text-white font-bold rounded-xl transition shadow-md shadow-[var(--neo-primary)]/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--neo-primary)] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>در حال ارسال کد تایید...</span>
                </>
              ) : platformLocks.lockRegistration ? (
                <>
                  <Lock className="w-4 h-4" />
                  <span>ثبت‌نام موقتاً مسدود است</span>
                </>
              ) : (
                <>
                  <span>ثبت‌نام و دریافت کد تایید</span>
                  <ArrowLeft className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </>
      ) : (
        /* OTP Verification Step */
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div className="p-3.5 bg-blue-50/70 border border-blue-100 rounded-2xl flex items-center justify-between text-xs">
            <div>
              <span className="text-gray-500">ارسال کد به شماره: </span>
              <span className="font-bold text-gray-900 font-mono dir-ltr inline-block">{registeredMobile}</span>
            </div>
            <button
              type="button"
              onClick={() => { setStep('form'); setOtpCode(''); setError(''); }}
              className="text-[var(--neo-primary)] hover:underline font-bold text-xs"
            >
              ویرایش اطلاعات
            </button>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-bold text-[var(--neo-text-main)] mb-1.5">
              کد تایید ۵ رقمی پیامک‌شده
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
            <p className="text-[11px] text-[var(--neo-text-muted)] mt-1.5">
              کد پیامک‌شده به تلفن همراه خود را وارد کنید.
            </p>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            {countdown > 0 ? (
              <span className="text-gray-400 font-mono text-[11px]">
                ارسال مجدد تا {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}
              </span>
            ) : (
              <button
                type="button"
                onClick={handleResendOtp}
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
            className="w-full py-3 px-4 bg-[var(--neo-primary)] hover:bg-blue-700 text-white font-bold rounded-xl transition shadow-md shadow-[var(--neo-primary)]/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--neo-primary)] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>در حال اعتبارسنجی...</span>
              </>
            ) : (
              <>
                <span>تایید شماره و ورود به سامانه</span>
                <CheckCircle2 className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      )}

      {/* Bottom login link */}
      <div className="mt-6 text-center text-xs sm:text-sm text-[var(--neo-text-secondary)] pt-4 border-t border-[var(--neo-border)]">
        قبلاً حساب ساخته‌اید؟{' '}
        <Link href="/login" className="font-bold text-[var(--neo-primary)] hover:underline">
          وارد شوید
        </Link>
      </div>
    </AuthCardLayout>
  );
}

export default function RegisterPage() {
  return (
    <GuestGuard>
      <Suspense fallback={<div className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" /></div>}>
        <RegisterForm />
      </Suspense>
    </GuestGuard>
  );
}
