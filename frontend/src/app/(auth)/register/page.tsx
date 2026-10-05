'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authApi } from '@/features/auth/api/auth.api';
import { referralApi } from '@/features/referral/api/referral.api';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { GuestGuard } from '@/features/auth/components/guards/GuestGuard';
import { AuthCardLayout } from '@/features/auth/components/AuthCardLayout';
import Link from 'next/link';
import { Mail, Lock, User, Eye, EyeOff, Loader2, AlertCircle, ArrowLeft, Gift, CheckCircle2, Phone, Smartphone } from 'lucide-react';
import { toEnDigits } from '@/lib/utils';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth } = useAuthStore();
  
  const [registerMode, setRegisterMode] = useState<'mobile' | 'email'>('mobile');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    mobile: '',
    email: '',
    password: '',
    referralCode: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showReferralInput, setShowReferralInput] = useState(false);
  const [showAdditionalContact, setShowAdditionalContact] = useState(false);
  const [referrerInfo, setReferrerInfo] = useState<{ referrerName: string; discountPercent: number; welcomeCredit: number } | null>(null);
  const [checkingCode, setCheckingCode] = useState(false);

  useEffect(() => {
    const refCode = searchParams.get('ref');
    if (refCode) {
      setFormData(prev => ({ ...prev, referralCode: refCode.trim().toUpperCase() }));
      setShowReferralInput(true);
      validateCode(refCode.trim().toUpperCase());
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

    if (registerMode === 'mobile') {
      let cleanMobile = formData.mobile.trim();
      if (cleanMobile.startsWith('+98')) cleanMobile = '0' + cleanMobile.slice(3);
      else if (cleanMobile.startsWith('0098')) cleanMobile = '0' + cleanMobile.slice(4);

      if (!cleanMobile) {
        setError('لطفاً شماره موبایل خود را وارد کنید.');
        return;
      }
      if (!/^09\d{9}$/.test(cleanMobile)) {
        setError('شماره موبایل نامعتبر است. فرمت صحیح: ۱۱ رقم با پیش‌شماره ۰۹ (مانند 09123456789)');
        return;
      }
    } else {
      const cleanEmail = formData.email.trim();
      if (!cleanEmail) {
        setError('لطفاً آدرس ایمیل خود را وارد کنید.');
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
        setError('آدرس ایمیل وارد شده نامعتبر است.');
        return;
      }
    }

    if (formData.password.length < 6) {
      setError('رمز عبور باید حداقل ۶ کاراکتر باشد.');
      return;
    }

    setLoading(true);

    const payload = {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      password: formData.password,
      mobile: registerMode === 'mobile' ? formData.mobile.trim() : (formData.mobile.trim() || undefined),
      email: registerMode === 'email' ? formData.email.trim() : (formData.email.trim() || undefined),
      referralCode: formData.referralCode ? formData.referralCode.trim() : undefined,
    };
    
    try {
      const response = await authApi.register(payload);
      if (response.success) {
        setAuth(response.data.user);
        
        const role = response.data.user.role;
        if (role === 'super-admin') router.push('/super-admin');
        else if (role === 'admin') router.push('/admin');
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
    <AuthCardLayout title="ایجاد حساب کاربری">
      {error && (
        <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs sm:text-sm font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{error}</span>
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

      {/* Registration Mode Switcher: Mobile vs Email */}
      <div className="grid grid-cols-2 gap-1.5 p-1 bg-[var(--neo-surface-2)] border border-[var(--neo-border)] rounded-2xl mb-5">
        <button
          type="button"
          onClick={() => { setRegisterMode('mobile'); setError(''); }}
          className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            registerMode === 'mobile'
              ? 'bg-white text-[var(--neo-primary)] shadow-xs border border-[var(--neo-border)]'
              : 'text-[var(--neo-text-secondary)] hover:text-[var(--neo-text-main)]'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          ثبت‌نام با شماره موبایل
        </button>

        <button
          type="button"
          onClick={() => { setRegisterMode('email'); setError(''); }}
          className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            registerMode === 'email'
              ? 'bg-white text-[var(--neo-primary)] shadow-xs border border-[var(--neo-border)]'
              : 'text-[var(--neo-text-secondary)] hover:text-[var(--neo-text-main)]'
          }`}
        >
          <Mail className="w-4 h-4" />
          ثبت‌نام با ایمیل
        </button>
      </div>

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

        {/* Primary Contact Input based on Mode */}
        {registerMode === 'mobile' ? (
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
              <Phone className="w-4 h-4 text-[var(--neo-text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            <span className="text-[11px] text-[var(--neo-text-muted)] mt-1 block">
              شماره موبایل ۱۱ رقمی خود را با ۰۹ وارد نمایید.
            </span>
          </div>
        ) : (
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
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-[var(--neo-border)] bg-[var(--neo-surface)] text-[var(--neo-text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--neo-primary)] focus:border-transparent transition dir-ltr text-left text-sm"
                placeholder="name@example.com"
                required 
              />
              <Mail className="w-4 h-4 text-[var(--neo-text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        )}

        {/* Optional Secondary Contact Toggle */}
        <div className="pt-0.5">
          {!showAdditionalContact ? (
            <button
              type="button"
              onClick={() => setShowAdditionalContact(true)}
              className="text-xs font-semibold text-[var(--neo-text-secondary)] hover:text-[var(--neo-primary)] transition flex items-center gap-1 cursor-pointer"
            >
              + {registerMode === 'mobile' ? 'افزودن ایمیل (اختیاری)' : 'افزودن شماره موبایل (اختیاری)'}
            </button>
          ) : (
            <div className="p-3 bg-[var(--neo-surface-2)]/60 rounded-xl border border-[var(--neo-border)] space-y-1.5 animate-in fade-in">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[var(--neo-text-main)]">
                  {registerMode === 'mobile' ? 'آدرس ایمیل (اختیاری)' : 'شماره موبایل (اختیاری)'}
                </label>
                <button
                  type="button"
                  onClick={() => setShowAdditionalContact(false)}
                  className="text-[11px] text-gray-400 hover:text-red-500"
                >
                  حذف
                </button>
              </div>
              <div className="relative">
                {registerMode === 'mobile' ? (
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-2 rounded-lg border border-[var(--neo-border)] bg-white text-xs dir-ltr text-left"
                    placeholder="name@example.com"
                  />
                ) : (
                  <input
                    type="tel"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-2 rounded-lg border border-[var(--neo-border)] bg-white text-xs dir-ltr text-left font-mono"
                    placeholder="09123456789"
                  />
                )}
              </div>
            </div>
          )}
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
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--neo-text-muted)] hover:text-[var(--neo-text-main)] transition"
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
              className="text-xs font-semibold text-[var(--neo-primary)] hover:underline flex items-center gap-1.5"
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
          disabled={loading}
          className="w-full mt-2 py-3 px-4 bg-[var(--neo-primary)] hover:bg-blue-700 text-white font-bold rounded-xl transition shadow-md shadow-[var(--neo-primary)]/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--neo-primary)] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>در حال ایجاد حساب...</span>
            </>
          ) : (
            <>
              <span>ثبت‌نام</span>
              <ArrowLeft className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

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
