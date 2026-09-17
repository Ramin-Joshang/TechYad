'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/features/admin/api/admin.api';
import { Loader2, Search, Ticket, MessageSquare, CheckCircle, Clock } from 'lucide-react';

export default function AdminTicketsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  
  const { data: ticketsData, isLoading } = useQuery({
    queryKey: ['adminTickets'],
    queryFn: () => adminApi.getTickets().then(res => res.data)
  });

  const updateStatusMutation = useMutation({
    mutationFn: (data: { id: string, status: string }) => adminApi.updateTicketStatus(data.id, data.status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminTickets'] })
  });

  const tickets = ticketsData?.tickets || [];
  const filteredTickets = tickets.filter((t: any) => 
    t.subject?.toLowerCase().includes(search.toLowerCase()) || 
    (t.userId?.firstName + ' ' + t.userId?.lastName).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-rose-100 text-rose-600 rounded-xl"><Ticket className="w-6 h-6" /></div>
          <div>
            <h1 className="text-2xl font-black text-gray-900">تیکت‌های پشتیبانی</h1>
            <p className="text-gray-500 mt-1">پاسخگویی به درخواست‌ها و مشکلات کاربران</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="relative max-w-md">
          <Search className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text"
            placeholder="جستجو در موضوع یا نام فرستنده..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-4 pr-10 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none"
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-rose-600" /></div>
        ) : filteredTickets.length === 0 ? (
           <div className="p-12 text-center text-gray-500 font-medium">تیکتی برای نمایش وجود ندارد.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredTickets.map((ticket: any) => (
              <div key={ticket._id} className="p-6 hover:bg-gray-50/50 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                      {ticket.userId?.firstName?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">{ticket.subject}</h3>
                      <p className="text-sm font-medium text-gray-500">
                        ارسال شده توسط {ticket.userId?.firstName} {ticket.userId?.lastName} • {new Date(ticket.createdAt).toLocaleDateString('fa-IR')}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    ticket.status === 'open' ? 'bg-rose-100 text-rose-700' :
                    ticket.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {ticket.status === 'open' ? 'باز' : ticket.status === 'in_progress' ? 'در حال بررسی' : 'بسته شده'}
                  </span>
                </div>
                
                <p className="text-gray-700 bg-gray-50 p-4 rounded-xl border border-gray-100 mb-4 text-sm leading-relaxed">
                  {ticket.message}
                </p>
                
                <div className="flex items-center gap-3">
                  {ticket.status !== 'closed' && (
                    <button 
                      onClick={() => updateStatusMutation.mutate({ id: ticket._id, status: 'closed' })}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg text-sm transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" />
                      بستن تیکت
                    </button>
                  )}
                  {ticket.status === 'open' && (
                    <button 
                      onClick={() => updateStatusMutation.mutate({ id: ticket._id, status: 'in_progress' })}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold rounded-lg text-sm transition-colors"
                    >
                      <Clock className="w-4 h-4" />
                      در حال بررسی
                    </button>
                  )}
                  {/* Real app would have a modal/drawer to send a message back */}
                  <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-sm text-sm transition-colors">
                    <MessageSquare className="w-4 h-4" />
                    ارسال پاسخ
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
