'use client';

import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/features/admin/api/admin.api';
import { Loader2, DollarSign, TrendingUp, CreditCard, BarChart } from 'lucide-react';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminRevenuePage() {
  
  const { data: revenueData, isLoading } = useQuery({
    queryKey: ['adminRevenue'],
    queryFn: () => adminApi.getRevenueStats().then(res => res.data)
  });

  if (isLoading) {
    return <div className="flex justify-center p-20"><Loader2 className="w-10 h-10 animate-spin text-emerald-600" /></div>;
  }

  const { totalRevenue = 0, thisMonthRevenue = 0, ordersCount = 0, chartData = [] } = revenueData || {};

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-center bg-[var(--neo-surface)] p-6 rounded-3xl shadow-sm border border-[var(--neo-border)]">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-100 text-emerald-600 rounded-2xl"><DollarSign className="w-6 h-6" /></div>
          <div>
            <h1 className="text-2xl font-black text-[var(--neo-text-main)]">گزارش مالی پلتفرم</h1>
            <p className="text-[var(--neo-text-secondary)] mt-1 text-sm">نمای کلی از درآمدهای کسب شده و تراکنش‌ها</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[var(--neo-surface)] p-6 rounded-3xl shadow-sm border border-[var(--neo-border)] flex items-center gap-5 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-50 rounded-full group-hover:scale-110 transition-transform -z-10"></div>
          <div className="p-4 bg-emerald-100 text-emerald-600 rounded-2xl shrink-0"><DollarSign className="w-7 h-7" /></div>
          <div>
            <p className="text-sm font-bold text-[var(--neo-text-secondary)] mb-1">کل درآمد پلتفرم</p>
            <h3 className="text-2xl font-black text-[var(--neo-text-main)]">{totalRevenue.toLocaleString()} <span className="text-sm text-[var(--neo-text-secondary)] font-medium">تومان</span></h3>
          </div>
        </div>
        
        <div className="bg-[var(--neo-surface)] p-6 rounded-3xl shadow-sm border border-[var(--neo-border)] flex items-center gap-5 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-[var(--neo-primary)]/10 rounded-full group-hover:scale-110 transition-transform -z-10"></div>
          <div className="p-4 bg-blue-100 text-[var(--neo-primary)] rounded-2xl shrink-0"><TrendingUp className="w-7 h-7" /></div>
          <div>
            <p className="text-sm font-bold text-[var(--neo-text-secondary)] mb-1">درآمد ماه جاری</p>
            <h3 className="text-2xl font-black text-[var(--neo-text-main)]">{thisMonthRevenue.toLocaleString()} <span className="text-sm text-[var(--neo-text-secondary)] font-medium">تومان</span></h3>
          </div>
        </div>
        
        <div className="bg-[var(--neo-surface)] p-6 rounded-3xl shadow-sm border border-[var(--neo-border)] flex items-center gap-5 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-50 rounded-full group-hover:scale-110 transition-transform -z-10"></div>
          <div className="p-4 bg-purple-100 text-purple-600 rounded-2xl shrink-0"><CreditCard className="w-7 h-7" /></div>
          <div>
            <p className="text-sm font-bold text-[var(--neo-text-secondary)] mb-1">کل تراکنش‌های موفق</p>
            <h3 className="text-2xl font-black text-[var(--neo-text-main)]">{ordersCount} <span className="text-sm text-[var(--neo-text-secondary)] font-medium">تراکنش</span></h3>
          </div>
        </div>
      </div>

      <div className="bg-[var(--neo-surface)] rounded-3xl shadow-sm border border-[var(--neo-border)] p-8">
        <div className="flex items-center gap-2 mb-8">
          <BarChart className="w-5 h-5 text-[var(--neo-text-muted)]" />
          <h3 className="text-lg font-bold text-[var(--neo-text-main)]">نمودار درآمد ماه‌های اخیر (تخمینی)</h3>
        </div>
        <div className="h-80 w-full" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsBarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dx={-10} tickFormatter={(val) => `${(val/1000000).toFixed(0)}M`} />
              <Tooltip 
                cursor={{ fill: '#F3F4F6' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                formatter={(value: any) => [`${value?.toLocaleString() || 0} تومان`, 'درآمد']}
              />
              <Bar dataKey="revenue" fill="#10B981" radius={[6, 6, 0, 0]} maxBarSize={50} />
            </RechartsBarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
