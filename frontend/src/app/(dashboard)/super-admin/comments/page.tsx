'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { superAdminApi } from '@/features/admin/api/super-admin.api';
import { 
  MessageCircle, Check, X, Trash2, Star, Filter, 
  ExternalLink, Loader2, AlertCircle, MessageSquare
} from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function CommentsModerationPage() {
  const queryClient = useQueryClient();
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');

  const { data: resData, isLoading } = useQuery({
    queryKey: ['commentsModeration', filterStatus, filterType],
    queryFn: () => superAdminApi.getComments({ status: filterStatus, type: filterType }).then((res: any) => res.data)
  });

  const moderateMutation = useMutation({
    mutationFn: (data: { id: string; itemType: string; status: 'approved' | 'rejected' }) => 
      superAdminApi.moderateComment(data.id, data),
    onSuccess: (_, vars) => {
      toast.success(vars.status === 'approved' ? 'دیدگاه تایید و منتشر شد' : 'دیدگاه رد شد');
      queryClient.invalidateQueries({ queryKey: ['commentsModeration'] });
    },
    onError: () => toast.error('خطا در تغییر وضعیت نظر')
  });

  const deleteMutation = useMutation({
    mutationFn: (data: { id: string; itemType: string }) => 
      superAdminApi.deleteComment(data.id, data.itemType),
    onSuccess: () => {
      toast.success('دیدگاه با موفقیت حذف گردید');
      queryClient.invalidateQueries({ queryKey: ['commentsModeration'] });
    },
    onError: () => toast.error('خطا در حذف نظر')
  });

  const comments = resData?.comments || [];
  const stats = resData?.stats || { total: 0, pending: 0, approved: 0, rejected: 0 };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-[var(--neo-border)] shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
            <MessageCircle className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-[var(--neo-text-main)]">مدیریت و نظارت بر دیدگاه‌ها و نظرات</h1>
            <p className="text-sm text-[var(--neo-text-secondary)] mt-1">تایید، رد یا حذف دیدگاه‌های ثبت‌شده دانشجویان پای دوره‌ها و دروس</p>
          </div>
        </div>

        <div className="flex gap-2">
          <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            {stats.pending} نظر در انتظار بررسی
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-[var(--neo-border)] shadow-sm">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterStatus === 'all' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            همه ({stats.total})
          </button>
          <button
            onClick={() => setFilterStatus('pending')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterStatus === 'pending' ? 'bg-amber-500 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            در انتظار بررسی ({stats.pending})
          </button>
          <button
            onClick={() => setFilterStatus('approved')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterStatus === 'approved' ? 'bg-emerald-600 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            تایید شده ({stats.approved})
          </button>
          <button
            onClick={() => setFilterStatus('rejected')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterStatus === 'rejected' ? 'bg-red-500 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            رد شده ({stats.rejected})
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 font-bold">بخش:</span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="text-xs p-2 bg-gray-50 border border-gray-200 rounded-xl outline-none"
          >
            <option value="all">همه بخش‌ها (دوره‌ها و دروس)</option>
            <option value="review">دیدگاه دوره‌ها (Review)</option>
            <option value="lesson">پرسش و پاسخ دروس (Lesson Comment)</option>
          </select>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="flex justify-center p-16">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-[var(--neo-border)] text-gray-500">
            <MessageSquare className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="font-bold">هیچ نظری با مشخصات انتخابی یافت نشد</p>
          </div>
        ) : (
          comments.map((item: any) => {
            const userName = item.user 
              ? `${item.user.firstName || ''} ${item.user.lastName || ''}`.trim() || item.user.email 
              : 'کاربر ناشناس';

            return (
              <div 
                key={item._id}
                className="bg-white p-5 rounded-3xl border border-[var(--neo-border)] shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 font-bold flex items-center justify-center text-xs">
                      {userName.slice(0, 2)}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 text-sm flex items-center gap-2">
                        {userName}
                        <span className="text-xs font-normal text-gray-400">
                          {new Date(item.createdAt).toLocaleDateString('fa-IR')}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                        <span className="font-medium text-gray-700">مربوط به: {item.targetTitle}</span>
                        {item.itemType === 'review' ? (
                          <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 text-[10px] font-bold">دیدگاه دوره</span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-bold">نظر درس</span>
                        )}
                        {item.rating && (
                          <span className="flex items-center gap-0.5 text-amber-500 font-bold text-xs">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            {item.rating}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-2xl border border-gray-100 leading-relaxed">
                    {item.text}
                  </p>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto justify-end border-t md:border-t-0 pt-3 md:pt-0">
                  {item.status === 'pending' && (
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                      در انتظار تایید
                    </span>
                  )}
                  {item.status === 'approved' && (
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      تایید شده
                    </span>
                  )}
                  {item.status === 'rejected' && (
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
                      رد شده
                    </span>
                  )}

                  <div className="flex items-center gap-1.5 mr-2">
                    {item.status !== 'approved' && (
                      <button
                        title="تایید دیدگاه"
                        disabled={moderateMutation.isPending}
                        onClick={() => moderateMutation.mutate({ id: item._id, itemType: item.itemType, status: 'approved' })}
                        className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-xl transition-colors"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    {item.status !== 'rejected' && (
                      <button
                        title="رد دیدگاه"
                        disabled={moderateMutation.isPending}
                        onClick={() => moderateMutation.mutate({ id: item._id, itemType: item.itemType, status: 'rejected' })}
                        className="p-2 bg-amber-50 hover:bg-amber-100 text-amber-600 rounded-xl transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      title="حذف دیدگاه"
                      disabled={deleteMutation.isPending}
                      onClick={() => {
                        if (confirm('آیا از حذف این دیدگاه اطمینان دارید؟')) {
                          deleteMutation.mutate({ id: item._id, itemType: item.itemType });
                        }
                      }}
                      className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
