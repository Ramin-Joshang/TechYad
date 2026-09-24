'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Wallet, ArrowUpRight, ArrowDownLeft, CreditCard, Gift, 
  Clock, CheckCircle2, XCircle, AlertCircle, Plus, 
  ExternalLink, Search, Filter, ShieldCheck, RefreshCw,
  Sparkles, ChevronLeft, Building2, HelpCircle
} from 'lucide-react';
import { walletApi, WalletTransactionItem } from '@/features/wallet/api/wallet.api';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function StudentWalletPage() {
  const queryClient = useQueryClient();

  // Modals & States
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState<number>(100000);
  const [isDepositing, setIsDepositing] = useState(false);

  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState<number>(100000);
  const [shabaNumber, setShabaNumber] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [bankName, setBankName] = useState('بانک ملی');
  const [cardNumber, setCardNumber] = useState('');
  const [isSubmittingWithdraw, setIsSubmittingWithdraw] = useState(false);

  const [selectedTx, setSelectedTx] = useState<WalletTransactionItem | null>(null);

  // Filters
  const [filterType, setFilterType] = useState<string>('all');
  const [filterDirection, setFilterDirection] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);

  // Fetch Wallet Overview
  const { data: overview, isLoading: isOverviewLoading, refetch: refetchOverview } = useQuery({
    queryKey: ['studentWalletOverview'],
    queryFn: () => walletApi.getOverview().then(res => res.data),
  });

  // Fetch Transactions
  const { data: txData, isLoading: isTxLoading } = useQuery({
    queryKey: ['studentWalletTransactions', page, filterType, filterDirection],
    queryFn: () => walletApi.getTransactions({
      page,
      limit: 10,
      type: filterType === 'all' ? undefined : filterType,
      direction: filterDirection === 'all' ? undefined : filterDirection,
    }).then(res => res.data),
  });

  // Handle Deposit
  const handleDeposit = async () => {
    if (!depositAmount || depositAmount < 10000) {
      toast.error('حداقل مبلغ شارژ ۱۰,۰۰۰ تومان می‌باشد');
      return;
    }

    setIsDepositing(true);
    try {
      const res = await walletApi.chargeWallet(depositAmount);
      if (res.data?.paymentUrl) {
        window.location.href = res.data.paymentUrl;
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'خطا در ایجاد تراکنش شارژ');
    } finally {
      setIsDepositing(false);
    }
  };

  // Handle Withdraw
  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!withdrawAmount || withdrawAmount < 50000) {
      toast.error('حداقل مبلغ تسویه ۵۰,۰۰۰ تومان می‌باشد');
      return;
    }
    if ((overview?.balance || 0) < withdrawAmount) {
      toast.error('موجودی کافی برای این درخواست تسویه وجود ندارد');
      return;
    }
    if (!shabaNumber.trim() || !accountHolder.trim()) {
      toast.error('شماره شبا و نام صاحب حساب الزامی هستند');
      return;
    }

    let cleanShaba = shabaNumber.trim().toUpperCase().replace(/[\s-]/g, '');
    if (!cleanShaba.startsWith('IR')) {
      cleanShaba = 'IR' + cleanShaba;
    }

    if (cleanShaba.length !== 26) {
      toast.error('شماره شبا باید ۲۶ کاراکتر (شامل IR) باشد');
      return;
    }

    setIsSubmittingWithdraw(true);
    try {
      await walletApi.requestWithdrawal({
        amount: withdrawAmount,
        shaba: cleanShaba,
        accountHolder: accountHolder.trim(),
        bankName,
        cardNumber: cardNumber.trim() || undefined,
      });
      toast.success('درخواست تسویه با موفقیت ثبت شد و به زودی واریز خواهد گردید');
      setShowWithdrawModal(false);
      queryClient.invalidateQueries({ queryKey: ['studentWalletOverview'] });
      queryClient.invalidateQueries({ queryKey: ['studentWalletTransactions'] });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'خطا در ثبت درخواست تسویه');
    } finally {
      setIsSubmittingWithdraw(false);
    }
  };

  const getTxTypeBadge = (tx: WalletTransactionItem) => {
    switch (tx.type) {
      case 'deposit':
        return { label: 'شارژ آنلاین', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'purchase':
        return { label: 'خرید دوره / کلاس', color: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'referral_reward':
        return { label: 'پاداش معرفی دوست', color: 'bg-purple-50 text-purple-700 border-purple-200' };
      case 'referral_welcome':
        return { label: 'هدیه ثبت‌نام معرف', color: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'withdraw':
        return { label: 'تسویه حساب', color: 'bg-orange-50 text-orange-700 border-orange-200' };
      case 'refund':
        return { label: 'بازگشت وجه', color: 'bg-teal-50 text-teal-700 border-teal-200' };
      case 'admin_adjustment':
        return { label: 'تعدیل مدیریت', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
      default:
        return { label: 'تراکنش', color: 'bg-slate-50 text-slate-700 border-slate-200' };
    }
  };

  const getTxStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full"><CheckCircle2 className="w-3.5 h-3.5" /> موفق</span>;
      case 'pending':
        return <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full"><Clock className="w-3.5 h-3.5" /> در انتظار</span>;
      case 'rejected':
      case 'failed':
        return <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full"><XCircle className="w-3.5 h-3.5" /> ناموفق / رد شده</span>;
      default:
        return <span>{status}</span>;
    }
  };

  const balance = overview?.balance || 0;
  const stats = overview?.stats;

  return (
    <div className="space-y-8 pb-12">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[var(--neo-border)] shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-[var(--neo-text-main)] flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/10 text-indigo-600 flex items-center justify-center">
              <Wallet className="w-6 h-6" />
            </div>
            کیف پول تک‌یاد
          </h1>
          <p className="text-sm text-[var(--neo-text-muted)] mt-1">
            مدیریت موجودی، افزایش اعتبار سریع، تسویه حساب بانکی و سوابق تراکنش‌ها
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              refetchOverview();
              queryClient.invalidateQueries({ queryKey: ['studentWalletTransactions'] });
              toast.success('موجودی به‌روزرسانی شد');
            }}
            className="p-2.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition"
            title="به‌روزرسانی"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          
          <button 
            onClick={() => setShowWithdrawModal(true)}
            disabled={balance < 50000}
            className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-sm font-bold transition disabled:opacity-50"
          >
            <ArrowDownLeft className="w-4 h-4 text-orange-500" />
            درخواست تسویه
          </button>

          <button 
            onClick={() => setShowDepositModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/20 transition"
          >
            <Plus className="w-4 h-4" />
            شارژ کیف پول
          </button>
        </div>
      </div>

      {/* Main Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card 1: Main Balance Card (Hero Style) */}
        <div className="md:col-span-2 relative overflow-hidden bg-gradient-to-br from-indigo-700 via-indigo-800 to-slate-900 text-white p-7 rounded-3xl shadow-xl flex flex-col justify-between min-h-[200px]">
          {/* Decorative shapes */}
          <div className="absolute -left-10 -bottom-10 w-44 h-44 bg-indigo-500/20 rounded-full blur-2xl"></div>
          <div className="absolute right-0 top-0 w-36 h-36 bg-pink-500/10 rounded-full blur-xl"></div>
          
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-indigo-200 uppercase tracking-wider">موجودی در دسترس شما</span>
              <span className="text-[10px] bg-emerald-400/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-400/30">
                فعال و قابل استفاده
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-indigo-200" />
            </div>
          </div>

          <div className="relative z-10 my-4">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl lg:text-5xl font-black tracking-tight">
                {balance.toLocaleString('fa-IR')}
              </span>
              <span className="text-lg font-normal text-indigo-200">تومان</span>
            </div>
          </div>

          <div className="relative z-10 flex items-center justify-between pt-3 border-t border-white/10 text-xs text-indigo-200">
            <span>شماره حساب کاربری: #{overview?.user?.id?.slice(-6) || '---'}</span>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setShowDepositModal(true)}
                className="underline hover:text-white font-bold"
              >
                + شارژ سریع حساب
              </button>
            </div>
          </div>
        </div>

        {/* Card 2: Total Referral Rewards */}
        <div className="bg-white p-6 rounded-3xl border border-[var(--neo-border)] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-500">پاداش معرفی و رفرال</span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Gift className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 mb-1">
              {(stats?.totalReferralEarnings || 0).toLocaleString('fa-IR')} <span className="text-xs font-normal text-slate-500">تومان</span>
            </div>
            <p className="text-xs text-purple-600 font-medium">واریز مستقیم به کیف پول</p>
          </div>
          <Link 
            href="/student/referrals" 
            className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-purple-700 hover:text-purple-800"
          >
            صفحه معرفی دوستان
            <ChevronLeft className="w-4 h-4" />
          </Link>
        </div>

        {/* Card 3: Total Spent on Orders */}
        <div className="bg-white p-6 rounded-3xl border border-[var(--neo-border)] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-500">مجموع خریدهای موفق</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 mb-1">
              {(stats?.totalSpentOnOrders || 0).toLocaleString('fa-IR')} <span className="text-xs font-normal text-slate-500">تومان</span>
            </div>
            <p className="text-xs text-slate-500 font-medium">پرداخت با اعتبار کیف پول</p>
          </div>
          <Link 
            href="/student/orders" 
            className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-700 hover:text-blue-800"
          >
            مشاهده سفارشات
            <ChevronLeft className="w-4 h-4" />
          </Link>
        </div>

      </div>

      {/* Feature Highlights Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/60 p-4 rounded-2xl flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-emerald-950 text-sm">پرداخت آنی ۱ کلیکه</h4>
            <p className="text-xs text-emerald-800">بدون نیاز به اتصال به درگاه بانکی و معطلی، فوراً دوره‌ها فعال می‌شوند.</p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200/60 p-4 rounded-2xl flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
            <Gift className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-indigo-950 text-sm">شارژ خودکار پاداش رفرال</h4>
            <p className="text-xs text-indigo-800">با دعوت دوستان خود به ازای هر خرید، درصد کمیسیون نقدی دریافت کنید.</p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/60 p-4 rounded-2xl flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-amber-950 text-sm">تسویه حساب به شماره شبا</h4>
            <p className="text-xs text-amber-800">در هر زمان امکان ثبت درخواست واریز موجودی به حساب بانکی شتاب را دارید.</p>
          </div>
        </div>
      </div>

      {/* Transaction History Section */}
      <div className="bg-white rounded-3xl border border-[var(--neo-border)] shadow-sm overflow-hidden">
        
        {/* Table Header & Controls */}
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">گردش حساب و تاریخچه تراکنش‌ها</h3>
            <p className="text-xs text-slate-500 mt-0.5">لیست کامل شارژها، پرداخت‌های دوره‌ها و پاداش‌های ثبت‌شده</p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'all', label: 'همه تراکنش‌ها' },
              { id: 'deposit', label: 'شارژها' },
              { id: 'purchase', label: 'خریدها' },
              { id: 'referral_reward', label: 'پاداش رفرال' },
              { id: 'withdraw', label: 'تسویه‌ها' },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => {
                  setFilterType(f.id);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  filterType === f.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-slate-50/75 text-slate-500 text-xs font-semibold border-b border-slate-100">
              <tr>
                <th className="p-4 pr-6">نوع و عنوان تراکنش</th>
                <th className="p-4">مبلغ (تومان)</th>
                <th className="p-4">موجودی پس از تراکنش</th>
                <th className="p-4">کد پیگیری / شناسه</th>
                <th className="p-4">تاریخ و زمان</th>
                <th className="p-4">وضعیت</th>
                <th className="p-4 pl-6 text-center">جزئیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isTxLoading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    در حال بارگذاری تراکنش‌ها...
                  </td>
                </tr>
              ) : !txData?.items?.length ? (
                <tr>
                  <td colSpan={7} className="text-center py-12">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <Wallet className="w-12 h-12 stroke-[1.5] mb-2 text-slate-300" />
                      <p className="font-bold text-slate-600 text-sm">تراکنشی یافت نشد</p>
                      <p className="text-xs text-slate-400 mt-1">با شارژ کیف پول یا ثبت سفارش، گردش حساب شما در اینجا ثبت می‌شود.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                txData.items.map((tx: WalletTransactionItem) => {
                  const typeBadge = getTxTypeBadge(tx);
                  const isCredit = tx.direction === 'credit';
                  return (
                    <tr key={tx._id} className="hover:bg-slate-50/60 transition">
                      <td className="p-4 pr-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            isCredit ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                          }`}>
                            {isCredit ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-sm">{tx.title}</div>
                            <span className={`inline-block text-[11px] px-2 py-0.5 rounded-md border font-medium mt-0.5 ${typeBadge.color}`}>
                              {typeBadge.label}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`font-black text-sm dir-ltr inline-block ${
                          isCredit ? 'text-emerald-600' : 'text-rose-600'
                        }`}>
                          {isCredit ? '+' : '-'}{tx.amount.toLocaleString('fa-IR')}
                        </span>
                      </td>
                      <td className="p-4 font-mono font-bold text-slate-700 text-xs">
                        {tx.balanceAfter ? `${tx.balanceAfter.toLocaleString('fa-IR')} ت` : '---'}
                      </td>
                      <td className="p-4 font-mono text-xs text-slate-500">
                        {tx.trackingCode || tx.referenceId || '---'}
                      </td>
                      <td className="p-4 text-xs text-slate-500">
                        {new Date(tx.createdAt).toLocaleDateString('fa-IR', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="p-4">
                        {getTxStatusBadge(tx.status)}
                      </td>
                      <td className="p-4 pl-6 text-center">
                        <button
                          onClick={() => setSelectedTx(tx)}
                          className="text-xs text-indigo-600 hover:text-indigo-800 font-bold bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition"
                        >
                          مشاهده رسید
                        </button>
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

      {/* Deposit Modal */}
      {showDepositModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">افزایش اعتبار کیف پول</h3>
                  <p className="text-xs text-slate-500">پرداخت امن از طریق کلیه کارت‌های عضو شتاب</p>
                </div>
              </div>
              <button 
                onClick={() => setShowDepositModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">انتخاب مبالغ پیشنهادی:</label>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {[50000, 100000, 200000, 500000, 1000000, 2000000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setDepositAmount(amt)}
                    className={`py-2 px-2 text-xs font-bold rounded-xl border transition ${
                      depositAmount === amt
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300'
                    }`}
                  >
                    {amt.toLocaleString('fa-IR')} ت
                  </button>
                ))}
              </div>

              <label className="block text-xs font-bold text-slate-700 mb-1 mt-3">یا مبلغ دلخواه (تومان):</label>
              <div className="relative">
                <input
                  type="number"
                  value={depositAmount || ''}
                  onChange={(e) => setDepositAmount(Number(e.target.value))}
                  placeholder="مبلغ به تومان..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-left font-bold text-slate-900 outline-none focus:border-emerald-500 text-base"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">تومان</span>
              </div>
              <span className="text-[11px] text-slate-400 block mt-1">حداقل مبلغ شارژ ۱۰,۰۰۰ تومان می‌باشد.</span>
            </div>

            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              پس از تکمیل پرداخت در درگاه بانکی، موجودی بلافاصله افزوده می‌شود.
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleDeposit}
                disabled={isDepositing || !depositAmount || depositAmount < 10000}
                className="flex-1 bg-emerald-600 text-white font-bold py-3.5 rounded-xl hover:bg-emerald-700 transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 disabled:opacity-50"
              >
                {isDepositing ? 'در حال اتصال...' : `پرداخت و شارژ ${depositAmount.toLocaleString('fa-IR')} تومان`}
              </button>
              <button
                type="button"
                onClick={() => setShowDepositModal(false)}
                className="px-4 py-3.5 bg-slate-100 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-200 transition"
              >
                انصراف
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                  <ArrowDownLeft className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">درخواست تسویه حساب</h3>
                  <p className="text-xs text-slate-500">انتقال موجودی کیف پول به حساب بانکی شتاب</p>
                </div>
              </div>
              <button 
                onClick={() => setShowWithdrawModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleWithdraw} className="space-y-4">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                <span className="text-slate-600">موجودی قابل تسویه:</span>
                <span className="font-bold text-slate-900 text-sm">{balance.toLocaleString('fa-IR')} تومان</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">مبلغ تسویه (تومان):</label>
                <input
                  type="number"
                  required
                  min={50000}
                  max={balance}
                  value={withdrawAmount || ''}
                  onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-left font-bold text-slate-900 outline-none focus:border-indigo-500 text-sm"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">حداقل مبلغ تسویه ۵۰,۰۰۰ تومان است.</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">شماره شبا (بدون فاصله):</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="IR..."
                    value={shabaNumber}
                    onChange={(e) => setShabaNumber(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-left font-mono font-bold text-slate-900 outline-none focus:border-indigo-500 text-sm uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">نام و نام خانوادگی صاحب حساب:</label>
                <input
                  type="text"
                  required
                  value={accountHolder}
                  onChange={(e) => setAccountHolder(e.target.value)}
                  placeholder="مثال: علی محمدی"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 outline-none focus:border-indigo-500 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">نام بانک:</label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="مثال: بانک سامان"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 outline-none focus:border-indigo-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">شماره کارت (اختیاری):</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="۶۰۳۷-..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-left font-mono text-slate-900 outline-none focus:border-indigo-500 text-sm"
                  />
                </div>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 leading-relaxed">
                واریز تسویه حساب از طریق سامانه پایا/ساتنا در سیکل کاری ۱ الی ۲ روز انجام می‌پذیرد.
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSubmittingWithdraw || withdrawAmount < 50000 || withdrawAmount > balance}
                  className="flex-1 bg-orange-600 text-white font-bold py-3 rounded-xl hover:bg-orange-700 transition flex items-center justify-center gap-2 shadow-lg shadow-orange-600/20 disabled:opacity-50"
                >
                  {isSubmittingWithdraw ? 'در حال ثبت...' : 'ثبت درخواست تسویه'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowWithdrawModal(false)}
                  className="px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-200 transition"
                >
                  انصراف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transaction Details Modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">رسید دیجیتال تراکنش</h3>
              <button 
                onClick={() => setSelectedTx(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <div className="text-center py-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="text-xs text-slate-500 mb-1">{selectedTx.title}</div>
              <div className={`text-3xl font-black ${
                selectedTx.direction === 'credit' ? 'text-emerald-600' : 'text-rose-600'
              }`}>
                {selectedTx.direction === 'credit' ? '+' : '-'}{selectedTx.amount.toLocaleString('fa-IR')}
                <span className="text-xs font-normal text-slate-500 mr-1.5">تومان</span>
              </div>
              <div className="mt-2 flex justify-center">
                {getTxStatusBadge(selectedTx.status)}
              </div>
            </div>

            <div className="space-y-2.5 text-xs text-slate-600">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span>کد پیگیری:</span>
                <span className="font-mono font-bold text-slate-900">{selectedTx.trackingCode || selectedTx.referenceId || '---'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span>شناسه تراکنش:</span>
                <span className="font-mono text-slate-500">{selectedTx._id}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span>موجودی پس از تراکنش:</span>
                <span className="font-bold text-slate-900">{selectedTx.balanceAfter ? `${selectedTx.balanceAfter.toLocaleString('fa-IR')} تومان` : '---'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span>تاریخ و ساعت:</span>
                <span>{new Date(selectedTx.createdAt).toLocaleString('fa-IR')}</span>
              </div>
              {selectedTx.description && (
                <div className="py-1.5 border-b border-slate-100">
                  <span className="block text-slate-400 mb-1">توضیحات:</span>
                  <span className="text-slate-800 font-medium">{selectedTx.description}</span>
                </div>
              )}
              {selectedTx.bankInfo?.shaba && (
                <div className="py-1.5 border-b border-slate-100">
                  <span className="block text-slate-400 mb-1">اطلاعات حساب شبا:</span>
                  <span className="font-mono font-bold text-slate-800">{selectedTx.bankInfo.shaba}</span>
                  <span className="block text-slate-600 mt-0.5">به نام: {selectedTx.bankInfo.accountHolder}</span>
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedTx(null)}
              className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition text-xs"
            >
              بستن رسید
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
