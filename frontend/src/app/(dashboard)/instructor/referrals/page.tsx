'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { referralApi, InstructorReferralInfo } from '@/features/referral/api/referral.api';
import {
  Share2, Gift, Copy, Check, Users, DollarSign, Wallet,
  TrendingUp, Award, BookOpen, AlertCircle, ArrowUpRight,
  ExternalLink, Send, QrCode, X, Sparkles, CheckCircle2, Clock
} from 'lucide-react';

export default function InstructorReferralPage() {
  const queryClient = useQueryClient();
  const [copiedLinkIndex, setCopiedLinkIndex] = useState<string | null>(null);
  const [generalCopied, setGeneralCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'courses' | 'referrals' | 'payouts'>('courses');
  const [showPayoutModal, setShowPayoutModal] = useState(false);

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

  const { data, isLoading, error } = useQuery<InstructorReferralInfo>({
    queryKey: ['instructorReferralInfo'],
    queryFn: async () => {
      const res = await referralApi.getInstructorInfo();
      return res.data;
    },
  });

  const payoutMutation = useMutation({
    mutationFn: (payload: any) => referralApi.requestPayout(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructorReferralInfo'] });
      setPayoutSuccess('درخواست تسویه با موفقیت ثبت شد.');
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

  const handleCopyGeneralLink = () => {
    if (!data?.shareLinks?.directLink) return;
    navigator.clipboard.writeText(data.shareLinks.directLink);
    setGeneralCopied(true);
    setTimeout(() => setGeneralCopied(false), 2500);
  };

  const handleCopyCourseLink = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedLinkIndex(id);
    setTimeout(() => setCopiedLinkIndex(null), 2500);
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
      setPayoutError('لطفاً شماره شبا یا شماره کارت را وارد کنید.');
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
        <p className="font-bold">خطا در بارگذاری اطلاعات همکاری در فروش</p>
      </div>
    );
  }

  const { stats, tier, referrals, payouts, shareLinks, instructorCourses = [] } = data;

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto px-4 sm:px-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[var(--neo-text-main)] flex items-center gap-2.5">
            <Share2 className="w-7 h-7 text-indigo-600" />
            همکاری در فروش و بازاریابی معرف (مدرسین)
          </h1>
          <p className="text-xs sm:text-sm text-[var(--neo-text-secondary)] mt-1">
            لینک‌های اختصاصی دوره‌های خود و آکادمی را در کانال‌ها و شبکه‌های اجتماعی خود قرار دهید و کمیسیون ویژه دریافت کنید!
          </p>
        </div>

        <button
          onClick={() => setShowPayoutModal(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-2xl shadow-lg shadow-emerald-600/20 transition text-sm shrink-0"
        >
          <Wallet className="w-4 h-4" />
          درخواست تسویه پورسانت
        </button>
      </div>

      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-indigo-700 via-purple-700 to-pink-700 text-white p-6 sm:p-7 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold text-white tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              پورسانت ویژه اساتید: {stats.commissionPercent}٪ از هر ثبت‌نام
            </span>
            <h2 className="text-xl sm:text-2xl font-black leading-snug">
              کد معرف استادی شما: <span className="font-mono text-amber-300 font-black">{data.referralCode}</span>
            </h2>
            <p className="text-purple-100 text-xs sm:text-sm max-w-xl">
              به عنوان مدرس تک‌یاد، هر کاربری که با کد یا لینک شما وارد سایت شود علاوه بر دریافت {stats.refereeDiscountPercent}٪ تخفیف هدیه، تا {stats.commissionPercent}٪ از کل مبالغ پرداختی او مستقیماً به موجودی کیف پول همکاری در فروش شما اضافه می‌شود.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleCopyGeneralLink}
              className="px-5 py-3 bg-white text-indigo-900 hover:bg-indigo-50 font-bold rounded-2xl text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-lg"
            >
              {generalCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              {generalCopied ? 'لینک کپی شد!' : 'کپی لینک کلی سایت'}
            </button>
            <a
              href={shareLinks.telegram}
              target="_blank"
              rel="noreferrer"
              className="px-5 py-3 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-2xl text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-lg"
            >
              <Send className="w-4 h-4" />
              اشتراک در کانال تلگرام
            </a>
          </div>
        </div>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[var(--neo-surface)] p-5 rounded-3xl border border-[var(--neo-border)] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--neo-text-muted)]">دانشجویان جذب‌شده</span>
            <div className="w-9 h-9 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-[var(--neo-text-main)]">
              {stats.totalInvited.toLocaleString('fa-IR')}
            </span>
            <span className="text-xs text-[var(--neo-text-muted)]">دانشجو</span>
          </div>
          <span className="text-[11px] text-[var(--neo-text-secondary)] mt-1 block">ثبت‌نام با لینک شما</span>
        </div>

        <div className="bg-[var(--neo-surface)] p-5 rounded-3xl border border-[var(--neo-border)] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--neo-text-muted)]">نرخ تبدیل</span>
            <div className="w-9 h-9 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-[var(--neo-text-main)]">{stats.conversionRate}٪</span>
            <span className="text-xs text-[var(--neo-text-muted)]">({stats.totalConversions} خرید)</span>
          </div>
          <span className="text-[11px] text-[var(--neo-text-secondary)] mt-1 block">دانشجویانی که دوره خریدند</span>
        </div>

        <div className="bg-[var(--neo-surface)] p-5 rounded-3xl border border-[var(--neo-border)] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--neo-text-muted)]">کل پورسانت کسب‌شده</span>
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
          <span className="text-[11px] text-[var(--neo-text-secondary)] mt-1 block">سود رفرال مستقل از سهم دوره</span>
        </div>

        <div className="bg-[var(--neo-surface)] p-5 rounded-3xl border border-emerald-500/30 bg-emerald-50/20 dark:bg-emerald-950/10 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">موجودی آماده تسویه</span>
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

      {/* Tabs */}
      <div className="bg-[var(--neo-surface)] rounded-3xl border border-[var(--neo-border)] shadow-sm overflow-hidden">
        <div className="flex border-b border-[var(--neo-border)] px-6 pt-4 gap-6">
          <button
            onClick={() => setActiveTab('courses')}
            className={`pb-3 font-bold text-sm border-b-2 transition flex items-center gap-2 ${
              activeTab === 'courses'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-[var(--neo-text-secondary)] hover:text-[var(--neo-text-main)]'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            لینک‌های بازاریابی دوره‌های من ({instructorCourses.length})
          </button>
          <button
            onClick={() => setActiveTab('referrals')}
            className={`pb-3 font-bold text-sm border-b-2 transition flex items-center gap-2 ${
              activeTab === 'referrals'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-[var(--neo-text-secondary)] hover:text-[var(--neo-text-main)]'
            }`}
          >
            <Users className="w-4 h-4" />
            دانشجویان دعوت‌شده ({referrals.length})
          </button>
          <button
            onClick={() => setActiveTab('payouts')}
            className={`pb-3 font-bold text-sm border-b-2 transition flex items-center gap-2 ${
              activeTab === 'payouts'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-[var(--neo-text-secondary)] hover:text-[var(--neo-text-main)]'
            }`}
          >
            <Wallet className="w-4 h-4" />
            سوابق تسویه حساب ({payouts.length})
          </button>
        </div>

        {/* Tab 1: Course Affiliate Links */}
        {activeTab === 'courses' && (
          <div className="p-6">
            <p className="text-xs text-[var(--neo-text-secondary)] mb-4">
              با اشتراک‌گذاری لینک‌های زیر، دانشجویانی که مستقیماً وارد صفحه دوره شما می‌شوند کد شما در سیستم ذخیره شده و هم تخفیف می‌گیرند و هم پورسانت بازاریابی به شما تعلق می‌گیرد.
            </p>
            {instructorCourses.length === 0 ? (
              <div className="text-center py-8 text-[var(--neo-text-muted)] text-sm">
                شما هنوز دوره منتشره‌ای ندارید. پس از انتشار دوره، لینک‌های همکاری در اینجا نمایش داده خواهند شد.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {instructorCourses.map((c) => (
                  <div
                    key={c.courseId}
                    className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-[var(--neo-border)] flex flex-col justify-between gap-3"
                  >
                    <div>
                      <h4 className="font-bold text-sm text-[var(--neo-text-main)] line-clamp-1">{c.title}</h4>
                      <div className="mt-1 text-xs text-[var(--neo-text-secondary)]">
                        قیمت: {c.price.toLocaleString('fa-IR')} تومان
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[var(--neo-border)] flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleCopyCourseLink(c.courseId, c.affiliateUrl)}
                        className="flex-1 py-1.5 px-3 bg-[var(--neo-surface)] hover:bg-gray-100 dark:hover:bg-gray-700 border border-[var(--neo-border)] rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                      >
                        {copiedLinkIndex === c.courseId ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        {copiedLinkIndex === c.courseId ? 'کپی شد!' : 'کپی لینک دوره'}
                      </button>
                      <a
                        href={c.telegramShareUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="py-1.5 px-3 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-bold transition flex items-center gap-1"
                      >
                        <Send className="w-3.5 h-3.5" />
                        تلگرام
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Referrals */}
        {activeTab === 'referrals' && (
          <div className="p-6">
            {referrals.length === 0 ? (
              <div className="text-center py-10 text-[var(--neo-text-muted)] text-sm">
                هنوز کاربری با لینک شما ثبت‌نام نکرده است.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-[var(--neo-border)] text-[var(--neo-text-muted)]">
                      <th className="pb-3 pr-2 font-bold">دانشجو</th>
                      <th className="pb-3 font-bold">تاریخ عضویت</th>
                      <th className="pb-3 font-bold">وضعیت سفارش</th>
                      <th className="pb-3 font-bold">پورسانت شما</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--neo-border)]">
                    {referrals.map((r) => (
                      <tr key={r._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition">
                        <td className="py-3.5 pr-2 font-bold text-[var(--neo-text-main)]">
                          {r.name}
                        </td>
                        <td className="py-3.5 text-[var(--neo-text-secondary)]">
                          {new Date(r.registeredAt).toLocaleDateString('fa-IR')}
                        </td>
                        <td className="py-3.5">
                          {r.status === 'rewarded' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              خرید انجام شد
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                              <Clock className="w-3 h-3 text-amber-600" />
                              عضو شده (در انتظار خرید)
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 font-bold text-emerald-600">
                          {r.rewardAmount > 0 ? `+${r.rewardAmount.toLocaleString('fa-IR')} تومان` : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Payouts */}
        {activeTab === 'payouts' && (
          <div className="p-6">
            {payouts.length === 0 ? (
              <div className="text-center py-10 text-[var(--neo-text-muted)] text-sm">
                هیچ درخواست تسویه‌ای ثبت نشده است.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-[var(--neo-border)] text-[var(--neo-text-muted)]">
                      <th className="pb-3 pr-2 font-bold">مبلغ</th>
                      <th className="pb-3 font-bold">تاریخ</th>
                      <th className="pb-3 font-bold">وضعیت</th>
                      <th className="pb-3 font-bold">کد پیگیری</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--neo-border)]">
                    {payouts.map((p) => (
                      <tr key={p._id}>
                        <td className="py-3.5 pr-2 font-black">{p.amount.toLocaleString('fa-IR')} تومان</td>
                        <td className="py-3.5 text-[var(--neo-text-secondary)]">{new Date(p.requestedAt).toLocaleDateString('fa-IR')}</td>
                        <td className="py-3.5">
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${
                            p.status === 'paid' ? 'bg-emerald-50 text-emerald-700' :
                            p.status === 'approved' ? 'bg-blue-50 text-blue-700' :
                            p.status === 'rejected' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'
                          }`}>
                            {p.status === 'paid' ? 'واریز شده' : p.status === 'approved' ? 'تایید شده' : p.status === 'rejected' ? 'رد شده' : 'در حال بررسی'}
                          </span>
                        </td>
                        <td className="py-3.5 text-xs font-mono">{p.transactionReference || p.adminNote || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Payout Modal */}
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
              درخواست تسویه پورسانت همکاری
            </h3>
            <p className="text-xs text-[var(--neo-text-secondary)] mb-4">
              موجودی قابل تسویه: <strong className="text-emerald-600">{stats.walletBalance.toLocaleString('fa-IR')} تومان</strong>
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
                    placeholder="نام و نام خانوادگی"
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
                  {payoutMutation.isPending ? 'در حال ثبت...' : 'ثبت درخواست تسویه'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
