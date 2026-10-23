'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { superAdminApi } from '@/features/admin/api/super-admin.api';
import {
  Activity,
  Search,
  Filter,
  ShieldAlert,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Eye,
  Copy,
  Check,
  X,
  RefreshCw,
  Server,
  Layers,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Database,
  Trash2,
  Terminal,
  Cpu,
  Monitor,
  Smartphone,
  Laptop,
  Globe,
  User,
  Shield,
  FileCode,
  Zap,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ApiLogsHubPage() {
  const queryClient = useQueryClient();

  // Filters & Search
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'all_errors' | 'error_5xx' | 'error_4xx' | 'success'>('all');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(20);

  // Modals & Details
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showCleanupModal, setShowCleanupModal] = useState<boolean>(false);
  const [cleanupDays, setCleanupDays] = useState<number>(30);
  const [showStackModal, setShowStackModal] = useState<boolean>(false);

  // Queries
  const {
    data: logsData,
    isLoading: loadingLogs,
    isFetching: fetchingLogs,
    refetch: refetchLogs,
  } = useQuery({
    queryKey: ['apiLogs', search, statusFilter, methodFilter, page, limit],
    queryFn: () =>
      superAdminApi.getApiLogs({
        search: search.trim() || undefined,
        status: statusFilter,
        method: methodFilter !== 'all' ? methodFilter : undefined,
        page,
        limit,
      }).then((res) => res.data),
    staleTime: 10000,
  });

  const { data: statsData, isLoading: loadingStats, refetch: refetchStats } = useQuery({
    queryKey: ['apiLogStats'],
    queryFn: () => superAdminApi.getApiLogStats().then((res) => res.data),
    staleTime: 15000,
  });

  const { data: detailData, isLoading: loadingDetail } = useQuery({
    queryKey: ['apiLogDetail', selectedLogId],
    queryFn: () => superAdminApi.getApiLogById(selectedLogId!).then((res) => res.data),
    enabled: !!selectedLogId,
  });

  // Cleanup mutation
  const cleanupMutation = useMutation({
    mutationFn: (days: number) => superAdminApi.cleanupApiLogs(days),
    onSuccess: (res: any) => {
      toast.success(res?.message || 'لاگ‌های قدیمی با موفقیت پاکسازی شدند');
      setShowCleanupModal(false);
      queryClient.invalidateQueries({ queryKey: ['apiLogs'] });
      queryClient.invalidateQueries({ queryKey: ['apiLogStats'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'خطا در پاکسازی لاگ‌ها');
    },
  });

  const logs = logsData?.logs || [];
  const total = logsData?.total || 0;
  const totalPages = logsData?.totalPages || 1;
  const stats = statsData || {};
  const selectedLog = detailData || null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('در حافظه کلیپ‌بورد کپی شد');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getMethodBadge = (m: string) => {
    switch (m?.toUpperCase()) {
      case 'GET':
        return <span className="px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700 font-mono font-bold text-xs border border-blue-200">GET</span>;
      case 'POST':
        return <span className="px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 font-mono font-bold text-xs border border-emerald-200">POST</span>;
      case 'PATCH':
      case 'PUT':
        return <span className="px-2 py-0.5 rounded-lg bg-amber-50 text-amber-700 font-mono font-bold text-xs border border-amber-200">{m}</span>;
      case 'DELETE':
        return <span className="px-2 py-0.5 rounded-lg bg-rose-50 text-rose-700 font-mono font-bold text-xs border border-rose-200">DELETE</span>;
      default:
        return <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-mono font-bold text-xs">{m}</span>;
    }
  };

  const getStatusBadge = (code: number) => {
    if (code >= 200 && code < 300) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono font-bold text-xs">
          <CheckCircle className="w-3.5 h-3.5" />
          {code}
        </span>
      );
    }
    if (code >= 300 && code < 400) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 font-mono font-bold text-xs">
          {code}
        </span>
      );
    }
    if (code >= 400 && code < 500) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 font-mono font-bold text-xs">
          <AlertTriangle className="w-3.5 h-3.5" />
          {code}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 font-mono font-bold text-xs animate-pulse">
        <XCircle className="w-3.5 h-3.5" />
        {code}
      </span>
    );
  };

  const getLatencyBadge = (ms: number) => {
    if (ms < 150) {
      return <span className="font-mono text-xs text-emerald-600 font-semibold">{ms} ms</span>;
    }
    if (ms < 600) {
      return <span className="font-mono text-xs text-amber-600 font-semibold">{ms} ms</span>;
    }
    return <span className="font-mono text-xs text-rose-600 font-bold">{ms} ms</span>;
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[var(--neo-surface)] p-6 rounded-3xl border border-[var(--neo-border)] shadow-sm">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-[var(--neo-text-main)] flex items-center gap-2">
                مرکز جامع خطاها، مانیتورینگ API و ردیابی عملیات
              </h1>
              <p className="text-xs sm:text-sm text-[var(--neo-text-secondary)]">
                رهگیری بلادرنگ درخواست‌ها، استک تریس خطاهای فنی سرور با کد پیگیری اختصاصی (Request ID)
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => {
              refetchLogs();
              refetchStats();
              toast.success('داده‌های مانیتورینگ به‌روزرسانی شدند');
            }}
            disabled={fetchingLogs}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-[var(--neo-border)] bg-[var(--neo-surface-2)] hover:bg-[var(--neo-surface)] text-xs font-bold text-[var(--neo-text-main)] transition"
          >
            <RefreshCw className={`w-4 h-4 ${fetchingLogs ? 'animate-spin text-blue-600' : ''}`} />
            <span>تازه‌سازی زنده</span>
          </button>

          <button
            onClick={() => setShowCleanupModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition"
          >
            <Trash2 className="w-4 h-4" />
            <span>پاکسازی لاگ‌های قدیمی</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="bg-[var(--neo-surface)] p-4 rounded-3xl border border-[var(--neo-border)] shadow-xs">
          <span className="text-[11px] font-bold text-[var(--neo-text-secondary)] block mb-1">
            درخواست‌های ۲۴ ساعت
          </span>
          <div className="text-2xl font-black text-[var(--neo-text-main)] font-mono">
            {stats.total24h?.toLocaleString('fa-IR') ?? '...'}
          </div>
          <div className="text-[10px] text-emerald-600 mt-1 flex items-center gap-1 font-medium">
            <Zap className="w-3 h-3" />
            موفق: {stats.success24h?.toLocaleString('fa-IR') ?? '0'}
          </div>
        </div>

        <div className="bg-[var(--neo-surface)] p-4 rounded-3xl border border-[var(--neo-border)] shadow-xs">
          <span className="text-[11px] font-bold text-rose-600 block mb-1">
            خطاهای سرور (5xx)
          </span>
          <div className="text-2xl font-black text-rose-600 font-mono">
            {stats.errors5xx24h?.toLocaleString('fa-IR') ?? '0'}
          </div>
          <div className="text-[10px] text-slate-400 mt-1 font-medium">
            بحرانی / نیازمند بررسی
          </div>
        </div>

        <div className="bg-[var(--neo-surface)] p-4 rounded-3xl border border-[var(--neo-border)] shadow-xs">
          <span className="text-[11px] font-bold text-amber-600 block mb-1">
            خطاهای کلاینت (4xx)
          </span>
          <div className="text-2xl font-black text-amber-600 font-mono">
            {stats.errors4xx24h?.toLocaleString('fa-IR') ?? '0'}
          </div>
          <div className="text-[10px] text-slate-400 mt-1 font-medium">
            اعتبارسنجی و دسترسی
          </div>
        </div>

        <div className="bg-[var(--neo-surface)] p-4 rounded-3xl border border-[var(--neo-border)] shadow-xs">
          <span className="text-[11px] font-bold text-[var(--neo-text-secondary)] block mb-1">
            نرخ خطا (Error Rate)
          </span>
          <div className="text-2xl font-black text-[var(--neo-text-main)] font-mono">
            {stats.errorRate ?? 0}٪
          </div>
          <div className="text-[10px] text-slate-400 mt-1 font-medium">
            میانگین ۲۴ ساعت اخیر
          </div>
        </div>

        <div className="bg-[var(--neo-surface)] p-4 rounded-3xl border border-[var(--neo-border)] shadow-xs">
          <span className="text-[11px] font-bold text-[var(--neo-text-secondary)] block mb-1">
            میانگین پاسخ‌دهی
          </span>
          <div className="text-2xl font-black text-indigo-600 font-mono">
            {stats.avgLatency ?? 0} <span className="text-xs">ms</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1 font-medium">
            زمان اجرای APIها
          </div>
        </div>

        <div className="bg-[var(--neo-surface)] p-4 rounded-3xl border border-[var(--neo-border)] shadow-xs">
          <span className="text-[11px] font-bold text-[var(--neo-text-secondary)] block mb-1">
            حداکثر تاخیر ثبت‌شده
          </span>
          <div className="text-2xl font-black text-[var(--neo-text-main)] font-mono">
            {stats.maxLatency ?? 0} <span className="text-xs">ms</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1 font-medium">
            کندترین پاسخ
          </div>
        </div>
      </div>

      {/* Top Failing Endpoints Section (if any errors exist) */}
      {stats.topFailingEndpoints && stats.topFailingEndpoints.length > 0 && (
        <div className="bg-amber-500/5 border border-amber-500/20 p-4 rounded-3xl space-y-2">
          <div className="flex items-center gap-2 text-xs font-black text-amber-900 dark:text-amber-200">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>مسیرهای دارای بیشترین فراوانی خطا در ۷ روز اخیر:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {stats.topFailingEndpoints.map((ep: any, i: number) => (
              <button
                key={i}
                onClick={() => {
                  setSearch(ep.path);
                  setStatusFilter('all_errors');
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-amber-200 text-xs font-mono transition hover:border-amber-400"
              >
                <span className="font-bold text-rose-600">{ep.method}</span>
                <span className="text-slate-700 dark:text-slate-300 dir-ltr">{ep.path}</span>
                <span className="px-1.5 py-0.2 rounded-md bg-rose-100 text-rose-800 font-bold text-[10px]">
                  {ep.errorCount} خطا
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search & Filters Bar */}
      <div className="bg-[var(--neo-surface)] p-4 rounded-3xl border border-[var(--neo-border)] shadow-sm space-y-4">
        {/* Status Tabs */}
        <div className="flex overflow-x-auto pb-1 gap-2 border-b border-[var(--neo-border)] scrollbar-hide">
          <button
            onClick={() => { setStatusFilter('all'); setPage(1); }}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
              statusFilter === 'all'
                ? 'bg-[var(--neo-text-main)] text-white shadow-xs'
                : 'text-[var(--neo-text-secondary)] hover:bg-[var(--neo-surface-2)]'
            }`}
          >
            همه درخواست‌ها
          </button>
          <button
            onClick={() => { setStatusFilter('all_errors'); setPage(1); }}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              statusFilter === 'all_errors'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-rose-600 hover:bg-rose-50'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            فقط خطاها (۴xx و ۵xx)
          </button>
          <button
            onClick={() => { setStatusFilter('error_5xx'); setPage(1); }}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              statusFilter === 'error_5xx'
                ? 'bg-rose-700 text-white shadow-xs'
                : 'text-rose-700 hover:bg-rose-100'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            خطاهای سرور (5xx)
          </button>
          <button
            onClick={() => { setStatusFilter('error_4xx'); setPage(1); }}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              statusFilter === 'error_4xx'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-amber-600 hover:bg-amber-50'
            }`}
          >
            خطاهای کلاینت (4xx)
          </button>
          <button
            onClick={() => { setStatusFilter('success'); setPage(1); }}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              statusFilter === 'success'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-emerald-700 hover:bg-emerald-50'
            }`}
          >
            <CheckCircle className="w-3.5 h-3.5" />
            درخواست‌های موفق (2xx)
          </button>
        </div>

        {/* Search Input & Method Select */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="md:col-span-2 relative">
            <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="جستجو با Request ID (کد پیگیری)، مسیر، ایمیل کاربر یا متن خطا..."
              className="w-full pl-4 pr-10 py-2.5 rounded-2xl border border-[var(--neo-border)] bg-[var(--neo-surface)] text-xs sm:text-sm text-[var(--neo-text-main)] focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div>
            <select
              value={methodFilter}
              onChange={(e) => { setMethodFilter(e.target.value); setPage(1); }}
              className="w-full px-3 py-2.5 rounded-2xl border border-[var(--neo-border)] bg-[var(--neo-surface)] text-xs font-bold text-[var(--neo-text-main)] focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">همه متدهای HTTP</option>
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PATCH">PATCH</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
            </select>
          </div>

          <div className="flex items-center justify-between text-xs font-bold text-[var(--neo-text-secondary)] px-2">
            <span>تعداد کل یافته‌ها: {total.toLocaleString('fa-IR')}</span>
            <select
              value={limit}
              onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
              className="bg-transparent border border-[var(--neo-border)] rounded-xl px-2 py-1 text-xs"
            >
              <option value={15}>۱۵ ردیف</option>
              <option value={25}>۲۵ ردیف</option>
              <option value={50}>۵۰ ردیف</option>
              <option value={100}>۱۰۰ ردیف</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Logs Table */}
      <div className="bg-[var(--neo-surface)] rounded-3xl border border-[var(--neo-border)] shadow-sm overflow-hidden">
        {loadingLogs ? (
          <div className="p-16 flex flex-col items-center justify-center gap-3 text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
            <span className="text-xs font-bold">در حال بارگذاری لاگ‌های API...</span>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-16 text-center space-y-3 text-slate-400">
            <Activity className="w-12 h-12 mx-auto text-slate-300" />
            <p className="text-sm font-bold text-slate-600">هیچ لاگی مطابق با فیلترهای انتخابی یافت نشد</p>
            <p className="text-xs">می‌توانید فیلترها را تغییر دهید یا واژه جستجو را پاک کنید.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-[var(--neo-surface-2)] text-[var(--neo-text-secondary)] font-black border-b border-[var(--neo-border)]">
                <tr>
                  <th className="py-3.5 px-4">کد پیگیری (Request ID)</th>
                  <th className="py-3.5 px-4">زمان ثبت</th>
                  <th className="py-3.5 px-4">متد و مسیر</th>
                  <th className="py-3.5 px-4 text-center">کد وضعیت</th>
                  <th className="py-3.5 px-4">مدت زمان</th>
                  <th className="py-3.5 px-4">کاربر / نقش</th>
                  <th className="py-3.5 px-4">کلاینت / IP</th>
                  <th className="py-3.5 px-4 text-center">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--neo-border)]">
                {logs.map((log: any) => {
                  const hasError = !!log.isError || log.statusCode >= 400;
                  const dateStr = new Date(log.createdAt).toLocaleTimeString('fa-IR', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  });
                  const dayStr = new Date(log.createdAt).toLocaleDateString('fa-IR');

                  return (
                    <tr
                      key={log._id || log.requestId}
                      className={`hover:bg-[var(--neo-surface-2)]/60 transition ${
                        log.is5xx ? 'bg-rose-500/5' : ''
                      }`}
                    >
                      {/* Request ID */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 font-mono dir-ltr text-xs">
                          <button
                            onClick={() => handleCopy(log.requestId, log.requestId)}
                            className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition text-slate-400 hover:text-slate-600"
                            title="کپی کد پیگیری"
                          >
                            {copiedId === log.requestId ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <span
                            onClick={() => setSelectedLogId(log.requestId)}
                            className="font-bold text-blue-600 hover:underline cursor-pointer truncate max-w-[160px]"
                          >
                            {log.requestId}
                          </span>
                        </div>
                      </td>

                      {/* Time */}
                      <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                        <div className="font-mono text-slate-700 dark:text-slate-300 font-bold">{dateStr}</div>
                        <div className="text-[10px] text-slate-400">{dayStr}</div>
                      </td>

                      {/* Method & Path */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2 max-w-[320px]">
                          {getMethodBadge(log.method)}
                          <span className="font-mono text-xs text-slate-800 dark:text-slate-200 dir-ltr truncate" title={log.path}>
                            {log.path}
                          </span>
                        </div>
                        {log.error?.message && (
                          <div className="text-[11px] text-rose-600 truncate max-w-[320px] mt-0.5" title={log.error.message}>
                            {log.error.code ? `[${log.error.code}] ` : ''}
                            {log.error.message}
                          </div>
                        )}
                      </td>

                      {/* Status Code */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        {getStatusBadge(log.statusCode)}
                      </td>

                      {/* Duration */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {getLatencyBadge(log.durationMs)}
                      </td>

                      {/* User */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {log.userId ? (
                          <div>
                            <span className="font-bold text-slate-800 dark:text-slate-200 block text-xs">
                              {log.userId.firstName} {log.userId.lastName}
                            </span>
                            <span className="text-[10px] text-blue-600 font-mono">
                              {log.userRole || log.userId.role || 'کاربر'}
                            </span>
                          </div>
                        ) : log.userEmail ? (
                          <span className="text-[11px] font-mono text-slate-600">{log.userEmail}</span>
                        ) : (
                          <span className="text-[11px] text-slate-400">مهمان (Guest)</span>
                        )}
                      </td>

                      {/* Client IP & Device */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-mono text-xs text-slate-700 dark:text-slate-300 dir-ltr">{log.clientIp}</div>
                        <div className="text-[10px] text-slate-400">{log.device || 'دسکتاپ'}</div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <button
                          onClick={() => setSelectedLogId(log.requestId)}
                          className="px-3 py-1.5 rounded-xl bg-[var(--neo-surface-2)] hover:bg-blue-50 hover:text-blue-600 text-xs font-bold transition flex items-center gap-1 mx-auto"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>بررسی</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-[var(--neo-border)] flex items-center justify-between text-xs font-bold text-[var(--neo-text-secondary)]">
            <span>
              صفحه {page.toLocaleString('fa-IR')} از {totalPages.toLocaleString('fa-IR')}
            </span>

            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-2 rounded-xl border border-[var(--neo-border)] hover:bg-[var(--neo-surface-2)] disabled:opacity-40 transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="p-2 rounded-xl border border-[var(--neo-border)] hover:bg-[var(--neo-surface-2)] disabled:opacity-40 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* DETAIL DRAWER / MODAL */}
      {selectedLogId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-[var(--neo-surface)] w-full max-w-4xl max-h-[90vh] rounded-3xl border border-[var(--neo-border)] shadow-2xl flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-[var(--neo-border)] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Terminal className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-[var(--neo-text-main)]">
                    جزئیات کامل درخواست و ردیابی خطا
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-mono text-xs text-blue-600 font-bold dir-ltr">{selectedLogId}</span>
                    <button
                      onClick={() => handleCopy(selectedLogId, 'modal-id')}
                      className="text-slate-400 hover:text-slate-600 text-xs p-1"
                      title="کپی کد پیگیری"
                    >
                      {copiedId === 'modal-id' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedLogId(null)}
                className="w-9 h-9 rounded-xl border border-[var(--neo-border)] hover:bg-slate-100 flex items-center justify-center text-slate-500 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-6">
              {loadingDetail || !selectedLog ? (
                <div className="p-16 flex flex-col items-center justify-center gap-3 text-slate-400">
                  <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
                  <span className="text-xs font-bold">در حال بازیابی مشخصات لاگ...</span>
                </div>
              ) : (
                <>
                  {/* Status Banner */}
                  <div
                    className={`p-4 rounded-2xl border flex items-start justify-between ${
                      selectedLog.is5xx
                        ? 'bg-rose-50 border-rose-200 text-rose-800'
                        : selectedLog.isError
                        ? 'bg-amber-50 border-amber-200 text-amber-800'
                        : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {getStatusBadge(selectedLog.statusCode)}
                        <span className="font-black text-sm">
                          {selectedLog.is5xx
                            ? 'خطای بحرانی سرور (Internal Server Error)'
                            : selectedLog.isError
                            ? 'پاسخ ناموفق / خطای کلاینت'
                            : 'عملیات کاملاً موفق (OK)'}
                        </span>
                      </div>
                      <p className="text-xs leading-relaxed opacity-90">
                        {selectedLog.error?.message ||
                          (selectedLog.statusCode === 200
                            ? 'درخواست بدون هیچ‌گونه خطا یا استثنا اجرا گردید.'
                            : `درخواست با کد وضعیت ${selectedLog.statusCode} خاتمه یافت.`)}
                      </p>
                    </div>

                    <div className="text-left font-mono text-xs">
                      <span className="font-bold">{selectedLog.durationMs} ms</span>
                    </div>
                  </div>

                  {/* Request Metadata Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-[var(--neo-surface-2)] p-4 rounded-2xl border border-[var(--neo-border)] text-xs">
                    <div>
                      <span className="text-slate-400 block mb-0.5">متد HTTP:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{selectedLog.method}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5">مسیر درخواستی:</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200 dir-ltr block truncate">{selectedLog.path}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5">آدرس IP کلاینت:</span>
                      <span className="font-mono text-slate-700 dark:text-slate-300 dir-ltr">{selectedLog.clientIp}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5">تاریخ و ساعت:</span>
                      <span className="font-mono text-slate-700 dark:text-slate-300">
                        {new Date(selectedLog.createdAt).toLocaleString('fa-IR')}
                      </span>
                    </div>
                  </div>

                  {/* Technical Error Details & Stack Trace (If Error Occurred) */}
                  {selectedLog.error && (
                    <div className="space-y-3">
                      <h4 className="font-black text-sm text-rose-700 flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-rose-600" />
                        جزئیات استثنای فنی (Technical Root Cause)
                      </h4>

                      <div className="p-4 rounded-2xl bg-rose-950 text-rose-100 font-mono text-xs space-y-2 border border-rose-900 dir-ltr text-left">
                        <div>
                          <span className="text-rose-400 font-bold">Error Code: </span>
                          <span className="text-white">{selectedLog.error.code || 'INTERNAL_ERROR'}</span>
                        </div>
                        <div>
                          <span className="text-rose-400 font-bold">Exception Name: </span>
                          <span className="text-amber-300">{selectedLog.error.name || 'Error'}</span>
                        </div>
                        <div>
                          <span className="text-rose-400 font-bold">User Message: </span>
                          <span className="text-white font-sans dir-rtl text-right block mt-0.5">{selectedLog.error.message}</span>
                        </div>

                        {selectedLog.error.fieldErrors && Object.keys(selectedLog.error.fieldErrors).length > 0 && (
                          <div className="pt-2 border-t border-rose-800">
                            <span className="text-amber-400 font-bold block mb-1">Field Errors:</span>
                            <pre className="text-rose-200 text-[11px] overflow-x-auto bg-black/40 p-2 rounded-lg">
                              {JSON.stringify(selectedLog.error.fieldErrors, null, 2)}
                            </pre>
                          </div>
                        )}

                        {selectedLog.error.stack && (
                          <div className="pt-2 border-t border-rose-800">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-rose-400 font-bold">Server Stack Trace:</span>
                              <button
                                onClick={() => handleCopy(selectedLog.error.stack, 'stack-trace')}
                                className="px-2 py-0.5 rounded bg-rose-900 hover:bg-rose-800 text-[10px] text-white transition flex items-center gap-1"
                              >
                                {copiedId === 'stack-trace' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                کپی Stack Trace
                              </button>
                            </div>
                            <pre className="text-[11px] text-slate-300 overflow-x-auto bg-black/60 p-3 rounded-xl max-h-56 scrollbar-thin">
                              {selectedLog.error.stack}
                            </pre>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Sanitized Payload (Query & Body) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Query Params */}
                    <div className="space-y-1.5">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                        <span>پارامترهای Query:</span>
                        {selectedLog.query && Object.keys(selectedLog.query).length > 0 && (
                          <button
                            onClick={() => handleCopy(JSON.stringify(selectedLog.query, null, 2), 'query-copy')}
                            className="text-[10px] text-blue-600 hover:underline flex items-center gap-1"
                          >
                            <Copy className="w-3 h-3" /> کپی
                          </button>
                        )}
                      </span>
                      <pre className="p-3 rounded-2xl bg-[var(--neo-surface-2)] text-[11px] font-mono dir-ltr text-left overflow-x-auto max-h-40 border border-[var(--neo-border)]">
                        {selectedLog.query && Object.keys(selectedLog.query).length > 0
                          ? JSON.stringify(selectedLog.query, null, 2)
                          : '// پارامتری ارسال نشده'}
                      </pre>
                    </div>

                    {/* Sanitized Request Body */}
                    <div className="space-y-1.5">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                        <span>بدنه درخواست (پاکسازی‌شده از رمز و داده محرمانه):</span>
                        {selectedLog.body && Object.keys(selectedLog.body).length > 0 && (
                          <button
                            onClick={() => handleCopy(JSON.stringify(selectedLog.body, null, 2), 'body-copy')}
                            className="text-[10px] text-blue-600 hover:underline flex items-center gap-1"
                          >
                            <Copy className="w-3 h-3" /> کپی
                          </button>
                        )}
                      </span>
                      <pre className="p-3 rounded-2xl bg-[var(--neo-surface-2)] text-[11px] font-mono dir-ltr text-left overflow-x-auto max-h-40 border border-[var(--neo-border)]">
                        {selectedLog.body && Object.keys(selectedLog.body).length > 0
                          ? JSON.stringify(selectedLog.body, null, 2)
                          : '// بدون بدنه (Body)'}
                      </pre>
                    </div>
                  </div>

                  {/* User & Client Device Details */}
                  <div className="p-4 rounded-2xl border border-[var(--neo-border)] bg-[var(--neo-surface)] space-y-2 text-xs">
                    <span className="font-bold text-slate-800 dark:text-slate-200 block">مشخصات کاربر و مرورگر:</span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-slate-600 dark:text-slate-400">
                      <div>دستگاه: <span className="font-bold text-slate-800 dark:text-slate-200">{selectedLog.device || 'دسکتاپ'}</span></div>
                      <div>مرورگر: <span className="font-bold text-slate-800 dark:text-slate-200">{selectedLog.browser || 'نامشخص'}</span></div>
                      <div>سیستم‌عامل: <span className="font-bold text-slate-800 dark:text-slate-200">{selectedLog.os || 'نامشخص'}</span></div>
                    </div>
                    {selectedLog.userAgent && (
                      <div className="text-[11px] text-slate-400 font-mono truncate dir-ltr text-left pt-1 border-t border-[var(--neo-border)]" title={selectedLog.userAgent}>
                        User-Agent: {selectedLog.userAgent}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[var(--neo-border)] bg-[var(--neo-surface-2)] flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-mono">
                TechYad Observability & Error Tracing Engine v1.0
              </span>

              <button
                onClick={() => setSelectedLogId(null)}
                className="px-5 py-2 rounded-xl bg-[var(--neo-text-main)] text-white text-xs font-bold transition hover:opacity-90"
              >
                بستن پنجره
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CLEANUP LOGS MODAL */}
      {showCleanupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-[var(--neo-surface)] w-full max-w-md rounded-3xl border border-[var(--neo-border)] p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-base text-[var(--neo-text-main)]">
                  پاکسازی لاگ‌های قدیمی API
                </h3>
                <p className="text-xs text-[var(--neo-text-secondary)]">
                  آزادسازی فضای دیتابیس و حفظ سرعت کوئری‌ها
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              لاگ‌های قدیمی‌تر از بازه انتخابی به طور کامل از دیتابیس حذف خواهند شد. این عملیات روی لاگ‌های مالی و Audit تفکیک‌شده اثری نخواهد داشت.
            </p>

            <div>
              <label className="block text-xs font-bold text-[var(--neo-text-main)] mb-1.5">
                حذف لاگ‌های قدیمی‌تر از:
              </label>
              <select
                value={cleanupDays}
                onChange={(e) => setCleanupDays(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl border border-[var(--neo-border)] bg-[var(--neo-surface)] text-xs font-bold"
              >
                <option value={7}>قدیمی‌تر از ۷ روز</option>
                <option value={14}>قدیمی‌تر از ۱۴ روز</option>
                <option value={30}>قدیمی‌تر از ۳۰ روز (پیشنهادی)</option>
                <option value={60}>قدیمی‌تر از ۶۰ روز</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowCleanupModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold border border-[var(--neo-border)] hover:bg-[var(--neo-surface-2)]"
              >
                انصراف
              </button>
              <button
                type="button"
                disabled={cleanupMutation.isPending}
                onClick={() => cleanupMutation.mutate(cleanupDays)}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition flex items-center gap-1.5 disabled:opacity-50"
              >
                {cleanupMutation.isPending ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>تایید و پاکسازی</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
