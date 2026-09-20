'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Loader2, CheckCircle, FileText, MessageSquare, Download } from 'lucide-react';

export default function InstructorAssignmentsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState<'pending' | 'graded'>('pending');
  
  const [gradingId, setGradingId] = useState<string | null>(null);
  const [grade, setGrade] = useState('');
  const [feedback, setFeedback] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['instructor-submissions', activeTab, page],
    queryFn: () => api.get('/instructor/submissions', { 
      params: { 
        status: activeTab === 'pending' ? 'submitted' : 'graded',
        page, 
        limit: 10 
      } 
    }).then(res => res.data)
  });

  const gradeMutation = useMutation({
    mutationFn: (data: { id: string, grade: number, feedback: string }) => 
      api.patch(`/instructor/submissions/${data.id}/grade`, { score: data.grade, feedback: data.feedback }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor-submissions'] });
      setGradingId(null);
      setGrade('');
      setFeedback('');
    }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[var(--neo-text-main)]">بررسی تکالیف</h1>
        <p className="text-[var(--neo-text-secondary)] mt-1">مدیریت و نمره‌دهی به تکالیف ارسالی دانشجویان</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-[var(--neo-surface)] p-1.5 rounded-2xl border border-[var(--neo-border)] shadow-sm w-fit">
        <button
          onClick={() => { setActiveTab('pending'); setPage(1); }}
          className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'pending' ? 'bg-amber-50 text-amber-700 shadow-sm' : 'text-[var(--neo-text-secondary)] hover:text-[var(--neo-text-main)] hover:bg-[var(--neo-surface-2)]'
          }`}
        >
          در انتظار نمره
        </button>
        <button
          onClick={() => { setActiveTab('graded'); setPage(1); }}
          className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'graded' ? 'bg-emerald-50 text-emerald-700 shadow-sm' : 'text-[var(--neo-text-secondary)] hover:text-[var(--neo-text-main)] hover:bg-[var(--neo-surface-2)]'
          }`}
        >
          نمره داده شده
        </button>
      </div>

      <div className="bg-[var(--neo-surface)] rounded-3xl shadow-sm border border-[var(--neo-border)] overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex justify-center text-[var(--neo-primary)]"><Loader2 className="w-8 h-8 animate-spin" /></div>
        ) : !data?.submissions?.length ? (
          <div className="p-12 text-center text-[var(--neo-text-secondary)] font-medium">هیچ تکلیفی یافت نشد.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="border-b border-[var(--neo-border)] bg-[var(--neo-surface-2)]/50">
                  <th className="p-4 font-bold text-[var(--neo-text-secondary)] text-sm">دانشجو</th>
                  <th className="p-4 font-bold text-[var(--neo-text-secondary)] text-sm">تکلیف</th>
                  <th className="p-4 font-bold text-[var(--neo-text-secondary)] text-sm">تاریخ ارسال</th>
                  <th className="p-4 font-bold text-[var(--neo-text-secondary)] text-sm text-center">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {data.submissions.map((sub: any) => (
                  <tr key={sub._id} className="border-b border-[var(--neo-border)] hover:bg-[var(--neo-surface-2)]/50 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-[var(--neo-text-main)]">
                        {sub.userId?.firstName} {sub.userId?.lastName}
                      </div>
                    </td>
                    <td className="p-4 font-medium text-[var(--neo-text-secondary)]">
                      {sub.assignmentId?.title || 'تکلیف بدون نام'}
                    </td>
                    <td className="p-4 font-medium text-[var(--neo-text-secondary)]">
                      {new Date(sub.submittedAt).toLocaleDateString('fa-IR')}
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center gap-2">
                        {sub.fileUrl && (
                          <a 
                            href={sub.fileUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="p-2 bg-[var(--neo-primary)]/10 text-[var(--neo-primary)] hover:bg-blue-100 rounded-lg transition-colors"
                            title="دانلود فایل"
                          >
                            <Download className="w-5 h-5" />
                          </a>
                        )}
                        {activeTab === 'pending' ? (
                          <button 
                            onClick={() => { setGradingId(sub._id); setGrade(''); setFeedback(''); }}
                            className="p-2 bg-amber-50 text-amber-600 hover:bg-amber-100 rounded-lg transition-colors"
                            title="ثبت نمره"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                        ) : (
                          <div className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full font-bold text-sm flex items-center gap-1">
                            نمره: {sub.score}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {data?.pages > 1 && (
        <div className="flex justify-center mt-6">
          <div className="flex gap-2">
            {[...Array(data?.pages || 0)].map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`w-10 h-10 rounded-xl font-bold transition-colors ${
                  page === i + 1 ? 'bg-[var(--neo-primary)] text-white shadow-md' : 'bg-[var(--neo-surface)] text-[var(--neo-text-secondary)] hover:bg-[var(--neo-surface-2)] border border-[var(--neo-border)]'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Grading Modal */}
      {gradingId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[var(--neo-surface)] rounded-3xl p-6 md:p-8 w-full max-w-md shadow-xl animate-in zoom-in-95 duration-200">
            <h2 className="text-xl font-black text-[var(--neo-text-main)] mb-6 flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-emerald-500" />
              ثبت نمره تکلیف
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-[var(--neo-text-main)] mb-2">نمره (از ۱۰۰)</label>
                <input 
                  type="number"
                  min="0"
                  max="100"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full px-4 py-3 bg-[var(--neo-surface-2)] border border-[var(--neo-border)] rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                  placeholder="مثال: 85"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-[var(--neo-text-main)] mb-2">بازخورد (اختیاری)</label>
                <textarea 
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="w-full px-4 py-3 bg-[var(--neo-surface-2)] border border-[var(--neo-border)] rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all resize-none"
                  rows={4}
                  placeholder="نکات مثبت و منفی تکلیف را بنویسید..."
                ></textarea>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <button 
                onClick={() => setGradingId(null)}
                className="px-5 py-2.5 bg-[var(--neo-surface-2)] hover:bg-[var(--neo-border)] text-[var(--neo-text-main)] font-bold rounded-xl transition-colors"
              >
                انصراف
              </button>
              <button 
                onClick={() => gradeMutation.mutate({ id: gradingId, grade: Number(grade), feedback })}
                disabled={!grade || gradeMutation.isPending}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md disabled:opacity-50 transition-colors flex items-center gap-2"
              >
                {gradeMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin"/> : 'ثبت نمره'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
