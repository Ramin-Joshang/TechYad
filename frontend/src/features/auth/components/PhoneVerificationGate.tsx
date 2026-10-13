'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/auth.store';
import { authApi } from '../api/auth.api';
import { Smartphone, CheckCircle2, AlertCircle, Loader2, RefreshCw, LogOut, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';

export function PhoneVerificationGate() {
  const { user, updateUser, logout } = useAuthStore();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState('');
  const [devCode, setDevCode] = useState<string | null>(null);

  const mobileNumber = user?.mobile || '';

  useEffect(() => {
    let timer: any;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleSendOtp = async () => {
    if (!mobileNumber) {
      setError('شماره موبایلی برای حساب کاربری شما یافت نشد. لطفاً با پشتیبانی تماس بگیرید.');
      return;
    }
    setError('');
    setSendingOtp(true);
    try {
      const res = await authApi.sendOtp(mobileNumber, 'auth');
      toast.success(res.message || 'کد تایید با موفقیت ارسال شد');
      if (res.data?.devCode) {
        setDevCode(res.data.devCode);
      }
      setCountdown(res.data?.expiresInSeconds || 180);
    } catch (err: any) {
      setError(err.response?.data?.message || 'خطا در ارسال کد تایید پیامکی');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setError('لطفاً کد تایید پیامک‌شده را وارد نمایید');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await authApi.verifyOtp(mobileNumber, code.trim(), 'auth');
      if (res.success) {
        toast.success('شماره موبایل شما با موفقیت تایید شد');
        updateUser({ mobileVerified: true, ...res.data?.user });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'کد تایید نامعتبر یا منقضی شده است');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-[var(--neo-surface)] border border-[var(--neo-border)] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative text-right">
        
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center mx-auto mb-5 shadow-xs">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <h2 className="text-xl font-black text-center text-[var(--neo-text-main)] mb-2">
          تایید شماره همراه الزامی است
        </h2>
        
        <p className="text-xs sm:text-sm text-[var(--neo-text-secondary)] text-center mb-6 leading-relaxed">
          برای فعال‌سازی و دسترسی به امکانات حساب کاربری در پلتفرم تک‌یاد، باید شماره موبایل خود را تایید نمایید.
        </p>

        {mobileNumber && (
          <div className="mb-5 p-3 bg-[var(--neo-surface-2)] rounded-2xl border border-[var(--neo-border)] flex items-center justify-between">
            <span className="text-xs text-[var(--neo-text-muted)] font-medium">شماره موبایل حساب:</span>
            <span className="text-sm font-bold font-mono text-[var(--neo-text-main)] dir-ltr">{mobileNumber}</span>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[var(--neo-text-main)] mb-1.5">
              کد تایید ۵ رقمی پیامک‌شده
            </label>
            <div className="relative">
              <input 
                type="text"
                maxLength={6}
                value={code}
                onChange={e => setCode(e.target.value)}
                placeholder="مثال: ۱۲۳۴۵"
                className="w-full text-center tracking-[0.5em] font-mono text-lg py-2.5 rounded-xl border border-[var(--neo-border)] bg-[var(--neo-surface)] focus:ring-2 focus:ring-[var(--neo-primary)] focus:outline-none"
                autoFocus
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading || !code.trim()}
            className="w-full py-3 bg-[var(--neo-primary)] text-white font-bold rounded-xl hover:opacity-90 transition disabled:opacity-50 text-sm flex items-center justify-center gap-2 shadow-sm"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            <span>تایید شماره و ورود به حساب</span>
          </button>
        </form>

        <div className="mt-4 pt-4 border-t border-[var(--neo-border)] flex items-center justify-between text-xs">
          {countdown > 0 ? (
            <span className="text-[var(--neo-text-muted)] font-mono">
              ارسال مجدد تا {Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, '0')}
            </span>
          ) : (
            <button 
              type="button" 
              onClick={handleSendOtp}
              disabled={sendingOtp}
              className="text-[var(--neo-primary)] font-bold hover:underline flex items-center gap-1"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${sendingOtp ? 'animate-spin' : ''}`} />
              <span>ارسال مجدد کد پیامکی</span>
            </button>
          )}

          <button 
            type="button"
            onClick={logout}
            className="text-rose-600 hover:underline flex items-center gap-1 font-medium"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>خروج از حساب</span>
          </button>
        </div>

      </div>
    </div>
  );
}
