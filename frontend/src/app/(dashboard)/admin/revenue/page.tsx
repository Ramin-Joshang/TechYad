'use client';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/features/admin/api/admin.api';
import { Loader2, DollarSign, TrendingUp, CreditCard } from 'lucide-react';

export default function AdminRevenuePage() {
  
  const { data: revenueData, isLoading } = useQuery({
    queryKey: ['adminRevenue'],
    queryFn: () => adminApi.getRevenueStats().then(res => res.data?.data)
  });

  if (isLoading) {
    return <div className="flex justify-center p-20"><Loader2 className="w-10 h-10 animate-spin text-emerald-600" /></div>;
  }

  const { totalRevenue = 0, thisMonthRevenue = 0, ordersCount = 0 } = revenueData || {};

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl"><DollarSign className="w-6 h-6" /></div>
          <div>
            <h1 className="text-2xl font-black text-gray-900">گزارش مالی پلتفرم</h1>
            <p className="text-gray-500 mt-1">نمای کلی از درآمدهای کسب شده</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-start gap-4">
          <div className="p-4 bg-emerald-100 text-emerald-600 rounded-2xl shrink-0"><DollarSign className="w-6 h-6" /></div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">کل درآمد پلتفرم</p>
            <h3 className="text-2xl font-black text-gray-900">{totalRevenue.toLocaleString()} <span className="text-base text-gray-500 font-medium">تومان</span></h3>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-start gap-4">
          <div className="p-4 bg-blue-100 text-blue-600 rounded-2xl shrink-0"><TrendingUp className="w-6 h-6" /></div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">درآمد ماه جاری</p>
            <h3 className="text-2xl font-black text-gray-900">{thisMonthRevenue.toLocaleString()} <span className="text-base text-gray-500 font-medium">تومان</span></h3>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-start gap-4">
          <div className="p-4 bg-purple-100 text-purple-600 rounded-2xl shrink-0"><CreditCard className="w-6 h-6" /></div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">تعداد کل تراکنش‌های موفق</p>
            <h3 className="text-2xl font-black text-gray-900">{ordersCount} <span className="text-base text-gray-500 font-medium">تراکنش</span></h3>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 text-center mt-8">
        <DollarSign className="w-16 h-16 text-gray-200 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">نمودار درآمد (به زودی)</h3>
        <p className="text-gray-500 max-w-sm mx-auto">امکان مشاهده نمودار تفکیکی درآمد بر اساس دوره‌ها و بازه‌های زمانی مختلف در نسخه‌های بعدی اضافه خواهد شد.</p>
      </div>
    </div>
  );
}
