'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { referralApi, ReferralAdminOverview, ReferralSettingData } from '@/features/referral/api/referral.api';
import {
  Share2, Users, DollarSign, Wallet, TrendingUp, CheckCircle2,
  Clock, X, Search, Filter, Settings, Award, AlertCircle,
  Check, Save, Loader2, ArrowUpRight, Gift, ShieldAlert
} from 'lucide-react';

export default function AdminReferralsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'referrals' | 'payouts' | 'leaderboard' | 'settings'>('referrals');

  // Search & Filters for Referrals
  const [referralSearch, setReferralSearch] = useState('');
  const [referralStatus, setReferralStatus] = useState('all');
  const [referralPage, setReferralPage] = useState(1);

  // Filters for Payouts
  const [payoutStatus, setPayoutStatus] = useState('all');
  const [payoutPage, setPayoutPage] = useState(1);

  // Payout action modal
  const [selectedPayout, setSelectedPayout] = useState<any>(null);
  const [payoutAction, setPayoutAction] = useState<'paid' | 'rejected' | 'approved'>('paid');
  const [adminNote, setAdminNote] = useState('');
  const [transactionRef, setTransactionRef] = useState('');

  // Manual Bonus Modal
  const [showBonusModal, setShowBonusModal] = useState(false);
  const [bonusForm, setBonusForm] = useState({ userId: '', amount: '', reason: '' });
  const [bonusTargetUser, setBonusTargetUser] = useState<string>('');

  // Overview query
  const { data: overview, isLoading: isOverviewLoading } = useQuery<ReferralAdminOverview>({
    queryKey: ['adminReferralOverview'],
    queryFn: async () => {
      const res = await referralApi.getAdminOverview();
      return res.data;
    },
  });

  // Referrals List query
  const { data: referralsData, isLoading: isReferralsLoading } = useQuery({
    queryKey: ['adminReferralsList', referralPage, referralStatus, referralSearch],
    queryFn: async () => {
      const res = await referralApi.getAdminReferrals({
        page: referralPage,
        limit: 15,
        status: referralStatus !== 'all' ? referralStatus : undefined,
        search: referralSearch || undefined,
      });
      return res.data;
    },
  });

  // Payouts List query
  const { data: payoutsData, isLoading: isPayoutsLoading } = useQuery({
    queryKey: ['adminPayoutsList', payoutPage, payoutStatus],
    queryFn: async () => {
      const res = await referralApi.getAdminPayouts({
        page: payoutPage,
        limit: 15,
        status: payoutStatus !== 'all' ? payoutStatus : undefined,
      });
      return res.data;
    },
  });

  // Leaderboard query
  const { data: leaderboard = [], isLoading: isLeaderboardLoading } = useQuery({
    queryKey: ['referralLeaderboard'],
    queryFn: async () => {
      const res = await referralApi.getLeaderboard(20);
      return res.data;
    },
  });

  // Settings query
  const { data: settingsData, isLoading: isSettingsLoading } = useQuery<ReferralSettingData>({
    queryKey: ['adminReferralSettings'],
    queryFn: async () => {
      const res = await referralApi.getSettings();
      return res.data;
    },
  });

  const [settingsForm, setSettingsForm] = useState<Partial<ReferralSettingData> | null>(null);

  // Sync settings form when data loaded
  if (settingsData && !settingsForm) {
    setSettingsForm(settingsData);
  }

  // Update Payout Status Mutation
  const updatePayoutMutation = useMutation({
    mutationFn: (variables: { id: string; status: any; adminNote?: string; transactionReference?: string }) =>
      referralApi.updatePayoutStatus(variables.id, {
        status: variables.status,
        adminNote: variables.adminNote,
        transactionReference: variables.transactionReference,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminPayoutsList'] });
      queryClient.invalidateQueries({ queryKey: ['adminReferralOverview'] });
      setSelectedPayout(null);
      setAdminNote('');
      setTransactionRef('');
    },
  });

  // Update Settings Mutation
  const updateSettingsMutation = useMutation({
    mutationFn: (newSettings: Partial<ReferralSettingData>) => referralApi.updateSettings(newSettings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminReferralSettings'] });
      alert('تنظیمات سیستم رفرال با موفقیت ذخیره شد.');
    },
  });

  // Manual Bonus Mutation
  const bonusMutation = useMutation({
    mutationFn: (payload: { userId: string; amount: number; reason: string }) =>
      referralApi.manualBonusCredit(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['referralLeaderboard'] });
      queryClient.invalidateQueries({ queryKey: ['adminReferralOverview'] });
      setShowBonusModal(false);
      setBonusForm({ userId: '', amount: '', reason: '' });
      alert('پاداش تشویقی با موفقیت به کیف پول کاربر اضافه شد.');
    },
  });

  const handlePayoutAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPayout) return;
    updatePayoutMutation.mutate({
      id: selectedPayout._id,
      status: payoutAction,
      adminNote,
      transactionReference: transactionRef,
    });
  };

  const handleBonusSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bonusForm.userId || !bonusForm.amount) return;
    bonusMutation.mutate({
      userId: bonusForm.userId,
      amount: Number(bonusForm.amount),
      reason: bonusForm.reason || 'پاداش تشویقی مدیر',
    });
  };

  const handleSettingsSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!settingsForm) return;
    updateSettingsMutation.mutate(settingsForm);
  };

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto px-4 sm:px-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[var(--neo-text-main)] flex items-center gap-2.5">
            <Share2 className="w-7 h-7 text-blue-600" />
            مدیریت جامع سیستم رفرال و بازاریابی
          </h1>
          <p className="text-xs sm:text-sm text-[var(--neo-text-secondary)] mt-1">
            نظارت بر معرفی‌ها، بررسی و تسویه حساب پورسانت‌ها، رتبه‌بندی بازاریاب‌ها و تنظیمات نرخ‌های کمیسیون
          </p>
        </div>

        <button
          onClick={() => {
            setBonusForm({ userId: '', amount: '', reason: '' });
            setShowBonusModal(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-xs sm:text-sm transition shadow-md shadow-blue-600/20"
        >
          <Gift className="w-4 h-4" />
          اعطای پاداش تشویقی دستی
        </button>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="bg-[var(--neo-surface)] p-4 rounded-3xl border border-[var(--neo-border)] shadow-sm">
          <span className="text-xs font-bold text-[var(--neo-text-muted)] block">کل معرفی‌ها</span>
          <span className="text-xl font-black text-[var(--neo-text-main)] mt-1 block">
            {overview?.totalReferrals?.toLocaleString('fa-IR') || 0}
          </span>
          <span className="text-[11px] text-[var(--neo-text-secondary)] mt-0.5 block">
            {overview?.totalReferrersCount || 0} معرف فعال
          </span>
        </div>

        <div className="bg-[var(--neo-surface)] p-4 rounded-3xl border border-[var(--neo-border)] shadow-sm">
          <span className="text-xs font-bold text-[var(--neo-text-muted)] block">خریدهای موفق</span>
          <span className="text-xl font-black text-purple-600 mt-1 block">
            {overview?.rewardedReferrals?.toLocaleString('fa-IR') || 0}
          </span>
          <span className="text-[11px] text-[var(--neo-text-secondary)] mt-0.5 block">
            نرخ تبدیل: {overview?.conversionRate || 0}٪
          </span>
        </div>

        <div className="bg-[var(--neo-surface)] p-4 rounded-3xl border border-[var(--neo-border)] shadow-sm">
          <span className="text-xs font-bold text-[var(--neo-text-muted)] block">درآمد جذب‌شده</span>
          <span className="text-xl font-black text-emerald-600 mt-1 block">
            {overview?.totalRevenueGenerated?.toLocaleString('fa-IR') || 0}
          </span>
          <span className="text-[11px] text-[var(--neo-text-secondary)] mt-0.5 block">تومان فروش رفرالی</span>
        </div>

        <div className="bg-[var(--neo-surface)] p-4 rounded-3xl border border-[var(--neo-border)] shadow-sm">
          <span className="text-xs font-bold text-[var(--neo-text-muted)] block">کل پورسانت واریزی</span>
          <span className="text-xl font-black text-amber-600 mt-1 block">
            {overview?.totalRewardPaid?.toLocaleString('fa-IR') || 0}
          </span>
          <span className="text-[11px] text-[var(--neo-text-secondary)] mt-0.5 block">تومان به کاربران</span>
        </div>

        <div className="col-span-2 lg:col-span-1 bg-[var(--neo-surface)] p-4 rounded-3xl border border-rose-300 dark:border-rose-900/40 bg-rose-50/20 shadow-sm">
          <span className="text-xs font-bold text-rose-700 dark:text-rose-400 block">در انتظار تسویه</span>
          <span className="text-xl font-black text-rose-700 dark:text-rose-400 mt-1 block">
            {overview?.pendingPayoutsCount || 0} درخواست
          </span>
          <span className="text-[11px] text-rose-600/80 mt-0.5 block font-bold">
            {(overview?.pendingPayoutsAmount || 0).toLocaleString('fa-IR')} تومان
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-[var(--neo-surface)] rounded-3xl border border-[var(--neo-border)] shadow-sm overflow-hidden">
        <div className="flex border-b border-[var(--neo-border)] px-6 pt-4 gap-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('referrals')}
            className={`pb-3 font-bold text-sm border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'referrals'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-[var(--neo-text-secondary)] hover:text-[var(--neo-text-main)]'
            }`}
          >
            <Users className="w-4 h-4" />
            لیست معرفی‌ها ({referralsData?.total || 0})
          </button>

          <button
            onClick={() => setActiveTab('payouts')}
            className={`pb-3 font-bold text-sm border-b-2 transition flex items-center gap-2 whitespace-nowrap relative ${
              activeTab === 'payouts'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-[var(--neo-text-secondary)] hover:text-[var(--neo-text-main)]'
            }`}
          >
            <Wallet className="w-4 h-4" />
            درخواست‌های تسویه حساب
            {(overview?.pendingPayoutsCount || 0) > 0 && (
              <span className="px-1.5 py-0.5 bg-rose-500 text-white rounded-full text-[10px] font-black">
                {overview?.pendingPayoutsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`pb-3 font-bold text-sm border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'leaderboard'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-[var(--neo-text-secondary)] hover:text-[var(--neo-text-main)]'
            }`}
          >
            <Award className="w-4 h-4 text-amber-500" />
            برترین بازاریاب‌ها
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`pb-3 font-bold text-sm border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'settings'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-[var(--neo-text-secondary)] hover:text-[var(--neo-text-main)]'
            }`}
          >
            <Settings className="w-4 h-4" />
            تنظیمات نرخ و قوانین
          </button>
        </div>

        {/* Tab 1: All Referrals */}
        {activeTab === 'referrals' && (
          <div className="p-6 space-y-4">
            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-72">
                <input
                  type="text"
                  value={referralSearch}
                  onChange={(e) => {
                    setReferralSearch(e.target.value);
                    setReferralPage(1);
                  }}
                  placeholder="جستجو نام، ایمیل یا کد معرف..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-[var(--neo-border)] bg-[var(--neo-bg)] text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Search className="w-4 h-4 text-[var(--neo-text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs text-[var(--neo-text-muted)] whitespace-nowrap">وضعیت:</span>
                <select
                  value={referralStatus}
                  onChange={(e) => {
                    setReferralStatus(e.target.value);
                    setReferralPage(1);
                  }}
                  className="px-3 py-2 rounded-xl border border-[var(--neo-border)] bg-[var(--neo-bg)] text-xs font-bold"
                >
                  <option value="all">همه وضعیت‌ها</option>
                  <option value="rewarded">پاداش داده شده (خرید موفق)</option>
                  <option value="pending">در انتظار خرید</option>
                </select>
              </div>
            </div>

            {/* Table */}
            {isReferralsLoading ? (
              <div className="p-12 text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
              </div>
            ) : referralsData?.referrals?.length === 0 ? (
              <div className="text-center py-12 text-[var(--neo-text-muted)] text-sm">
                هیچ موردی با فیلترهای انتخابی یافت نشد.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-[var(--neo-border)] text-[var(--neo-text-muted)]">
                      <th className="pb-3 pr-2 font-bold">معرف (دعوت‌کننده)</th>
                      <th className="pb-3 font-bold">کاربر دعوت‌شده</th>
                      <th className="pb-3 font-bold">کد معرف</th>
                      <th className="pb-3 font-bold">وضعیت</th>
                      <th className="pb-3 font-bold">مبلغ سفارش</th>
                      <th className="pb-3 font-bold">پاداش معرف</th>
                      <th className="pb-3 font-bold">تاریخ ثبت</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--neo-border)]">
                    {referralsData?.referrals?.map((r: any) => (
                      <tr key={r._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition">
                        <td className="py-3.5 pr-2">
                          <span className="font-bold text-[var(--neo-text-main)] block">
                            {r.referrerId?.firstName} {r.referrerId?.lastName}
                          </span>
                          <span className="text-[11px] text-[var(--neo-text-muted)] font-mono">
                            {r.referrerId?.email}
                          </span>
                        </td>
                        <td className="py-3.5">
                          <span className="font-bold text-[var(--neo-text-main)] block">
                            {r.refereeId?.firstName} {r.refereeId?.lastName}
                          </span>
                          <span className="text-[11px] text-[var(--neo-text-muted)] font-mono">
                            {r.refereeId?.email}
                          </span>
                        </td>
                        <td className="py-3.5 font-mono font-bold text-blue-600">
                          {r.referralCode}
                        </td>
                        <td className="py-3.5">
                          {r.status === 'rewarded' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              خرید موفق ({r.commissionPercentage || 15}٪)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                              <Clock className="w-3 h-3 text-amber-600" />
                              در انتظار اولین خرید
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 font-bold">
                          {r.orderAmount > 0 ? `${r.orderAmount.toLocaleString('fa-IR')} ت` : '-'}
                        </td>
                        <td className="py-3.5 font-black text-emerald-600">
                          {r.rewardAmount > 0 ? `+${r.rewardAmount.toLocaleString('fa-IR')} ت` : '-'}
                        </td>
                        <td className="py-3.5 text-xs text-[var(--neo-text-secondary)]">
                          {new Date(r.createdAt).toLocaleDateString('fa-IR')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {(referralsData?.totalPages || 0) > 1 && (
              <div className="flex justify-center items-center gap-2 pt-4 border-t border-[var(--neo-border)]">
                <button
                  onClick={() => setReferralPage((p) => Math.max(1, p - 1))}
                  disabled={referralPage === 1}
                  className="px-3 py-1.5 rounded-xl border border-[var(--neo-border)] text-xs disabled:opacity-50"
                >
                  صفحه قبل
                </button>
                <span className="text-xs font-bold">
                  {referralPage} از {referralsData?.totalPages}
                </span>
                <button
                  onClick={() => setReferralPage((p) => Math.min(referralsData?.totalPages || 1, p + 1))}
                  disabled={referralPage === referralsData?.totalPages}
                  className="px-3 py-1.5 rounded-xl border border-[var(--neo-border)] text-xs disabled:opacity-50"
                >
                  صفحه بعد
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Payouts Management */}
        {activeTab === 'payouts' && (
          <div className="p-6 space-y-4">
            {/* Filter */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[var(--neo-text-muted)]">فیلتر وضعیت درخواست‌ها:</span>
              <select
                value={payoutStatus}
                onChange={(e) => {
                  setPayoutStatus(e.target.value);
                  setPayoutPage(1);
                }}
                className="px-3 py-2 rounded-xl border border-[var(--neo-border)] bg-[var(--neo-bg)] text-xs font-bold"
              >
                <option value="all">همه</option>
                <option value="pending">در انتظار بررسی</option>
                <option value="approved">تایید شده</option>
                <option value="paid">واریز شده</option>
                <option value="rejected">رد شده</option>
              </select>
            </div>

            {/* Table */}
            {isPayoutsLoading ? (
              <div className="p-12 text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
              </div>
            ) : payoutsData?.payouts?.length === 0 ? (
              <div className="text-center py-12 text-[var(--neo-text-muted)] text-sm">
                هیچ درخواست تسویه‌ای یافت نشد.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-[var(--neo-border)] text-[var(--neo-text-muted)]">
                      <th className="pb-3 pr-2 font-bold">کاربر درخواست‌دهنده</th>
                      <th className="pb-3 font-bold">مبلغ تسویه</th>
                      <th className="pb-3 font-bold">اطلاعات حساب بانکی</th>
                      <th className="pb-3 font-bold">تاریخ درخواست</th>
                      <th className="pb-3 font-bold">وضعیت</th>
                      <th className="pb-3 font-bold">عملیات مدیریت</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--neo-border)]">
                    {payoutsData?.payouts?.map((p: any) => (
                      <tr key={p._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition">
                        <td className="py-3.5 pr-2">
                          <span className="font-bold text-[var(--neo-text-main)] block">
                            {p.userId?.firstName} {p.userId?.lastName}
                          </span>
                          <span className="text-[11px] text-[var(--neo-text-muted)] font-mono">
                            {p.userId?.email}
                          </span>
                        </td>
                        <td className="py-3.5 font-black text-[var(--neo-text-main)]">
                          {p.amount.toLocaleString('fa-IR')} تومان
                        </td>
                        <td className="py-3.5 text-xs text-[var(--neo-text-secondary)]">
                          {p.bankInfo?.shaba && <div className="font-mono">IR{p.bankInfo.shaba}</div>}
                          {p.bankInfo?.cardNumber && <div className="font-mono">{p.bankInfo.cardNumber}</div>}
                          {p.bankInfo?.accountHolder && <div>صاحب حساب: {p.bankInfo.accountHolder}</div>}
                        </td>
                        <td className="py-3.5 text-xs text-[var(--neo-text-secondary)]">
                          {new Date(p.requestedAt).toLocaleDateString('fa-IR')}
                        </td>
                        <td className="py-3.5">
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${
                            p.status === 'paid' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                            p.status === 'approved' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                            p.status === 'rejected' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {p.status === 'paid' ? 'واریز شده' : p.status === 'approved' ? 'تایید شده' : p.status === 'rejected' ? 'رد شده' : 'در انتظار بررسی'}
                          </span>
                        </td>
                        <td className="py-3.5">
                          {p.status === 'pending' ? (
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => {
                                  setSelectedPayout(p);
                                  setPayoutAction('paid');
                                  setAdminNote('');
                                  setTransactionRef('');
                                }}
                                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-sm"
                              >
                                ثبت واریز
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedPayout(p);
                                  setPayoutAction('rejected');
                                  setAdminNote('');
                                  setTransactionRef('');
                                }}
                                className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition shadow-sm"
                              >
                                رد درخواست
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-[var(--neo-text-muted)] font-mono">
                              {p.transactionReference || 'پردازش شده'}
                            </span>
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

        {/* Tab 3: Leaderboard */}
        {activeTab === 'leaderboard' && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm text-[var(--neo-text-main)] flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                برترین کاربران و بازاریاب‌ها در جذب دانشجو
              </h3>
            </div>

            {isLeaderboardLoading ? (
              <div className="p-12 text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
              </div>
            ) : leaderboard.length === 0 ? (
              <div className="text-center py-10 text-[var(--neo-text-muted)] text-sm">
                هنوز کاربری معرف ثبت نکرده است.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-[var(--neo-border)] text-[var(--neo-text-muted)]">
                      <th className="pb-3 pr-2 font-bold">رتبه</th>
                      <th className="pb-3 font-bold">نام و نشان کاربر</th>
                      <th className="pb-3 font-bold">نقش</th>
                      <th className="pb-3 font-bold">سطح باشگاه</th>
                      <th className="pb-3 font-bold">تعداد دعوت‌ها</th>
                      <th className="pb-3 font-bold">کل درآمد کسب‌شده</th>
                      <th className="pb-3 font-bold">عملیات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--neo-border)]">
                    {leaderboard.map((user: any) => (
                      <tr key={user.userId} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition">
                        <td className="py-3.5 pr-2">
                          <span className={`inline-flex items-center justify-center w-7 h-7 rounded-xl font-black text-xs ${
                            user.rank === 1 ? 'bg-amber-400 text-amber-950 shadow-md shadow-amber-400/30' :
                            user.rank === 2 ? 'bg-slate-300 text-slate-800' :
                            user.rank === 3 ? 'bg-amber-700 text-white' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {user.rank}
                          </span>
                        </td>
                        <td className="py-3.5 font-bold text-[var(--neo-text-main)]">
                          {user.name}
                        </td>
                        <td className="py-3.5 text-xs text-[var(--neo-text-secondary)]">
                          {user.role}
                        </td>
                        <td className="py-3.5">
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            {user.tier}
                          </span>
                        </td>
                        <td className="py-3.5 font-bold text-[var(--neo-text-main)]">
                          {user.referralCount} نفر
                        </td>
                        <td className="py-3.5 font-black text-emerald-600">
                          {user.referralEarnings.toLocaleString('fa-IR')} تومان
                        </td>
                        <td className="py-3.5">
                          <button
                            onClick={() => {
                              setBonusForm({ userId: user.userId, amount: '50000', reason: 'پاداش بازاریاب برتر' });
                              setBonusTargetUser(user.name);
                              setShowBonusModal(true);
                            }}
                            className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-sm"
                          >
                            <Gift className="w-3.5 h-3.5" />
                            اعطای بونوس
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Referral Settings */}
        {activeTab === 'settings' && (
          <div className="p-6">
            {isSettingsLoading || !settingsForm ? (
              <div className="p-12 text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
              </div>
            ) : (
              <form onSubmit={handleSettingsSave} className="max-w-2xl space-y-5">
                {/* System Active Switch */}
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/40 rounded-2xl border border-[var(--neo-border)]">
                  <div>
                    <span className="font-bold text-sm text-[var(--neo-text-main)] block">فعال بودن سیستم معرفی و رفرال</span>
                    <span className="text-xs text-[var(--neo-text-secondary)]">در صورت غیرفعال بودن، کدها ذخیره نشده و پاداشی محاسبه نخواهد شد.</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settingsForm.isActive}
                      onChange={(e) => setSettingsForm({ ...settingsForm, isActive: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[var(--neo-text-main)] mb-1">
                      درصد کمیسیون پیش‌فرض معرف (دانشجو)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={settingsForm.defaultCommissionPercent}
                        onChange={(e) => setSettingsForm({ ...settingsForm, defaultCommissionPercent: Number(e.target.value) })}
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[var(--neo-border)] bg-[var(--neo-bg)] text-sm font-bold"
                        min={1}
                        max={100}
                        required
                      />
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500">٪</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[var(--neo-text-main)] mb-1">
                      درصد کمیسیون اختصاصی اساتید
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={settingsForm.instructorCommissionPercent}
                        onChange={(e) => setSettingsForm({ ...settingsForm, instructorCommissionPercent: Number(e.target.value) })}
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[var(--neo-border)] bg-[var(--neo-bg)] text-sm font-bold"
                        min={1}
                        max={100}
                        required
                      />
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500">٪</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[var(--neo-text-main)] mb-1">
                      درصد تخفیف هدیه کاربر دعوت‌شده
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={settingsForm.refereeDiscountPercent}
                        onChange={(e) => setSettingsForm({ ...settingsForm, refereeDiscountPercent: Number(e.target.value) })}
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[var(--neo-border)] bg-[var(--neo-bg)] text-sm font-bold"
                        min={0}
                        max={100}
                      />
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500">٪</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[var(--neo-text-main)] mb-1">
                      اعتبار اولیه هدیه ثبت‌نام (کیف پول)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={settingsForm.refereeWelcomeCredit}
                        onChange={(e) => setSettingsForm({ ...settingsForm, refereeWelcomeCredit: Number(e.target.value) })}
                        className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-[var(--neo-border)] bg-[var(--neo-bg)] text-sm font-bold"
                      />
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500">تومان</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[var(--neo-text-main)] mb-1">
                      حداقل مبلغ تسویه حساب بانکی
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={settingsForm.minWithdrawalAmount}
                        onChange={(e) => setSettingsForm({ ...settingsForm, minWithdrawalAmount: Number(e.target.value) })}
                        className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-[var(--neo-border)] bg-[var(--neo-bg)] text-sm font-bold"
                      />
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500">تومان</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[var(--neo-text-main)] mb-1">
                      شرط پرداخت پاداش
                    </label>
                    <select
                      value={settingsForm.qualificationCondition}
                      onChange={(e: any) => setSettingsForm({ ...settingsForm, qualificationCondition: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-[var(--neo-border)] bg-[var(--neo-bg)] text-sm font-bold"
                    >
                      <option value="first_purchase">تنها پس از اولین خرید موفق</option>
                      <option value="any_purchase">با هر بار خرید کاربر دعوت‌شده</option>
                      <option value="registration_only">فوری به محض ثبت‌نام (بدون نیاز به خرید)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--neo-text-main)] mb-1">
                    متن شرایط و قوانین سیستم رفرال
                  </label>
                  <textarea
                    rows={3}
                    value={settingsForm.termsAndConditions || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, termsAndConditions: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--neo-border)] bg-[var(--neo-bg)] text-xs leading-relaxed"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={updateSettingsMutation.isPending}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-blue-600/20 flex items-center gap-2"
                  >
                    {updateSettingsMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    ذخیره تغییرات تنظیمات
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>

      {/* Payout Review Modal */}
      {selectedPayout && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--neo-surface)] rounded-3xl border border-[var(--neo-border)] max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setSelectedPayout(null)}
              className="absolute left-4 top-4 text-[var(--neo-text-muted)] hover:text-[var(--neo-text-main)]"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-black text-[var(--neo-text-main)] mb-2">
              بررسی و تعیین وضعیت درخواست تسویه
            </h3>

            <div className="p-3 bg-gray-50 dark:bg-gray-800/40 rounded-2xl border border-[var(--neo-border)] text-xs space-y-1 mb-4">
              <div>کاربر: <strong>{selectedPayout.userId?.firstName} {selectedPayout.userId?.lastName}</strong></div>
              <div>مبلغ تسویه: <strong className="text-emerald-600">{selectedPayout.amount.toLocaleString('fa-IR')} تومان</strong></div>
              {selectedPayout.bankInfo?.shaba && <div className="font-mono">شبا: IR{selectedPayout.bankInfo.shaba}</div>}
              {selectedPayout.bankInfo?.cardNumber && <div className="font-mono">کارت: {selectedPayout.bankInfo.cardNumber}</div>}
              {selectedPayout.bankInfo?.accountHolder && <div>صاحب حساب: {selectedPayout.bankInfo.accountHolder}</div>}
            </div>

            <form onSubmit={handlePayoutAction} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[var(--neo-text-main)] mb-1">
                  وضعیت جدید:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPayoutAction('paid')}
                    className={`py-2 rounded-xl text-xs font-bold border transition ${
                      payoutAction === 'paid' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-gray-50 border-[var(--neo-border)] text-[var(--neo-text-secondary)]'
                    }`}
                  >
                    تایید و واریز شد (پایا)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPayoutAction('rejected')}
                    className={`py-2 rounded-xl text-xs font-bold border transition ${
                      payoutAction === 'rejected' ? 'bg-rose-600 text-white border-rose-600' : 'bg-gray-50 border-[var(--neo-border)] text-[var(--neo-text-secondary)]'
                    }`}
                  >
                    رد و استرداد به کیف پول
                  </button>
                </div>
              </div>

              {payoutAction === 'paid' && (
                <div>
                  <label className="block text-xs font-bold text-[var(--neo-text-main)] mb-1">
                    شماره پیگیری / کد ارجاع پایا:
                  </label>
                  <input
                    type="text"
                    value={transactionRef}
                    onChange={(e) => setTransactionRef(e.target.value)}
                    placeholder="مثال: REF-928374"
                    className="w-full px-3 py-2 rounded-xl border border-[var(--neo-border)] bg-[var(--neo-bg)] text-xs font-mono"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[var(--neo-text-main)] mb-1">
                  توضیحات یا پیام برای کاربر:
                </label>
                <textarea
                  rows={2}
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="مثال: واریز با موفقیت از طریق پایا بانک ملی انجام شد."
                  className="w-full px-3 py-2 rounded-xl border border-[var(--neo-border)] bg-[var(--neo-bg)] text-xs"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedPayout(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[var(--neo-text-secondary)] hover:bg-gray-100"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={updatePayoutMutation.isPending}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow"
                >
                  {updatePayoutMutation.isPending ? 'در حال ثبت...' : 'ثبت وضعیت'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manual Bonus Modal */}
      {showBonusModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--neo-surface)] rounded-3xl border border-[var(--neo-border)] max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setShowBonusModal(false)}
              className="absolute left-4 top-4 text-[var(--neo-text-muted)] hover:text-[var(--neo-text-main)]"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-black text-[var(--neo-text-main)] flex items-center gap-2 mb-1">
              <Gift className="w-5 h-5 text-amber-500" />
              اعطای پاداش تشویقی و بونوس دستی
            </h3>
            <p className="text-xs text-[var(--neo-text-secondary)] mb-4">
              مبلغ موردنظر مستقیماً به کیف پول کاربر اضافه شده و اعلان برای او ارسال خواهد شد.
            </p>

            <form onSubmit={handleBonusSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[var(--neo-text-main)] mb-1">
                  شناسه یا کاربر هدف:
                </label>
                <input
                  type="text"
                  value={bonusTargetUser ? `${bonusTargetUser} (${bonusForm.userId})` : bonusForm.userId}
                  onChange={(e) => setBonusForm({ ...bonusForm, userId: e.target.value })}
                  placeholder="آیدی کاربر (UserId)"
                  className="w-full px-3 py-2 rounded-xl border border-[var(--neo-border)] bg-[var(--neo-bg)] text-xs font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--neo-text-main)] mb-1">
                  مبلغ پاداش (تومان):
                </label>
                <input
                  type="number"
                  value={bonusForm.amount}
                  onChange={(e) => setBonusForm({ ...bonusForm, amount: e.target.value })}
                  placeholder="مثال: 50000"
                  className="w-full px-3 py-2 rounded-xl border border-[var(--neo-border)] bg-[var(--neo-bg)] text-xs font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--neo-text-main)] mb-1">
                  علت پاداش (در اعلان کاربر نمایش داده می‌شود):
                </label>
                <input
                  type="text"
                  value={bonusForm.reason}
                  onChange={(e) => setBonusForm({ ...bonusForm, reason: e.target.value })}
                  placeholder="مثال: پاداش همکاری عالی و جذب بیش از ۳۰ دانشجو"
                  className="w-full px-3 py-2 rounded-xl border border-[var(--neo-border)] bg-[var(--neo-bg)] text-xs"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowBonusModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[var(--neo-text-secondary)] hover:bg-gray-100"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={bonusMutation.isPending}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow"
                >
                  {bonusMutation.isPending ? 'در حال واریز...' : 'واریز پاداش'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
