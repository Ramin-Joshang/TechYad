'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/features/admin/api/admin.api';
import { 
  Ticket, Search, Filter, MessageSquare, Send, CheckCircle2, 
  Clock, AlertTriangle, XCircle, User, Loader2, RefreshCw, 
  ExternalLink, ChevronRight, ShieldAlert, ArrowUpDown
} from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function SuperAdminTicketsPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [replyStatus, setReplyStatus] = useState('answered');

  // Fetch tickets list
  const { data, isLoading } = useQuery({
    queryKey: ['superAdminTickets', statusFilter, priorityFilter, searchTerm, currentPage],
    queryFn: async () => {
      const params: any = {
        page: currentPage,
        limit: 15,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        priority: priorityFilter !== 'all' ? priorityFilter : undefined,
        search: searchTerm.trim() || undefined
      };
      const res = await adminApi.getTickets(params);
      return res?.data || res;
    }
  });

  const tickets = data?.tickets || [];
  const stats = data?.stats || {
    total: 0,
    open: 0,
    in_progress: 0,
    answered: 0,
    closed: 0
  };
  const totalPages = data?.pages || 1;

  // Fetch selected ticket thread details
  const { data: activeTicketData, isLoading: isLoadingTicketDetails } = useQuery({
    queryKey: ['ticketDetails', activeTicketId],
    queryFn: async () => {
      if (!activeTicketId) return null;
      const res = await adminApi.getTicketDetails(activeTicketId);
      return res?.data || res;
    },
    enabled: !!activeTicketId,
    refetchInterval: 15000 // auto-refresh active conversation every 15s
  });

  // Reply mutation
  const replyMutation = useMutation({
    mutationFn: ({ id, message, status }: { id: string; message: string; status: string }) =>
      adminApi.replyToTicket(id, { message, status }),
    onSuccess: () => {
      toast.success('پاسخ شما با موفقیت ارسال شد');
      setReplyMessage('');
      queryClient.invalidateQueries({ queryKey: ['ticketDetails', activeTicketId] });
      queryClient.invalidateQueries({ queryKey: ['superAdminTickets'] });
      queryClient.invalidateQueries({ queryKey: ['superAdminDashboardStats'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'خطا در ارسال پاسخ');
    }
  });

  // Update status/priority mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status, priority }: { id: string; status: string; priority?: string }) =>
      adminApi.updateTicketStatus(id, status, priority),
    onSuccess: () => {
      toast.success('وضعیت تیکت تغییر یافت');
      queryClient.invalidateQueries({ queryKey: ['ticketDetails', activeTicketId] });
      queryClient.invalidateQueries({ queryKey: ['superAdminTickets'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'خطا در به‌روزرسانی تیکت');
    }
  });

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTicketId || !replyMessage.trim()) {
      toast.error('لطفاً متن پاسخ را وارد نمایید');
      return;
    }
    replyMutation.mutate({
      id: activeTicketId,
      message: replyMessage.trim(),
      status: replyStatus
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800"><AlertTriangle className="w-3 h-3" /> نیازمند پاسخ</span>;
      case 'in_progress':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800"><Clock className="w-3 h-3" /> در حال بررسی</span>;
      case 'answered':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800"><CheckCircle2 className="w-3 h-3" /> پاسخ داده شده</span>;
      case 'closed':
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700"><XCircle className="w-3 h-3" /> بسته شده</span>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-red-50 text-red-700 border border-red-200">فوری / بالا</span>;
      case 'medium':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">معمولی</span>;
      case 'low':
      default:
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-gray-50 text-gray-600 border border-gray-200">پایین</span>;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header Banner */}
      <div className="bg-[var(--neo-surface)] border border-[var(--neo-border)] rounded-3xl p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-blue-100 text-[var(--neo-primary)] rounded-2xl">
              <Ticket className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-[var(--neo-text-main)]">مرکز جامع پشتیبانی و تیکت‌ها</h1>
              <p className="text-[var(--neo-text-secondary)] text-sm mt-1">پاسخگویی، پیگیری و تحلیل مسائل و درخواست‌های کاربران و اساتید</p>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[var(--neo-border)] shadow-sm">
          <div className="text-xs font-semibold text-[var(--neo-text-secondary)] mb-1">کل تیکت‌ها</div>
          <div className="text-2xl font-black text-[var(--neo-text-main)]">{stats.total}</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-[var(--neo-border)] shadow-sm">
          <div className="text-xs font-semibold text-rose-600 mb-1">نیازمند پاسخ (باز)</div>
          <div className="text-2xl font-black text-rose-600">{stats.open}</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-[var(--neo-border)] shadow-sm">
          <div className="text-xs font-semibold text-blue-600 mb-1">در حال بررسی</div>
          <div className="text-2xl font-black text-blue-600">{stats.in_progress}</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-[var(--neo-border)] shadow-sm">
          <div className="text-xs font-semibold text-emerald-600 mb-1">پاسخ داده شده</div>
          <div className="text-2xl font-black text-emerald-600">{stats.answered}</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-[var(--neo-border)] shadow-sm">
          <div className="text-xs font-semibold text-gray-500 mb-1">بسته شده</div>
          <div className="text-2xl font-black text-gray-600">{stats.closed}</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-5 rounded-3xl border border-[var(--neo-border)] shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="جستجو در عنوان، کاربر، ایمیل..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pr-12 pl-4 py-3 bg-[var(--neo-surface-2)] border border-[var(--neo-border)] rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--neo-primary)]"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          {[
            { id: 'all', label: 'همه وضعیت‌ها' },
            { id: 'open', label: 'نیازمند پاسخ' },
            { id: 'in_progress', label: 'در حال بررسی' },
            { id: 'answered', label: 'پاسخ داده شده' },
            { id: 'closed', label: 'بسته شده' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setStatusFilter(item.id);
                setCurrentPage(1);
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                statusFilter === item.id
                  ? 'bg-[var(--neo-primary)] text-white shadow-md shadow-blue-500/20'
                  : 'bg-[var(--neo-surface-2)] text-[var(--neo-text-secondary)] hover:bg-gray-200'
              }`}
            >
              {item.label}
            </button>
          ))}

          {/* Priority filter */}
          <select
            value={priorityFilter}
            onChange={(e) => {
              setPriorityFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="text-xs font-bold py-2 px-3 rounded-xl border border-[var(--neo-border)] bg-[var(--neo-surface-2)] focus:outline-none"
          >
            <option value="all">همه اولویت‌ها</option>
            <option value="high">اولویت بالا</option>
            <option value="medium">اولویت متوسط</option>
            <option value="low">اولویت پایین</option>
          </select>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="bg-white rounded-3xl border border-[var(--neo-border)] shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-20 gap-3">
            <Loader2 className="w-10 h-10 animate-spin text-[var(--neo-primary)]" />
            <p className="text-sm text-gray-500 font-medium">در حال دریافت تیکت‌های پشتیبانی...</p>
          </div>
        ) : tickets.length === 0 ? (
          <div className="p-16 text-center">
            <Ticket className="w-16 h-16 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-gray-700">هیچ تیکتی با این مشخصات یافت نشد</h3>
            <p className="text-sm text-gray-500 mt-1">با فیلترهای دیگر بررسی کنید.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-[var(--neo-surface-2)] text-[var(--neo-text-secondary)] font-bold border-b border-[var(--neo-border)]">
                <tr>
                  <th className="p-4">کاربر ارسال‌کننده</th>
                  <th className="p-4">موضوع تیکت</th>
                  <th className="p-4">بخش / دسته</th>
                  <th className="p-4">اولویت</th>
                  <th className="p-4">وضعیت</th>
                  <th className="p-4">تعداد پیام</th>
                  <th className="p-4">آخرین بروزرسانی</th>
                  <th className="p-4 text-center">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--neo-border)]">
                {tickets.map((ticket: any) => (
                  <tr 
                    key={ticket._id} 
                    className={`hover:bg-blue-50/40 transition-colors cursor-pointer ${
                      ticket.status === 'open' ? 'bg-rose-50/20' : ''
                    }`}
                    onClick={() => setActiveTicketId(ticket._id)}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-100 text-[var(--neo-primary)] font-black flex items-center justify-center text-sm shrink-0">
                          {ticket.userId?.firstName?.[0] || 'ک'}
                        </div>
                        <div>
                          <div className="font-bold text-[var(--neo-text-main)]">
                            {ticket.userId ? `${ticket.userId.firstName || ''} ${ticket.userId.lastName || ''}`.trim() : 'کاربر ناشناس'}
                          </div>
                          <div className="text-xs text-gray-400 font-mono" dir="ltr">{ticket.userId?.email || '-'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-bold text-[var(--neo-text-main)] max-w-xs truncate">
                      {ticket.subject}
                    </td>
                    <td className="p-4 text-xs text-gray-600 font-medium">
                      {ticket.category === 'technical' ? 'فنی و پلتفرم' :
                       ticket.category === 'financial' ? 'مالی و پرداخت' :
                       ticket.category === 'courses' ? 'آموزش و دوره‌ها' : ticket.category || 'عمومی'}
                    </td>
                    <td className="p-4">
                      {getPriorityBadge(ticket.priority)}
                    </td>
                    <td className="p-4">
                      {getStatusBadge(ticket.status)}
                    </td>
                    <td className="p-4 text-xs font-bold text-gray-500">
                      <span className="inline-flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-lg">
                        <MessageSquare className="w-3 h-3" />
                        {ticket.messageCount || 1}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-gray-500">
                      {new Date(ticket.updatedAt || ticket.createdAt).toLocaleDateString('fa-IR', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setActiveTicketId(ticket._id)}
                        className="px-4 py-2 bg-[var(--neo-primary)] hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                      >
                        مشاهده و پاسخ
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-[var(--neo-border)] flex items-center justify-between">
            <div className="text-sm text-gray-500">
              صفحه {currentPage} از {totalPages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-xl text-sm font-bold bg-[var(--neo-surface-2)] disabled:opacity-50 hover:bg-gray-200 transition-colors"
              >
                قبلی
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-xl text-sm font-bold bg-[var(--neo-surface-2)] disabled:opacity-50 hover:bg-gray-200 transition-colors"
              >
                بعدی
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Ticket Conversation Drawer / Modal */}
      {activeTicketId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl h-[85vh] flex flex-col border border-[var(--neo-border)] animate-in zoom-in-95 overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-[var(--neo-border)] flex justify-between items-start bg-white shrink-0">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-black text-[var(--neo-text-main)]">
                    {activeTicketData?.ticket?.subject || 'مشاهده تیکت'}
                  </h3>
                  {activeTicketData?.ticket?.priority && getPriorityBadge(activeTicketData.ticket.priority)}
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span>کاربر: <strong className="text-gray-700">{activeTicketData?.ticket?.userId?.firstName} {activeTicketData?.ticket?.userId?.lastName}</strong></span>
                  <span>ایمیل: <span className="font-mono" dir="ltr">{activeTicketData?.ticket?.userId?.email}</span></span>
                  {activeTicketData?.ticket?.userId?._id && (
                    <Link
                      href={`/super-admin/users/${activeTicketData.ticket.userId._id}`}
                      target="_blank"
                      className="text-blue-600 hover:underline flex items-center gap-1 font-bold"
                    >
                      پروفایل کاربر <ExternalLink className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Status selector */}
                {activeTicketData?.ticket && (
                  <select
                    value={activeTicketData.ticket.status}
                    onChange={(e) => updateStatusMutation.mutate({ id: activeTicketId, status: e.target.value })}
                    className="text-xs font-bold py-1.5 px-3 rounded-xl border border-[var(--neo-border)] bg-[var(--neo-surface-2)] cursor-pointer"
                  >
                    <option value="open">نیازمند پاسخ</option>
                    <option value="in_progress">در حال بررسی</option>
                    <option value="answered">پاسخ داده شده</option>
                    <option value="closed">بسته شده</option>
                  </select>
                )}
                <button
                  onClick={() => setActiveTicketId(null)}
                  className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold text-gray-500"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Conversation Thread */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/50">
              {isLoadingTicketDetails ? (
                <div className="flex justify-center p-12">
                  <Loader2 className="w-8 h-8 animate-spin text-[var(--neo-primary)]" />
                </div>
              ) : activeTicketData?.messages?.length === 0 ? (
                <div className="text-center py-12 text-gray-400 text-sm">هیچ پیامی ثبت نشده است.</div>
              ) : (
                activeTicketData?.messages?.map((msg: any) => {
                  const isAdmin = msg.senderType === 'admin' || msg.senderType === 'super-admin' || msg.senderId?.role === 'admin' || msg.senderId?.role === 'super-admin';
                  return (
                    <div
                      key={msg._id}
                      className={`flex flex-col ${isAdmin ? 'items-start' : 'items-end'}`}
                    >
                      <div className="text-xs text-gray-400 mb-1 flex items-center gap-1.5 px-1">
                        <span className="font-bold text-gray-600">
                          {isAdmin ? 'مدیر ارشد پلتفرم' : `${activeTicketData.ticket.userId?.firstName} ${activeTicketData.ticket.userId?.lastName}`}
                        </span>
                        <span>•</span>
                        <span>{new Date(msg.createdAt).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div
                        className={`p-4 rounded-2xl max-w-xl text-sm leading-relaxed whitespace-pre-wrap shadow-sm ${
                          isAdmin
                            ? 'bg-blue-600 text-white rounded-tr-none'
                            : 'bg-white border border-[var(--neo-border)] text-gray-800 rounded-tl-none'
                        }`}
                      >
                        {msg.message}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Reply Input Bar */}
            <form onSubmit={handleSendReply} className="p-4 border-t border-[var(--neo-border)] bg-white shrink-0 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-gray-600">ارسال پاسخ به عنوان سوپر ادمین:</span>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">وضعیت تیکت پس از ارسال:</span>
                  <select
                    value={replyStatus}
                    onChange={(e) => setReplyStatus(e.target.value)}
                    className="py-1 px-2.5 rounded-lg border border-gray-200 text-xs font-bold"
                  >
                    <option value="answered">پاسخ داده شده</option>
                    <option value="in_progress">در حال بررسی</option>
                    <option value="closed">بسته شده</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2">
                <textarea
                  rows={3}
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="متن پاسخ خود را به کاربر بنویسید..."
                  className="flex-1 p-3 rounded-2xl border border-[var(--neo-border)] focus:ring-2 focus:ring-[var(--neo-primary)] outline-none text-sm resize-none"
                />
                <button
                  type="submit"
                  disabled={replyMutation.isPending || !replyMessage.trim()}
                  className="px-6 bg-[var(--neo-primary)] hover:bg-blue-700 text-white rounded-2xl font-bold flex flex-col items-center justify-center gap-1 transition-all shadow-md shadow-blue-500/20 disabled:opacity-50 cursor-pointer"
                >
                  {replyMutation.isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span className="text-xs">ارسال</span>
                    </>
                  )}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
