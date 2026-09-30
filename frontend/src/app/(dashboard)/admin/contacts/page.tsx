'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { generalApi } from '@/features/general/api/general.api';
import { 
  Mail, Phone, Clock, Search, Filter, Trash2, Eye, 
  CheckCircle2, AlertCircle, MessageSquare, Reply, User, 
  ExternalLink, Loader2, ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminContactsPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'read' | 'replied' | 'archived'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<any | null>(null);
  const [replyNotes, setReplyNotes] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['adminContacts', statusFilter, searchTerm],
    queryFn: () => generalApi.getContactsAdmin({ status: statusFilter, search: searchTerm }).then(res => res.data)
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => generalApi.updateContactStatus(id, data),
    onSuccess: () => {
      toast.success('وضعیت پیام با موفقیت به‌روزرسانی شد');
      queryClient.invalidateQueries({ queryKey: ['adminContacts'] });
      if (selectedMessage) {
        setSelectedMessage((prev: any) => ({ ...prev, ...updateMutation.variables?.data }));
      }
    },
    onError: () => toast.error('خطا در به‌روزرسانی وضعیت')
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => generalApi.deleteContact(id),
    onSuccess: () => {
      toast.success('پیام با موفقیت حذف شد');
      queryClient.invalidateQueries({ queryKey: ['adminContacts'] });
      setSelectedMessage(null);
    },
    onError: () => toast.error('خطا در حذف پیام')
  });

  const messages = data?.messages || [];

  const handleOpenDetail = (msg: any) => {
    setSelectedMessage(msg);
    setReplyNotes(msg.replyNotes || '');
    if (msg.status === 'pending') {
      updateMutation.mutate({ id: msg._id, data: { status: 'read', isRead: true } });
    }
  };

  const handleSaveNotes = () => {
    if (!selectedMessage) return;
    updateMutation.mutate({ 
      id: selectedMessage._id, 
      data: { replyNotes, status: 'replied' } 
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-[var(--neo-border)] shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-blue-50 text-[var(--neo-primary)] rounded-2xl">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-[var(--neo-text-main)]">
                پیام‌های دریافتی تماس با ما
              </h1>
              <p className="text-xs text-[var(--neo-text-secondary)] mt-1">
                بررسی، پیگیری و ثبت پاسخ برای پیام‌های ارسالی کاربران از فرم تماس
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3.5 py-1.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold font-mono">
            مجموع پیام‌ها: {data?.total || messages.length}
          </span>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-white p-4 rounded-2xl border border-[var(--neo-border)]">
        <div className="md:col-span-8 relative">
          <Search className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="جستجو بر اساس نام، موضوع، شماره تماس یا متن پیام..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-[var(--neo-border)] bg-[var(--neo-surface-2)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--neo-primary)]"
          />
        </div>

        <div className="md:col-span-4 flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400 shrink-0" />
          <select
            value={statusFilter}
            onChange={(e: any) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-[var(--neo-border)] bg-[var(--neo-surface-2)] text-xs font-bold focus:outline-none"
          >
            <option value="all">همه وضعیت‌ها</option>
            <option value="pending">در انتظار بررسی</option>
            <option value="read">خوانده شده</option>
            <option value="replied">پاسخ داده شده</option>
            <option value="archived">بایگانی شده</option>
          </select>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Messages List */}
        <div className={`${selectedMessage ? 'lg:col-span-7' : 'lg:col-span-12'} space-y-3`}>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-16 bg-white rounded-3xl border border-[var(--neo-border)]">
              <Loader2 className="w-8 h-8 animate-spin text-[var(--neo-primary)] mb-2" />
              <span className="text-xs text-gray-500 font-bold">در حال دریافت پیام‌ها...</span>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center p-16 bg-white rounded-3xl border border-[var(--neo-border)]">
              <Mail className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm font-bold text-gray-600">هیچ پیامی یافت نشد</p>
              <p className="text-xs text-gray-400 mt-1">پیام‌های جدید ارسال‌شده توسط کاربران در اینجا نمایش داده می‌شوند.</p>
            </div>
          ) : (
            messages.map((msg: any) => {
              const isSelected = selectedMessage?._id === msg._id;
              const isPending = msg.status === 'pending';
              return (
                <div
                  key={msg._id}
                  onClick={() => handleOpenDetail(msg)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer bg-white hover:shadow-md ${
                    isSelected 
                      ? 'border-[var(--neo-primary)] ring-2 ring-blue-100' 
                      : isPending 
                        ? 'border-amber-300 bg-amber-50/20' 
                        : 'border-[var(--neo-border)]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {isPending && (
                          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
                        )}
                        <h3 className="font-bold text-sm text-[var(--neo-text-main)]">
                          {msg.subject || 'بدون موضوع'}
                        </h3>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                        <span className="font-medium text-gray-700 flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-gray-400" />
                          {msg.name}
                        </span>
                        {msg.phone && (
                          <span className="font-mono dir-ltr flex items-center gap-1">
                            <Phone className="w-3 h-3 text-gray-400" />
                            {msg.phone}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-gray-400" />
                          {new Date(msg.createdAt).toLocaleDateString('fa-IR')}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        msg.status === 'pending'
                          ? 'bg-amber-100 text-amber-700'
                          : msg.status === 'replied'
                            ? 'bg-emerald-100 text-emerald-700'
                            : msg.status === 'archived'
                              ? 'bg-gray-100 text-gray-600'
                              : 'bg-blue-100 text-blue-700'
                      }`}>
                        {msg.status === 'pending' && 'در انتظار'}
                        {msg.status === 'read' && 'خوانده شده'}
                        {msg.status === 'replied' && 'پاسخ داده شده'}
                        {msg.status === 'archived' && 'بایگانی'}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-gray-600 mt-3 line-clamp-2 leading-relaxed">
                    {msg.message}
                  </p>
                </div>
              );
            })
          )}
        </div>

        {/* Selected Message Detail Drawer */}
        {selectedMessage && (
          <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-[var(--neo-border)] shadow-sm sticky top-4 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[var(--neo-border)]">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-[var(--neo-text-main)]">جزئیات پیام</span>
              </div>
              <button
                onClick={() => setSelectedMessage(null)}
                className="text-xs text-gray-400 hover:text-gray-700 font-bold"
              >
                بستن
              </button>
            </div>

            {/* Sender Info */}
            <div className="p-4 bg-[var(--neo-surface-2)] rounded-2xl space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">ارسال‌کننده:</span>
                <span className="font-bold text-gray-800">{selectedMessage.name}</span>
              </div>
              {selectedMessage.phone && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">شماره تماس:</span>
                  <a href={`tel:${selectedMessage.phone}`} className="font-mono font-bold text-blue-600 hover:underline flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {selectedMessage.phone}
                  </a>
                </div>
              )}
              {selectedMessage.email && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">ایمیل:</span>
                  <a href={`mailto:${selectedMessage.email}`} className="font-mono text-gray-700 hover:underline flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    {selectedMessage.email}
                  </a>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">تاریخ ارسال:</span>
                <span className="font-medium text-gray-600">
                  {new Date(selectedMessage.createdAt).toLocaleString('fa-IR')}
                </span>
              </div>
            </div>

            {/* Subject and Message Body */}
            <div>
              <h4 className="text-xs font-bold text-gray-400 mb-1">موضوع پیام:</h4>
              <p className="text-sm font-black text-gray-800 mb-3">{selectedMessage.subject}</p>
              <h4 className="text-xs font-bold text-gray-400 mb-1">متن کامل پیام:</h4>
              <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl text-xs text-gray-700 leading-relaxed whitespace-pre-wrap font-sans">
                {selectedMessage.message}
              </div>
            </div>

            {/* Status Change Controls */}
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-2">تغییر وضعیت پیام:</label>
              <div className="grid grid-cols-3 gap-2">
                {(['read', 'replied', 'archived'] as const).map(st => (
                  <button
                    key={st}
                    onClick={() => updateMutation.mutate({ id: selectedMessage._id, data: { status: st } })}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition ${
                      selectedMessage.status === st
                        ? 'bg-[var(--neo-primary)] text-white border-transparent'
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {st === 'read' && 'خوانده‌شده'}
                    {st === 'replied' && 'پاسخ داده‌شده'}
                    {st === 'archived' && 'بایگانی'}
                  </button>
                ))}
              </div>
            </div>

            {/* Admin Reply & Internal Notes */}
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-2 flex items-center gap-1.5">
                <Reply className="w-3.5 h-3.5 text-blue-600" />
                یادداشت پاسخ یا نتیجه پیگیری:
              </label>
              <textarea
                rows={3}
                value={replyNotes}
                onChange={e => setReplyNotes(e.target.value)}
                placeholder="توضیحات تماس تلفنی یا پاسخ ایمیلی ارسال‌شده به کاربر..."
                className="w-full p-3 rounded-xl border border-[var(--neo-border)] bg-[var(--neo-surface-2)] text-xs focus:outline-none focus:ring-2 focus:ring-[var(--neo-primary)]"
              />
              <button
                onClick={handleSaveNotes}
                disabled={updateMutation.isPending}
                className="mt-2 w-full py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition"
              >
                {updateMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                ثبت یادداشت و علامت‌گذاری به عنوان پاسخ داده شده
              </button>
            </div>

            {/* Delete button */}
            <div className="pt-2 border-t border-[var(--neo-border)] flex justify-between items-center">
              <button
                onClick={() => {
                  if (confirm('آیا از حذف این پیام اطمینان دارید؟')) {
                    deleteMutation.mutate(selectedMessage._id);
                  }
                }}
                disabled={deleteMutation.isPending}
                className="text-xs text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                حذف پیام
              </button>

              {selectedMessage.phone && (
                <a
                  href={`tel:${selectedMessage.phone}`}
                  className="px-4 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl text-xs font-bold flex items-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5" />
                  تماس تلفنی
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
