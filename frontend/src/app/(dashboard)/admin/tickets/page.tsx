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
            <h1 className="text-2xl font-black text-[var(--neo-text-main)]">تیکت‌های پشتیبانی</h1>
            <p className="text-[var(--neo-text-secondary)] mt-1">پاسخگویی به درخواست‌ها و مشکلات کاربران</p>
          </div>
        </div>
      </div>

      <div className="bg-[var(--neo-surface)] rounded-2xl shadow-sm border border-[var(--neo-border)] p-4">
        <div className="relative max-w-md">
          <Search className="w-5 h-5 text-[var(--neo-text-muted)] absolute right-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text"
            placeholder="جستجو در موضوع یا نام فرستنده..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-4 pr-10 py-2 bg-[var(--neo-surface-2)] border border-[var(--neo-border)] rounded-xl focus:ring-2 focus:ring-rose-500 outline-none"
          />
        </div>
      </div>

      <div className="bg-[var(--neo-surface)] rounded-3xl shadow-sm border border-[var(--neo-border)] overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-rose-600" /></div>
        ) : filteredTickets.length === 0 ? (
           <div className="p-12 text-center text-[var(--neo-text-secondary)] font-medium">تیکتی برای نمایش وجود ندارد.</div>
        ) : (
          <div className="divide-y divide-[var(--neo-border)]">
            {filteredTickets.map((ticket: any) => (
              <div key={ticket._id} className="p-6 hover:bg-[var(--neo-surface-2)]/50 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 text-[var(--neo-primary)] rounded-full flex items-center justify-center font-bold">
                      {ticket.userId?.firstName?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-[var(--neo-text-main)]">{ticket.subject}</h3>
                      <p className="text-sm font-medium text-[var(--neo-text-secondary)]">
                        ارسال شده توسط {ticket.userId?.firstName} {ticket.userId?.lastName} • {new Date(ticket.createdAt).toLocaleDateString('fa-IR')}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    ticket.status === 'open' ? 'bg-rose-100 text-rose-700' :
                    ticket.status === 'in_progress' ? 'bg-blue-100 text-[var(--neo-primary)]' :
                    'bg-[var(--neo-surface-2)] text-[var(--neo-text-main)]'
                  }`}>
                    {ticket.status === 'open' ? 'باز' : ticket.status === 'in_progress' ? 'در حال بررسی' : 'بسته شده'}
                  </span>
                </div>
                
                <p className="text-[var(--neo-text-main)] bg-[var(--neo-surface-2)] p-4 rounded-xl border border-[var(--neo-border)] mb-4 text-sm leading-relaxed">
                  {ticket.message}
                </p>
                
                <div className="flex items-center gap-3">
                  {ticket.status !== 'closed' && (
                    <button 
                      onClick={() => updateStatusMutation.mutate({ id: ticket._id, status: 'closed' })}
                      className="flex items-center gap-2 px-4 py-2 bg-[var(--neo-surface-2)] hover:bg-[var(--neo-border)] text-[var(--neo-text-main)] font-bold rounded-lg text-sm transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" />
                      بستن تیکت
                    </button>
                  )}
                  {ticket.status === 'open' && (
                    <button 
                      onClick={() => updateStatusMutation.mutate({ id: ticket._id, status: 'in_progress' })}
                      className="flex items-center gap-2 px-4 py-2 bg-[var(--neo-primary)]/10 hover:bg-blue-100 text-[var(--neo-primary)] font-bold rounded-lg text-sm transition-colors"
                    >
                      <Clock className="w-4 h-4" />
                      در حال بررسی
                    </button>
                  )}
                  {/* Real app would have a modal/drawer to send a message back */}
                  <button className="flex items-center gap-2 px-4 py-2 bg-[var(--neo-primary)] hover:bg-[var(--neo-primary)] text-white font-bold rounded-lg shadow-sm text-sm transition-colors">
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
