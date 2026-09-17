'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Loader2, DollarSign, TrendingUp, Calendar, CreditCard, ArrowDownRight } from 'lucide-react';

export default function InstructorSalesPage() {
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  const { data, isLoading } = useQuery({
    queryKey: ['instructor-sales', month, year],
    queryFn: () => api.get('/instructor/sales', { params: { month, year } }).then(res => res.data)
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">گزارش مالی و فروش</h1>
          <p className="text-gray-500 mt-1">مشاهده درآمد شما از دوره‌ها و کلاس‌ها (سهم ۷۰٪)</p>
        </div>
        
        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-gray-200 shadow-sm">
          <select 
            value={month} onChange={e => setMonth(Number(e.target.value))}
            className="bg-transparent border-none focus:ring-0 text-sm font-bold text-gray-700 outline-none pr-8 cursor-pointer"
          >
            {[...Array(12)].map((_, i) => (
              <option key={i} value={i + 1}>ماه {i + 1}</option>
            ))}
          </select>
          <div className="w-px h-6 bg-gray-200"></div>
          <select 
            value={year} onChange={e => setYear(Number(e.target.value))}
            className="bg-transparent border-none focus:ring-0 text-sm font-bold text-gray-700 outline-none pr-8 cursor-pointer"
          >
            {[2024, 2025, 2026].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 flex justify-center text-blue-600"><Loader2 className="w-10 h-10 animate-spin" /></div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-5">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0">
                <DollarSign className="w-7 h-7" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">درآمد این ماه (سهم شما)</p>
                <h3 className="text-2xl font-black text-gray-900">{data?.totalSales?.toLocaleString() || 0} تومان</h3>
              </div>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-5">
              <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
                <CreditCard className="w-7 h-7" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">تعداد فروش این ماه</p>
                <h3 className="text-2xl font-black text-gray-900">{data?.sales?.length || 0} تراکنش</h3>
              </div>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-5">
              <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center shrink-0">
                <TrendingUp className="w-7 h-7" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">وضعیت تسویه</p>
                <h3 className="text-2xl font-black text-gray-900">پرداخت نشده</h3>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mt-8">
            <div className="p-6 border-b border-gray-50">
              <h2 className="text-lg font-bold text-gray-900">لیست تراکنش‌های اخیر</h2>
            </div>
            
            {!data?.sales?.length ? (
              <div className="p-12 text-center text-gray-500 font-medium">هیچ فروشی در این بازه زمانی یافت نشد.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right">
                  <thead>
                    <tr className="bg-gray-50/50">
                      <th className="p-4 font-bold text-gray-600 text-sm">خریدار</th>
                      <th className="p-4 font-bold text-gray-600 text-sm">آیتم خریداری شده</th>
                      <th className="p-4 font-bold text-gray-600 text-sm">تاریخ</th>
                      <th className="p-4 font-bold text-gray-600 text-sm">مبلغ کل</th>
                      <th className="p-4 font-bold text-gray-600 text-sm text-left">سهم شما (۷۰٪)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.sales.map((sale: any) => (
                      <tr key={sale._id} className="border-t border-gray-50 hover:bg-gray-50/50 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold overflow-hidden shrink-0">
                              {sale.userId?.avatar ? (
                                <img src={sale.userId.avatar} alt="Avatar" className="w-full h-full object-cover" />
                              ) : (
                                sale.userId?.firstName?.charAt(0) || 'U'
                              )}
                            </div>
                            <div className="font-bold text-gray-900">
                              {sale.userId?.firstName} {sale.userId?.lastName}
                            </div>
                          </div>
                        </td>
                        <td className="p-4 font-medium text-gray-700">
                          {sale.items.map((item: any, idx: number) => (
                            <div key={idx}>{item.titleSnapshot}</div>
                          ))}
                        </td>
                        <td className="p-4 font-medium text-gray-600">
                          {new Date(sale.createdAt).toLocaleDateString('fa-IR')}
                        </td>
                        <td className="p-4 font-bold text-gray-500">
                          {sale.total.toLocaleString()} تومان
                        </td>
                        <td className="p-4 font-black text-emerald-600 text-left flex items-center justify-end gap-1">
                          <ArrowDownRight className="w-4 h-4" />
                          {sale.instructorShare.toLocaleString()} تومان
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
