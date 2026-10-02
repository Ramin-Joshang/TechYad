'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { 
  Loader2, DollarSign, TrendingUp, Calendar, CreditCard, 
  ArrowDownRight, BookOpen, GraduationCap, Filter, CheckCircle2
} from 'lucide-react';

export default function InstructorSalesPage() {
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [activeTab, setActiveTab] = useState<'all' | 'course' | 'class'>('all');

  const { data, isLoading } = useQuery({
    queryKey: ['instructor-sales', month, year],
    queryFn: () => api.get('/instructor/sales', { params: { month, year } }).then(res => res.data)
  });

  const sales = data?.sales || [];
  const coursesRevenue = data?.coursesRevenue || 0;
  const classesRevenue = data?.classesRevenue || 0;
  const totalSales = data?.totalSales || 0;
  const netEarnings = data?.netInstructorEarnings || data?.instructorShare || Math.round(totalSales * 0.7);

  // Filter sales list by active tab
  const filteredSales = activeTab === 'all' 
    ? sales 
    : sales.filter((s: any) => {
        return s.items?.some((i: any) => i.itemType === activeTab);
      });

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16 animate-in fade-in duration-300">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-[var(--neo-border)] shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-slate-900">گزارش جامع درآمد و فروش (دوره‌ها و کلاس‌ها)</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            مشاهده شفاف تفکیک درآمد شما از دوره‌های ویدیویی و کلاس‌های آنلاین/حضوری (سهم ۷۰٪ استاد)
          </p>
        </div>
        
        {/* Date Filter */}
        <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-200 shadow-2xs">
          <Calendar className="w-4 h-4 text-slate-400 mr-1" />
          <select 
            value={month} 
            onChange={e => setMonth(Number(e.target.value))}
            className="bg-transparent border-none focus:ring-0 text-xs sm:text-sm font-bold text-slate-800 outline-none pr-6 cursor-pointer"
          >
            {[...Array(12)].map((_, i) => (
              <option key={i} value={i + 1}>ماه {i + 1}</option>
            ))}
          </select>
          <div className="w-px h-5 bg-slate-200"></div>
          <select 
            value={year} 
            onChange={e => setYear(Number(e.target.value))}
            className="bg-transparent border-none focus:ring-0 text-xs sm:text-sm font-bold text-slate-800 outline-none pr-6 cursor-pointer"
          >
            {[2024, 2025, 2026].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-indigo-600 gap-3">
          <Loader2 className="w-10 h-10 animate-spin" />
          <span className="text-xs font-bold text-slate-400">در حال محاسبه درآمد و تراکنش‌های دوره و کلاس...</span>
        </div>
      ) : (
        <>
          {/* Revenue Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Total Earnings */}
            <div className="bg-white p-5 rounded-3xl border border-[var(--neo-border)] shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400">سهم خالص شما (۷۰٪)</p>
                <h3 className="text-xl font-black text-slate-900 font-mono mt-0.5">
                  {netEarnings.toLocaleString('fa-IR')} <span className="text-xs font-normal">تومان</span>
                </h3>
                <span className="text-[10px] text-emerald-600 font-medium">از کل فروش {totalSales.toLocaleString('fa-IR')}</span>
              </div>
            </div>

            {/* Courses Revenue */}
            <div className="bg-white p-5 rounded-3xl border border-[var(--neo-border)] shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400">درآمد حاصل از دوره‌ها</p>
                <h3 className="text-xl font-black text-blue-600 font-mono mt-0.5">
                  {Math.round(coursesRevenue * 0.7).toLocaleString('fa-IR')} <span className="text-xs font-normal">تومان</span>
                </h3>
                <span className="text-[10px] text-slate-400">فروش ناخالص: {coursesRevenue.toLocaleString('fa-IR')}</span>
              </div>
            </div>

            {/* Classes Revenue */}
            <div className="bg-white p-5 rounded-3xl border border-[var(--neo-border)] shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center shrink-0">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400">درآمد حاصل از کلاس‌ها</p>
                <h3 className="text-xl font-black text-purple-600 font-mono mt-0.5">
                  {Math.round(classesRevenue * 0.7).toLocaleString('fa-IR')} <span className="text-xs font-normal">تومان</span>
                </h3>
                <span className="text-[10px] text-slate-400">فروش ناخالص: {classesRevenue.toLocaleString('fa-IR')}</span>
              </div>
            </div>

            {/* Total Orders / Enrollments */}
            <div className="bg-white p-5 rounded-3xl border border-[var(--neo-border)] shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center shrink-0">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400">تعداد کل تراکنش‌ها</p>
                <h3 className="text-xl font-black text-slate-900 font-mono mt-0.5">
                  {sales.length.toLocaleString('fa-IR')} <span className="text-xs font-normal">تراکنش</span>
                </h3>
                <span className="text-[10px] text-slate-400">ثبت‌نام‌های پرداخت‌شده</span>
              </div>
            </div>

          </div>

          {/* Transactions Section */}
          <div className="bg-white rounded-3xl shadow-xs border border-[var(--neo-border)] overflow-hidden">
            
            {/* Table Header and Tabs */}
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">ریز تراکنش‌ها و فروش‌های ثبت‌شده</h2>
                <p className="text-xs text-slate-400 mt-0.5">شامل ثبت‌نام دوره‌های ویدیویی و ثبت‌نام‌های نقدی و بیعانه‌ای کلاس‌ها</p>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-2xl border border-slate-200">
                {[
                  { id: 'all', label: 'همه تراکنش‌ها' },
                  { id: 'course', label: '📚 فقط دوره‌ها' },
                  { id: 'class', label: '🏫 فقط کلاس‌ها' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      activeTab === tab.id
                        ? 'bg-slate-900 text-white shadow-2xs'
                        : 'text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
            
            {filteredSales.length === 0 ? (
              <div className="p-16 text-center text-slate-500 space-y-2">
                <CreditCard className="w-12 h-12 mx-auto text-slate-300" />
                <h3 className="font-bold text-base text-slate-800">هیچ تراکنشی در این بازه زمانی یافت نشد</h3>
                <p className="text-xs text-slate-400">می‌توانید ماه یا سال دیگری را برای مشاهده انتخاب کنید.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-50/80 text-slate-600 font-bold border-b border-slate-100">
                    <tr>
                      <th className="p-4">دانشجو / خریدار</th>
                      <th className="p-4">عنوان و نوع آموزش</th>
                      <th className="p-4">تاریخ تراکنش</th>
                      <th className="p-4">مبلغ کل پرداخت</th>
                      <th className="p-4 text-left">سهم شما (۷۰٪)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredSales.map((sale: any) => {
                      const user = sale.userId;
                      const studentName = user 
                        ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email 
                        : 'دانشجو';

                      return (
                        <tr key={sale._id} className="hover:bg-slate-50/70 transition-colors">
                          
                          {/* Student */}
                          <td className="p-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold overflow-hidden shrink-0 border border-indigo-100">
                                {user?.avatar ? (
                                  <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                  user?.firstName?.charAt(0) || 'U'
                                )}
                              </div>
                              <div>
                                <div className="font-bold text-slate-900 text-sm">
                                  {studentName}
                                </div>
                                <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                                  {user?.email || '-'}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Item(s) */}
                          <td className="p-4">
                            <div className="space-y-1">
                              {sale.items?.map((item: any, idx: number) => {
                                const isClass = item.itemType === 'class';
                                return (
                                  <div key={idx} className="flex items-center gap-2">
                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold border ${
                                      isClass 
                                        ? 'bg-purple-50 text-purple-700 border-purple-200' 
                                        : 'bg-blue-50 text-blue-700 border-blue-200'
                                    }`}>
                                      {isClass ? <GraduationCap className="w-3 h-3" /> : <BookOpen className="w-3 h-3" />}
                                      {isClass ? 'کلاس آموزشی' : 'دوره آموزشی'}
                                    </span>
                                    <span className="font-bold text-slate-800 text-xs">
                                      {item.title || item.titleSnapshot || 'عنوان دوره/کلاس'}
                                    </span>
                                    {item.paymentType === 'deposit' && (
                                      <span className="text-[9px] bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded-md font-bold">
                                        بیعانه
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </td>

                          {/* Date */}
                          <td className="p-4 whitespace-nowrap text-slate-500 font-medium">
                            <div>{new Date(sale.createdAt).toLocaleDateString('fa-IR')}</div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {new Date(sale.createdAt).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </td>

                          {/* Total Paid */}
                          <td className="p-4 whitespace-nowrap font-bold text-slate-700 font-mono">
                            {sale.total?.toLocaleString('fa-IR')} تومان
                          </td>

                          {/* Instructor Share */}
                          <td className="p-4 whitespace-nowrap text-left">
                            <div className="inline-flex items-center gap-1 font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-100 font-mono">
                              <ArrowDownRight className="w-3.5 h-3.5" />
                              {sale.instructorShare?.toLocaleString('fa-IR')} تومان
                            </div>
                          </td>

                        </tr>
                      );
                    })}
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
