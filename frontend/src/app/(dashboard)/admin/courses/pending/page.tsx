'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Loader2, CheckCircle, XCircle, BookOpen, Clock } from 'lucide-react';
import Link from 'next/link';

export default function PendingCoursesPage() {
  const queryClient = useQueryClient();
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [reason, setReason] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-pending-courses'],
    queryFn: () => api.get('/admin/courses', { params: { status: 'pending_review' } }).then(res => res.data?.data)
  });

  const publishMutation = useMutation({
    mutationFn: (id: string) => api.post(`/admin/courses/${id}/publish`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pending-courses'] });
      alert('دوره با موفقیت منتشر شد');
    }
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string, reason: string }) => api.post(`/admin/courses/${id}/reject`, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pending-courses'] });
      setRejectId(null);
      setReason('');
    }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900">بررسی دوره‌ها</h1>
        <p className="text-gray-500 mt-1">دوره‌های در انتظار تایید اساتید</p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex justify-center text-blue-600"><Loader2 className="w-8 h-8 animate-spin" /></div>
        ) : data?.courses?.length === 0 ? (
          <div className="p-12 text-center text-gray-500 font-medium">هیچ دوره‌ای در انتظار بررسی نیست.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="p-4 font-bold text-gray-600 text-sm">دوره</th>
                  <th className="p-4 font-bold text-gray-600 text-sm">استاد</th>
                  <th className="p-4 font-bold text-gray-600 text-sm">تاریخ درخواست</th>
                  <th className="p-4 font-bold text-gray-600 text-sm text-center">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {data?.courses?.map((course: any) => (
                  <tr key={course._id} className="border-b border-gray-50">
                    <td className="p-4">
                      <div className="font-bold text-gray-900">{course.title}</div>
                    </td>
                    <td className="p-4 font-medium text-gray-600">
                      {course.instructors?.[0]?.firstName} {course.instructors?.[0]?.lastName}
                    </td>
                    <td className="p-4 font-medium text-gray-600">
                      {new Date(course.updatedAt).toLocaleDateString('fa-IR')}
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center gap-2">
                        <button 
                          onClick={() => publishMutation.mutate(course._id)}
                          disabled={publishMutation.isPending}
                          className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors"
                          title="تایید و انتشار"
                        >
                          <CheckCircle className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => setRejectId(course._id)}
                          className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                          title="رد دوره"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {rejectId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-xl animate-in zoom-in-95 duration-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">رد دوره</h2>
            <p className="text-sm text-gray-600 mb-4">لطفاً علت رد دوره را برای استاد بنویسید تا بتواند مشکلات را برطرف کند.</p>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none mb-4"
              rows={4}
              placeholder="مثال: کیفیت صدای ویدیو در فصل اول پایین است..."
            ></textarea>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setRejectId(null)}
                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors"
              >
                انصراف
              </button>
              <button 
                onClick={() => rejectMutation.mutate({ id: rejectId, reason })}
                disabled={!reason.trim() || rejectMutation.isPending}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-md disabled:opacity-50 transition-colors"
              >
                {rejectMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin"/> : 'تایید و رد دوره'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
