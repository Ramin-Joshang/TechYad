'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { referralApi, UserReferralInfo } from '@/features/referral/api/referral.api';
import {
  Share2, Gift, Copy, Check, Users, DollarSign, Wallet,
  TrendingUp, Award, ShieldCheck, ChevronDown, ChevronUp,
  AlertCircle, ArrowUpRight, HelpCircle, ExternalLink,
  MessageCircle, Send, QrCode, X, Sparkles, CheckCircle2, Clock
} from 'lucide-react';

export default function StudentReferralPage() {
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'referrals' | 'payouts'>('referrals');
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Payout Form State
  const [payoutForm, setPayoutForm] = useState({
    amount: '',
    shaba: '',
    cardNumber: '',
    bankName: '',
    accountHolder: '',
  });
  const [payoutError, setPayoutError] = useState('');
  const [payoutSuccess, setPayoutSuccess] = useState('');

  const { data, isLoading, error } = useQuery<UserReferralInfo>({
    queryKey: ['myReferralInfo'],
    queryFn: async () => {
      const res = await referralApi.getMyInfo();
      return res.data;
    },
  });

  const payoutMutation = useMutation({
    mutationFn: (payload: any) => referralApi.requestPayout(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myReferralInfo'] });
      setPayoutSuccess('درخواست تسویه با موفقیت ثبت شد و به زودی واریز خواهد شد.');
      setPayoutError('');
      setPayoutForm({ amount: '', shaba: '', cardNumber: '', bankName: '', accountHolder: '' });
      setTimeout(() => {
        setShowPayoutModal(false);
        setPayoutSuccess('');
      }, 2500);
    },
    onError: (err: any) => {
      setPayoutError(err.response?.data?.message || 'خطا در ثبت درخواست تسویه');
    },
  });

  const handleCopyLink = () => {
    if (!data?.shareLinks?.directLink) return;
    navigator.clipboard.writeText(data.shareLinks.directLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCopyCode = () => {
    if (!data?.referralCode) return;
    navigator.clipboard.writeText(data.referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePayoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPayoutError('');
    setPayoutSuccess('');

    const numAmount = Number(payoutForm.amount);
    if (!numAmount || numAmount < (data?.stats.minWithdrawalAmount || 100000)) {
      setPayoutError(`حداقل مبلغ تسویه ${(data?.stats.minWithdrawalAmount || 100000).toLocaleString('fa-IR')} تومان است.`);
      return;
    }

    if (numAmount > (data?.stats.walletBalance || 0)) {
      setPayoutError('مبلغ درخواستی بیشتر از موجودی قابل تسویه شماست.');
      return;
    }

    if (!payoutForm.shaba && !payoutForm.cardNumber) {
      setPayoutError('لطفاً شماره شبا یا شماره کارت خود را وارد کنید.');
      return;
    }

    payoutMutation.mutate({
      amount: numAmount,
      method: 'bank_transfer',
      bankInfo: {
        shaba: payoutForm.shaba,
        cardNumber: payoutForm.cardNumber,
        bankName: payoutForm.bankName,
        accountHolder: payoutForm.accountHolder,
      },
    });
  };

  const faqs = [
    {
      q: 'پاداش معرفی چه زمانی به کیف پول من واریز می‌شود؟',
      a: 'به محض اینکه دوست شما با لینک یا کد شما ثبت‌نام کند و اولین دوره آموزشی خود را خریداری نماید، درصد پاداش شما آنی محاسبه شده و به کیف پول شما واریز می‌شود.',
    },
    {
      q: 'آیا دوست من هم تخفیف دریافت می‌کند؟',
      a: `بله! دوست شما با استفاده از کد شما ${data?.stats?.refereeDiscountPercent || 10}٪ تخفیف اختصاصی در اولین خرید خود دریافت می‌کند.`,
    },
    {
      q: 'حداقل مبلغ برای درخواست تسویه نقدی چقدر است؟',
      a: `حداقل مبلغ جهت ثبت درخواست تسویه به حساب بانکی ${(data?.stats?.minWithdrawalAmount || 100000).toLocaleString('fa-IR')} تومان می‌باشد و در کمتر از ۲۴ ساعت کاری پایا واریز خواهد شد.`,
    },
    {
      q: 'سطوح باشگاه معرفان (برنزی، نقره‌ای، طلایی و الماس) چگونه کار می‌کنند؟',
      a: 'هر چقدر تعداد دوستان ثبت‌نام کرده شما بیشتر شود، سطح کاربری شما ارتقا پیدا کرده و درصد پاداش همکاری شما تا ۸٪ بیشتر از نرخ پایه افزایش می‌یابد.',
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center text-rose-600 bg-rose-50 rounded-2xl max-w-lg mx-auto mt-10">
        <AlertCircle className="w-8 h-8 mx-auto mb-2 text-rose-500" />
        <p className="font-bold">خطا در بارگذاری اطلاعات سیستم معرفی</p>
      </div>
    );
  }

  const { stats, tier, referrals, payouts, shareLinks } = data;

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto px-4 sm:px-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[var(--neo-text-main)] flex items-center gap-2.5">
            <Gift className="w-7 h-7 text-blue-600" />
            معرفی به دوستان و کسب درآمد
          </h1>
          <p className="text-xs sm:text-sm text-[var(--neo-text-secondary)] mt-1">
            لینک اختصاصی خود را به اشتراک بگذارید، به دوستانتان تخفیف هدیه دهید و با هر خرید آن‌ها پاداش نقدی بگیرید!
          </p>
        </div>

        <button
          onClick={() => setShowPayoutModal(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-2xl shadow-lg shadow-emerald-600/20 transition text-sm shrink-0"
        >
          <Wallet className="w-4 h-4" />
          درخواست تسویه درآمد
        </button>
      </div>

      {/* Hero: Share Box & Tier Badge */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Referral Code & Share Links */}
        <div className="lg:col-span-2 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white p-6 sm:p-7 rounded-3xl shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold text-white tracking-wide">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                کمیسیون شما: {stats.commissionPercent}٪ از هر خرید
              </span>
              <h2 className="text-xl sm:text-2xl font-black leading-snug">
                کد و لینک دعوت اختصاصی شما
              </h2>
              <p className="text-blue-100 text-xs sm:text-sm max-w-md">
                هر فرد با کد شما ثبت‌نام کند، {stats.refereeDiscountPercent}٪ تخفیف گرفته و تا {stats.commissionPercent}٪ از پرداخت او به موجودی شما اضافه می‌شود.
              </p>
            </div>

            {/* Code Badge Box */}
            <div className="bg-white/15 backdrop-blur-md p-4 rounded-2xl border border-white/25 flex flex-col items-center justify-center min-w-[200px]">
              <span className="text-xs text-blue-200 font-medium mb-1">کد معرف شما</span>
              <span className="text-2xl font-black tracking-widest font-mono text-amber-300">{data.referralCode}</span>
              <div className="flex items-center gap-2 mt-3 w-full">
                <button
                  onClick={handleCopyCode}
                  className="flex-1 py-1.5 px-3 bg-white text-blue-900 hover:bg-blue-50 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 shadow"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'کپی شد!' : 'کپی کد'}
                </button>
                <button
                  onClick={() => setShowQrModal(true)}
                  className="p-1.5 bg-white/20 hover:bg-white/30 text-white rounded-xl transition"
                  title="نمایش بارکد QR"
                >
                  <QrCode className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Social Share Bar */}
          <div className="mt-6 pt-5 border-t border-white/20 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-bold text-blue-100 flex items-center gap-1.5">
              <Share2 className="w-4 h-4" />
              اشتراک مستقیم در شبکه‌های اجتماعی:
            </span>
            <div className="flex items-center gap-2">
              <a
                href={shareLinks.telegram}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                تلگرام
              </a>
              <a
                href={shareLinks.whatsapp}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                واتساپ
              </a>
              <a
                href={shareLinks.eitaa}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
              >
                ایتا
              </a>
              <a
                href={shareLinks.bale}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 bg-teal-500 hover:bg-teal-600 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
              >
                بله
              </a>
              <button
                onClick={handleCopyLink}
                className="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                کپی لینک کامل
              </button>
            </div>
          </div>
        </div>

        {/* Club Tier Card */}
        <div className="bg-[var(--neo-surface)] p-6 rounded-3xl border border-[var(--neo-border)] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[var(--neo-text-muted)] flex items-center gap-1">
                <Award className="w-4 h-4 text-amber-500" />
                سطح باشگاه معرفان
              </span>
              <span className="text-xs font-black px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                {tier.badgeText}
              </span>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-[var(--neo-text-main)]">{tier.name}</h3>
                <p className="text-xs text-[var(--neo-text-secondary)] mt-0.5">
                  {tier.bonusRate > 0 ? `+${tier.bonusRate}٪ پاداش مازاد بر کمیسیون پایه` : 'نرخ پایه کمیسیون'}
                </p>
              </div>
            </div>

            {tier.nextTier ? (
              <div className="mt-5 space-y-1.5">
                <div className="flex justify-between text-xs text-[var(--neo-text-secondary)]">
                  <span>پیشرفت تا سطح {tier.nextTier}</span>
                  <span className="font-bold text-[var(--neo-text-main)]">
                    {stats.totalInvited} / {tier.minInvites + tier.invitesNeededForNext}
                  </span>
                </div>
                <div className="w-full h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all"
                    style={{
                      width: `${Math.min(100, Math.round((stats.totalInvited / (tier.minInvites + tier.invitesNeededForNext)) * 100))}%`,
                    }}
                  ></div>
                </div>
                <p className="text-[11px] text-[var(--neo-text-muted)] mt-1">
                  تنها {tier.invitesNeededForNext} دعوت دیگر تا ارتقا به سطح {tier.nextTier}!
                </p>
              </div>
            ) : (
              <div className="mt-5 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                تبریک! شما به بالاترین سطح باشگاه معرفان رسیده‌اید.
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-[var(--neo-border)] flex items-center justify-between text-xs text-[var(--neo-text-muted)]">
            <span>مجموع درآمد واریزشده:</span>
            <span className="font-bold text-[var(--neo-text-main)]">{stats.totalEarned.toLocaleString('fa-IR')} تومان</span>
          </div>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Invited */}
        <div className="bg-[var(--neo-surface)] p-5 rounded-3xl border border-[var(--neo-border)] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--neo-text-muted)]">دوستان ثبت‌نام کرده</span>
            <div className="w-9 h-9 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-[var(--neo-text-main)]">
              {stats.totalInvited.toLocaleString('fa-IR')}
            </span>
            <span className="text-xs text-[var(--neo-text-muted)]">نفر</span>
          </div>
          <span className="text-[11px] text-[var(--neo-text-secondary)] mt-1 block">با کد یا لینک شما</span>
        </div>

        {/* Conversions */}
        <div className="bg-[var(--neo-surface)] p-5 rounded-3xl border border-[var(--neo-border)] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--neo-text-muted)]">خریدهای موفق</span>
            <div className="w-9 h-9 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-[var(--neo-text-main)]">
              {stats.totalConversions.toLocaleString('fa-IR')}
            </span>
            <span className="text-xs text-[var(--neo-text-muted)]">خرید ({stats.conversionRate}٪)</span>
          </div>
          <span className="text-[11px] text-[var(--neo-text-secondary)] mt-1 block">منجر به پاداش نقدی</span>
        </div>

        {/* Total Earned */}
        <div className="bg-[var(--neo-surface)] p-5 rounded-3xl border border-[var(--neo-border)] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--neo-text-muted)]">کل پاداش کسب‌شده</span>
            <div className="w-9 h-9 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-[var(--neo-text-main)]">
              {stats.totalEarned.toLocaleString('fa-IR')}
            </span>
            <span className="text-xs text-[var(--neo-text-muted)]">تومان</span>
          </div>
          <span className="text-[11px] text-[var(--neo-text-secondary)] mt-1 block">مجموع از ابتدا</span>
        </div>

        {/* Wallet Balance Ready for Payout */}
        <div className="bg-[var(--neo-surface)] p-5 rounded-3xl border border-emerald-500/30 bg-emerald-50/20 dark:bg-emerald-950/10 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">موجودی قابل تسویه</span>
            <div className="w-9 h-9 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-emerald-800 dark:text-emerald-300">
              {stats.walletBalance.toLocaleString('fa-IR')}
            </span>
            <span className="text-xs text-emerald-700 dark:text-emerald-400">تومان</span>
          </div>
          <button
            onClick={() => setShowPayoutModal(true)}
            className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold hover:underline mt-1 flex items-center gap-1"
          >
            ثبت درخواست تسویه
            <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* How it Works Banner */}
      <div className="bg-[var(--neo-surface)] p-6 rounded-3xl border border-[var(--neo-border)] shadow-sm">
        <h3 className="text-base font-bold text-[var(--neo-text-main)] mb-4 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-blue-600" />
          چگونه از معرفی دوستان درآمد کسب کنیم؟ (در ۳ گام ساده)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-[var(--neo-border)] flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-black flex items-center justify-center shrink-0 text-sm">
              ۱
            </div>
            <div>
              <h4 className="text-sm font-bold text-[var(--neo-text-main)]">ارسال لینک یا کد اختصاصی</h4>
              <p className="text-xs text-[var(--neo-text-secondary)] mt-1">
                کد یا لینک معرفی خود را برای دوستان و در گروه‌های تلگرام و واتساپ ارسال کنید.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-[var(--neo-border)] flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-black flex items-center justify-center shrink-0 text-sm">
              ۲
            </div>
            <div>
              <h4 className="text-sm font-bold text-[var(--neo-text-main)]">ثبت‌نام و خرید با تخفیف</h4>
              <p className="text-xs text-[var(--neo-text-secondary)] mt-1">
                دوست شما با کد شما ثبت‌نام کرده و {stats.refereeDiscountPercent}٪ تخفیف هدیه دریافت می‌کند.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-[var(--neo-border)] flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-black flex items-center justify-center shrink-0 text-sm">
              ۳
            </div>
            <div>
              <h4 className="text-sm font-bold text-[var(--neo-text-main)]">دریافت پاداش نقدی</h4>
              <p className="text-xs text-[var(--neo-text-secondary)] mt-1">
                پس از خرید دوره، کمیسیون شما آنی به کیف پولتان افزوده شده و قابل برداشت نقدی است.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section: Referrals List vs Payouts History */}
      <div className="bg-[var(--neo-surface)] rounded-3xl border border-[var(--neo-border)] shadow-sm overflow-hidden">
        <div className="flex border-b border-[var(--neo-border)] px-6 pt-4 gap-6">
          <button
            onClick={() => setActiveTab('referrals')}
            className={`pb-3 font-bold text-sm border-b-2 transition flex items-center gap-2 ${
              activeTab === 'referrals'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-[var(--neo-text-secondary)] hover:text-[var(--neo-text-main)]'
            }`}
          >
            <Users className="w-4 h-4" />
            لیست دوستان معرفی‌شده ({referrals.length})
          </button>
          <button
            onClick={() => setActiveTab('payouts')}
            className={`pb-3 font-bold text-sm border-b-2 transition flex items-center gap-2 ${
              activeTab === 'payouts'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-[var(--neo-text-secondary)] hover:text-[var(--neo-text-main)]'
            }`}
          >
            <Wallet className="w-4 h-4" />
            تاریخچه درخواست‌های تسویه ({payouts.length})
          </button>
        </div>

        {/* Tab 1: Referrals List */}
        {activeTab === 'referrals' && (
          <div className="p-6">
            {referrals.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 mx-auto text-[var(--neo-text-muted)] mb-3 opacity-40" />
                <h4 className="text-base font-bold text-[var(--neo-text-main)]">هنوز دوستی با کد شما ثبت‌نام نکرده است</h4>
                <p className="text-xs text-[var(--neo-text-secondary)] max-w-sm mx-auto mt-1 mb-4">
                  لینک اختصاصی خود را در شبکه‌های اجتماعی برای دوستانتان بفرستید تا اولین پاداش را دریافت کنید.
                </p>
                <button
                  onClick={handleCopyLink}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition inline-flex items-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" />
                  کپی لینک دعوت
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-[var(--neo-border)] text-[var(--neo-text-muted)]">
                      <th className="pb-3 pr-2 font-bold">کاربر معرفی‌شده</th>
                      <th className="pb-3 font-bold">تاریخ عضویت</th>
                      <th className="pb-3 font-bold">وضعیت خرید</th>
                      <th className="pb-3 font-bold">پاداش دریافتی شما</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--neo-border)]">
                    {referrals.map((r) => (
                      <tr key={r._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition">
                        <td className="py-3.5 pr-2">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                              {r.name.charAt(0)}
                            </div>
                            <div>
                              <span className="font-bold text-[var(--neo-text-main)] block">{r.name}</span>
                              <span className="text-[11px] text-[var(--neo-text-muted)] font-mono">{r.email}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 text-[var(--neo-text-secondary)]">
                          {new Date(r.registeredAt).toLocaleDateString('fa-IR')}
                        </td>
                        <td className="py-3.5">
                          {r.status === 'rewarded' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              خرید موفق - پاداش واریز شد
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                              <Clock className="w-3 h-3 text-amber-600" />
                              ثبت‌نام شده (در انتظار اولین خرید)
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 font-bold">
                          {r.rewardAmount > 0 ? (
                            <span className="text-emerald-600">
                              +{r.rewardAmount.toLocaleString('fa-IR')} تومان
                            </span>
                          ) : (
                            <span className="text-[var(--neo-text-muted)]">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Payouts History */}
        {activeTab === 'payouts' && (
          <div className="p-6">
            {payouts.length === 0 ? (
              <div className="text-center py-12">
                <Wallet className="w-12 h-12 mx-auto text-[var(--neo-text-muted)] mb-3 opacity-40" />
                <h4 className="text-base font-bold text-[var(--neo-text-main)]">هنوز درخواست تسویه‌ای ثبت نکرده‌اید</h4>
                <p className="text-xs text-[var(--neo-text-secondary)] max-w-sm mx-auto mt-1 mb-4">
                  با رسیدن موجودی به حداقل {(stats.minWithdrawalAmount || 100000).toLocaleString('fa-IR')} تومان می‌توانید درخواست تسویه به حساب بانکی ثبت کنید.
                </p>
                <button
                  onClick={() => setShowPayoutModal(true)}
                  disabled={stats.walletBalance < (stats.minWithdrawalAmount || 100000)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition inline-flex items-center gap-1.5"
                >
                  <Wallet className="w-3.5 h-3.5" />
                  درخواست تسویه درآمد
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-[var(--neo-border)] text-[var(--neo-text-muted)]">
                      <th className="pb-3 pr-2 font-bold">مبلغ تسویه</th>
                      <th className="pb-3 font-bold">تاریخ درخواست</th>
                      <th className="pb-3 font-bold">روش واریز</th>
                      <th className="pb-3 font-bold">وضعیت درخواست</th>
                      <th className="pb-3 font-bold">توضیحات و شناسه پیگیری</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--neo-border)]">
                    {payouts.map((p) => (
                      <tr key={p._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition">
                        <td className="py-3.5 pr-2 font-black text-[var(--neo-text-main)]">
                          {p.amount.toLocaleString('fa-IR')} تومان
                        </td>
                        <td className="py-3.5 text-[var(--neo-text-secondary)]">
                          {new Date(p.requestedAt).toLocaleDateString('fa-IR')}
                        </td>
                        <td className="py-3.5 text-xs text-[var(--neo-text-muted)]">
                          {p.bankInfo?.shaba ? `شبا: IR${p.bankInfo.shaba}` : p.bankInfo?.cardNumber ? `کارت: ${p.bankInfo.cardNumber}` : 'انتقال بانکی'}
                        </td>
                        <td className="py-3.5">
                          {p.status === 'paid' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              واریز شد
                            </span>
                          )}
                          {p.status === 'approved' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                              <CheckCircle2 className="w-3 h-3 text-blue-600" />
                              تایید شد (در صف پایا)
                            </span>
                          )}
                          {p.status === 'pending' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                              <Clock className="w-3 h-3 text-amber-600" />
                              در حال بررسی
                            </span>
                          )}
                          {p.status === 'rejected' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              <X className="w-3 h-3 text-rose-600" />
                              رد شده (مبلغ برگشت داده شد)
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 text-xs text-[var(--neo-text-muted)]">
                          {p.transactionReference && (
                            <span className="font-mono block">پیگیری: {p.transactionReference}</span>
                          )}
                          {p.adminNote && <span>{p.adminNote}</span>}
                          {!p.transactionReference && !p.adminNote && '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* FAQ Accordion */}
      <div className="bg-[var(--neo-surface)] p-6 rounded-3xl border border-[var(--neo-border)] shadow-sm">
        <h3 className="text-base font-bold text-[var(--neo-text-main)] mb-4 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-blue-600" />
          پرسش‌های متداول سیستم معرفی
        </h3>
        <div className="divide-y divide-[var(--neo-border)]">
          {faqs.map((faq, idx) => (
            <div key={idx} className="py-3">
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full flex items-center justify-between text-right font-bold text-xs sm:text-sm text-[var(--neo-text-main)] hover:text-blue-600 transition"
              >
                <span>{faq.q}</span>
                {openFaq === idx ? <ChevronUp className="w-4 h-4 text-blue-600" /> : <ChevronDown className="w-4 h-4 text-[var(--neo-text-muted)]" />}
              </button>
              {openFaq === idx && (
                <p className="mt-2 text-xs sm:text-sm text-[var(--neo-text-secondary)] leading-relaxed pr-2">
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Payout Request Modal */}
      {showPayoutModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--neo-surface)] rounded-3xl border border-[var(--neo-border)] max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setShowPayoutModal(false)}
              className="absolute left-5 top-5 text-[var(--neo-text-muted)] hover:text-[var(--neo-text-main)]"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-black text-[var(--neo-text-main)] flex items-center gap-2 mb-1">
              <Wallet className="w-5 h-5 text-emerald-600" />
              درخواست تسویه حساب درآمد
            </h3>
            <p className="text-xs text-[var(--neo-text-secondary)] mb-4">
              موجودی قابل تسویه فعلی شما: <strong className="text-emerald-600">{stats.walletBalance.toLocaleString('fa-IR')} تومان</strong>
            </p>

            {payoutError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{payoutError}</span>
              </div>
            )}

            {payoutSuccess && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{payoutSuccess}</span>
              </div>
            )}

            <form onSubmit={handlePayoutSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[var(--neo-text-main)] mb-1">
                  مبلغ درخواستی (تومان)
                </label>
                <input
                  type="number"
                  value={payoutForm.amount}
                  onChange={(e) => setPayoutForm({ ...payoutForm, amount: e.target.value })}
                  placeholder={`حداقل ${(stats.minWithdrawalAmount || 100000).toLocaleString('fa-IR')}`}
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--neo-border)] bg-[var(--neo-bg)] text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--neo-text-main)] mb-1">
                  شماره شبا (بدون IR)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={payoutForm.shaba}
                    onChange={(e) => setPayoutForm({ ...payoutForm, shaba: e.target.value })}
                    placeholder="مثال: 010000000000000000000000"
                    maxLength={24}
                    className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-[var(--neo-border)] bg-[var(--neo-bg)] text-sm dir-ltr font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-xs text-gray-500">IR</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[var(--neo-text-main)] mb-1">
                    شماره کارت (اختیاری)
                  </label>
                  <input
                    type="text"
                    value={payoutForm.cardNumber}
                    onChange={(e) => setPayoutForm({ ...payoutForm, cardNumber: e.target.value })}
                    placeholder="۶۰۳۷۹۹..."
                    maxLength={16}
                    className="w-full px-3 py-2.5 rounded-xl border border-[var(--neo-border)] bg-[var(--neo-bg)] text-sm dir-ltr font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--neo-text-main)] mb-1">
                    نام صاحب حساب
                  </label>
                  <input
                    type="text"
                    value={payoutForm.accountHolder}
                    onChange={(e) => setPayoutForm({ ...payoutForm, accountHolder: e.target.value })}
                    placeholder="علی محمدی"
                    className="w-full px-3 py-2.5 rounded-xl border border-[var(--neo-border)] bg-[var(--neo-bg)] text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowPayoutModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-[var(--neo-text-secondary)] hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={payoutMutation.isPending}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 disabled:opacity-50 flex items-center gap-1.5"
                >
                  {payoutMutation.isPending ? 'در حال ثبت...' : 'ثبت نهایی درخواست'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--neo-surface)] rounded-3xl border border-[var(--neo-border)] max-w-sm w-full p-6 shadow-2xl relative text-center">
            <button
              onClick={() => setShowQrModal(false)}
              className="absolute left-4 top-4 text-[var(--neo-text-muted)] hover:text-[var(--neo-text-main)]"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base font-black text-[var(--neo-text-main)] mb-1">بارکد QR اختصاصی شما</h3>
            <p className="text-xs text-[var(--neo-text-secondary)] mb-4">
              دوستانتان می‌توانند با دوربین گوشی این بارکد را اسکن کنند و مستقیم با کد شما ثبت‌نام نمایند.
            </p>
            <div className="bg-white p-4 rounded-2xl inline-block shadow-inner border border-gray-200">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(shareLinks.directLink)}`}
                alt="QR Code"
                className="w-44 h-44 mx-auto"
              />
            </div>
            <div className="mt-4 font-mono font-bold text-sm text-[var(--neo-text-main)]">
              کد معرف: {data.referralCode}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
