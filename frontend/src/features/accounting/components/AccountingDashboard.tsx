'use client';

import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import {
  accountingApi,
  ChartAccount,
  JournalEntry,
  JournalEntryLine,
  FinancialAccountItem,
  FinancialOperationItem,
  TrialBalanceItem,
  ReceivablesPayablesSummary,
} from '../api/accounting.api';
import toast from 'react-hot-toast';
import {
  Calculator,
  BookOpen,
  FileText,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Building2,
  Wallet,
  Users,
  Shield,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Plus,
  ArrowRightLeft,
  RotateCcw,
  Check,
  Lock,
  Search,
  Filter,
  Calendar,
  Layers,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  PieChart,
  BarChart3,
  Receipt,
  Download,
  Eye,
  Trash2,
} from 'lucide-react';

interface AccountingDashboardProps {
  forcedRole?: 'super-admin' | 'accountant' | 'partner';
}

export function AccountingDashboard({ forcedRole }: AccountingDashboardProps) {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const userRole = forcedRole || user?.role || 'accountant';
  const userRoles = Array.isArray(user?.roles) ? user.roles : [];
  const isSuperAdmin = userRole === 'super-admin' || userRoles.includes('super-admin');
  const isAccountant = userRole === 'accountant' || userRoles.includes('accountant');
  const isPartner = !isSuperAdmin && !isAccountant && (userRole === 'partner' || userRoles.includes('partner'));
  const canMutate = isSuperAdmin || isAccountant;

  // Active Tab
  const [activeTab, setActiveTab] = useState<
    'overview' | 'coa' | 'journal' | 'trial-balance' | 'accounts' | 'operations' | 'summary' | 'fiscal-years' | 'audit'
  >('overview');

  // Modals
  const [showNewEntryModal, setShowNewEntryModal] = useState(false);
  const [showNewAccountModal, setShowNewAccountModal] = useState(false);
  const [showNewOpModal, setShowNewOpModal] = useState(false);
  const [selectedEntryDetails, setSelectedEntryDetails] = useState<JournalEntry | null>(null);
  const [reversalTargetEntry, setReversalTargetEntry] = useState<JournalEntry | null>(null);
  const [reversalReason, setReversalReason] = useState('');

  // Search & Filter States
  const [coaSearch, setCoaSearch] = useState('');
  const [coaTypeFilter, setCoaTypeFilter] = useState('all');
  const [journalStatusFilter, setJournalStatusFilter] = useState('all');
  const [journalSearch, setJournalSearch] = useState('');
  const [opTypeFilter, setOpTypeFilter] = useState('all');
  const [ledgerAccountCode, setLedgerAccountCode] = useState<string | null>(null);

  // Queries
  const { data: accountsRes, isLoading: loadingAccounts } = useQuery({
    queryKey: ['accountingAccounts'],
    queryFn: () => accountingApi.getAccounts().then((res) => res.data),
  });

  const { data: journalRes, isLoading: loadingJournal } = useQuery({
    queryKey: ['accountingJournalEntries', journalStatusFilter, journalSearch],
    queryFn: () =>
      accountingApi
        .getJournalEntries({
          status: journalStatusFilter === 'all' ? undefined : journalStatusFilter,
          search: journalSearch.trim() || undefined,
          limit: 50,
        })
        .then((res) => res.data),
  });

  const { data: trialBalanceRes, isLoading: loadingTrialBalance } = useQuery({
    queryKey: ['accountingTrialBalance'],
    queryFn: () => accountingApi.getTrialBalance().then((res) => res.data),
  });

  const { data: financialAccountsRes, isLoading: loadingFinAccounts } = useQuery({
    queryKey: ['accountingFinancialAccounts'],
    queryFn: () => accountingApi.getFinancialAccounts().then((res) => res.data),
  });

  const { data: operationsRes, isLoading: loadingOperations } = useQuery({
    queryKey: ['accountingOperations', opTypeFilter],
    queryFn: () =>
      accountingApi
        .getFinancialOperations({
          type: opTypeFilter === 'all' ? undefined : opTypeFilter,
          limit: 50,
        })
        .then((res) => res.data),
  });

  const { data: summaryRes, isLoading: loadingSummary } = useQuery({
    queryKey: ['accountingSummary'],
    queryFn: () => accountingApi.getReceivablesAndPayablesSummary().then((res) => res.data),
  });

  const { data: fiscalYearsRes } = useQuery({
    queryKey: ['accountingFiscalYears'],
    queryFn: () => accountingApi.getFiscalYears().then((res) => res.data),
  });

  // New Journal Entry Form State
  const [newEntryForm, setNewEntryForm] = useState<{
    date: string;
    description: string;
    status: 'draft' | 'posted';
    sourceType: string;
    referenceDocument: string;
    lines: JournalEntryLine[];
  }>({
    date: new Date().toISOString().split('T')[0],
    description: '',
    status: 'posted',
    sourceType: 'manual',
    referenceDocument: '',
    lines: [
      { accountCode: '1011', description: '', debit: 0, credit: 0 },
      { accountCode: '4010', description: '', debit: 0, credit: 0 },
    ],
  });

  // Calculate sum of debits and credits for new entry form
  const newEntryTotals = useMemo(() => {
    const totalDebit = newEntryForm.lines.reduce((s, l) => s + (Number(l.debit) || 0), 0);
    const totalCredit = newEntryForm.lines.reduce((s, l) => s + (Number(l.credit) || 0), 0);
    const difference = Math.abs(totalDebit - totalCredit);
    const isBalanced = totalDebit > 0 && totalCredit > 0 && totalDebit === totalCredit;
    return { totalDebit, totalCredit, difference, isBalanced };
  }, [newEntryForm.lines]);

  // Mutations
  const createEntryMutation = useMutation({
    mutationFn: (data: any) => accountingApi.createJournalEntry(data),
    onSuccess: () => {
      toast.success('سند حسابداری با موفقیت ثبت شد');
      queryClient.invalidateQueries({ queryKey: ['accountingJournalEntries'] });
      queryClient.invalidateQueries({ queryKey: ['accountingTrialBalance'] });
      queryClient.invalidateQueries({ queryKey: ['accountingAccounts'] });
      queryClient.invalidateQueries({ queryKey: ['accountingFinancialAccounts'] });
      queryClient.invalidateQueries({ queryKey: ['accountingSummary'] });
      setShowNewEntryModal(false);
      setNewEntryForm({
        date: new Date().toISOString().split('T')[0],
        description: '',
        status: 'posted',
        sourceType: 'manual',
        referenceDocument: '',
        lines: [
          { accountCode: '1011', description: '', debit: 0, credit: 0 },
          { accountCode: '4010', description: '', debit: 0, credit: 0 },
        ],
      });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'خطا در ثبت سند حسابداری');
    },
  });

  const postEntryMutation = useMutation({
    mutationFn: (id: string) => accountingApi.postJournalEntry(id),
    onSuccess: () => {
      toast.success('سند پیش‌نویس قطعی (Posted) شد');
      queryClient.invalidateQueries({ queryKey: ['accountingJournalEntries'] });
      queryClient.invalidateQueries({ queryKey: ['accountingTrialBalance'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'خطا در قطعی‌سازی سند');
    },
  });

  const reverseEntryMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      accountingApi.reverseJournalEntry(id, reason),
    onSuccess: () => {
      toast.success('سند اولیه با موفقیت ابطال و سند معکوس صادر گردید');
      queryClient.invalidateQueries({ queryKey: ['accountingJournalEntries'] });
      queryClient.invalidateQueries({ queryKey: ['accountingTrialBalance'] });
      queryClient.invalidateQueries({ queryKey: ['accountingAccounts'] });
      queryClient.invalidateQueries({ queryKey: ['accountingFinancialAccounts'] });
      setReversalTargetEntry(null);
      setReversalReason('');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'خطا در ابطال سند');
    },
  });

  // Seed COA mutation
  const seedCoaMutation = useMutation({
    mutationFn: () => accountingApi.seedCOA(),
    onSuccess: (res: any) => {
      toast.success(res?.message || 'کدینگ استاندارد حساب‌ها با موفقیت مستقر گردید');
      queryClient.invalidateQueries({ queryKey: ['accountingAccounts'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'خطا در استقرار کدینگ');
    },
  });

  // New Financial Account State
  const [newAccountForm, setNewAccountForm] = useState<{
    name: string;
    type: FinancialAccountItem['type'];
    code: string;
    bankName: string;
    accountNumber: string;
    cardLast4: string;
    shaba: string;
    accountHolderName: string;
    initialBalance: number;
  }>({
    name: '',
    type: 'bank',
    code: '1013',
    bankName: 'بانک ملت',
    accountNumber: '',
    cardLast4: '',
    shaba: '',
    accountHolderName: 'مؤسسه آموزشی تک‌یاد',
    initialBalance: 0,
  });

  const createAccountMutation = useMutation({
    mutationFn: (data: any) => accountingApi.createFinancialAccount(data),
    onSuccess: () => {
      toast.success('حساب مالی با موفقیت تعریف شد');
      queryClient.invalidateQueries({ queryKey: ['accountingFinancialAccounts'] });
      setShowNewAccountModal(false);
      setNewAccountForm({
        name: '',
        type: 'bank',
        code: '1013',
        bankName: 'بانک ملت',
        accountNumber: '',
        cardLast4: '',
        shaba: '',
        accountHolderName: 'مؤسسه آموزشی تک‌یاد',
        initialBalance: 0,
      });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'خطا در ثبت حساب مالی');
    },
  });

  // New Operation Form State
  const [newOpForm, setNewOpForm] = useState<{
    type: FinancialOperationItem['type'];
    category: string;
    amount: number;
    description: string;
    fromAccountId: string;
    toAccountId: string;
    payerOrPayee: string;
  }>({
    type: 'expense',
    category: 'سرور و زیرساخت ابری',
    amount: 1000000,
    description: '',
    fromAccountId: '',
    toAccountId: '',
    payerOrPayee: '',
  });

  const createOpMutation = useMutation({
    mutationFn: (data: any) => accountingApi.createFinancialOperation(data),
    onSuccess: () => {
      toast.success('عملیات مالی با موفقیت ثبت و سند حسابداری صادر شد');
      queryClient.invalidateQueries({ queryKey: ['accountingOperations'] });
      queryClient.invalidateQueries({ queryKey: ['accountingFinancialAccounts'] });
      queryClient.invalidateQueries({ queryKey: ['accountingJournalEntries'] });
      queryClient.invalidateQueries({ queryKey: ['accountingTrialBalance'] });
      queryClient.invalidateQueries({ queryKey: ['accountingSummary'] });
      setShowNewOpModal(false);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'خطا در ثبت عملیات مالی');
    },
  });

  const cancelOpMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      accountingApi.cancelFinancialOperation(id, reason),
    onSuccess: () => {
      toast.success('عملیات مالی ابطال و سند معکوس صادر شد');
      queryClient.invalidateQueries({ queryKey: ['accountingOperations'] });
      queryClient.invalidateQueries({ queryKey: ['accountingFinancialAccounts'] });
      queryClient.invalidateQueries({ queryKey: ['accountingJournalEntries'] });
      queryClient.invalidateQueries({ queryKey: ['accountingTrialBalance'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'خطا در ابطال عملیات');
    },
  });

  // Helper formatting
  const formatToman = (amount?: number) => {
    if (amount === undefined || amount === null) return '۰ تومان';
    return `${Number(amount).toLocaleString('fa-IR')} تومان`;
  };

  const accounts = accountsRes || [];
  const entries = journalRes?.entries || [];
  const tbItems = trialBalanceRes?.items || [];
  const finAccounts = financialAccountsRes || [];
  const operations = operationsRes?.operations || [];
  const summary = summaryRes;

  // Filtered COA
  const filteredAccounts = useMemo(() => {
    return accounts.filter((acc) => {
      const matchSearch =
        acc.name.toLowerCase().includes(coaSearch.toLowerCase()) ||
        acc.code.includes(coaSearch);
      const matchType = coaTypeFilter === 'all' || acc.type === coaTypeFilter;
      return matchSearch && matchType;
    });
  }, [accounts, coaSearch, coaTypeFilter]);

  // Overall Financial KPIs
  const totalAssetsBalance = useMemo(() => {
    return finAccounts.reduce((sum, a) => sum + (a.currentBalance || 0), 0);
  }, [finAccounts]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* 1. Header & Role Badge */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-bold">
              <Calculator className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-black text-slate-900">
                  سیستم حسابداری مالی و دفتر کل تک‌یاد
                </h1>
                <span
                  className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold ${
                    isPartner
                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                      : isSuperAdmin
                      ? 'bg-rose-100 text-rose-800 border border-rose-300'
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  }`}
                >
                  {isPartner
                    ? '👁️ دسترسی فقط‌خواندنی شریک'
                    : isSuperAdmin
                    ? '👑 دسترسی کامل مدیر ارشد'
                    : '🛡️ حسابدار مسئول'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                ثبت دوطرفه استاندارد، کدینگ ۵ سطحی، تراز آزمایشی خودکار و مدیریت عملیات مالی
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls for Super Admin & Accountant */}
        <div className="flex items-center gap-2 flex-wrap">
          {canMutate && (
            <>
              <button
                onClick={() => setShowNewEntryModal(true)}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm shadow-blue-600/20"
              >
                <Plus className="w-4 h-4" />
                <span>ثبت سند حسابداری</span>
              </button>
              <button
                onClick={() => setShowNewOpModal(true)}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm shadow-emerald-600/20"
              >
                <DollarSign className="w-4 h-4" />
                <span>ثبت عملیات مالی</span>
              </button>
              <button
                onClick={() => setShowNewAccountModal(true)}
                className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
              >
                <Building2 className="w-4 h-4" />
                <span>تعریف حساب مالی</span>
              </button>
            </>
          )}

          {isSuperAdmin && accounts.length === 0 && (
            <button
              onClick={() => seedCoaMutation.mutate()}
              disabled={seedCoaMutation.isPending}
              className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            >
              <RefreshCw className={`w-4 h-4 ${seedCoaMutation.isPending ? 'animate-spin' : ''}`} />
              <span>استقرار کدینگ استاندارد</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Partner Read-Only Notice */}
      {isPartner && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-amber-900 text-xs">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold">حالت نظارتی شریک مؤسسه:</span> شما دارای دسترسی نظارتی کامل به
            دفاتر مالی، تراز آزمایشی، صورت‌های درآمد/هزینه، موجودی‌ها، سرمایه و مطالبات هستید. ثبت،
            ویرایش یا ابطال اسناد صرفاً توسط حسابدار و مدیر ارشد قابل انجام است.
          </div>
        </div>
      )}

      {/* 3. Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200">
        {[
          { key: 'overview', label: 'داشبورد مالی', icon: PieChart },
          { key: 'coa', label: 'کدینگ حساب‌ها (COA)', icon: BookOpen },
          { key: 'journal', label: 'اسناد حسابداری', icon: FileText },
          { key: 'trial-balance', label: 'تراز آزمایشی دفاتر', icon: BarChart3 },
          { key: 'accounts', label: 'بانک‌ها و صندوق', icon: Building2 },
          { key: 'operations', label: 'عملیات مالی و شرکا', icon: DollarSign },
          { key: 'summary', label: 'مطالبات و بدهی‌ها', icon: ArrowRightLeft },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================= */}
      {/* TAB 1: OVERVIEW & KPI CARDS                                */}
      {/* ========================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-500 text-xs">
                <span>موجودی نقدی و بانک‌ها</span>
                <Building2 className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-xl font-black text-slate-900">
                {formatToman(totalAssetsBalance)}
              </div>
              <p className="text-[11px] text-slate-400">
                {finAccounts.length} حساب بانکی و صندوق فعال
              </p>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-500 text-xs">
                <span>کل مطالبات پلتفرم</span>
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-black text-emerald-600">
                {formatToman(summary?.receivables?.total || 0)}
              </div>
              <p className="text-[11px] text-slate-400">
                شامل وجوه در راه شاپرک ({formatToman(summary?.receivables?.gatewayTransit || 0)})
              </p>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-500 text-xs">
                <span>کل بدهی‌ها و تعهدات</span>
                <TrendingDown className="w-4 h-4 text-rose-600" />
              </div>
              <div className="text-xl font-black text-rose-600">
                {formatToman(summary?.payables?.total || 0)}
              </div>
              <p className="text-[11px] text-slate-400">
                کیف پول کاربران + تسویه اساتید + وام شرکا
              </p>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-500 text-xs">
                <span>سرمایه و حقوق صاحبان سهام</span>
                <Users className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-xl font-black text-purple-600">
                {formatToman(summary?.equityAndReserves?.partnerCapital || 0)}
              </div>
              <p className="text-[11px] text-slate-400">آورده‌های ثبت‌شده سهامداران</p>
            </div>
          </div>

          {/* Quick Trial Balance Status */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  trialBalanceRes?.isBalanced
                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                    : 'bg-rose-50 text-rose-600 border border-rose-200'
                }`}
              >
                {trialBalanceRes?.isBalanced ? (
                  <ShieldCheck className="w-6 h-6" />
                ) : (
                  <AlertCircle className="w-6 h-6" />
                )}
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  وضعیت توازن دفاتر و اسناد (Double-Entry Balance)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  مجموع بدهکار:{' '}
                  <span className="font-bold text-slate-800">
                    {formatToman(trialBalanceRes?.totalDebit || 0)}
                  </span>{' '}
                  | مجموع بستانکار:{' '}
                  <span className="font-bold text-slate-800">
                    {formatToman(trialBalanceRes?.totalCredit || 0)}
                  </span>
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('trial-balance')}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            >
              <span>مشاهده جزئیات تراز آزمایشی</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Recent Journal Entries & Accounts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Entries */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-900">آخرین اسناد حسابداری</h3>
                <button
                  onClick={() => setActiveTab('journal')}
                  className="text-xs text-blue-600 hover:underline font-bold"
                >
                  مشاهده همه
                </button>
              </div>
              <div className="divide-y divide-slate-100">
                {entries.slice(0, 5).map((entry) => (
                  <div key={entry._id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900">
                          #{entry.entryNumber}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            entry.status === 'posted'
                              ? 'bg-emerald-50 text-emerald-700'
                              : entry.status === 'reversed'
                              ? 'bg-rose-50 text-rose-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {entry.status === 'posted'
                            ? 'قطعی'
                            : entry.status === 'reversed'
                            ? 'ابطال‌شده'
                            : 'پیش‌نویس'}
                        </span>
                      </div>
                      <p className="text-slate-600 mt-1 line-clamp-1">{entry.description}</p>
                    </div>
                    <div className="text-left font-mono font-bold text-slate-900">
                      {formatToman(entry.totalAmount)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Accounts Status */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-900">مانده حساب‌های مالی و بانکی</h3>
                <button
                  onClick={() => setActiveTab('accounts')}
                  className="text-xs text-blue-600 hover:underline font-bold"
                >
                  مشاهده همه
                </button>
              </div>
              <div className="divide-y divide-slate-100">
                {finAccounts.map((acc) => (
                  <div key={acc._id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900">{acc.name}</span>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {acc.bankName} {acc.cardLast4 ? `• کارت: ****${acc.cardLast4}` : ''}
                      </p>
                    </div>
                    <div className="text-left font-mono font-bold text-emerald-600">
                      {formatToman(acc.currentBalance)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: CHART OF ACCOUNTS (کدینگ حساب‌ها)                    */}
      {/* ========================================================= */}
      {activeTab === 'coa' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-black text-slate-900">ساختار کدینگ حساب‌ها (Chart of Accounts)</h2>
              <p className="text-xs text-slate-500 mt-1">
                سلسله‌مراتب حساب‌های کل، معین و تفصیلی بر اساس استانداردهای حسابداری دوطرفه ایران
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                <input
                  type="text"
                  value={coaSearch}
                  onChange={(e) => setCoaSearch(e.target.value)}
                  placeholder="جستجو در نام یا کد حساب..."
                  className="w-full pl-3 pr-9 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <select
                value={coaTypeFilter}
                onChange={(e) => setCoaTypeFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 font-bold"
              >
                <option value="all">همه گروه‌ها</option>
                <option value="asset">۱. دارایی‌ها (Asset)</option>
                <option value="liability">۲. بدهی‌ها (Liability)</option>
                <option value="equity">۳. سرمایه (Equity)</option>
                <option value="revenue">۴. درآمدها (Revenue)</option>
                <option value="expense">۵. هزینه‌ها (Expense)</option>
              </select>
            </div>
          </div>

          {/* Accounts Table */}
          <div className="overflow-x-auto border border-slate-100 rounded-2xl">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">کد حساب</th>
                  <th className="py-3 px-4">نام حساب</th>
                  <th className="py-3 px-4">گروه مالی</th>
                  <th className="py-3 px-4">ماهیت</th>
                  <th className="py-3 px-4">سطح</th>
                  <th className="py-3 px-4">وضعیت</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAccounts.map((acc) => (
                  <tr key={acc._id} className="hover:bg-slate-50/50 transition">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{acc.code}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800">{acc.name}</div>
                      {acc.description && (
                        <div className="text-[11px] text-slate-400 mt-0.5">{acc.description}</div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          acc.type === 'asset'
                            ? 'bg-blue-50 text-blue-700'
                            : acc.type === 'liability'
                            ? 'bg-rose-50 text-rose-700'
                            : acc.type === 'equity'
                            ? 'bg-purple-50 text-purple-700'
                            : acc.type === 'revenue'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {acc.type === 'asset'
                          ? 'دارایی'
                          : acc.type === 'liability'
                          ? 'بدهی'
                          : acc.type === 'equity'
                          ? 'سرمایه'
                          : acc.type === 'revenue'
                          ? 'درآمد'
                          : 'هزینه'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold">
                      {acc.nature === 'debit' ? (
                        <span className="text-blue-600">بدهکار (Debit)</span>
                      ) : (
                        <span className="text-emerald-600">بستانکار (Credit)</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500">سطح {acc.level}</td>
                    <td className="py-3 px-4">
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold">
                        {acc.isSystem ? 'سیستمی' : 'عادی'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: JOURNAL ENTRIES (اسناد حسابداری)                     */}
      {/* ========================================================= */}
      {activeTab === 'journal' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-black text-slate-900">دفتر روزنامه و اسناد حسابداری</h2>
              <p className="text-xs text-slate-500 mt-1">
                ثبت کلیه رویدادهای مالی به تفکیک ردیف‌های بدهکار و بستانکار با شماره سریال ترتیبی
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={journalStatusFilter}
                onChange={(e) => setJournalStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 font-bold"
              >
                <option value="all">همه اسناد</option>
                <option value="posted">فقط قطعی‌شده‌ها (Posted)</option>
                <option value="draft">پیش‌نویس‌ها (Draft)</option>
                <option value="reversed">ابطال‌شده‌ها (Reversed)</option>
              </select>

              {canMutate && (
                <button
                  onClick={() => setShowNewEntryModal(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>ثبت سند جدید</span>
                </button>
              )}
            </div>
          </div>

          {/* Entries List */}
          <div className="space-y-3">
            {entries.map((entry) => (
              <div
                key={entry._id}
                className="p-4 rounded-2xl border border-slate-200 hover:border-slate-300 transition space-y-3"
              >
                <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-black text-sm text-slate-900">
                      سند #{entry.entryNumber}
                    </span>
                    <span className="text-slate-400">|</span>
                    <span className="text-slate-600 font-mono">
                      {new Date(entry.date).toLocaleDateString('fa-IR')}
                    </span>
                    <span
                      className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${
                        entry.status === 'posted'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : entry.status === 'reversed'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {entry.status === 'posted'
                        ? 'قطعی (Posted)'
                        : entry.status === 'reversed'
                        ? 'معکوس و باطل‌شده'
                        : 'پیش‌نویس'}
                    </span>
                    {entry.sourceType && (
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-mono">
                        منبع: {entry.sourceType}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 font-mono">
                      مبلغ: {formatToman(entry.totalAmount)}
                    </span>

                    {/* Operational buttons */}
                    {canMutate && entry.status === 'draft' && (
                      <button
                        onClick={() => postEntryMutation.mutate(entry._id)}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold transition"
                      >
                        قطعی‌کردن سند
                      </button>
                    )}

                    {isSuperAdmin && entry.status === 'posted' && !entry.reversalOf && (
                      <button
                        onClick={() => setReversalTargetEntry(entry)}
                        className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-[11px] font-bold transition flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>صدور سند معکوس (ابطال)</span>
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-700 font-medium">{entry.description}</p>

                {/* Rows / Lines table */}
                <div className="bg-slate-50/70 rounded-xl p-3 border border-slate-100">
                  <table className="w-full text-right text-xs">
                    <thead>
                      <tr className="text-slate-400 font-semibold border-b border-slate-200 pb-1">
                        <th className="pb-1.5">کد و حساب</th>
                        <th className="pb-1.5">شرح ردیف</th>
                        <th className="pb-1.5 text-left">بدهکار</th>
                        <th className="pb-1.5 text-left">بستانکار</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {entry.lines.map((line, idx) => (
                        <tr key={idx} className="text-slate-800">
                          <td className="py-1.5 font-mono font-bold text-blue-700">
                            {line.accountCode} - {line.accountName || ''}
                          </td>
                          <td className="py-1.5 text-slate-600 text-[11px]">{line.description}</td>
                          <td className="py-1.5 text-left font-mono font-bold">
                            {line.debit > 0 ? formatToman(line.debit) : '—'}
                          </td>
                          <td className="py-1.5 text-left font-mono font-bold">
                            {line.credit > 0 ? formatToman(line.credit) : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: TRIAL BALANCE (تراز آزمایشی دفاتر)                    */}
      {/* ========================================================= */}
      {activeTab === 'trial-balance' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-black text-slate-900">تراز آزمایشی چهار ستونی دفاتر</h2>
              <p className="text-xs text-slate-500 mt-1">
                گردش و مانده کلیه حساب‌های فعال جهت تایید صحت توازن و انطباق دوطرفه
              </p>
            </div>

            <div
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 ${
                trialBalanceRes?.isBalanced
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}
            >
              {trialBalanceRes?.isBalanced ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>تراز آزمایشی کاملاً متوازن است</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4" />
                  <span>هشدار: اختلاف در تراز آزمایشی</span>
                </>
              )}
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-100 rounded-2xl">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">کد حساب</th>
                  <th className="py-3 px-4">نام حساب</th>
                  <th className="py-3 px-4 text-left">گردش بدهکار</th>
                  <th className="py-3 px-4 text-left">گردش بستانکار</th>
                  <th className="py-3 px-4 text-left">مانده بدهکار</th>
                  <th className="py-3 px-4 text-left">مانده بستانکار</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tbItems.map((item) => (
                  <tr key={item.accountCode} className="hover:bg-slate-50/50 transition">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {item.accountCode}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800">{item.accountName}</td>
                    <td className="py-3 px-4 text-left font-mono">
                      {item.debitSum > 0 ? formatToman(item.debitSum) : '—'}
                    </td>
                    <td className="py-3 px-4 text-left font-mono">
                      {item.creditSum > 0 ? formatToman(item.creditSum) : '—'}
                    </td>
                    <td className="py-3 px-4 text-left font-mono font-bold text-blue-700">
                      {item.balanceDebit > 0 ? formatToman(item.balanceDebit) : '—'}
                    </td>
                    <td className="py-3 px-4 text-left font-mono font-bold text-emerald-700">
                      {item.balanceCredit > 0 ? formatToman(item.balanceCredit) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-100/70 font-bold border-t border-slate-200">
                <tr>
                  <td colSpan={2} className="py-3 px-4 text-slate-900">
                    مجموع تراز دفاتر (Total):
                  </td>
                  <td className="py-3 px-4 text-left font-mono text-slate-900">
                    {formatToman(trialBalanceRes?.totalDebit)}
                  </td>
                  <td className="py-3 px-4 text-left font-mono text-slate-900">
                    {formatToman(trialBalanceRes?.totalCredit)}
                  </td>
                  <td colSpan={2} className="py-3 px-4 text-center text-emerald-700">
                    اختلاف تراز: ۰ تومان (Balanced)
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 5: FINANCIAL ACCOUNTS (بانک‌ها و صندوق)                  */}
      {/* ========================================================= */}
      {activeTab === 'accounts' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-black text-slate-900">حساب‌های بانکی، کارت‌ها و صندوق نقدی</h2>
              <p className="text-xs text-slate-500 mt-1">
                مدیریت حساب‌های تسویه درگاه سامان، حساب‌های جاری، تنخواه و صندوق با رعایت ضوابط امنیتی کارت
              </p>
            </div>

            {canMutate && (
              <button
                onClick={() => setShowNewAccountModal(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>تعریف حساب مالی جدید</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {finAccounts.map((acc) => (
              <div
                key={acc._id}
                className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">{acc.name}</h4>
                      <p className="text-[10px] text-slate-400 font-mono">کد معین: {acc.code}</p>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold">
                    {acc.type === 'bank'
                      ? 'بانک'
                      : acc.type === 'card'
                      ? 'کارت'
                      : acc.type === 'cash'
                      ? 'صندوق تنخواه'
                      : 'درگاه تسویه'}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 text-[11px] font-mono">
                  {acc.bankName && (
                    <div className="flex justify-between text-slate-600">
                      <span>نام بانک:</span>
                      <span className="font-bold text-slate-800">{acc.bankName}</span>
                    </div>
                  )}
                  {acc.cardLast4 && (
                    <div className="flex justify-between text-slate-600">
                      <span>شماره کارت:</span>
                      <span className="font-bold text-slate-800">****{acc.cardLast4}</span>
                    </div>
                  )}
                  {acc.shaba && (
                    <div className="flex justify-between text-slate-600">
                      <span>شماره شبا:</span>
                      <span className="font-bold text-slate-800">{acc.shaba}</span>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500">مانده جاری لحظه‌ای:</span>
                  <span className="text-sm font-black text-emerald-600 font-mono">
                    {formatToman(acc.currentBalance)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 6: OPERATIONS (عملیات مالی، هزینه‌ها، شرکا)             */}
      {/* ========================================================= */}
      {activeTab === 'operations' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-black text-slate-900">عملیات مالی، هزینه‌ها، انتقال و جاری شرکا</h2>
              <p className="text-xs text-slate-500 mt-1">
                ثبت هزینه‌های عملیاتی (سرور، تبلیغات، پیامک)، انتقال‌های داخلی بدون اثر روی سود، و آورده/وام شرکا
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={opTypeFilter}
                onChange={(e) => setOpTypeFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 font-bold"
              >
                <option value="all">همه انواع عملیات</option>
                <option value="expense">هزینه‌ها (سرور، تبلیغات، تجهیزات)</option>
                <option value="income">درآمد مستقیم</option>
                <option value="transfer">انتقال بین حساب‌ها</option>
                <option value="partner_equity">آورده سرمایه شریک</option>
                <option value="partner_loan">وام شریک به مؤسسه</option>
                <option value="partner_repayment">بازپرداخت وام به شریک</option>
                <option value="partner_withdrawal">برداشت شریک</option>
              </select>

              {canMutate && (
                <button
                  onClick={() => setShowNewOpModal(true)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>ثبت عملیات مالی جدید</span>
                </button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-100 rounded-2xl">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">شماره عملیات</th>
                  <th className="py-3 px-4">تاریخ</th>
                  <th className="py-3 px-4">نوع عملیات</th>
                  <th className="py-3 px-4">دسته‌بندی / طرف حساب</th>
                  <th className="py-3 px-4">شرح</th>
                  <th className="py-3 px-4 text-left">مبلغ</th>
                  <th className="py-3 px-4">وضعیت</th>
                  {isSuperAdmin && <th className="py-3 px-4 text-center">عملیات</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {operations.map((op) => (
                  <tr key={op._id} className="hover:bg-slate-50/50 transition">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {op.operationNumber}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {new Date(op.date).toLocaleDateString('fa-IR')}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          op.type === 'expense'
                            ? 'bg-rose-50 text-rose-700'
                            : op.type === 'income'
                            ? 'bg-emerald-50 text-emerald-700'
                            : op.type === 'transfer'
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-purple-50 text-purple-700'
                        }`}
                      >
                        {op.type === 'expense'
                          ? 'هزینه'
                          : op.type === 'income'
                          ? 'درآمد مستقیم'
                          : op.type === 'transfer'
                          ? 'انتقال داخلی'
                          : op.type === 'partner_equity'
                          ? 'آورده سرمایه'
                          : op.type === 'partner_loan'
                          ? 'وام شریک'
                          : op.type === 'partner_repayment'
                          ? 'بازپرداخت وام'
                          : 'برداشت شریک'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800">
                      {op.category}
                      {op.payerOrPayee ? ` (${op.payerOrPayee})` : ''}
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate">{op.description}</td>
                    <td className="py-3 px-4 text-left font-mono font-bold text-slate-900">
                      {formatToman(op.amount)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${
                          op.status === 'completed'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {op.status === 'completed' ? 'تایید و ثبت‌شده' : 'ابطال‌شده'}
                      </span>
                    </td>
                    {isSuperAdmin && (
                      <td className="py-3 px-4 text-center">
                        {op.status === 'completed' && (
                          <button
                            onClick={() => cancelOpMutation.mutate({ id: op._id, reason: 'ابطال توسط مدیر ارشد' })}
                            className="text-rose-600 hover:text-rose-800 text-[11px] font-bold"
                          >
                            ابطال
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 7: RECEIVABLES, PAYABLES & EQUITY                      */}
      {/* ========================================================= */}
      {activeTab === 'summary' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-2">
            <h2 className="text-base font-black text-slate-900">
              گزارش جامع مطالبات، بدهی‌ها و تعهدات مالی پلتفرم
            </h2>
            <p className="text-xs text-slate-500">
              تفکیک مبالغ در انتظار دریافت، تعهدات تسویه مدرسان، اعتبار کیف پول دانشجویان و وام‌های سهامداران
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Receivables Column */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-sm text-slate-900">مطالبات پلتفرم (Receivables)</h3>
              </div>
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl flex justify-between items-center">
                  <span className="text-slate-600">وجوه در راه درگاه شاپرک (سپ):</span>
                  <span className="font-bold font-mono text-emerald-600">
                    {formatToman(summary?.receivables?.gatewayTransit)}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl flex justify-between items-center">
                  <span className="text-slate-600">اقساط و مطالبات آتی دانشجویان:</span>
                  <span className="font-bold font-mono text-emerald-600">
                    {formatToman(summary?.receivables?.studentInstallments)}
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-100 flex justify-between items-center font-bold">
                  <span className="text-slate-900">مجموع مطالبات:</span>
                  <span className="text-emerald-700 font-mono text-sm">
                    {formatToman(summary?.receivables?.total)}
                  </span>
                </div>
              </div>
            </div>

            {/* Payables Column */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <TrendingDown className="w-5 h-5 text-rose-600" />
                <h3 className="font-bold text-sm text-slate-900">بدهی‌ها و تعهدات (Payables)</h3>
              </div>
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl flex justify-between items-center">
                  <span className="text-slate-600">سهم در انتظار تسویه اساتید:</span>
                  <span className="font-bold font-mono text-rose-600">
                    {formatToman(summary?.payables?.instructorsPendingSettlement)}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl flex justify-between items-center">
                  <span className="text-slate-600">اعتبار کیف پول دانشجویان (تعهد):</span>
                  <span className="font-bold font-mono text-rose-600">
                    {formatToman(summary?.payables?.studentWalletLiabilities)}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl flex justify-between items-center">
                  <span className="text-slate-600">مانده وام و بدهی به شرکا:</span>
                  <span className="font-bold font-mono text-rose-600">
                    {formatToman(summary?.payables?.partnerLoans)}
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-100 flex justify-between items-center font-bold">
                  <span className="text-slate-900">مجموع بدهی‌ها:</span>
                  <span className="text-rose-700 font-mono text-sm">
                    {formatToman(summary?.payables?.total)}
                  </span>
                </div>
              </div>
            </div>

            {/* Equity & Reserves */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <Users className="w-5 h-5 text-purple-600" />
                <h3 className="font-bold text-sm text-slate-900">سرمایه و سهم شرکا (Equity)</h3>
              </div>
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl flex justify-between items-center">
                  <span className="text-slate-600">آورده سرمایه سهامداران:</span>
                  <span className="font-bold font-mono text-purple-600">
                    {formatToman(summary?.equityAndReserves?.partnerCapital)}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl flex justify-between items-center">
                  <span className="text-slate-600">برداشت‌های انجام‌شده شرکا:</span>
                  <span className="font-bold font-mono text-amber-600">
                    {formatToman(summary?.equityAndReserves?.partnerWithdrawals)}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl flex justify-between items-center">
                  <span className="text-slate-600">سود انباشته / زیان دوره:</span>
                  <span className="font-bold font-mono text-blue-600">
                    {formatToman(summary?.equityAndReserves?.retainedEarnings)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: CREATE JOURNAL ENTRY (ثبت سند حسابداری جدید)       */}
      {/* ========================================================= */}
      {showNewEntryModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-black text-base text-slate-900">ثبت سند حسابداری جدید (دوطرفه)</h3>
              <button
                onClick={() => setShowNewEntryModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">تاریخ سند</label>
                  <input
                    type="date"
                    value={newEntryForm.date}
                    onChange={(e) => setNewEntryForm({ ...newEntryForm, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">وضعیت ثبت</label>
                  <select
                    value={newEntryForm.status}
                    onChange={(e) => setNewEntryForm({ ...newEntryForm, status: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold"
                  >
                    <option value="posted">ثبت قطعی (Posted)</option>
                    <option value="draft">پیش‌نویس (Draft)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">شرح کلی سند *</label>
                <input
                  type="text"
                  value={newEntryForm.description}
                  onChange={(e) => setNewEntryForm({ ...newEntryForm, description: e.target.value })}
                  placeholder="مثال: سند واریز هزینه هاستینگ ابری و دامنه..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs"
                />
              </div>

              {/* Rows editor */}
              <div className="space-y-2 pt-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-800">ردیف‌های بدهکار و بستانکار</span>
                  <button
                    type="button"
                    onClick={() =>
                      setNewEntryForm({
                        ...newEntryForm,
                        lines: [
                          ...newEntryForm.lines,
                          { accountCode: '1011', description: '', debit: 0, credit: 0 },
                        ],
                      })
                    }
                    className="text-blue-600 hover:text-blue-800 text-[11px] font-bold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>افزودن ردیف</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {newEntryForm.lines.map((line, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-12 gap-2 items-center text-xs"
                    >
                      <div className="sm:col-span-4">
                        <label className="block text-[10px] text-slate-500 mb-0.5">حساب معین</label>
                        <select
                          value={line.accountCode}
                          onChange={(e) => {
                            const newLines = [...newEntryForm.lines];
                            newLines[idx].accountCode = e.target.value;
                            setNewEntryForm({ ...newEntryForm, lines: newLines });
                          }}
                          className="w-full p-1.5 rounded-lg border border-slate-200 bg-white font-mono"
                        >
                          {accounts.map((a) => (
                            <option key={a.code} value={a.code}>
                              {a.code} - {a.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="sm:col-span-3">
                        <label className="block text-[10px] text-slate-500 mb-0.5">شرح ردیف</label>
                        <input
                          type="text"
                          value={line.description || ''}
                          onChange={(e) => {
                            const newLines = [...newEntryForm.lines];
                            newLines[idx].description = e.target.value;
                            setNewEntryForm({ ...newEntryForm, lines: newLines });
                          }}
                          placeholder="شرح..."
                          className="w-full p-1.5 rounded-lg border border-slate-200 bg-white"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[10px] text-slate-500 mb-0.5">بدهکار (تومان)</label>
                        <input
                          type="number"
                          value={line.debit || ''}
                          onChange={(e) => {
                            const newLines = [...newEntryForm.lines];
                            newLines[idx].debit = Number(e.target.value) || 0;
                            if (newLines[idx].debit > 0) newLines[idx].credit = 0;
                            setNewEntryForm({ ...newEntryForm, lines: newLines });
                          }}
                          className="w-full p-1.5 rounded-lg border border-slate-200 bg-white font-mono text-left"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[10px] text-slate-500 mb-0.5">بستانکار (تومان)</label>
                        <input
                          type="number"
                          value={line.credit || ''}
                          onChange={(e) => {
                            const newLines = [...newEntryForm.lines];
                            newLines[idx].credit = Number(e.target.value) || 0;
                            if (newLines[idx].credit > 0) newLines[idx].debit = 0;
                            setNewEntryForm({ ...newEntryForm, lines: newLines });
                          }}
                          className="w-full p-1.5 rounded-lg border border-slate-200 bg-white font-mono text-left"
                        />
                      </div>

                      <div className="sm:col-span-1 text-center pt-3 sm:pt-0">
                        {newEntryForm.lines.length > 2 && (
                          <button
                            type="button"
                            onClick={() => {
                              const newLines = newEntryForm.lines.filter((_, i) => i !== idx);
                              setNewEntryForm({ ...newEntryForm, lines: newLines });
                            }}
                            className="text-rose-500 hover:text-rose-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Validation & Balance Banner */}
                <div
                  className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                    newEntryTotals.isBalanced
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-rose-50 border-rose-200 text-rose-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {newEntryTotals.isBalanced ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-600" />
                    )}
                    <span>
                      {newEntryTotals.isBalanced
                        ? 'سند کاملاً تراز و متوازن است.'
                        : `سند ناتراز است! اختلاف: ${formatToman(newEntryTotals.difference)}`}
                    </span>
                  </div>
                  <div className="font-mono font-bold">
                    بدهکار: {formatToman(newEntryTotals.totalDebit)} | بستانکار:{' '}
                    {formatToman(newEntryTotals.totalCredit)}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  disabled={
                    createEntryMutation.isPending ||
                    !newEntryForm.description.trim() ||
                    (newEntryForm.status === 'posted' && !newEntryTotals.isBalanced)
                  }
                  onClick={() => createEntryMutation.mutate(newEntryForm)}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold transition flex items-center justify-center gap-2"
                >
                  {createEntryMutation.isPending && (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  )}
                  <span>ثبت و ذخیره سند</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewEntryModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  انصراف
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: CREATE FINANCIAL OPERATION (عملیات مالی)            */}
      {/* ========================================================= */}
      {showNewOpModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-black text-base text-slate-900">ثبت عملیات مالی جدید</h3>
              <button
                onClick={() => setShowNewOpModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">نوع عملیات مالی *</label>
                <select
                  value={newOpForm.type}
                  onChange={(e) => setNewOpForm({ ...newOpForm, type: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold"
                >
                  <option value="expense">هزینه‌های عملیاتی (سرور، تبلیغات، پیامک)</option>
                  <option value="income">درآمد متفرقه یا مستقیم</option>
                  <option value="transfer">انتقال داخلی بین حساب‌ها و صندوق</option>
                  <option value="partner_equity">آورده سرمایه نقدی شریک</option>
                  <option value="partner_loan">وام یا قرض‌الحسنه شریک به مؤسسه</option>
                  <option value="partner_repayment">بازپرداخت وام به شریک</option>
                  <option value="partner_withdrawal">برداشت شریک</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">دسته‌بندی یا موضوع *</label>
                <input
                  type="text"
                  value={newOpForm.category}
                  onChange={(e) => setNewOpForm({ ...newOpForm, category: e.target.value })}
                  placeholder="مثال: هزینه سرورهای آروان / تبلیغات یکتانت..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">مبلغ عملیات (تومان) *</label>
                <input
                  type="number"
                  value={newOpForm.amount || ''}
                  onChange={(e) => setNewOpForm({ ...newOpForm, amount: Number(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono text-left"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">حساب مرتبط / مبدأ *</label>
                <select
                  value={newOpForm.fromAccountId}
                  onChange={(e) => setNewOpForm({ ...newOpForm, fromAccountId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs"
                >
                  <option value="">انتخاب حساب مالی...</option>
                  {finAccounts.map((a) => (
                    <option key={a._id} value={a._id}>
                      {a.name} ({a.bankName} - مانده: {formatToman(a.currentBalance)})
                    </option>
                  ))}
                </select>
              </div>

              {newOpForm.type === 'transfer' && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">حساب مقصد انتقال *</label>
                  <select
                    value={newOpForm.toAccountId}
                    onChange={(e) => setNewOpForm({ ...newOpForm, toAccountId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs"
                  >
                    <option value="">انتخاب حساب مقصد...</option>
                    {finAccounts.map((a) => (
                      <option key={a._id} value={a._id}>
                        {a.name} ({a.bankName})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">طرف حساب یا دریافت‌کننده / پرداخت‌کننده</label>
                <input
                  type="text"
                  value={newOpForm.payerOrPayee}
                  onChange={(e) => setNewOpForm({ ...newOpForm, payerOrPayee: e.target.value })}
                  placeholder="مثال: شرکت ابر آروان..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">توضیحات و شرح عملیات</label>
                <textarea
                  rows={2}
                  value={newOpForm.description}
                  onChange={(e) => setNewOpForm({ ...newOpForm, description: e.target.value })}
                  placeholder="توضیحات اختیاری..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs resize-none"
                />
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  disabled={createOpMutation.isPending || !newOpForm.category || !newOpForm.amount}
                  onClick={() => createOpMutation.mutate(newOpForm)}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold transition flex items-center justify-center gap-2"
                >
                  {createOpMutation.isPending && (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  )}
                  <span>ثبت عملیات مالی</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewOpModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  انصراف
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: CREATE FINANCIAL ACCOUNT                           */}
      {/* ========================================================= */}
      {showNewAccountModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 md:p-8 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-black text-base text-slate-900">تعریف حساب مالی یا صندوق</h3>
              <button
                onClick={() => setShowNewAccountModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">نام حساب *</label>
                <input
                  type="text"
                  value={newAccountForm.name}
                  onChange={(e) => setNewAccountForm({ ...newAccountForm, name: e.target.value })}
                  placeholder="مثال: حساب جاری سامان - شعبه مرکزی"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">نوع حساب</label>
                  <select
                    value={newAccountForm.type}
                    onChange={(e) => setNewAccountForm({ ...newAccountForm, type: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold"
                  >
                    <option value="bank">حساب بانکی</option>
                    <option value="card">کارت بانکی</option>
                    <option value="cash">صندوق نقدی (تنخواه)</option>
                    <option value="gateway_settlement">حساب تسویه درگاه</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">کد معین *</label>
                  <input
                    type="text"
                    value={newAccountForm.code}
                    onChange={(e) => setNewAccountForm({ ...newAccountForm, code: e.target.value })}
                    placeholder="1011"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">نام بانک</label>
                <input
                  type="text"
                  value={newAccountForm.bankName}
                  onChange={(e) => setNewAccountForm({ ...newAccountForm, bankName: e.target.value })}
                  placeholder="مثال: بانک سامان"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">۴ رقم آخر کارت</label>
                  <input
                    type="text"
                    maxLength={4}
                    value={newAccountForm.cardLast4}
                    onChange={(e) => setNewAccountForm({ ...newAccountForm, cardLast4: e.target.value })}
                    placeholder="1234"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono text-center"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">موجودی افتتاحیه (تومان)</label>
                  <input
                    type="number"
                    value={newAccountForm.initialBalance || ''}
                    onChange={(e) => setNewAccountForm({ ...newAccountForm, initialBalance: Number(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono text-left"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  disabled={createAccountMutation.isPending || !newAccountForm.name.trim()}
                  onClick={() => createAccountMutation.mutate(newAccountForm)}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold transition flex items-center justify-center gap-2"
                >
                  {createAccountMutation.isPending && (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  )}
                  <span>ثبت حساب مالی</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewAccountModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  انصراف
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: REVERSE ENTRY (ابطال سند و صدور سند معکوس)         */}
      {/* ========================================================= */}
      {reversalTargetEntry && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 md:p-8 space-y-4">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
              <RotateCcw className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-black text-base text-slate-900">
                ابطال سند قطعی #{reversalTargetEntry.entryNumber}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                طبق استانداردهای حسابداری، سند قطعی قابل حذف فیزیکی نیست. با تأیید این عملیات، یک
                «سند معکوس قرینه» به طور خودکار صادر شده و گردش‌های بدهکار و بستانکار خنثی خواهند شد.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">علت و شرح ابطال *</label>
              <textarea
                rows={2}
                value={reversalReason}
                onChange={(e) => setReversalReason(e.target.value)}
                placeholder="دلیل ابطال و صدور سند معکوس..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs resize-none"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                disabled={reverseEntryMutation.isPending || !reversalReason.trim()}
                onClick={() =>
                  reverseEntryMutation.mutate({
                    id: reversalTargetEntry._id,
                    reason: reversalReason.trim(),
                  })
                }
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold text-xs transition flex items-center justify-center gap-2"
              >
                {reverseEntryMutation.isPending && (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                )}
                <span>تأیید و صدور سند معکوس</span>
              </button>
              <button
                type="button"
                onClick={() => setReversalTargetEntry(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
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
