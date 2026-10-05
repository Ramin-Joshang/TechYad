'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { superAdminApi } from '@/features/admin/api/super-admin.api';
import { 
  History, Search, Filter, ShieldAlert, CheckCircle, 
  XCircle, AlertTriangle, User, Globe, Loader2,
  Smartphone, Monitor, Laptop, Phone, Mail, Clock,
  Eye, Copy, Check, X, Shield, Cpu, Maximize2, Server,
  RefreshCw, MapPin
} from 'lucide-react';

export default function AuditLogsPage() {
  const [category, setCategory] = useState('all');
  const [role, setRole] = useState('all');
  const [status, setStatus] = useState('all');
  const [severity, setSeverity] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState<any>(null);
  const [copiedPayload, setCopiedPayload] = useState(false);

  const { data: resData, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['auditLogs', category, role, status, severity, search, page],
    queryFn: () => superAdminApi.getAuditLogs({ 
      category, 
      role,
      status, 
      severity,
      search, 
      page, 
      limit: 25 
    }).then((res: any) => res.data)
  });

  const logs = resData?.logs || [];
  const total = resData?.total || 0;
  const totalPages = resData?.totalPages || 1;

  const handleCopyPayload = (data: any) => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  const getRoleBadge = (r: string) => {
    switch (r) {
      case 'super-admin':
        return <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold">سوپرادمین</span>;
      case 'admin':
        return <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-bold">مدیر</span>;
      case 'instructor':
        return <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">مدرس</span>;
      case 'student':
        return <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">دانشجو</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">کاربر مهمان</span>;
    }
  };

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'auth': return <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-200/60">احراز هویت</span>;
      case 'course': return <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 text-[10px] font-bold border border-purple-200/60">دوره و محتوا</span>;
      case 'user': return <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-bold border border-indigo-200/60">کاربران</span>;
      case 'order': return <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200/60">سفارش و مالی</span>;
      case 'settlement': return <span className="px-2 py-0.5 rounded-md bg-teal-50 text-teal-700 text-[10px] font-bold border border-teal-200/60">تسویه‌حساب</span>;
      case 'security': return <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 text-[10px] font-bold border border-rose-200/60">امنیتی</span>;
      case 'notification': return <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-200/60">اعلان</span>;
      case 'sms': return <span className="px-2 py-0.5 rounded-md bg-cyan-50 text-cyan-700 text-[10px] font-bold border border-cyan-200/60">پیامک</span>;
      case 'payment': return <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200/60">درگاه پرداخت</span>;
      default: return <span className="px-2 py-0.5 rounded-md bg-slate-50 text-slate-700 text-[10px] font-bold border border-slate-200/60">سیستمی</span>;
    }
  };

  const getStatusBadge = (st: string) => {
    if (st === 'success') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
          <CheckCircle className="w-3 h-3 text-emerald-500" />
          موفق
        </span>
      );
    }
    if (st === 'failure') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold">
          <XCircle className="w-3 h-3 text-rose-500" />
          ناموفق
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold">
        <AlertTriangle className="w-3 h-3 text-amber-500" />
        هشدار
      </span>
    );
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'critical':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-rose-600 text-white">بحرانی</span>;
      case 'warning':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-white">هشدار</span>;
      default:
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-200 text-slate-700">عادی</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[var(--neo-border)] shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
            <History className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              لاگ‌های امنیتی، دیوایس و ردپای سیستم (Audit Logs)
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              ثبت جامع مشخصات کاربر (نام، نقش، ایمیل، موبایل)، اطلاعات دقیق شبکه، مشخصات دستگاه کلاینت و جزئیات رویدادها
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-2.5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition disabled:opacity-50 cursor-pointer"
            title="تازه‌سازی"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin text-indigo-600' : ''}`} />
          </button>
          <div className="text-xs bg-slate-100 text-slate-700 px-3.5 py-2 rounded-2xl font-bold font-mono">
            مجموع رویدادها: {total.toLocaleString('fa-IR')}
          </div>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-[var(--neo-border)] shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[260px]">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="جستجو در عنوان رویداد، نام کاربر، ایمیل، شماره موبایل، آدرس IP یا منبع..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pr-10 pl-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Category Filter */}
            <select
              value={category}
              onChange={(e) => { setCategory(e.target.value); setPage(1); }}
              className="text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-slate-700 cursor-pointer"
            >
              <option value="all">همه دسته‌ها</option>
              <option value="auth">احراز هویت و لاگین</option>
              <option value="security">امنیتی و دسترسی</option>
              <option value="user">کاربران و ثبت‌نام</option>
              <option value="course">دوره‌ها و کلاس‌ها</option>
              <option value="order">سفارش و مالی</option>
              <option value="settlement">تسویه‌حساب</option>
              <option value="notification">اعلان‌ها</option>
              <option value="sms">پیامک‌ها</option>
              <option value="payment">درگاه پرداخت</option>
            </select>

            {/* Role Filter */}
            <select
              value={role}
              onChange={(e) => { setRole(e.target.value); setPage(1); }}
              className="text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-slate-700 cursor-pointer"
            >
              <option value="all">همه نقش‌ها</option>
              <option value="super-admin">سوپرادمین</option>
              <option value="admin">مدیر</option>
              <option value="instructor">مدرس</option>
              <option value="student">دانشجو</option>
              <option value="guest">کاربر مهمان</option>
            </select>

            {/* Status Filter */}
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              className="text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-slate-700 cursor-pointer"
            >
              <option value="all">همه وضعیت‌ها</option>
              <option value="success">موفق (Success)</option>
              <option value="failure">ناموفق (Failed)</option>
              <option value="warning">هشدار (Warning)</option>
            </select>

            {/* Severity Filter */}
            <select
              value={severity}
              onChange={(e) => { setSeverity(e.target.value); setPage(1); }}
              className="text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-slate-700 cursor-pointer"
            >
              <option value="all">همه سطوح</option>
              <option value="info">عادی (Info)</option>
              <option value="warning">هشدار (Warning)</option>
              <option value="critical">بحرانی (Critical)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-3xl border border-[var(--neo-border)] shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-20 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            <p className="text-xs text-slate-500 font-medium">در حال دریافت لاگ‌های امنیتی...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-20 text-slate-500">
            <History className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <p className="font-bold text-sm text-slate-700">هیچ لاگ یا رویدادی مطابق با فیلترها یافت نشد</p>
            <p className="text-xs text-slate-400 mt-1">می‌توانید عبارت جستجو یا فیلترهای انتخابی را تغییر دهید.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-[var(--neo-border)] select-none">
                <tr>
                  <th className="p-3.5 text-center">وضعیت</th>
                  <th className="p-3.5">عنوان رویداد / اکشن</th>
                  <th className="p-3.5">دسته‌بندی</th>
                  <th className="p-3.5">مشخصات اقدام‌کننده (کاربر / نقش)</th>
                  <th className="p-3.5">اطلاعات تماس (ایمیل / موبایل)</th>
                  <th className="p-3.5">دستگاه، مرورگر و مدل سیستم</th>
                  <th className="p-3.5">آدرس IP و موقعیت</th>
                  <th className="p-3.5">منبع هدف</th>
                  <th className="p-3.5">زمان ثبت</th>
                  <th className="p-3.5 text-center">جزئیات کامل</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log: any) => {
                  const user = log.userId;
                  const userName = user 
                    ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || user.mobile 
                    : log.userName || log.userEmail || log.userPhone || 'کاربر مهمان / سیستم';

                  const userRole = user?.role || log.userRole || 'guest';
                  const userEmail = user?.email || log.userEmail;
                  const userPhone = user?.mobile || log.userPhone;

                  const isMobile = log.deviceDetails?.isMobile || log.device?.includes('موبایل');
                  const isTablet = log.deviceDetails?.isTablet || log.device?.includes('تبلت');
                  const isBot = log.deviceDetails?.isBot;

                  const deviceModel = log.deviceDetails?.model || log.device || 'دسکتاپ';
                  const osInfo = log.deviceDetails?.osName 
                    ? `${log.deviceDetails.osName} ${log.deviceDetails.osVersion || ''}`.trim() 
                    : log.os || '-';
                  const browserInfo = log.deviceDetails?.browserName 
                    ? `${log.deviceDetails.browserName} ${log.deviceDetails.browserVersion ? log.deviceDetails.browserVersion.split('.')[0] : ''}`.trim() 
                    : log.browser || '-';

                  return (
                    <tr 
                      key={log._id} 
                      onClick={() => setSelectedLog(log)}
                      className="hover:bg-indigo-50/30 transition-colors cursor-pointer"
                    >
                      {/* Status */}
                      <td className="p-3.5 text-center whitespace-nowrap">
                        <div className="flex flex-col items-center gap-1">
                          {getStatusBadge(log.status)}
                          {log.severity && log.severity !== 'info' && (
                            <div className="mt-0.5">{getSeverityBadge(log.severity)}</div>
                          )}
                        </div>
                      </td>

                      {/* Action */}
                      <td className="p-3.5 font-black text-slate-900 max-w-[180px]">
                        <div className="truncate" title={log.action}>
                          {log.title || log.action}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">
                          {log.action}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="p-3.5 whitespace-nowrap">
                        {getCategoryBadge(log.category)}
                      </td>

                      {/* Actor (User + Role) */}
                      <td className="p-3.5">
                        <div className="font-bold text-slate-800 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[140px]" title={userName}>{userName}</span>
                        </div>
                        <div className="mt-1 flex items-center gap-1">
                          {getRoleBadge(userRole)}
                        </div>
                      </td>

                      {/* Contact Info (Email / Phone) */}
                      <td className="p-3.5 font-mono text-[11px] text-slate-600">
                        {userPhone ? (
                          <div className="flex items-center gap-1 text-slate-800 font-bold dir-ltr text-right">
                            <Phone className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span>{userPhone}</span>
                          </div>
                        ) : null}
                        {userEmail ? (
                          <div className="flex items-center gap-1 text-slate-500 dir-ltr text-right mt-0.5 truncate max-w-[160px]" title={userEmail}>
                            <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{userEmail}</span>
                          </div>
                        ) : null}
                        {!userPhone && !userEmail && (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      {/* Device & OS */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-1.5 text-slate-800 font-bold">
                          {isBot ? (
                            <Server className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                          ) : isMobile ? (
                            <Smartphone className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          ) : isTablet ? (
                            <Laptop className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                          ) : (
                            <Monitor className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          )}
                          <span className="truncate max-w-[130px]" title={deviceModel}>{deviceModel}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5 truncate max-w-[150px]" title={`${browserInfo} • ${osInfo}`}>
                          {browserInfo} • {osInfo}
                        </div>
                      </td>

                      {/* IP & Location */}
                      <td className="p-3.5 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                        <div className="font-bold text-slate-800 dir-ltr text-right">
                          {log.ip || '127.0.0.1'}
                        </div>
                        {log.deviceDetails?.location ? (
                          <div className="text-[10px] text-slate-400 font-sans mt-0.5 flex items-center gap-0.5">
                            <MapPin className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                            <span className="truncate max-w-[100px]">{log.deviceDetails.location}</span>
                          </div>
                        ) : null}
                      </td>

                      {/* Target Resource */}
                      <td className="p-3.5 max-w-[130px]">
                        <span className="font-medium text-slate-700 truncate block" title={log.targetResource || log.targetTitle || log.targetType || '-'}>
                          {log.targetResource || log.targetTitle || log.targetType || '-'}
                        </span>
                      </td>

                      {/* Timestamp */}
                      <td className="p-3.5 text-slate-500 whitespace-nowrap font-mono text-[11px]">
                        {new Date(log.createdAt).toLocaleString('fa-IR')}
                      </td>

                      {/* Action View */}
                      <td className="p-3.5 text-center whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLog(log);
                          }}
                          className="p-1.5 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 transition cursor-pointer"
                          title="مشاهده جزئیات کامل"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-3 bg-slate-50 text-xs">
            <span className="text-slate-500 font-medium">
              صفحه {page} از {totalPages} (تعداد کل رویدادها: {total.toLocaleString('fa-IR')})
            </span>
            <div className="flex items-center gap-1.5">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="px-3.5 py-1.5 bg-white border border-slate-200 rounded-xl disabled:opacity-40 font-bold transition hover:bg-slate-100 cursor-pointer"
              >
                قبلی
              </button>
              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, totalPages) }).map((_, idx) => {
                  let pNum = page <= 3 ? idx + 1 : page >= totalPages - 2 ? totalPages - 4 + idx : page - 2 + idx;
                  if (pNum < 1 || pNum > totalPages) return null;
                  return (
                    <button
                      key={pNum}
                      onClick={() => setPage(pNum)}
                      className={`w-7 h-7 rounded-xl font-bold font-mono text-xs transition cursor-pointer ${
                        page === pNum
                          ? 'bg-slate-900 text-white'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {pNum}
                    </button>
                  );
                })}
              </div>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(p => p + 1)}
                className="px-3.5 py-1.5 bg-white border border-slate-200 rounded-xl disabled:opacity-40 font-bold transition hover:bg-slate-100 cursor-pointer"
              >
                بعدی
              </button>
            </div>
          </div>
        )}
      </div>

      {/* FULL LOG DETAILS MODAL */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-4xl max-h-[92vh] rounded-3xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-100 text-indigo-700 rounded-2xl">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base sm:text-lg">
                    جزئیات جامع رویداد و لاگ امنیتی
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className="font-mono text-xs text-slate-400">شناسه: {selectedLog._id}</span>
                    {getStatusBadge(selectedLog.status)}
                    {selectedLog.severity && getSeverityBadge(selectedLog.severity)}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedLog(null)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-200 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-xs text-slate-700 flex-1">
              
              {/* 1. Actor Information */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
                <h4 className="font-black text-slate-900 flex items-center gap-2 text-xs">
                  <User className="w-4 h-4 text-indigo-600" />
                  مشخصات کامل اقدام‌کننده (کاربر / مدیر)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-medium">
                  <div>
                    <span className="text-slate-400 block text-[11px]">نام و نام خانوادگی:</span>
                    <span className="font-bold text-slate-900 text-sm">
                      {selectedLog.userId 
                        ? `${selectedLog.userId.firstName || ''} ${selectedLog.userId.lastName || ''}`.trim() || selectedLog.userId.email
                        : selectedLog.userName || 'کاربر مهمان'}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">نقش کاربری (Role):</span>
                    <div className="mt-0.5">
                      {getRoleBadge(selectedLog.userId?.role || selectedLog.userRole || 'guest')}
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">آدرس ایمیل:</span>
                    <span className="font-mono dir-ltr text-right block text-slate-800">
                      {selectedLog.userId?.email || selectedLog.userEmail || '-'}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">شماره همراه / تماس:</span>
                    <span className="font-mono dir-ltr text-right block text-slate-800 font-bold">
                      {selectedLog.userId?.mobile || selectedLog.userPhone || '-'}
                    </span>
                  </div>

                  {selectedLog.userId?._id && (
                    <div className="sm:col-span-2">
                      <span className="text-slate-400 block text-[11px]">شناسه یکتای کاربری (User ID):</span>
                      <span className="font-mono text-slate-600 select-all">{selectedLog.userId._id}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 2. Device & Network Details */}
              <div className="bg-indigo-50/40 p-4 rounded-2xl border border-indigo-100 space-y-3">
                <h4 className="font-black text-slate-900 flex items-center gap-2 text-xs">
                  <Monitor className="w-4 h-4 text-indigo-600" />
                  اطلاعات کامل دیوایس، مرورگر و شبکه کلاینت
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-medium">
                  <div>
                    <span className="text-slate-400 block text-[11px]">آدرس آی‌پی (Client IP):</span>
                    <span className="font-mono font-bold text-indigo-700 dir-ltr text-right block">
                      {selectedLog.ip || '127.0.0.1'}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">نوع دستگاه:</span>
                    <span className="text-slate-900 font-bold">
                      {selectedLog.deviceDetails?.deviceType || selectedLog.device || 'دسکتاپ'}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">برند و مدل سیستم:</span>
                    <span className="text-slate-900 font-bold">
                      {selectedLog.deviceDetails?.brand ? `${selectedLog.deviceDetails.brand} - ` : ''}
                      {selectedLog.deviceDetails?.model || selectedLog.device || '-'}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">سیستم‌عامل (OS):</span>
                    <span className="text-slate-900">
                      {selectedLog.deviceDetails?.osName 
                        ? `${selectedLog.deviceDetails.osName} ${selectedLog.deviceDetails.osVersion || ''}` 
                        : selectedLog.os || '-'}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">مرورگر وب (Browser):</span>
                    <span className="text-slate-900">
                      {selectedLog.deviceDetails?.browserName 
                        ? `${selectedLog.deviceDetails.browserName} (${selectedLog.deviceDetails.browserVersion || ''})` 
                        : selectedLog.browser || '-'}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">موتور پردازش (Engine):</span>
                    <span className="font-mono text-slate-800">
                      {selectedLog.deviceDetails?.engine || '-'}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">معماری پردازنده (CPU Arch):</span>
                    <span className="font-mono text-slate-800">
                      {selectedLog.deviceDetails?.cpuArch || 'x86_64'}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">رزولوشن صفحه کلاینت:</span>
                    <span className="font-mono text-slate-800">
                      {selectedLog.deviceDetails?.screenResolution || '-'}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">موقعیت جغرافیایی / کشور:</span>
                    <span className="text-slate-800 font-medium">
                      {selectedLog.deviceDetails?.location || 'ایران (IR)'}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">پروتکل ارتباطی:</span>
                    <span className="font-mono text-slate-800 font-bold">
                      {selectedLog.deviceDetails?.protocol || 'HTTPS'}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">زبان مرورگر (Language):</span>
                    <span className="font-mono text-slate-800">
                      {selectedLog.deviceDetails?.language || 'fa-IR'}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">پروکسی / Forwarded For:</span>
                    <span className="font-mono text-[10px] text-slate-600 truncate block" title={selectedLog.deviceDetails?.forwardedFor || '-'}>
                      {selectedLog.deviceDetails?.forwardedFor || '-'}
                    </span>
                  </div>
                </div>

                {/* Raw User-Agent string */}
                {selectedLog.userAgent && (
                  <div className="pt-2 border-t border-indigo-100">
                    <span className="text-slate-400 block text-[11px] mb-1">User-Agent خام مرورگر:</span>
                    <div className="p-2.5 bg-white rounded-xl border border-slate-200 font-mono text-[11px] text-slate-700 dir-ltr text-left select-all break-all">
                      {selectedLog.userAgent}
                    </div>
                  </div>
                )}
              </div>

              {/* 3. Event & Resource Details */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
                <h4 className="font-black text-slate-900 flex items-center gap-2 text-xs">
                  <ShieldAlert className="w-4 h-4 text-indigo-600" />
                  جزئیات رویداد و منبع هدف (Target Resource)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-medium">
                  <div>
                    <span className="text-slate-400 block text-[11px]">عنوان رویداد:</span>
                    <span className="font-bold text-slate-900">{selectedLog.title || selectedLog.action}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">کد یا نام اکشن (Action):</span>
                    <span className="font-mono text-slate-700">{selectedLog.action}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">دسته‌بندی رویداد:</span>
                    <div className="mt-0.5">{getCategoryBadge(selectedLog.category)}</div>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">منبع هدف (Target Resource):</span>
                    <span className="text-slate-900 font-bold">{selectedLog.targetResource || selectedLog.targetTitle || selectedLog.targetType || '-'}</span>
                  </div>

                  {selectedLog.targetId && (
                    <div className="sm:col-span-2">
                      <span className="text-slate-400 block text-[11px]">شناسه منبع هدف (Target ID):</span>
                      <span className="font-mono text-slate-600 select-all">{selectedLog.targetId}</span>
                    </div>
                  )}

                  <div className="sm:col-span-2">
                    <span className="text-slate-400 block text-[11px]">زمان دقیق رخداد:</span>
                    <span className="font-mono text-slate-800">
                      {new Date(selectedLog.createdAt).toLocaleString('fa-IR')}
                    </span>
                  </div>
                </div>
              </div>

              {/* 4. Payload / Parameters JSON Viewer */}
              {selectedLog.details && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-black text-slate-900 flex items-center gap-1.5 text-xs">
                      <span>تغییرات، پارامترها و داده‌های ارسالی (Payload):</span>
                    </h4>
                    <button
                      onClick={() => handleCopyPayload(selectedLog.details)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition cursor-pointer"
                    >
                      {copiedPayload ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedPayload ? 'کپی شد' : 'کپی JSON'}</span>
                    </button>
                  </div>
                  <pre className="p-4 bg-slate-900 text-emerald-400 rounded-2xl font-mono text-xs dir-ltr text-left overflow-x-auto max-h-60 selection:bg-emerald-800 selection:text-white">
                    {JSON.stringify(selectedLog.details, null, 2)}
                  </pre>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 flex justify-end bg-slate-50/80 shrink-0">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs transition cursor-pointer shadow-xs"
              >
                بستن پنجره
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
