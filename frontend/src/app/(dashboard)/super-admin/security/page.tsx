'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { superAdminApi } from '@/features/admin/api/super-admin.api';
import { 
  Lock, Shield, KeyRound, Smartphone, AlertTriangle, 
  CheckCircle2, Plus, Trash2, Loader2, Save, Globe, Activity,
  Power, PowerOff, ShoppingCart, BookOpen, MessageSquare, Headphones,
  Send, Percent, Wallet, Ban, RefreshCw, Edit3, X, Check, AlertCircle,
  HelpCircle, ShieldAlert
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function SecurityPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'locks' | 'policy' | 'logs'>('locks');

  // Security Policy Config State
  const [config, setConfig] = useState<any>({
    twoFactorRequiredForAdmins: false,
    maxLoginAttempts: 5,
    sessionTimeoutMinutes: 120,
    blockedIps: [],
    forceHttps: true
  });
  const [newIp, setNewIp] = useState('');

  // Editing Message Modal State
  const [editingLockKey, setEditingLockKey] = useState<string | null>(null);
  const [editingLockTitle, setEditingLockTitle] = useState<string>('');
  const [editingLockMsg, setEditingLockMsg] = useState<string>('');

  // Fetch Security Policy & Recent Logs
  const { data: resData, isLoading: loadingSecurity } = useQuery({
    queryKey: ['securityOverview'],
    queryFn: () => superAdminApi.getSecurityOverview().then((res: any) => {
      if (res.data?.config) setConfig(res.data.config);
      return res.data;
    })
  });

  // Fetch Platform Operational Locks (Kill-Switches)
  const { data: locksData, isLoading: loadingLocks, refetch: refetchLocks } = useQuery({
    queryKey: ['platformLocks'],
    queryFn: () => superAdminApi.getPlatformLocks().then((res: any) => res.data),
    staleTime: 5000
  });

  const locks = locksData || {};

  // Mutation: Save Security Policy
  const saveConfigMutation = useMutation({
    mutationFn: (data: any) => superAdminApi.updateSecurityConfig(data),
    onSuccess: () => {
      toast.success('تنظیمات امنیتی با موفقیت بروزرسانی شد');
      queryClient.invalidateQueries({ queryKey: ['securityOverview'] });
    },
    onError: () => toast.error('خطا در ذخیره پیکربندی امنیتی')
  });

  // Mutation: Update Platform Locks
  const updateLocksMutation = useMutation({
    mutationFn: (data: any) => superAdminApi.updatePlatformLocks(data),
    onSuccess: (_, variables) => {
      toast.success('قفل‌های عملیاتی سامانه با موفقیت به‌روزرسانی شد');
      queryClient.invalidateQueries({ queryKey: ['platformLocks'] });
      queryClient.invalidateQueries({ queryKey: ['publicPlatformLocks'] });
      setEditingLockKey(null);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'خطا در تغییر وضعیت قفل');
    }
  });

  const handleToggleLock = (lockKey: string, currentValue: boolean) => {
    const nextValue = !currentValue;
    updateLocksMutation.mutate({
      [lockKey]: nextValue
    });
  };

  const handleOpenEditMessage = (key: string, title: string, currentMessage: string) => {
    setEditingLockKey(key);
    setEditingLockTitle(title);
    setEditingLockMsg(currentMessage || '');
  };

  const handleSaveMessage = () => {
    if (!editingLockKey) return;
    updateLocksMutation.mutate({
      [editingLockKey]: editingLockMsg.trim()
    });
  };

  const handleResetAllLocks = () => {
    if (!window.confirm('آیا از عادی‌سازی و غیرفعال‌کردن تمامی قفل‌های عملیاتی سامانه اطمینان دارید؟ تمامی بخش‌های سایت به حالت آزاد درخواهند آمد.')) {
      return;
    }
    updateLocksMutation.mutate({
      lockMaintenance: false,
      lockLogin: false,
      lockRegistration: false,
      lockPurchases: false,
      lockSettlements: false,
      lockCoupons: false,
      lockCourseCreation: false,
      lockSmsOtp: false,
      lockComments: false,
      lockSupportTickets: false,
    });
  };

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

  const recentLogs = resData?.recentSecurityLogs || [];
  const activeAdminsCount = resData?.activeAdminsCount || 1;

  // Compute active locks count
  const lockKeys = [
    'lockMaintenance', 'lockLogin', 'lockRegistration', 'lockPurchases',
    'lockSettlements', 'lockCoupons', 'lockCourseCreation', 'lockSmsOtp',
    'lockComments', 'lockSupportTickets'
  ];
  const activeLocksCount = lockKeys.filter(k => Boolean(locks[k])).length;

  if (loadingSecurity && loadingLocks) {
    return (
      <div className="flex flex-col items-center justify-center p-24 gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-red-600" />
        <span className="text-xs font-bold text-slate-500">در حال دریافت وضعیت امنیتی سامانه...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-[var(--neo-border)] shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-50 text-red-600 rounded-2xl">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-[var(--neo-text-main)]">
                مرکز امنیت، قفل‌های عملیاتی و کلیدهای اضطراری
              </h1>
              {activeLocksCount > 0 ? (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-rose-100 text-rose-800 border border-rose-300 animate-pulse">
                  {activeLocksCount} قفل فعال
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  همه سرویس‌ها فعال
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-[var(--neo-text-secondary)] mt-1">
              مدیریت کلیدهای قطع اضطراری پلتفرم، مسدودسازی لاگین، ثبت‌نام، خریدها و کنترل فایروال
            </p>
          </div>
        </div>

        {/* Global Reset or Save */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          {activeTab === 'locks' && activeLocksCount > 0 && (
            <button
              onClick={handleResetAllLocks}
              disabled={updateLocksMutation.isPending}
              className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-black rounded-xl border border-rose-200 transition shadow-xs cursor-pointer"
              title="غیرفعال‌سازی سریع تمام قفل‌ها و بازگشت به حالت عادی"
            >
              <PowerOff className="w-4 h-4 text-rose-600" />
              <span>عادی‌سازی تمام قفل‌ها ({activeLocksCount})</span>
            </button>
          )}

          {activeTab === 'policy' && (
            <button
              onClick={() => saveConfigMutation.mutate(config)}
              disabled={saveConfigMutation.isPending}
              className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm rounded-xl transition shadow-sm cursor-pointer disabled:opacity-50"
            >
              {saveConfigMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>ذخیره سیاست‌های امنیتی</span>
            </button>
          )}

          <button
            onClick={() => refetchLocks()}
            className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition"
            title="تازه‌سازی وضعیت"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-100/80 rounded-2xl border border-slate-200/80 overflow-x-auto">
        <button
          onClick={() => setActiveTab('locks')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'locks'
              ? 'bg-white text-rose-700 shadow-xs border border-slate-200/60 font-black'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Power className="w-4 h-4 text-rose-600" />
          <span>کلیدهای اضطراری و قفل‌های عملیاتی پلتفرم (Kill-Switches)</span>
          {activeLocksCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('policy')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'policy'
              ? 'bg-white text-indigo-700 shadow-xs border border-slate-200/60 font-black'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Shield className="w-4 h-4 text-indigo-600" />
          <span>سیاست‌های رمز عبور، نشست‌ها و لیست سیاه IP</span>
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'logs'
              ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60 font-black'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Activity className="w-4 h-4 text-emerald-600" />
          <span>لاگ‌ها و رویدادهای امنیتی زنده ({recentLogs.length})</span>
        </button>
      </div>

      {/* TAB 1: OPERATIONAL LOCKS & EMERGENCY KILL-SWITCHES */}
      {activeTab === 'locks' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Master Status Banner */}
          <div className={`p-5 rounded-3xl border transition-all ${
            activeLocksCount > 0
              ? 'bg-gradient-to-r from-rose-50 via-amber-50 to-rose-50 border-rose-300 text-rose-950 shadow-sm'
              : 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
          }`}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-2xl ${activeLocksCount > 0 ? 'bg-rose-500 text-white shadow-xs' : 'bg-emerald-500 text-white'}`}>
                  {activeLocksCount > 0 ? <ShieldAlert className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6" />}
                </div>
                <div>
                  <h3 className="text-base font-black">
                    {activeLocksCount > 0 
                      ? `سامانه در وضعیت کنترل‌شده قرار دارد: ${activeLocksCount} قفل عملیاتی فعال است` 
                      : 'تمامی سرویس‌ها و درگاه‌های پلتفرم در وضعیت عادی (آزاد و فعال) هستند'}
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {activeLocksCount > 0
                      ? 'بخش‌های قفل‌شده برای کاربران مسدود بوده و متن پیام‌های سفارشی شما به آن‌ها نمایش داده می‌شود.'
                      : 'هیچ محدودیتی بر ثبت‌نام، ورود، خریدها، تسویه‌ها و ایجاد دوره اعمال نشده است.'}
                  </p>
                </div>
              </div>

              {locks.updatedAt && (
                <div className="text-[11px] text-slate-500 bg-white/80 px-3 py-1.5 rounded-xl border border-slate-200 font-mono">
                  آخرین تغییر: {new Date(locks.updatedAt).toLocaleTimeString('fa-IR')} توسط {locks.updatedBy || 'مدیر کل'}
                </div>
              )}
            </div>
          </div>

          {/* Group 1: Access & Identity (ورود، ثبت‌نام، تعمیرات، پیامک) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-sm font-black text-slate-800 flex items-center gap-2">
                <Lock className="w-4 h-4 text-rose-600" />
                <span>۱. قفل‌های دسترسی و احراز هویت (Access & Identity)</span>
              </h2>
              <span className="text-[11px] text-slate-400 font-bold">سوپرادمین تحت هر شرایطی دسترسی کامل دارد</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Lock 1: Full Maintenance */}
              <LockCard
                title="حالت تعمیرات و ارتقای سراسری (Full Maintenance)"
                description="مسدودسازی کامل سایت برای عموم کاربران و نمایش صفحه تعمیرات به همراه زمان تخمینی. سوپرادمین همچنان سایت را کامل می‌بیند."
                icon={Power}
                iconColor="text-rose-600"
                bgColor="bg-rose-50"
                activeBg="bg-rose-50/60 border-rose-300"
                isActive={Boolean(locks.lockMaintenance)}
                onToggle={() => handleToggleLock('lockMaintenance', locks.lockMaintenance)}
                message={locks.maintenanceMessage}
                onEditMessage={() => handleOpenEditMessage('maintenanceMessage', 'حالت تعمیرات سراسری', locks.maintenanceMessage)}
                isPending={updateLocksMutation.isPending}
              />

              {/* Lock 2: User Login */}
              <LockCard
                title="قفل ورود کاربران عادی (User Login Lock)"
                description="ممانعت از ورود دانشجویان، اساتید و حسابداران. در صورت نیاز به بررسی دیتابیس یا ممیزی دسترسی‌ها کاربرد دارد."
                icon={Ban}
                iconColor="text-amber-600"
                bgColor="bg-amber-50"
                activeBg="bg-amber-50/60 border-amber-300"
                isActive={Boolean(locks.lockLogin)}
                onToggle={() => handleToggleLock('lockLogin', locks.lockLogin)}
                message={locks.lockLoginMessage}
                onEditMessage={() => handleOpenEditMessage('lockLoginMessage', 'ورود کاربران', locks.lockLoginMessage)}
                isPending={updateLocksMutation.isPending}
              />

              {/* Lock 3: User Registration */}
              <LockCard
                title="قفل ثبت‌نام کاربر جدید (Registration Lock)"
                description="غیرفعال‌سازی موقت عضویت کاربران جدید جهت پیشگیری از حملات ثبت‌نام رباتیک یا زمان تکمیل ظرفیت پلتفرم."
                icon={ShieldAlert}
                iconColor="text-orange-600"
                bgColor="bg-orange-50"
                activeBg="bg-orange-50/60 border-orange-300"
                isActive={Boolean(locks.lockRegistration)}
                onToggle={() => handleToggleLock('lockRegistration', locks.lockRegistration)}
                message={locks.lockRegistrationMessage}
                onEditMessage={() => handleOpenEditMessage('lockRegistrationMessage', 'ثبت‌نام جدید', locks.lockRegistrationMessage)}
                isPending={updateLocksMutation.isPending}
              />

              {/* Lock 4: SMS OTP Gateway */}
              <LockCard
                title="قفل اضطراری ارسال پیامک و OTP (SMS Flooding Guard)"
                description="قطع فوری ارسال کدهای پیامکی به منظور جلوگیری از هدر رفت شارژ پنل کاوه‌نگار در حملات SMS Flooding."
                icon={Smartphone}
                iconColor="text-blue-600"
                bgColor="bg-blue-50"
                activeBg="bg-blue-50/60 border-blue-300"
                isActive={Boolean(locks.lockSmsOtp)}
                onToggle={() => handleToggleLock('lockSmsOtp', locks.lockSmsOtp)}
                message={locks.lockSmsOtpMessage}
                onEditMessage={() => handleOpenEditMessage('lockSmsOtpMessage', 'ارسال پیامک و OTP', locks.lockSmsOtpMessage)}
                isPending={updateLocksMutation.isPending}
              />
            </div>
          </div>

          {/* Group 2: Financial & Commerce (خرید، تسویه، کوپن) */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-sm font-black text-slate-800 flex items-center gap-2">
                <Wallet className="w-4 h-4 text-emerald-600" />
                <span>۲. قفل‌های مالی، تراکنش‌ها و درگاه پرداخت (Financial & Commerce)</span>
              </h2>
              <span className="text-[11px] text-slate-400 font-bold">مرور و جستجوی دوره‌ها بدون اختلال ادامه می‌یابد</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Lock 5: Purchases & Payments */}
              <LockCard
                title="قفل خرید و درگاه پرداخت (Checkout Lock)"
                description="قفل موقت ثبت سفارش، شارژ آنلاین کیف پول و ارسال به شاپرک در زمان تغییر شماره حساب یا بستن سال مالی."
                icon={ShoppingCart}
                iconColor="text-emerald-600"
                bgColor="bg-emerald-50"
                activeBg="bg-emerald-50/60 border-emerald-300"
                isActive={Boolean(locks.lockPurchases)}
                onToggle={() => handleToggleLock('lockPurchases', locks.lockPurchases)}
                message={locks.lockPurchasesMessage}
                onEditMessage={() => handleOpenEditMessage('lockPurchasesMessage', 'خرید و پرداخت اینترنتی', locks.lockPurchasesMessage)}
                isPending={updateLocksMutation.isPending}
              />

              {/* Lock 6: Settlements */}
              <LockCard
                title="قفل تسویه‌حساب اساتید (Settlements Lock)"
                description="مسدودسازی ثبت درخواست‌های تسویه‌حساب جدید توسط اساتید در روزهای تعطیلات رسمی، ممیزی مالیاتی یا بستن دفاتر."
                icon={Wallet}
                iconColor="text-purple-600"
                bgColor="bg-purple-50"
                activeBg="bg-purple-50/60 border-purple-300"
                isActive={Boolean(locks.lockSettlements)}
                onToggle={() => handleToggleLock('lockSettlements', locks.lockSettlements)}
                message={locks.lockSettlementsMessage}
                onEditMessage={() => handleOpenEditMessage('lockSettlementsMessage', 'تسویه‌حساب اساتید', locks.lockSettlementsMessage)}
                isPending={updateLocksMutation.isPending}
              />

              {/* Lock 7: Coupons */}
              <LockCard
                title="قفل کدهای تخفیف (Coupons Engine Lock)"
                description="تعلیق موقت اعمال تخفیف‌ها روی سبد خرید در کمپین‌های خاص بدون نیاز به حذف کدهای تخفیف از سیستم."
                icon={Percent}
                iconColor="text-indigo-600"
                bgColor="bg-indigo-50"
                activeBg="bg-indigo-50/60 border-indigo-300"
                isActive={Boolean(locks.lockCoupons)}
                onToggle={() => handleToggleLock('lockCoupons', locks.lockCoupons)}
                message={locks.lockCouponsMessage}
                onEditMessage={() => handleOpenEditMessage('lockCouponsMessage', 'کدهای تخفیف', locks.lockCouponsMessage)}
                isPending={updateLocksMutation.isPending}
              />
            </div>
          </div>

          {/* Group 3: Content & Teaching & Interaction (ایجاد دوره، نظرات، تیکت) */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-sm font-black text-slate-800 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-600" />
                <span>۳. قفل‌های محتوا، تدریس و تعاملات (Content & Community)</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Lock 8: Course & Class Creation */}
              <LockCard
                title="قفل ایجاد دوره و کلاس جدید (Course Creation Lock)"
                description="مسدودسازی موقت تعریف دوره یا کلاس جدید توسط اساتید در زمان‌هایی که ظرفیت بررسی یا پشتیبانی پر است."
                icon={BookOpen}
                iconColor="text-blue-600"
                bgColor="bg-blue-50"
                activeBg="bg-blue-50/60 border-blue-300"
                isActive={Boolean(locks.lockCourseCreation)}
                onToggle={() => handleToggleLock('lockCourseCreation', locks.lockCourseCreation)}
                message={locks.lockCourseCreationMessage}
                onEditMessage={() => handleOpenEditMessage('lockCourseCreationMessage', 'ایجاد دوره و کلاس جدید', locks.lockCourseCreationMessage)}
                isPending={updateLocksMutation.isPending}
              />

              {/* Lock 9: Comments */}
              <LockCard
                title="قفل ارسال نظرات جدید (Comments Lock)"
                description="ممانعت از ثبت دیدگاه‌ها و پرسش و پاسخ‌های جدید زیر دوره‌ها در زمان هجوم هرزنامه یا تعطیلات بررسی."
                icon={MessageSquare}
                iconColor="text-teal-600"
                bgColor="bg-teal-50"
                activeBg="bg-teal-50/60 border-teal-300"
                isActive={Boolean(locks.lockComments)}
                onToggle={() => handleToggleLock('lockComments', locks.lockComments)}
                message={locks.lockCommentsMessage}
                onEditMessage={() => handleOpenEditMessage('lockCommentsMessage', 'ارسال نظرات', locks.lockCommentsMessage)}
                isPending={updateLocksMutation.isPending}
              />

              {/* Lock 10: Support Tickets */}
              <LockCard
                title="قفل ارسال تیکت پشتیبانی (Tickets Lock)"
                description="تعلیق موقت ارسال تیکت‌های جدید دانشجویان در صورت عدم حضور کارشناسان پشتیبانی یا تعطیلات رسمی."
                icon={Headphones}
                iconColor="text-cyan-600"
                bgColor="bg-cyan-50"
                activeBg="bg-cyan-50/60 border-cyan-300"
                isActive={Boolean(locks.lockSupportTickets)}
                onToggle={() => handleToggleLock('lockSupportTickets', locks.lockSupportTickets)}
                message={locks.lockSupportTicketsMessage}
                onEditMessage={() => handleOpenEditMessage('lockSupportTicketsMessage', 'تیکت‌های پشتیبانی', locks.lockSupportTicketsMessage)}
                isPending={updateLocksMutation.isPending}
              />
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: SECURITY POLICIES & IP BLACKLIST */}
      {activeTab === 'policy' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Status Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-[var(--neo-border)] shadow-xs">
              <div className="flex items-center justify-between text-gray-500 text-xs mb-2">
                <span>مدیران با دسترسی سیستمی</span>
                <Shield className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-black text-gray-900">
                {activeAdminsCount.toLocaleString('fa-IR')} مدیر فعال
              </div>
              <div className="text-xs text-emerald-600 mt-1 flex items-center gap-1 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" /> وضعیت پایدار احراز هویت
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[var(--neo-border)] shadow-xs">
              <div className="flex items-center justify-between text-gray-500 text-xs mb-2">
                <span>IPهای مسدودشده (Blacklist)</span>
                <Globe className="w-4 h-4 text-red-500" />
              </div>
              <div className="text-2xl font-black text-red-600">
                {(config.blockedIps?.length || 0).toLocaleString('fa-IR')} آدرس
              </div>
              <div className="text-xs text-gray-400 mt-1">ترافیک مسدودشده در لبه شبکه</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[var(--neo-border)] shadow-xs">
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Access Policies */}
            <div className="bg-white p-6 rounded-3xl border border-[var(--neo-border)] shadow-xs space-y-5">
              <h3 className="font-black text-gray-900 text-base flex items-center gap-2">
                <Shield className="w-5 h-5 text-indigo-600" />
                سیاست‌های امنیتی و کنترل نشست‌ها
              </h3>

              <div className="space-y-4">
                <label className="flex items-center justify-between p-3.5 rounded-2xl border border-gray-100 hover:bg-gray-50 transition cursor-pointer">
                  <div>
                    <span className="text-xs font-bold text-gray-800 block">الزام ورود دوعاملی (2FA) برای مدیران</span>
                    <span className="text-[11px] text-gray-400 block mt-0.5">در صورت فعال بودن، مدیران ملزم به تایید پیامکی می‌شوند</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.twoFactorRequiredForAdmins || false}
                    onChange={(e) => setConfig({ ...config, twoFactorRequiredForAdmins: e.target.checked })}
                    className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 rounded-2xl border border-gray-100 hover:bg-gray-50 transition cursor-pointer">
                  <div>
                    <span className="text-xs font-bold text-gray-800 block">اجبار پروتکل امن SSL/HTTPS</span>
                    <span className="text-[11px] text-gray-400 block mt-0.5">ریدایرکت تمامی ترافیک ناامن HTTP به پورت امن</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.forceHttps || false}
                    onChange={(e) => setConfig({ ...config, forceHttps: e.target.checked })}
                    className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                </label>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    حداکثر دفعات تلاش ناموفق برای ورود (Brute-force Threshold)
                  </label>
                  <input
                    type="number"
                    min={3}
                    max={20}
                    value={config.maxLoginAttempts || 5}
                    onChange={(e) => setConfig({ ...config, maxLoginAttempts: Number(e.target.value) })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* IP Blacklist */}
            <div className="bg-white p-6 rounded-3xl border border-[var(--neo-border)] shadow-xs space-y-4">
              <h3 className="font-black text-gray-900 text-base flex items-center gap-2">
                <Globe className="w-5 h-5 text-red-600" />
                لیست سیاه آدرس‌های IP (IP Blacklist)
              </h3>

              <p className="text-xs text-gray-500">
                ترافیک ورودی از این آدرس‌ها بلافاصله توسط فایروال بلاک شده و خطای ۴۰۳ دریافت خواهند کرد.
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
                  className="px-4 py-2 bg-gray-900 hover:bg-black text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
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
                        className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
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
        </div>
      )}

      {/* TAB 3: AUDIT LOGS */}
      {activeTab === 'logs' && (
        <div className="bg-white p-6 rounded-3xl border border-[var(--neo-border)] shadow-xs space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-gray-900 text-base flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-600" />
              رویدادهای امنیتی و تغییر وضعیت قفل‌ها
            </h3>
            <span className="text-xs text-slate-400">ثبت تغییرات با مهر زمانی رسمی</span>
          </div>

          {recentLogs.length === 0 ? (
            <p className="text-xs text-gray-400 p-6 text-center">رویداد امنیتی غیرعادی ثبت نشده است.</p>
          ) : (
            <div className="space-y-2">
              {recentLogs.map((log: any) => (
                <div key={log._id} className="p-3.5 bg-gray-50 hover:bg-gray-100/80 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs border border-gray-100 transition">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shrink-0" />
                    <span className="font-black text-gray-800">{log.action || log.title}</span>
                    <span className="text-gray-500 font-medium">({log.userName || log.userEmail || 'سامانه'})</span>
                  </div>
                  <div className="text-gray-400 font-mono text-[11px] self-end sm:self-auto">
                    {new Date(log.createdAt).toLocaleString('fa-IR')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL: Edit Custom Message */}
      {editingLockKey && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-black text-slate-800">
                  تنظیم پیام سفارشی: {editingLockTitle}
                </h3>
              </div>
              <button
                onClick={() => setEditingLockKey(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              این متن هنگامی که این قفل فعال باشد به کاربرانی که قصد دسترسی به این بخش را دارند نمایش داده می‌شود.
            </p>

            <div>
              <textarea
                rows={4}
                value={editingLockMsg}
                onChange={(e) => setEditingLockMsg(e.target.value)}
                placeholder="متن پیام توضیحی به کاربر..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 resize-none font-medium leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingLockKey(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={handleSaveMessage}
                disabled={updateLocksMutation.isPending}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition"
              >
                {updateLocksMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                <span>ذخیره متن پیام</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// Subcomponent: Individual Lock Card with Interactive Toggle & Custom Message Preview
function LockCard({
  title,
  description,
  icon: Icon,
  iconColor,
  bgColor,
  activeBg,
  isActive,
  onToggle,
  message,
  onEditMessage,
  isPending,
}: {
  title: string;
  description: string;
  icon: any;
  iconColor: string;
  bgColor: string;
  activeBg: string;
  isActive: boolean;
  onToggle: () => void;
  message?: string;
  onEditMessage: () => void;
  isPending: boolean;
}) {
  return (
    <div className={`p-5 rounded-3xl border transition-all ${
      isActive 
        ? `${activeBg} shadow-xs` 
        : 'bg-white border-slate-200 hover:border-slate-300'
    }`}>
      {/* Top row: Icon, Title, and Toggle */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-2xl ${isActive ? 'bg-rose-500 text-white' : `${bgColor} ${iconColor}`} transition`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-black text-slate-800 leading-snug">
              {title}
            </h4>
            <div className="mt-1 flex items-center gap-1.5">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black ${
                isActive 
                  ? 'bg-rose-100 text-rose-800 border border-rose-200' 
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-rose-600' : 'bg-emerald-500'}`} />
                {isActive ? 'قفل و مسدود است' : 'آزاد و فعال'}
              </span>
            </div>
          </div>
        </div>

        {/* Interactive Toggle Switch */}
        <button
          type="button"
          role="switch"
          aria-checked={isActive}
          onClick={onToggle}
          disabled={isPending}
          className={`relative inline-flex h-7 w-13 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            isActive ? 'bg-rose-600 focus:ring-rose-500' : 'bg-slate-200 focus:ring-slate-400'
          }`}
          title={isActive ? 'کلیک کنید تا قفل باز شود' : 'کلیک کنید تا قفل فعال شود'}
        >
          <span
            className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
              isActive ? '-translate-x-6' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Description */}
      <p className="text-xs text-slate-500 mt-3 leading-relaxed">
        {description}
      </p>

      {/* Custom Message preview and Edit button */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
        <div className="flex-1 truncate text-[11px] text-slate-600 bg-white/70 px-2.5 py-1.5 rounded-xl border border-slate-200/80">
          <span className="font-bold text-slate-400 ml-1">پیام:</span>
          <span className="truncate" title={message}>{message || 'بدون پیام سفارشی'}</span>
        </div>

        <button
          type="button"
          onClick={onEditMessage}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-bold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 border border-indigo-100 transition shrink-0 cursor-pointer"
          title="ویرایش متنی که به کاربر هنگام برخورد با این قفل نشان داده می‌شود"
        >
          <Edit3 className="w-3 h-3" />
          <span>ویرایش پیام</span>
        </button>
      </div>
    </div>
  );
}
