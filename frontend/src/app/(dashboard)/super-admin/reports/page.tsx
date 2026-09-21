'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/features/admin/api/admin.api';
import { 
  BarChart3, TrendingUp, DollarSign, ShoppingBag, 
  Percent, ArrowUpRight, ArrowDownRight, Loader2, 
  Calendar, Download, BookOpen, Video, Tag, Award, Printer
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, BarChart, Bar, 
  PieChart, Pie, Cell, Legend
} from 'recharts';

export default function SuperAdminReportsPage() {
  const [dateRange, setDateRange] = useState('12m');

  const { data: reportData, isLoading } = useQuery({
    queryKey: ['superAdminComprehensiveReports'],
    queryFn: async () => {
      const res = await adminApi.getComprehensiveReports();
      return res?.data || res;
    }
  });

  if (isLoading || !reportData) {
    return (
      <div className="flex flex-col items-center justify-center p-24 gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-[var(--neo-primary)]" />
        <p className="text-gray-500 font-bold">در حال پردازش گزارش‌های جامع کلان پلتفرم...</p>
      </div>
    );
  }

  const {
    revenueSummary,
    monthlyPerformance = [],
    dailyPerformance = [],
    revenueByItemType = { courses: 0, classes: 0 },
    topCourses = [],
    topClasses = [],
    topCoupons = [],
    orderStatusCounts = {}
  } = reportData;

  const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  const itemTypeData = [
    { name: 'دوره‌های آموزشی', value: revenueByItemType.courses || 0, color: '#2563eb' },
    { name: 'کلاس‌های زنده و وبینارها', value: revenueByItemType.classes || 0, color: '#10b981' }
  ];

  const statusDistributionData = [
    { name: 'پرداخت موفق', value: orderStatusCounts.paid || 0, color: '#10b981' },
    { name: 'در انتظار پرداخت', value: orderStatusCounts.pending || 0, color: '#f59e0b' },
    { name: 'مرجوع شده', value: orderStatusCounts.refunded || 0, color: '#8b5cf6' },
    { name: 'ناموفق', value: orderStatusCounts.failed || 0, color: '#ef4444' }
  ].filter(d => d.value > 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header Banner */}
      <div className="bg-[var(--neo-surface)] border border-[var(--neo-border)] rounded-3xl p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden print:hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-2xl">
              <BarChart3 className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-[var(--neo-text-main)]">گزارش‌های جامع و هوش تجاری</h1>
              <p className="text-[var(--neo-text-secondary)] text-sm mt-1">تحلیل عمقی جریان‌های درآمدی، عملکرد محتوا، کمپین‌ها و نرخ تبدیل</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="px-5 py-3 bg-[var(--neo-surface-2)] hover:bg-gray-200 text-[var(--neo-text-main)] border border-[var(--neo-border)] rounded-2xl font-bold transition-all flex items-center gap-2 shadow-sm text-sm cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            چاپ گزارش
          </button>
        </div>
      </div>

      {/* Top Level Financial Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Revenue */}
        <div className="bg-white p-6 rounded-3xl border border-[var(--neo-border)] shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
              <DollarSign className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              درآمد خالص
            </span>
          </div>
          <div className="text-3xl font-black text-emerald-600 mb-1">
            {revenueSummary?.totalRevenue?.toLocaleString('fa-IR')} <span className="text-xs text-gray-500 font-normal">تومان</span>
          </div>
          <div className="text-xs text-gray-500 font-medium">مجموع درآمد تایید شده پلتفرم</div>
        </div>

        {/* This Month's Revenue */}
        <div className="bg-white p-6 rounded-3xl border border-[var(--neo-border)] shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
              <Calendar className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full">
              ماه جاری
            </span>
          </div>
          <div className="text-3xl font-black text-blue-600 mb-1">
            {revenueSummary?.thisMonthRevenue?.toLocaleString('fa-IR')} <span className="text-xs text-gray-500 font-normal">تومان</span>
          </div>
          <div className="text-xs text-gray-500 font-medium">درآمد کسب شده در ۳۰ روز اخیر</div>
        </div>

        {/* Average Order Value (AOV) */}
        <div className="bg-white p-6 rounded-3xl border border-[var(--neo-border)] shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full">
              {revenueSummary?.totalPaidOrders || 0} سفارش
            </span>
          </div>
          <div className="text-3xl font-black text-purple-700 mb-1">
            {revenueSummary?.averageOrderValue?.toLocaleString('fa-IR')} <span className="text-xs text-gray-500 font-normal">تومان</span>
          </div>
          <div className="text-xs text-gray-500 font-medium">میانگین ارزش هر سبد خرید</div>
        </div>

        {/* Conversion Rate */}
        <div className="bg-white p-6 rounded-3xl border border-[var(--neo-border)] shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
              <Percent className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full">
              نرخ تبدیل
            </span>
          </div>
          <div className="text-3xl font-black text-amber-600 mb-1">
            {revenueSummary?.conversionRate || 0}٪
          </div>
          <div className="text-xs text-gray-500 font-medium">درصد خریداران از کل کاربران ثبت‌نامی</div>
        </div>

      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 12-Month Performance Trend Chart */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-8 border border-[var(--neo-border)] shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-black text-[var(--neo-text-main)]">روند درآمد ماهانه پلتفرم</h3>
              <p className="text-xs text-gray-400 mt-1">نمودار درآمد (تومان) و تعداد سفارشات در ماه‌های اخیر</p>
            </div>
          </div>

          <div className="h-80 w-full" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyPerformance} margin={{ top: 10, right: 10, left: 20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(val) => (val >= 1000000 ? `${val / 1000000}M` : val)} />
                <Tooltip 
                  formatter={(val: any, name: any) => [
                    name === 'revenue' ? `${Number(val).toLocaleString('fa-IR')} تومان` : val,
                    name === 'revenue' ? 'درآمد' : 'سفارشات'
                  ]}
                  labelFormatter={(lbl) => `دوره: ${lbl}`}
                />
                <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue Distribution by Item Type */}
        <div className="bg-white rounded-3xl p-8 border border-[var(--neo-border)] shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-black text-[var(--neo-text-main)] mb-1">سهم درآمدی خدمات</h3>
            <p className="text-xs text-gray-400 mb-6">مقایسه فروش دوره‌های آموزشی با کلاس‌های آنلاین</p>

            <div className="h-56 w-full" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={itemTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {itemTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val: any) => `${Number(val).toLocaleString('fa-IR')} تومان`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-[var(--neo-border)]">
            {itemTypeData.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="font-bold text-gray-700">{item.name}</span>
                </div>
                <span className="font-black text-gray-900">{item.value.toLocaleString('fa-IR')} تومان</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Daily 30-Day Revenue Trend */}
      <div className="bg-white rounded-3xl p-8 border border-[var(--neo-border)] shadow-sm">
        <h3 className="text-xl font-black text-[var(--neo-text-main)] mb-1">فروش روزانه ۳۰ روز اخیر</h3>
        <p className="text-xs text-gray-400 mb-6">روند درآمد حاصله در طول هر روز کاری</p>

        <div className="h-64 w-full" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyPerformance} margin={{ top: 10, right: 10, left: 20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={(val) => (val >= 1000000 ? `${val / 1000000}M` : val)} />
              <Tooltip 
                formatter={(val: any) => [`${Number(val).toLocaleString('fa-IR')} تومان`, 'درآمد']}
                labelFormatter={(lbl) => `روز: ${lbl}`}
              />
              <Bar dataKey="revenue" fill="#10b981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Ranking Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Top Selling Courses */}
        <div className="bg-white rounded-3xl p-6 border border-[var(--neo-border)] shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-black text-[var(--neo-text-main)]">پرفروش‌ترین دوره‌ها</h3>
          </div>

          <div className="space-y-3">
            {topCourses.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-6">داده‌ای ثبت نشده است</p>
            ) : (
              topCourses.map((course: any, idx: number) => (
                <div key={idx} className="p-3.5 rounded-2xl border border-[var(--neo-border)] bg-gray-50/50 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-black text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="font-bold text-xs text-gray-800 max-w-[150px] truncate">{course.title}</div>
                      <div className="text-[11px] text-gray-400">{course.enrollmentsCount} دانشجو</div>
                    </div>
                  </div>
                  <div className="text-left font-black text-xs text-emerald-600">
                    {course.totalRevenue?.toLocaleString('fa-IR')} تومان
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Selling Classes */}
        <div className="bg-white rounded-3xl p-6 border border-[var(--neo-border)] shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <Video className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-black text-[var(--neo-text-main)]">پرفروش‌ترین کلاس‌ها</h3>
          </div>

          <div className="space-y-3">
            {topClasses.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-6">داده‌ای ثبت نشده است</p>
            ) : (
              topClasses.map((cls: any, idx: number) => (
                <div key={idx} className="p-3.5 rounded-2xl border border-[var(--neo-border)] bg-gray-50/50 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-black text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="font-bold text-xs text-gray-800 max-w-[150px] truncate">{cls.title}</div>
                      <div className="text-[11px] text-gray-400">{cls.enrollmentsCount} ثبت‌نام</div>
                    </div>
                  </div>
                  <div className="text-left font-black text-xs text-emerald-600">
                    {cls.totalRevenue?.toLocaleString('fa-IR')} تومان
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Coupons Performance */}
        <div className="bg-white rounded-3xl p-6 border border-[var(--neo-border)] shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
              <Tag className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-black text-[var(--neo-text-main)]">مؤثرترین کدهای تخفیف</h3>
          </div>

          <div className="space-y-3">
            {topCoupons.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-6">داده‌ای ثبت نشده است</p>
            ) : (
              topCoupons.map((coupon: any, idx: number) => (
                <div key={idx} className="p-3.5 rounded-2xl border border-[var(--neo-border)] bg-gray-50/50 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 font-black text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="font-bold text-xs font-mono text-purple-800">{coupon.code}</div>
                      <div className="text-[11px] text-gray-400">{coupon.usageCount} بار استفاده</div>
                    </div>
                  </div>
                  <div className="text-left font-black text-xs text-purple-700">
                    {coupon.totalDiscountGiven?.toLocaleString('fa-IR')} تومان
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
