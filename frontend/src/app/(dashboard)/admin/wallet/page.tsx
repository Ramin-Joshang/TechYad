'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Wallet, ArrowUpRight, ArrowDownLeft, CreditCard, Gift, 
  Clock, CheckCircle2, XCircle, Search, Filter, RefreshCw,
  Building2, DollarSign, Users, AlertCircle, Plus, Minus,
  FileText, ShieldCheck, Check, Ban, ExternalLink, ChevronLeft
} from 'lucide-react';
import { walletApi, WalletTransactionItem } from '@/features/wallet/api/wallet.api';
import toast from 'react-hot-toast';

export default function AdminWalletPage() {
  const queryClient = useQueryClient();

  // Active Tab: 'transactions' | 'withdrawals' | 'adjust'
  const [activeTab, setActiveTab] = useState<'transactions' | 'withdrawals' | 'adjust'>('transactions');

  // Filters for Transactions
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [page, setPage] = useState(1);

  // Manual Adjust Modal/Form state
  const [targetUserId, setTargetUserId] = useState('');
  const [adjustAmount, setAdjustAmount] = useState<number>(50000);
  const [adjustDirection, setAdjustDirection] = useState<'credit' | 'debit'>('credit');
  const [adjustReason, setAdjustReason] = useState('');
  const [isAdjusting, setIsAdjusting] = useState(false);

  // Approve / Reject Modal
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<WalletTransactionItem | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [trackingCodeInput, setTrackingCodeInput] = useState('');
  const [adminNoteInput, setAdminNoteInput] = useState('');
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  // Fetch Admin Stats
  const { data: stats, isLoading: isStatsLoading, refetch: refetchStats } = useQuery({
    queryKey: ['adminWalletStats'],
    queryFn: () => walletApi.adminGetStats().then(res => res.data),
  });

  // Fetch Transactions
  const { data: txData, isLoading: isTxLoading, refetch: refetchTx } = useQuery({
    queryKey: ['adminWalletTransactions', page, filterType, filterStatus, searchQuery],
    queryFn: () => walletApi.adminGetAllTransactions({
      page,
      limit: 15,
      type: filterType === 'all' ? undefined : filterType,
      status: filterStatus === 'all' ? undefined : filterStatus,
      search: searchQuery.trim() || undefined,
    }).then(res => res.data),
  });

  // Fetch Withdrawals (Transactions of type 'withdraw')
  const { data: withdrawalsData, isLoading: isWithdrawalsLoading, refetch: refetchWithdrawals } = useQuery({
    queryKey: ['adminWalletWithdrawals', page],
    queryFn: () => walletApi.adminGetAllTransactions({
      page,
      limit: 15,
      type: 'withdraw',
    }).then(res => res.data),
  });

  // Manual Adjust Handler
  const handleManualAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUserId.trim() || !adjustAmount || adjustAmount <= 0 || !adjustReason.trim()) {
      toast.error('لطفاً کلیه فیلدهای فرم تنظیم موجودی را تکمیل نمایید');
      return;
    }

    setIsAdjusting(true);
    try {
      await walletApi.adminAdjustBalance({
        targetUserId: targetUserId.trim(),
        amount: adjustAmount,
        direction: adjustDirection,
        reason: adjustReason.trim(),
      });
      toast.success('موجودی کاربر با موفقیت ویرایش گردید و لاگ امنیتی ثبت شد');
      setTargetUserId('');
      setAdjustReason('');
      queryClient.invalidateQueries({ queryKey: ['adminWalletStats'] });
      queryClient.invalidateQueries({ queryKey: ['adminWalletTransactions'] });
      setActiveTab('transactions');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'خطا در ویرایش موجودی کاربر');
    } finally {
      setIsAdjusting(false);
    }
  };

  // Approve / Reject Handler
  const handleConfirmAction = async () => {
    if (!selectedWithdrawal) return;
    setIsProcessingAction(true);

    try {
      if (actionType === 'approve') {
        await walletApi.adminApproveWithdrawal(selectedWithdrawal._id, {
          trackingCode: trackingCodeInput.trim() || undefined,
          adminNote: adminNoteInput.trim() || undefined,
        });
        toast.success('درخواست تسویه با موفقیت تایید و تکمیل شد');
      } else {
        if (!adminNoteInput.trim()) {
          toast.error('ذکر دلیل رد درخواست الزامی است');
          setIsProcessingAction(false);
          return;
        }
        await walletApi.adminRejectWithdrawal(selectedWithdrawal._id, adminNoteInput.trim());
        toast.success('درخواست تسویه رد شد و مبلغ به کیف پول کاربر بازگشت داده شد');
      }

      setSelectedWithdrawal(null);
      setActionType(null);
      setTrackingCodeInput('');
      setAdminNoteInput('');
      queryClient.invalidateQueries({ queryKey: ['adminWalletStats'] });
      queryClient.invalidateQueries({ queryKey: ['adminWalletWithdrawals'] });
      queryClient.invalidateQueries({ queryKey: ['adminWalletTransactions'] });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'خطا در اعمال تغییرات تسویه');
    } finally {
      setIsProcessingAction(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[var(--neo-border)] shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/10 text-indigo-600 flex items-center justify-center">
              <Wallet className="w-6 h-6" />
            </div>
            مدیریت کیف پول‌ها و گردش مالی
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            نظارت بر موجودی کاربران، اعتبارات در گردش، تایید تسویه‌ها و تنظیم دستی موجودی
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              refetchStats();
              refetchTx();
              refetchWithdrawals();
              toast.success('آمار مالی کیف پول‌ها به‌روز شد');
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-bold transition"
          >
            <RefreshCw className="w-4 h-4" />
            به‌روزرسانی داده‌ها
          </button>
          
          <button 
            onClick={() => setActiveTab('adjust')}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/20 transition"
          >
            <Plus className="w-4 h-4" />
            تغییر دستی موجودی کاربر
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* KPI 1: Total Liabilities */}
        <div className="bg-white p-6 rounded-3xl border border-[var(--neo-border)] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500">موجودی کل در گردش کاربران</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 mb-1">
              {(stats?.totalLiabilities || 0).toLocaleString('fa-IR')} <span className="text-xs font-normal text-slate-500">تومان</span>
            </div>
            <div className="text-xs text-indigo-600 font-medium">
              نزد {(stats?.usersWithBalance || 0).toLocaleString('fa-IR')} کاربر با موجودی فعال
            </div>
          </div>
        </div>

        {/* KPI 2: Total Online Deposits */}
        <div className="bg-white p-6 rounded-3xl border border-[var(--neo-border)] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500">مجموع شارژهای شتاب</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-emerald-600 mb-1">
              {(stats?.totalDeposits || 0).toLocaleString('fa-IR')} <span className="text-xs font-normal text-slate-500">تومان</span>
            </div>
            <div className="text-xs text-emerald-700 font-medium">
              افزایش اعتبار مستقیم از درگاه
            </div>
          </div>
        </div>

        {/* KPI 3: Orders Paid with Wallet */}
        <div className="bg-white p-6 rounded-3xl border border-[var(--neo-border)] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500">خرید با موجودی کیف پول</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-blue-600 mb-1">
              {(stats?.totalPurchases || 0).toLocaleString('fa-IR')} <span className="text-xs font-normal text-slate-500">تومان</span>
            </div>
            <div className="text-xs text-blue-700 font-medium">
              پرداخت دوره‌ها بدون واسطه بانکی
            </div>
          </div>
        </div>

        {/* KPI 4: Pending Withdrawals */}
        <div className="bg-white p-6 rounded-3xl border border-[var(--neo-border)] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500">تسویه‌های در انتظار تایید</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-amber-600 mb-1">
              {(stats?.pendingWithdrawalsAmount || 0).toLocaleString('fa-IR')} <span className="text-xs font-normal text-slate-500">تومان</span>
            </div>
            <div className="text-xs text-amber-700 font-bold">
              {(stats?.pendingWithdrawalsCount || 0).toLocaleString('fa-IR')} درخواست در صف بررسی
            </div>
          </div>
        </div>

      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('transactions')}
          className={`px-5 py-2.5 rounded-2xl text-sm font-bold transition flex items-center gap-2 ${
            activeTab === 'transactions'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          کل تراکنش‌های سامانه
        </button>

        <button
          onClick={() => setActiveTab('withdrawals')}
          className={`relative px-5 py-2.5 rounded-2xl text-sm font-bold transition flex items-center gap-2 ${
            activeTab === 'withdrawals'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Building2 className="w-4 h-4" />
          درخواست‌های تسویه‌حساب بانکی
          {(stats?.pendingWithdrawalsCount || 0) > 0 && (
            <span className="bg-rose-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
              {stats?.pendingWithdrawalsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('adjust')}
          className={`px-5 py-2.5 rounded-2xl text-sm font-bold transition flex items-center gap-2 ${
            activeTab === 'adjust'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Plus className="w-4 h-4" />
          تعدیل دستی موجودی کاربر
        </button>
      </div>

      {/* Tab 1: All Platform Transactions */}
      {activeTab === 'transactions' && (
        <div className="bg-white rounded-3xl border border-[var(--neo-border)] shadow-sm overflow-hidden space-y-4">
          
          {/* Filters Bar */}
          <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text"
                placeholder="جستجو بر اساس نام، ایمیل، شناسه یا کد پیگیری..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-10 pl-4 py-2.5 text-xs outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center gap-3">
              <select
                value={filterType}
                onChange={(e) => {
                  setFilterType(e.target.value);
                  setPage(1);
                }}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none"
              >
                <option value="all">همه انواع تراکنش</option>
                <option value="deposit">شارژ آنلاین</option>
                <option value="purchase">خرید دوره</option>
                <option value="withdraw">تسویه حساب</option>
                <option value="referral_reward">پاداش رفرال</option>
                <option value="referral_welcome">هدیه عضویت</option>
                <option value="admin_adjustment">تعدیل دستی مدیریت</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setPage(1);
                }}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none"
              >
                <option value="all">همه وضعیت‌ها</option>
                <option value="completed">موفق / تکمیل شده</option>
                <option value="pending">در انتظار</option>
                <option value="rejected">رد شده / ناموفق</option>
              </select>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="p-4 pr-6">کاربر</th>
                  <th className="p-4">نوع و عنوان تراکنش</th>
                  <th className="p-4">مبلغ (تومان)</th>
                  <th className="p-4">موجودی پس از تراکنش</th>
                  <th className="p-4">کد پیگیری</th>
                  <th className="p-4">تاریخ</th>
                  <th className="p-4 pl-6 text-center">وضعیت</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isTxLoading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-slate-400">در حال دریافت داده‌ها...</td>
                  </tr>
                ) : !txData?.items?.length ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-slate-400">تراکنشی با فیلترهای جاری یافت نشد</td>
                  </tr>
                ) : (
                  txData.items.map((tx: WalletTransactionItem) => {
                    const isCredit = tx.direction === 'credit';
                    const userObj: any = tx.userId;
                    return (
                      <tr key={tx._id} className="hover:bg-slate-50/70 transition">
                        <td className="p-4 pr-6">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 text-xs">
                              {userObj?.firstName ? userObj.firstName.charAt(0) : 'U'}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900">
                                {userObj?.firstName ? `${userObj.firstName} ${userObj.lastName}` : 'کاربر سیستم'}
                              </div>
                              <div className="text-[11px] text-slate-400 font-mono">{userObj?.email || '---'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="font-bold text-slate-800">{tx.title}</div>
                          <span className="text-[10px] text-slate-500">{tx.description || tx.type}</span>
                        </td>
                        <td className="p-4 font-black dir-ltr text-sm">
                          <span className={isCredit ? 'text-emerald-600' : 'text-rose-600'}>
                            {isCredit ? '+' : '-'}{tx.amount.toLocaleString('fa-IR')}
                          </span>
                        </td>
                        <td className="p-4 font-mono font-bold text-slate-700">
                          {tx.balanceAfter ? `${tx.balanceAfter.toLocaleString('fa-IR')} ت` : '---'}
                        </td>
                        <td className="p-4 font-mono text-[11px] text-slate-500">
                          {tx.trackingCode || tx.referenceId || '---'}
                        </td>
                        <td className="p-4 text-slate-500">
                          {new Date(tx.createdAt).toLocaleDateString('fa-IR', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td className="p-4 pl-6 text-center">
                          <span className={`inline-block px-2.5 py-1 rounded-full font-bold text-[11px] ${
                            tx.status === 'completed' ? 'bg-emerald-50 text-emerald-700' :
                            tx.status === 'pending' ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'
                          }`}>
                            {tx.status === 'completed' ? 'موفق' : tx.status === 'pending' ? 'در انتظار' : 'رد شده'}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {txData && txData.pagination.totalPages > 1 && (
            <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>صفحه {txData.pagination.page} از {txData.pagination.totalPages}</span>
              <div className="flex gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(p => p - 1)}
                  className="px-3 py-1.5 bg-slate-100 rounded-lg hover:bg-slate-200 transition disabled:opacity-50"
                >
                  قبلی
                </button>
                <button
                  disabled={page >= txData.pagination.totalPages}
                  onClick={() => setPage(p => p + 1)}
                  className="px-3 py-1.5 bg-slate-100 rounded-lg hover:bg-slate-200 transition disabled:opacity-50"
                >
                  بعدی
                </button>
              </div>
            </div>
          )}

        </div>
      )}

      {/* Tab 2: Withdrawals Management */}
      {activeTab === 'withdrawals' && (
        <div className="bg-white rounded-3xl border border-[var(--neo-border)] shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-lg font-bold text-slate-900">لیست درخواست‌های تسویه‌حساب و برداشت وجه</h3>
            <p className="text-xs text-slate-500 mt-1">
              بررسی شماره شبا، تایید حواله بانکی با ثبت کد رهگیری پایا/ساتنا یا رد درخواست با بازگشت آنی موجودی
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="p-4 pr-6">متقاضی</th>
                  <th className="p-4">مبلغ درخواستی</th>
                  <th className="p-4">اطلاعات حساب شبا</th>
                  <th className="p-4">تاریخ ثبت</th>
                  <th className="p-4">وضعیت</th>
                  <th className="p-4 pl-6 text-center">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isWithdrawalsLoading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-slate-400">در حال بارگذاری...</td>
                  </tr>
                ) : !withdrawalsData?.items?.length ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-slate-400">درخواست تسویه‌ای یافت نشد</td>
                  </tr>
                ) : (
                  withdrawalsData.items.map((item: WalletTransactionItem) => {
                    const userObj: any = item.userId;
                    return (
                      <tr key={item._id} className="hover:bg-slate-50/70 transition">
                        <td className="p-4 pr-6">
                          <div className="font-bold text-slate-900">
                            {userObj?.firstName ? `${userObj.firstName} ${userObj.lastName}` : 'کاربر'}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">{userObj?.email}</div>
                        </td>
                        <td className="p-4 font-black text-sm text-slate-900">
                          {item.amount.toLocaleString('fa-IR')} <span className="text-xs font-normal text-slate-500">تومان</span>
                        </td>
                        <td className="p-4">
                          <div className="font-mono font-bold text-slate-800">{item.bankInfo?.shaba || '---'}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            صاحب حساب: {item.bankInfo?.accountHolder || '---'} {item.bankInfo?.bankName ? `(${item.bankInfo.bankName})` : ''}
                          </div>
                        </td>
                        <td className="p-4 text-slate-500">
                          {new Date(item.createdAt).toLocaleDateString('fa-IR')}
                        </td>
                        <td className="p-4">
                          <span className={`inline-block px-2.5 py-1 rounded-full font-bold text-[11px] ${
                            item.status === 'completed' ? 'bg-emerald-50 text-emerald-700' :
                            item.status === 'pending' ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'
                          }`}>
                            {item.status === 'completed' ? 'واریز شده' : item.status === 'pending' ? 'در انتظار تایید' : 'رد شده'}
                          </span>
                        </td>
                        <td className="p-4 pl-6 text-center">
                          {item.status === 'pending' ? (
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => {
                                  setSelectedWithdrawal(item);
                                  setActionType('approve');
                                  setTrackingCodeInput(`PAYA-${Date.now().toString().slice(-6)}`);
                                }}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] transition shadow-sm"
                              >
                                تایید واریز
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedWithdrawal(item);
                                  setActionType('reject');
                                }}
                                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg font-bold text-[11px] transition"
                              >
                                رد درخواست
                              </button>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-xs font-mono">
                              {item.trackingCode || 'تعیین وضعیت شده'}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Manual Adjustment Form */}
      {activeTab === 'adjust' && (
        <div className="bg-white rounded-3xl border border-[var(--neo-border)] shadow-sm p-8 max-w-2xl">
          <div className="border-b border-slate-100 pb-4 mb-6">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Plus className="w-5 h-5 text-indigo-600" />
              تعدیل و شارژ / کسر دستی موجودی کیف پول کاربر
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              این عملیات مستقیماً موجودی کاربر را تغییر داده، لاگ امنیتی (Audit Log) ایجاد کرده و به کاربر اعلان ارسال می‌کند.
            </p>
          </div>

          <form onSubmit={handleManualAdjust} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                شناسه یکتا یا ایمیل کاربر:
              </label>
              <input
                type="text"
                required
                placeholder="مثال: 66f3a... یا user@gmail.com"
                value={targetUserId}
                onChange={(e) => setTargetUserId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">نوع تغییر:</label>
              <div className="grid grid-cols-2 gap-3">
                <label className={`flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition ${
                  adjustDirection === 'credit'
                    ? 'border-emerald-600 bg-emerald-50/40 text-emerald-950 font-bold'
                    : 'border-slate-200 text-slate-600'
                }`}>
                  <input
                    type="radio"
                    name="adjustDir"
                    checked={adjustDirection === 'credit'}
                    onChange={() => setAdjustDirection('credit')}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>افزایش موجودی / شارژ هدیه (+)</span>
                </label>

                <label className={`flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition ${
                  adjustDirection === 'debit'
                    ? 'border-rose-600 bg-rose-50/40 text-rose-950 font-bold'
                    : 'border-slate-200 text-slate-600'
                }`}>
                  <input
                    type="radio"
                    name="adjustDir"
                    checked={adjustDirection === 'debit'}
                    onChange={() => setAdjustDirection('debit')}
                    className="text-rose-600 focus:ring-rose-500"
                  />
                  <span>کسر یا تسویه دستی موجودی (-)</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">مبلغ تغییر (تومان):</label>
              <div className="relative">
                <input
                  type="number"
                  required
                  min={1000}
                  value={adjustAmount || ''}
                  onChange={(e) => setAdjustAmount(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-left font-bold text-slate-900 outline-none focus:border-indigo-500 text-base"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">تومان</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">دلیل ثبت تغییر موجودی (در اعلان و رسید کاربر درج می‌شود):</label>
              <textarea
                required
                rows={3}
                placeholder="مثال: پاداش ویژه مسابقه کدنویسی / تسویه حساب حضوری / جبران خسارت قطعی کلاس"
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-900 outline-none focus:border-indigo-500 leading-relaxed"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isAdjusting}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl transition shadow-lg shadow-indigo-600/20 disabled:opacity-50 text-sm"
              >
                {isAdjusting ? 'در حال ثبت...' : 'اعمال تغییر موجودی و ثبت در لاگ سیستم'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Approve / Reject Modal */}
      {selectedWithdrawal && actionType && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">
                {actionType === 'approve' ? 'تایید و ثبت حواله پایا/ساتنا' : 'رد درخواست تسویه حساب'}
              </h3>
              <button onClick={() => setSelectedWithdrawal(null)} className="text-slate-400 p-1">✕</button>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl space-y-1.5 text-xs text-slate-700 border border-slate-100">
              <div className="flex justify-between">
                <span>مبلغ تسویه:</span>
                <span className="font-bold text-slate-900">{selectedWithdrawal.amount.toLocaleString('fa-IR')} تومان</span>
              </div>
              <div className="flex justify-between font-mono">
                <span>شبا:</span>
                <span className="font-bold">{selectedWithdrawal.bankInfo?.shaba}</span>
              </div>
              <div className="flex justify-between">
                <span>به نام:</span>
                <span>{selectedWithdrawal.bankInfo?.accountHolder}</span>
              </div>
            </div>

            {actionType === 'approve' ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">کد رهگیری بانکی (پایا / ساتنا):</label>
                  <input
                    type="text"
                    required
                    value={trackingCodeInput}
                    onChange={(e) => setTrackingCodeInput(e.target.value)}
                    placeholder="PAYA-..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-mono outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">توضیحات مدیر (اختیاری):</label>
                  <input
                    type="text"
                    value={adminNoteInput}
                    onChange={(e) => setAdminNoteInput(e.target.value)}
                    placeholder="واریز شد..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-rose-700 mb-1">علت رد درخواست (مبلغ فوراً به کیف پول کاربر بازگردانده می‌شود):</label>
                <textarea
                  required
                  rows={3}
                  value={adminNoteInput}
                  onChange={(e) => setAdminNoteInput(e.target.value)}
                  placeholder="مثال: عدم تطابق نام صاحب حساب با شماره شبا / نقص مدارک احراز هویت"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs outline-none focus:border-rose-500"
                />
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleConfirmAction}
                disabled={isProcessingAction}
                className={`flex-1 text-white font-bold py-3 rounded-xl transition disabled:opacity-50 text-xs ${
                  actionType === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {isProcessingAction ? 'در حال اعمال...' : actionType === 'approve' ? 'تایید و نهایی‌سازی تسویه' : 'رد درخواست و بازگشت وجه'}
              </button>
              <button
                onClick={() => setSelectedWithdrawal(null)}
                className="px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold text-xs"
              >
                انصراف
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
