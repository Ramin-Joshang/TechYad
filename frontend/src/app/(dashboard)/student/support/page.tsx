'use client';

import { useQuery } from '@tanstack/react-query';
import { supportApi } from '@/features/support/api/support.api';
import { Ticket, Search, Loader2, Plus, Clock, MessageSquare, CheckCircle, ArrowLeft, Tag } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function SupportTicketsPage() {
  const [search, setSearch] = useState('');
  
  const { data: ticketsData, isLoading } = useQuery({
    queryKey: ['myTickets'],
    queryFn: () => supportApi.getMyTickets().then(res => res.data)
  });

  const tickets = ticketsData || [];
  
  const filteredTickets = tickets.filter((ticket: any) => 
    ticket.subject?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 mb-2 flex items-center gap-3">
            <Ticket className="w-8 h-8 text-indigo-500" />
            تیکت‌های پشتیبانی
          </h1>
          <p className="text-gray-500">پیگیری سوالات و مشکلات با تیم پشتیبانی.</p>
        </div>
        <Link 
          href="/student/support/new" 
          className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-600/20 w-full md:w-auto"
        >
          <Plus className="w-5 h-5" />
          ایجاد تیکت جدید
        </Link>
      </div>

      <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
        <div className="relative w-full">
          <Search className="w-5 h-5 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2" />
          <input 
            type="text"
            placeholder="جستجوی عنوان تیکت..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
          <p className="text-gray-500">در حال بارگذاری تیکت‌ها...</p>
        </div>
      ) : filteredTickets.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-gray-100 shadow-sm flex flex-col items-center justify-center">
          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
            <Ticket className="w-12 h-12 text-gray-300" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">هنوز هیچ تیکتی ندارید</h3>
          <p className="text-gray-500 mb-8 max-w-sm mx-auto">برای ارتباط با پشتیبانی، یک تیکت جدید ایجاد کنید.</p>
          <Link 
            href="/student/support/new" 
            className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition"
          >
            <Plus className="w-5 h-5" />
            ایجاد تیکت جدید
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="py-4 px-6 font-bold text-gray-700 text-sm">موضوع</th>
                  <th className="py-4 px-6 font-bold text-gray-700 text-sm">دپارتمان</th>
                  <th className="py-4 px-6 font-bold text-gray-700 text-sm">اولویت</th>
                  <th className="py-4 px-6 font-bold text-gray-700 text-sm">وضعیت</th>
                  <th className="py-4 px-6 font-bold text-gray-700 text-sm">تاریخ ثبت</th>
                  <th className="py-4 px-6 font-bold text-gray-700 text-sm">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredTickets.map((ticket: any) => {
                  return (
                    <tr key={ticket._id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="py-4 px-6">
                        <div className="font-bold text-gray-900">{ticket.subject}</div>
                      </td>
                      <td className="py-4 px-6 text-gray-600 font-medium text-sm">
                        <div className="flex items-center gap-1.5 bg-gray-100 w-fit px-2.5 py-1 rounded-md">
                          <Tag className="w-3.5 h-3.5" />
                          {ticket.category === 'technical' ? 'فنی' : 
                           ticket.category === 'financial' ? 'مالی' : 'عمومی'}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${
                          ticket.priority === 'high' ? 'bg-red-100 text-red-700' :
                          ticket.priority === 'medium' ? 'bg-amber-100 text-amber-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {ticket.priority === 'high' ? 'زیاد' : ticket.priority === 'medium' ? 'متوسط' : 'کم'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                          ticket.status === 'closed' ? 'bg-gray-100 text-gray-600' :
                          ticket.status === 'answered' ? 'bg-emerald-100 text-emerald-700' :
                          ticket.status === 'in_progress' ? 'bg-purple-100 text-purple-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {ticket.status === 'closed' ? <CheckCircle className="w-3.5 h-3.5" /> : 
                           ticket.status === 'answered' ? <MessageSquare className="w-3.5 h-3.5" /> :
                           <Clock className="w-3.5 h-3.5" />}
                          {ticket.status === 'closed' ? 'بسته شده' : 
                           ticket.status === 'answered' ? 'پاسخ داده شده' : 
                           ticket.status === 'in_progress' ? 'در حال بررسی' : 'باز (جدید)'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-sm text-gray-500 font-medium">
                           {new Date(ticket.createdAt).toLocaleDateString('fa-IR')}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <Link href={`/student/support/${ticket._id}`} className="inline-flex items-center gap-1 text-sm font-bold text-indigo-600 hover:text-indigo-700 transition">
                          مشاهده
                          <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
