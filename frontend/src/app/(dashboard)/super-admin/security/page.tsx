'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { superAdminApi } from '@/features/admin/api/super-admin.api';
import { 
  Lock, Shield, KeyRound, Smartphone, AlertTriangle, 
  CheckCircle, Plus, Trash2, Loader2, Save, Globe, Activity
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function SecurityPage() {
  const queryClient = useQueryClient();
  const [config, setConfig] = useState<any>({
    twoFactorRequiredForAdmins: false,
    maxLoginAttempts: 5,
    sessionTimeoutMinutes: 120,
    blockedIps: [],
    forceHttps: true
  });
  const [newIp, setNewIp] = useState('');

  const { data: resData, isLoading } = useQuery({
    queryKey: ['securityOverview'],
    queryFn: () => superAdminApi.getSecurityOverview().then((res: any) => {
      if (res.data?.config) setConfig(res.data.config);
      return res.data;
    })
  });

  const saveConfigMutation = useMutation({
    mutationFn: (data: any) => superAdminApi.updateSecurityConfig(data),
    onSuccess: () => {
      toast.success('تنظیمات امنیتی با موفقیت بروزرسانی شد');
      queryClient.invalidateQueries({ queryKey: ['securityOverview'] });
    },
    onError: () => toast.error('خطا در ذخیره پیکربندی امنیتی')
  });

  const handleAddBlockedIp = () => {
    if (!newIp.trim()) return;
    const currentList = config.blockedIps || [];
    if (currentList.includes(newIp.trim())) {
      toast.error('این IP قبلاً در لیست سیاه قرار دارد');
      return;
    }
    const updated = [...currentList, newIp.trim()];
    setConfig({ ...config, blockedIps: updated });
    setNewIp('');
  };

  const handleRemoveBlockedIp = (ipToRemove: string) => {
    const updated = (config.blockedIps || []).filter((ip: string) => ip !== ipToRemove);
    setConfig({ ...config, blockedIps: updated });
  };

  const handleSave = () => {
    saveConfigMutation.mutate(config);
  };

  const recentLogs = resData?.recentSecurityLogs || [];
  const activeAdminsCount = resData?.activeAdminsCount || 1;

  if (isLoading) {
    return (
      <div className="flex justify-center p-20">
        <Loader2 className="w-10 h-10 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-[var(--neo-border)] shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-50 text-red-600 rounded-2xl">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-[var(--neo-text-main)]">امنیت و کنترل دسترسی پیشرفته</h1>
            <p className="text-sm text-[var(--neo-text-secondary)] mt-1">مدیریت سیاست‌های رمز عبور، لیست سیاه IPها، نشست‌های فعال و احراز هویت دوعاملی</p>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saveConfigMutation.isPending}
          className="flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-colors shadow-sm disabled:opacity-50"
        >
          {saveConfigMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          ذخیره پیکربندی امنیتی
        </button>
      </div>

      {/* Security Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[var(--neo-border)] shadow-sm">
          <div className="flex items-center justify-between text-gray-500 text-xs mb-2">
            <span>مدیران با دسترسی سیستمی</span>
            <Shield className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-gray-900">
            {activeAdminsCount.toLocaleString('fa-IR')} مدیر فعال
          </div>
          <div className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" /> وضعیت پایدار
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[var(--neo-border)] shadow-sm">
          <div className="flex items-center justify-between text-gray-500 text-xs mb-2">
            <span>IPهای مسدودشده (Blacklist)</span>
            <Globe className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-2xl font-black text-red-600">
            {(config.blockedIps?.length || 0).toLocaleString('fa-IR')} آدرس
          </div>
          <div className="text-xs text-gray-400 mt-1">ترافیک مسدود شده از لبه سرور</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[var(--neo-border)] shadow-sm">
          <div className="flex items-center justify-between text-gray-500 text-xs mb-2">
            <span>احراز هویت دوعاملی (2FA)</span>
            <KeyRound className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-blue-600">
            {config.twoFactorRequiredForAdmins ? 'اجباری' : 'اختیاری'}
          </div>
          <div className="text-xs text-gray-400 mt-1">برای کلیه نقش‌های مدیریتی</div>
        </div>
      </div>

      {/* Configuration Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Access Policies */}
        <div className="bg-white p-6 rounded-3xl border border-[var(--neo-border)] shadow-sm space-y-5">
          <h3 className="font-black text-gray-900 text-base flex items-center gap-2">
            <Shield className="w-5 h-5 text-red-600" />
            سیاست‌های ورود و نشست‌ها
          </h3>

          <div className="space-y-4 text-sm">
            <label className="flex items-center justify-between p-3.5 bg-gray-50 rounded-2xl cursor-pointer">
              <div>
                <div className="font-bold text-gray-800">اجباری بودن ورود دوعاملی (2FA/OTP)</div>
                <div className="text-xs text-gray-500">تمامی مدیران قبل از ورود به پنل باید کد یکبار مصرف پیامکی را تایید کنند.</div>
              </div>
              <input
                type="checkbox"
                checked={config.twoFactorRequiredForAdmins || false}
                onChange={(e) => setConfig({ ...config, twoFactorRequiredForAdmins: e.target.checked })}
                className="w-5 h-5 text-red-600 rounded focus:ring-red-500"
              />
            </label>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                حداکثر دفعات تلاش ناموفق ورود (Rate Limiting)
              </label>
              <input
                type="number"
                min="3"
                max="20"
                value={config.maxLoginAttempts || 5}
                onChange={(e) => setConfig({ ...config, maxLoginAttempts: Number(e.target.value) })}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-red-500"
              />
              <span className="text-[11px] text-gray-400">پس از این تعداد، حساب یا IP به مدت ۱۵ دقیقه مسدود می‌شود.</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                مدت زمان انقضای نشست فعال مدیر (دقیقه)
              </label>
              <input
                type="number"
                min="15"
                max="1440"
                value={config.sessionTimeoutMinutes || 120}
                onChange={(e) => setConfig({ ...config, sessionTimeoutMinutes: Number(e.target.value) })}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-red-500"
              />
              <span className="text-[11px] text-gray-400">پس از عدم فعالیت کاربر، خروج خودکار صورت می‌گیرد.</span>
            </div>
          </div>
        </div>

        {/* IP Blacklist */}
        <div className="bg-white p-6 rounded-3xl border border-[var(--neo-border)] shadow-sm space-y-4">
          <h3 className="font-black text-gray-900 text-base flex items-center gap-2">
            <Globe className="w-5 h-5 text-red-600" />
            لیست سیاه آدرس‌های IP (IP Blacklist)
          </h3>

          <p className="text-xs text-gray-500">
            ترافیک ورودی از این آدرس‌های اینترنتی بلافاصله توسط فایروال برنامه بلاک شده و خطای ۴۰۳ دریافت خواهند کرد.
          </p>

          <div className="flex gap-2">
            <input
              type="text"
              dir="ltr"
              placeholder="مثلاً: 198.51.100.12"
              value={newIp}
              onChange={(e) => setNewIp(e.target.value)}
              className="flex-1 p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono outline-none focus:ring-2 focus:ring-red-500"
            />
            <button
              type="button"
              onClick={handleAddBlockedIp}
              className="px-4 py-2 bg-gray-900 hover:bg-black text-white rounded-xl text-xs font-bold flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              افزودن
            </button>
          </div>

          <div className="border border-gray-100 rounded-2xl divide-y divide-gray-100 max-h-56 overflow-y-auto">
            {(config.blockedIps || []).length === 0 ? (
              <div className="p-4 text-center text-xs text-gray-400">هیچ آدرس IP در لیست مسدودسازی قرار ندارد.</div>
            ) : (
              config.blockedIps.map((ip: string) => (
                <div key={ip} className="flex justify-between items-center p-3 hover:bg-gray-50 text-xs">
                  <span className="font-mono text-gray-800 font-bold">{ip}</span>
                  <button
                    onClick={() => handleRemoveBlockedIp(ip)}
                    className="text-red-500 hover:text-red-700 p-1"
                    title="حذف از لیست سیاه"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Critical Security Logs preview */}
      <div className="bg-white p-6 rounded-3xl border border-[var(--neo-border)] shadow-sm space-y-4">
        <h3 className="font-black text-gray-900 text-base flex items-center gap-2">
          <Activity className="w-5 h-5 text-indigo-600" />
          آخرین رویدادهای امنیتی ثبت‌شده
        </h3>

        {recentLogs.length === 0 ? (
          <p className="text-xs text-gray-400">رویداد امنیتی غیرعادی ثبت نشده است.</p>
        ) : (
          <div className="space-y-2">
            {recentLogs.map((log: any) => (
              <div key={log._id} className="p-3 bg-gray-50 rounded-2xl flex justify-between items-center text-xs border border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-500" />
                  <span className="font-bold text-gray-800">{log.action}</span>
                  <span className="text-gray-400">({log.userName || log.userEmail || 'ناشناس'})</span>
                </div>
                <div className="text-gray-400 font-mono">
                  {new Date(log.createdAt).toLocaleString('fa-IR')}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
