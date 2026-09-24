'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Wallet, ArrowUpRight, ArrowDownLeft, CreditCard, Gift, 
  Clock, CheckCircle2, XCircle, Plus, RefreshCw,
  Sparkles, ChevronLeft, Building2, DollarSign, TrendingUp
} from 'lucide-react';
import { walletApi, WalletTransactionItem } from '@/features/wallet/api/wallet.api';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function InstructorWalletPage() {
  const queryClient = useQueryClient();

  // Modals & States
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState<number>(200000);
  const [shabaNumber, setShabaNumber] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [bankName, setBankName] = useState('بانک سامان');
  const [cardNumber, setCardNumber] = useState('');
  const [isSubmittingWithdraw, setIsSubmittingWithdraw] = useState(false);

  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState<number>(100000);
  const [isDepositing, setIsDepositing] = useState(false);

  const [selectedTx, setSelectedTx] = useState<WalletTransactionItem | null>(null);

  // Filters
  const [filterType, setFilterType] = useState<string>('all');
  const [page, setPage] = useState(1);

  // Fetch Wallet Overview
  const { data: overview, isLoading: isOverviewLoading, refetch: refetchOverview } = useQuery({
    queryKey: ['instructorWalletOverview'],
    queryFn: () => walletApi.getOverview().then(res => res.data),
  });

  // Fetch Transactions
  const { data: txData, isLoading: isTxLoading } = useQuery({
    queryKey: ['instructorWalletTransactions', page, filterType],
    queryFn: () => walletApi.getTransactions({
      page,
      limit: 10,
      type: filterType === 'all' ? undefined : filterType,
    }).then(res => res.data),
  });

  // Handle Withdraw
  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!withdrawAmount || withdrawAmount < 50000) {
      toast.error('حداقل مبلغ تسویه ۵۰,۰۰۰ تومان می‌باشد');
      return;
    }
    if ((overview?.balance || 0) < withdrawAmount) {
      toast.error('موجودی کافی برای این تسویه وجود ندارد');
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
      toast.success('درخواست تسویه با موفقیت ثبت شد');
      setShowWithdrawModal(false);
      queryClient.invalidateQueries({ queryKey: ['instructorWalletOverview'] });
      queryClient.invalidateQueries({ queryKey: ['instructorWalletTransactions'] });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'خطا در ثبت درخواست تسویه');
    } finally {
      setIsSubmittingWithdraw(false);
    }
  };

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
      toast.error(err.response?.data?.message || 'خطا در ایجاد تراکنش');
    } finally {
      setIsDepositing(false);
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
            کیف پول و درآمدهای مدرس
          </h1>
          <p className="text-sm text-[var(--neo-text-muted)] mt-1">
            موجودی قابل برداشت حاصل از فروش دوره‌ها، همکاری در فروش و تسویه‌حساب بانکی
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/instructor/sales"
            className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-sm font-bold transition"
          >
            <TrendingUp className="w-4 h-4 text-indigo-600" />
            گزارش فروش دوره‌ها
          </Link>

          <button 
            onClick={() => setShowWithdrawModal(true)}
            disabled={balance < 50000}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/20 transition disabled:opacity-50"
          >
            <ArrowDownLeft className="w-4 h-4 text-white" />
            درخواست تسویه‌حساب
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Main Balance */}
        <div className="md:col-span-2 relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-indigo-900 text-white p-7 rounded-3xl shadow-xl flex flex-col justify-between min-h-[200px]">
          <div className="relative z-10 flex items-center justify-between">
            <span className="text-xs font-semibold text-indigo-200 uppercase tracking-wider">موجودی کیف پول شما (قابل تسویه)</span>
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-indigo-300" />
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
            <span>درخواست‌های در انتظار واریز: {(stats?.pendingWithdrawalAmount || 0).toLocaleString('fa-IR')} تومان</span>
            <button 
              onClick={() => setShowDepositModal(true)}
              className="text-xs underline hover:text-white font-bold"
            >
              + افزایش موجودی دلخواه
            </button>
          </div>
        </div>

        {/* Card 2: Referral Commission */}
        <div className="bg-white p-6 rounded-3xl border border-[var(--neo-border)] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-500">درآمد حاصل از رفرال</span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Gift className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 mb-1">
              {(stats?.totalReferralEarnings || 0).toLocaleString('fa-IR')} <span className="text-xs font-normal text-slate-500">تومان</span>
            </div>
            <p className="text-xs text-purple-600 font-medium">کمیسیون معرفی دانشجویان</p>
          </div>
          <Link 
            href="/instructor/referrals" 
            className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-purple-700 hover:text-purple-800"
          >
            لینک‌های اختصاصی دوره‌ها
            <ChevronLeft className="w-4 h-4" />
          </Link>
        </div>

        {/* Card 3: Total Withdrawn */}
        <div className="bg-white p-6 rounded-3xl border border-[var(--neo-border)] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-500">مجموع تسویه‌های انجام شده</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 mb-1">
              {(stats?.totalDebited || 0).toLocaleString('fa-IR')} <span className="text-xs font-normal text-slate-500">تومان</span>
            </div>
            <p className="text-xs text-emerald-600 font-medium">واریز شده به حساب‌های شبا</p>
          </div>
          <button 
            onClick={() => {
              setFilterType('withdraw');
              setPage(1);
            }}
            className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-700 hover:text-emerald-800"
          >
            تاریخچه تسویه‌ها
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-3xl border border-[var(--neo-border)] shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">گردش حساب و تاریخچه تراکنش‌ها</h3>
            <p className="text-xs text-slate-500 mt-0.5">سوابق کلیه دریافت‌ها، پاداش‌ها و واریزی‌های بانکی</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'all', label: 'همه تراکنش‌ها' },
              { id: 'withdraw', label: 'تسویه‌حساب‌ها' },
              { id: 'referral_reward', label: 'پاداش رفرال' },
              { id: 'deposit', label: 'شارژها' },
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

        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs font-semibold border-b border-slate-100">
              <tr>
                <th className="p-4 pr-6">عنوان تراکنش</th>
                <th className="p-4">مبلغ (تومان)</th>
                <th className="p-4">موجودی پس از تراکنش</th>
                <th className="p-4">کد پیگیری</th>
                <th className="p-4">تاریخ</th>
                <th className="p-4">وضعیت</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isTxLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400">در حال بارگذاری...</td>
                </tr>
              ) : !txData?.items?.length ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400">تراکنشی یافت نشد</td>
                </tr>
              ) : (
                txData.items.map((tx: WalletTransactionItem) => {
                  const isCredit = tx.direction === 'credit';
                  return (
                    <tr key={tx._id} className="hover:bg-slate-50/60 transition">
                      <td className="p-4 pr-6">
                        <div className="font-bold text-slate-900">{tx.title}</div>
                        {tx.description && <div className="text-xs text-slate-500 mt-0.5">{tx.description}</div>}
                      </td>
                      <td className="p-4 font-black dir-ltr text-sm">
                        <span className={isCredit ? 'text-emerald-600' : 'text-rose-600'}>
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
                        {new Date(tx.createdAt).toLocaleDateString('fa-IR')}
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${
                          tx.status === 'completed' ? 'bg-emerald-50 text-emerald-700' :
                          tx.status === 'pending' ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'
                        }`}>
                          {tx.status === 'completed' ? 'تکمیل شده' : tx.status === 'pending' ? 'در حال بررسی' : 'رد شده'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <ArrowDownLeft className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">درخواست تسویه‌حساب درآمد</h3>
                  <p className="text-xs text-slate-500">واریز پایا/ساتنا به شماره شبای بانکی</p>
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
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">شماره شبا (۲۴ رقم بدون IR):</label>
                <input
                  type="text"
                  required
                  placeholder="IR..."
                  value={shabaNumber}
                  onChange={(e) => setShabaNumber(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-left font-mono font-bold text-slate-900 outline-none focus:border-indigo-500 text-sm uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">نام و نام خانوادگی صاحب حساب:</label>
                <input
                  type="text"
                  required
                  value={accountHolder}
                  onChange={(e) => setAccountHolder(e.target.value)}
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 outline-none focus:border-indigo-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">شماره کارت:</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="اختیاری"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-left font-mono text-slate-900 outline-none focus:border-indigo-500 text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSubmittingWithdraw || withdrawAmount < 50000 || withdrawAmount > balance}
                  className="flex-1 bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 disabled:opacity-50"
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

      {/* Deposit Modal */}
      {showDepositModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="font-bold text-slate-900 text-lg">شارژ کیف پول مدرس</h3>
              <button onClick={() => setShowDepositModal(false)} className="text-slate-400 p-1">✕</button>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">مبلغ شارژ (تومان):</label>
              <input
                type="number"
                value={depositAmount || ''}
                onChange={(e) => setDepositAmount(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-left font-bold text-slate-900 outline-none focus:border-indigo-500 text-base"
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleDeposit}
                disabled={isDepositing || !depositAmount || depositAmount < 10000}
                className="flex-1 bg-indigo-600 text-white font-bold py-3.5 rounded-xl hover:bg-indigo-700 transition"
              >
                {isDepositing ? 'در حال اتصال...' : 'اتصال به درگاه بانکی'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
