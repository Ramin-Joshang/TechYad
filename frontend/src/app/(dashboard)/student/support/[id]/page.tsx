'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supportApi } from '@/features/support/api/support.api';
import { Ticket, Loader2, ArrowRight, Clock, MessageSquare, CheckCircle, Send, ShieldAlert, User } from 'lucide-react';
import Link from 'next/link';
import { use, useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/features/auth/stores/auth.store';

export default function TicketDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [replyText, setReplyText] = useState('');

  const { data: detailData, isLoading, isError } = useQuery({
    queryKey: ['myTicketDetail', id],
    queryFn: () => supportApi.getTicketDetails(id).then(res => res.data),
    retry: 1,
    refetchInterval: 10000 // Simple real-time behavior via polling every 10s
  });

  const replyMutation = useMutation({
    mutationFn: (message: string) => supportApi.replyToTicket(id, { message }),
    onSuccess: () => {
      setReplyText('');
      queryClient.invalidateQueries({ queryKey: ['myTicketDetail', id] });
      queryClient.invalidateQueries({ queryKey: ['myTickets'] });
    }
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (detailData?.messages) {
      scrollToBottom();
    }
  }, [detailData?.messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    replyMutation.mutate(replyText);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
        <p className="text-gray-500">در حال دریافت جزئیات تیکت...</p>
      </div>
    );
  }

  if (isError || !detailData) {
    return (
      <div className="bg-white rounded-3xl p-16 text-center border border-red-100 shadow-sm flex flex-col items-center justify-center">
        <h3 className="text-xl font-bold text-gray-900 mb-2">تیکت یافت نشد</h3>
        <button onClick={() => router.push('/student/support')} className="mt-4 px-6 py-2 bg-indigo-500 text-white rounded-xl font-bold hover:bg-indigo-600 transition">
          بازگشت به لیست
        </button>
      </div>
    );
  }

  const { ticket, messages } = detailData;
  const isClosed = ticket.status === 'closed';

  return (
    <div className="space-y-6 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto h-full flex flex-col min-h-[calc(100vh-140px)]">
      {/* Header */}
      <div className="shrink-0">
        <Link href="/student/support" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition mb-4">
          <ArrowRight className="w-4 h-4" />
          بازگشت به تیکت‌ها
        </Link>
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900 mb-2">{ticket.subject}</h1>
            <div className="flex items-center gap-4 text-sm font-medium">
              <span className="text-gray-500">
                تاریخ ثبت: <span className="text-gray-700">{new Date(ticket.createdAt).toLocaleDateString('fa-IR')}</span>
              </span>
              <span className="text-gray-300">•</span>
              <span className="text-gray-500">
                دپارتمان: <span className="text-gray-700">{ticket.category === 'technical' ? 'فنی' : ticket.category === 'financial' ? 'مالی' : 'عمومی'}</span>
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
              ticket.status === 'closed' ? 'bg-gray-100 text-gray-600' :
              ticket.status === 'answered' ? 'bg-emerald-100 text-emerald-700' :
              ticket.status === 'in_progress' ? 'bg-purple-100 text-purple-700' :
              'bg-blue-100 text-blue-700'
            }`}>
              {ticket.status === 'closed' ? <CheckCircle className="w-4 h-4" /> : 
               ticket.status === 'answered' ? <MessageSquare className="w-4 h-4" /> :
               <Clock className="w-4 h-4" />}
              {ticket.status === 'closed' ? 'بسته شده' : 
               ticket.status === 'answered' ? 'پاسخ داده شده' : 
               ticket.status === 'in_progress' ? 'در حال بررسی' : 'باز (جدید)'}
            </span>
            <span className={`inline-flex px-3 py-1.5 rounded-full text-xs font-bold ${
              ticket.priority === 'high' ? 'bg-red-100 text-red-700' :
              ticket.priority === 'medium' ? 'bg-amber-100 text-amber-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              اولویت {ticket.priority === 'high' ? 'زیاد' : ticket.priority === 'medium' ? 'متوسط' : 'کم'}
            </span>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
        
        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50">
          {messages.map((msg: any) => {
            const isMe = msg.senderId?._id === user?.id || msg.senderId === user?.id;
            
            return (
              <div key={msg._id} className={`flex gap-4 ${isMe ? 'flex-row' : 'flex-row-reverse'}`}>
                <div className="w-10 h-10 rounded-full shrink-0 flex items-center justify-center bg-gray-200 overflow-hidden shadow-sm">
                  {isMe ? (
                    user?.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : <User className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ShieldAlert className="w-5 h-5 text-indigo-600" />
                  )}
                </div>
                
                <div className={`max-w-[80%] ${isMe ? 'items-start' : 'items-end'}`}>
                  <div className={`flex items-center gap-2 mb-1 ${isMe ? 'justify-start' : 'justify-end'}`}>
                    <span className="text-xs font-bold text-gray-500">
                      {isMe ? 'شما' : 'پشتیبانی'}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {new Date(msg.createdAt).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  
                  <div className={`p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap shadow-sm ${
                    isMe 
                      ? 'bg-blue-600 text-white rounded-tr-sm' 
                      : 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm'
                  }`}>
                    {msg.message}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-gray-100 shrink-0">
          {isClosed ? (
            <div className="bg-gray-50 rounded-2xl p-4 text-center">
              <p className="text-gray-500 font-medium mb-3">این تیکت بسته شده است. با ارسال پیام جدید، تیکت مجدداً باز خواهد شد.</p>
              <form onSubmit={handleSubmit} className="flex gap-2 max-w-2xl mx-auto">
                <input 
                  type="text" 
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="نوشتن پیام جدید..."
                  className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
                <button 
                  type="submit"
                  disabled={replyMutation.isPending || !replyText.trim()}
                  className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition flex items-center justify-center"
                >
                  {replyMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 transform -rotate-90" />}
                </button>
              </form>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input 
                type="text" 
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="پاسخ خود را بنویسید..."
                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
              />
              <button 
                type="submit"
                disabled={replyMutation.isPending || !replyText.trim()}
                className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition flex items-center justify-center shadow-md shadow-indigo-600/20"
              >
                {replyMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 transform -rotate-90" />}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
