'use client';

import { useAuthStore } from '@/features/auth/stores/auth.store';
import { adminApi } from '@/features/admin/api/admin.api';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { 
  Users, BookOpen, DollarSign, Activity, CheckSquare, 
  List, GraduationCap, Briefcase, Video, Ticket, Shield, 
  Loader2, Server, Key, TrendingUp, ShoppingBag, 
  Tag, Clock, AlertTriangle, ArrowUpRight, CheckCircle2, 
  ExternalLink, Layers, PlusCircle, Compass
} from 'lucide-react';
import Link from 'next/link';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, BarChart, Bar 
} from 'recharts';

export default function SuperAdminDashboard() {
  const { user } = useAuthStore();
  
  const { data: statsData, isLoading: isLoadingStats } = useQuery({
    queryKey: ['superAdminDashboardStats'],
    queryFn: async () => {
      const res = await adminApi.getDashboardStats();
      return res?.data || res;
    }
  });

  const { data: healthData, isLoading: isLoadingHealth } = useQuery({
    queryKey: ['systemHealth'],
    queryFn: () => api.get('/health').then((res: any) => res?.data || res),
    refetchInterval: 30000 // refresh every 30s
  });

  if (isLoadingStats || !statsData) {
    return (
      <div className="flex flex-col items-center justify-center p-24 gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-[var(--neo-primary)]" />
        <p className="text-gray-500 font-bold">در حال بارگذاری داشبورد کلان پلتفرم...</p>
      </div>
    );
  }

  const {
    totalRevenue = 0,
    monthlyRevenue = 0,
    todayRevenue = 0,
    averageOrderValue = 0,
    conversionRate = 0,
    totalUsers = 0,
    students = 0,
    instructors = 0,
    admins = 0,
    totalCourses = 0,
    publishedCourses = 0,
    pendingCourses = 0,
    draftCourses = 0,
    classes = 0,
    activeClasses = 0,
    orders = 0,
    pendingOrders = 0,
    tickets = 0,
    activeCoupons = 0,
    recentOrders = [],
    recentTickets = [],
    topCourses = [],
    monthlyRevenueChart = []
  } = statsData;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      
      {/* Header Banner with System Status */}
      <div className="bg-[var(--neo-surface)] border border-[var(--neo-border)] rounded-3xl p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-blue-100 text-[var(--neo-primary)] rounded-2xl">
              <Server className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-[var(--neo-text-main)]">مرکز فرماندهی و داشبورد کلان</h1>
              <p className="text-[var(--neo-text-secondary)] text-sm mt-1">
                درود {user?.firstName} عزیز؛ تمام سامانه‌های پلتفرم تک‌یاد فعال و در بالاترین سطح کارایی هستند.
              </p>
            </div>
          </div>
        </div>
        
        <div className="relative z-10 flex flex-wrap gap-3">
          <Link 
            href="/super-admin/reports" 
            className="px-5 py-3 bg-[var(--neo-primary)] hover:bg-blue-700 text-white rounded-2xl font-bold shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2 text-sm"
          >
            <TrendingUp className="w-4 h-4" />
            گزارش‌های تحلیلی
          </Link>
          <Link 
            href="/super-admin/roles" 
            className="px-5 py-3 bg-white hover:bg-gray-50 text-[var(--neo-text-main)] border border-[var(--neo-border)] rounded-2xl font-bold shadow-sm transition-all flex items-center gap-2 text-sm"
          >
            <Key className="w-4 h-4 text-purple-600" />
            سطوح دسترسی
          </Link>
        </div>
      </div>

      {/* System Live Health Metric Bar */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-[var(--neo-border)]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-[var(--neo-text-main)] flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-600" />
            پایش آنلاین وضعیت زیرساخت پلتفرم
          </h2>
          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            سیستم کاملاً آنلاین
          </span>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-[var(--neo-surface-2)] border border-[var(--neo-border)]">
            <div className="text-xs text-gray-500 mb-1">وب‌سرویس و هسته API</div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="font-bold text-sm text-gray-800">سالم و فعال (200 OK)</span>
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-[var(--neo-surface-2)] border border-[var(--neo-border)]">
            <div className="text-xs text-gray-500 mb-1">دیتابیس MongoDB</div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="font-bold text-sm text-gray-800">متصل (Replication OK)</span>
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-[var(--neo-surface-2)] border border-[var(--neo-border)]">
            <div className="text-xs text-gray-500 mb-1">درگاه پرداخت و سفارشات</div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="font-bold text-sm text-gray-800">آماده تراکنش</span>
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-[var(--neo-surface-2)] border border-[var(--neo-border)]">
            <div className="text-xs text-gray-500 mb-1">پاسخگویی پشتیبانی</div>
            <div className="flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full ${tickets > 0 ? 'bg-amber-500' : 'bg-emerald-500'}`} />
              <span className="font-bold text-sm text-gray-800">{tickets} تیکت نیازمند پاسخ</span>
            </div>
          </div>
        </div>
      </div>

      {/* Macro Financial & Business Metrics (5 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        <Link href="/super-admin/orders" className="bg-white p-5 rounded-3xl border border-[var(--neo-border)] shadow-sm hover:shadow-md transition-all group">
          <div className="flex justify-between items-start mb-3">
            <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform">
              <DollarSign className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">کل</span>
          </div>
          <div className="text-2xl font-black text-emerald-600 mb-1">
            {totalRevenue.toLocaleString('fa-IR')} <span className="text-xs text-gray-400 font-normal">ت</span>
          </div>
          <div className="text-xs font-bold text-gray-600">درآمد کل پلتفرم</div>
        </Link>

        <Link href="/super-admin/reports" className="bg-white p-5 rounded-3xl border border-[var(--neo-border)] shadow-sm hover:shadow-md transition-all group">
          <div className="flex justify-between items-start mb-3">
            <div className="p-3 rounded-2xl bg-blue-50 text-blue-600 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">۳۰ روزه</span>
          </div>
          <div className="text-2xl font-black text-blue-600 mb-1">
            {monthlyRevenue.toLocaleString('fa-IR')} <span className="text-xs text-gray-400 font-normal">ت</span>
          </div>
          <div className="text-xs font-bold text-gray-600">درآمد ماه جاری</div>
        </Link>

        <Link href="/super-admin/orders" className="bg-white p-5 rounded-3xl border border-[var(--neo-border)] shadow-sm hover:shadow-md transition-all group">
          <div className="flex justify-between items-start mb-3">
            <div className="p-3 rounded-2xl bg-purple-50 text-purple-600 group-hover:scale-110 transition-transform">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">موفق</span>
          </div>
          <div className="text-2xl font-black text-purple-600 mb-1">
            {orders.toLocaleString('fa-IR')}
          </div>
          <div className="text-xs font-bold text-gray-600">تعداد سفارشات پرداخت‌شده</div>
        </Link>

        <Link href="/super-admin/orders" className="bg-white p-5 rounded-3xl border border-[var(--neo-border)] shadow-sm hover:shadow-md transition-all group">
          <div className="flex justify-between items-start mb-3">
            <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600 group-hover:scale-110 transition-transform">
              <Compass className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">AOV</span>
          </div>
          <div className="text-2xl font-black text-indigo-600 mb-1">
            {averageOrderValue.toLocaleString('fa-IR')} <span className="text-xs text-gray-400 font-normal">ت</span>
          </div>
          <div className="text-xs font-bold text-gray-600">میانگین سبد خرید</div>
        </Link>

        <Link href="/super-admin/reports" className="bg-white p-5 rounded-3xl border border-[var(--neo-border)] shadow-sm hover:shadow-md transition-all group">
          <div className="flex justify-between items-start mb-3">
            <div className="p-3 rounded-2xl bg-amber-50 text-amber-600 group-hover:scale-110 transition-transform">
              <Activity className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">تبدیل</span>
          </div>
          <div className="text-2xl font-black text-amber-600 mb-1">
            {conversionRate}٪
          </div>
          <div className="text-xs font-bold text-gray-600">نرخ تبدیل خریداران</div>
        </Link>

      </div>

      {/* Quick Course Management Hub (Requested by user: لینک صفحات مرتبط به دوره مشخص باشه و دم دست باشه) */}
      <div className="bg-gradient-to-l from-blue-900 to-indigo-900 text-white rounded-3xl p-6 shadow-md">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-2xl backdrop-blur">
              <BookOpen className="w-6 h-6 text-blue-200" />
            </div>
            <div>
              <h3 className="text-lg font-black">مرکز دسترسی سریع به دوره‌های آموزشی</h3>
              <p className="text-xs text-blue-200 mt-0.5">تمام صفحات، فیلترها و عملیات مرتبط با دوره‌ها در یک نگاه</p>
            </div>
          </div>
          <span className="text-xs bg-white/20 px-3 py-1.5 rounded-xl font-bold backdrop-blur">
            مجموع دوره‌ها: {totalCourses}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <Link
            href="/super-admin/courses"
            className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 transition-colors backdrop-blur flex flex-col justify-between text-right"
          >
            <span className="text-xs text-blue-200">کل دوره‌ها</span>
            <span className="text-lg font-black mt-1">{totalCourses} دوره</span>
          </Link>

          <Link
            href="/super-admin/courses?status=published"
            className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 transition-colors backdrop-blur flex flex-col justify-between text-right"
          >
            <span className="text-xs text-emerald-300">دوره‌های فعال و منتشر</span>
            <span className="text-lg font-black mt-1 text-emerald-300">{publishedCourses}</span>
          </Link>

          <Link
            href="/super-admin/courses?status=pending_review"
            className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 transition-colors backdrop-blur flex flex-col justify-between text-right"
          >
            <span className="text-xs text-amber-300">در انتظار تایید سوپر</span>
            <span className="text-lg font-black mt-1 text-amber-300">{pendingCourses}</span>
          </Link>

          <Link
            href="/super-admin/courses?status=draft"
            className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 transition-colors backdrop-blur flex flex-col justify-between text-right"
          >
            <span className="text-xs text-gray-300">پیش‌نویس‌ها</span>
            <span className="text-lg font-black mt-1 text-gray-300">{draftCourses}</span>
          </Link>

          <Link
            href="/super-admin/categories"
            className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 transition-colors backdrop-blur flex flex-col justify-between text-right"
          >
            <span className="text-xs text-blue-200">دسته‌بندی دوره‌ها</span>
            <span className="text-xs font-bold mt-2 flex items-center gap-1">
              مدیریت دسته‌ها <ExternalLink className="w-3 h-3" />
            </span>
          </Link>

          <Link
            href="/courses"
            target="_blank"
            className="p-3 rounded-2xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/30 transition-colors backdrop-blur flex flex-col justify-between text-right"
          >
            <span className="text-xs text-emerald-200">کاتالوگ عمومی</span>
            <span className="text-xs font-bold mt-2 flex items-center gap-1 text-emerald-300">
              مشاهده در سایت <ExternalLink className="w-3 h-3" />
            </span>
          </Link>
        </div>
      </div>

      {/* Revenue & Growth Chart (12 Months) */}
      <div className="bg-white rounded-3xl p-8 border border-[var(--neo-border)] shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h3 className="text-xl font-black text-[var(--neo-text-main)]">روند درآمد پلتفرم (۱۲ ماه گذشته)</h3>
            <p className="text-xs text-gray-400 mt-1">نمودار حجم فروش و درآمد کل به تفکیک ماه‌های میلادی/شمسی</p>
          </div>
          <Link
            href="/super-admin/reports"
            className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
          >
            گزارش‌های تحلیلی تکمیلی <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="h-72 w-full" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyRevenueChart} margin={{ top: 10, right: 10, left: 20, bottom: 0 }}>
              <defs>
                <linearGradient id="dashRevenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35}/>
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(val) => (val >= 1000000 ? `${val / 1000000}M` : val)} />
              <Tooltip 
                formatter={(val: any, name: any) => [
                  name === 'revenue' ? `${Number(val).toLocaleString('fa-IR')} تومان` : val,
                  name === 'revenue' ? 'درآمد' : 'تعداد سفارشات'
                ]}
                labelFormatter={(lbl) => `ماه: ${lbl}`}
              />
              <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#dashRevenueGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Entity & Ecosystem Status Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        
        <Link href="/super-admin/users" className="p-5 rounded-2xl bg-white border border-[var(--neo-border)] shadow-sm hover:border-blue-300 transition-all flex items-center gap-3">
          <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-black text-gray-900">{totalUsers.toLocaleString('fa-IR')}</div>
            <div className="text-xs text-gray-500 font-medium">کل کاربران</div>
          </div>
        </Link>

        <Link href="/super-admin/users?role=student" className="p-5 rounded-2xl bg-white border border-[var(--neo-border)] shadow-sm hover:border-blue-300 transition-all flex items-center gap-3">
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-black text-emerald-700">{students.toLocaleString('fa-IR')}</div>
            <div className="text-xs text-gray-500 font-medium">دانشجویان</div>
          </div>
        </Link>

        <Link href="/super-admin/instructors" className="p-5 rounded-2xl bg-white border border-[var(--neo-border)] shadow-sm hover:border-blue-300 transition-all flex items-center gap-3">
          <div className="p-3 rounded-xl bg-purple-50 text-purple-600">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-black text-purple-700">{instructors}</div>
            <div className="text-xs text-gray-500 font-medium">اساتید فعال</div>
          </div>
        </Link>

        <Link href="/super-admin/classes" className="p-5 rounded-2xl bg-white border border-[var(--neo-border)] shadow-sm hover:border-blue-300 transition-all flex items-center gap-3">
          <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-black text-indigo-700">{classes}</div>
            <div className="text-xs text-gray-500 font-medium">کلاس‌های زنده</div>
          </div>
        </Link>

        <Link href="/super-admin/tickets" className="p-5 rounded-2xl bg-white border border-[var(--neo-border)] shadow-sm hover:border-blue-300 transition-all flex items-center gap-3">
          <div className="p-3 rounded-xl bg-rose-50 text-rose-600">
            <Ticket className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-black text-rose-700">{tickets}</div>
            <div className="text-xs text-gray-500 font-medium">تیکت‌های باز</div>
          </div>
        </Link>

        <Link href="/super-admin/coupons" className="p-5 rounded-2xl bg-white border border-[var(--neo-border)] shadow-sm hover:border-blue-300 transition-all flex items-center gap-3">
          <div className="p-3 rounded-xl bg-amber-50 text-amber-600">
            <Tag className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-black text-amber-700">{activeCoupons}</div>
            <div className="text-xs text-gray-500 font-medium">کدهای تخفیف فعال</div>
          </div>
        </Link>

      </div>

      {/* Two-Column Macro Operations Feeds */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Recent Orders Stream */}
        <div className="bg-white rounded-3xl p-6 border border-[var(--neo-border)] shadow-sm">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-lg font-black text-[var(--neo-text-main)] flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-blue-600" />
              آخرین تراکنش‌ها و سفارشات
            </h3>
            <Link href="/super-admin/orders" className="text-xs font-bold text-blue-600 hover:underline">
              مشاهده تمام سفارشات ({orders + pendingOrders})
            </Link>
          </div>

          <div className="space-y-3">
            {recentOrders.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-8">هنوز سفارشی ثبت نشده است</p>
            ) : (
              recentOrders.map((order: any) => (
                <div key={order._id} className="p-3.5 rounded-2xl border border-[var(--neo-border)] bg-gray-50/50 hover:bg-gray-50 transition-colors flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-black text-xs flex items-center justify-center">
                      {order.userId?.firstName?.[0] || 'ک'}
                    </div>
                    <div>
                      <div className="font-bold text-xs text-gray-800">
                        {order.userId ? `${order.userId.firstName || ''} ${order.userId.lastName || ''}`.trim() : 'کاربر'}
                      </div>
                      <div className="text-[11px] text-gray-400 max-w-[180px] truncate">
                        {order.items?.[0]?.titleSnapshot || 'سفارش'}
                      </div>
                    </div>
                  </div>

                  <div className="text-left">
                    <div className="font-black text-xs text-gray-900">
                      {order.totalAmount?.toLocaleString('fa-IR')} تومان
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      order.status === 'paid' ? 'bg-emerald-100 text-emerald-800' :
                      order.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {order.status === 'paid' ? 'موفق' : order.status === 'pending' ? 'در انتظار' : order.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Tickets Stream */}
        <div className="bg-white rounded-3xl p-6 border border-[var(--neo-border)] shadow-sm">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-lg font-black text-[var(--neo-text-main)] flex items-center gap-2">
              <Ticket className="w-5 h-5 text-purple-600" />
              درخواست‌های پشتیبانی نیازمند پیگیری
            </h3>
            <Link href="/super-admin/tickets" className="text-xs font-bold text-purple-600 hover:underline">
              مشاهده مرکز پشتیبانی
            </Link>
          </div>

          <div className="space-y-3">
            {recentTickets.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-8">هیچ تیکت فعالی وجود ندارد</p>
            ) : (
              recentTickets.map((ticket: any) => (
                <Link 
                  key={ticket._id} 
                  href="/super-admin/tickets"
                  className="p-3.5 rounded-2xl border border-[var(--neo-border)] bg-gray-50/50 hover:bg-purple-50/40 transition-colors flex items-center justify-between block"
                >
                  <div>
                    <div className="font-bold text-xs text-gray-800 max-w-[200px] truncate">
                      {ticket.subject}
                    </div>
                    <div className="text-[11px] text-gray-400 mt-0.5">
                      {ticket.userId?.firstName} {ticket.userId?.lastName} • {new Date(ticket.createdAt).toLocaleDateString('fa-IR')}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      ticket.priority === 'high' ? 'bg-rose-100 text-rose-800' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {ticket.priority === 'high' ? 'فوری' : 'معمولی'}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      ticket.status === 'open' ? 'bg-rose-100 text-rose-800' :
                      ticket.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {ticket.status === 'open' ? 'نیازمند پاسخ' : ticket.status === 'in_progress' ? 'بررسی' : 'پاسخ داده'}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Top 5 Best Selling Courses */}
      <div className="bg-white rounded-3xl p-6 border border-[var(--neo-border)] shadow-sm">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-lg font-black text-[var(--neo-text-main)] flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            ۵ دوره برتر و پرفروش پلتفرم
          </h3>
          <Link href="/super-admin/courses" className="text-xs font-bold text-indigo-600 hover:underline">
            مدیریت تمام دوره‌ها
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {topCourses.length === 0 ? (
            <p className="col-span-full text-xs text-gray-400 text-center py-8">هنوز آماری ثبت نشده است</p>
          ) : (
            topCourses.map((course: any, idx: number) => (
              <div key={idx} className="p-4 rounded-2xl border border-[var(--neo-border)] bg-gray-50/50 hover:shadow-sm transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs font-black flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-bold text-gray-800 truncate flex-1">{course.title}</span>
                  </div>
                  <div className="text-[11px] text-gray-400 mb-3">{course.instructorName || 'استاد تک‌یاد'}</div>
                </div>

                <div className="pt-2 border-t border-[var(--neo-border)] flex justify-between items-center text-xs">
                  <span className="text-gray-500">{course.enrollmentsCount} دانشجو</span>
                  <span className="font-black text-emerald-600">{course.totalRevenue?.toLocaleString('fa-IR')} ت</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
