'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { 
  FileText, Plus, Loader2, CheckCircle, Clock, 
  MessageSquare, Download, Trash2, Edit, Calendar, 
  Award, Users, AlertCircle, BookOpen, Check, ExternalLink 
} from 'lucide-react';

export default function InstructorAssignmentsPage() {
  const queryClient = useQueryClient();
  const [activeMainTab, setActiveMainTab] = useState<'submissions' | 'assignments'>('submissions');
  const [submissionTab, setSubmissionTab] = useState<'pending' | 'graded'>('pending');
  const [page, setPage] = useState(1);
  
  // Grading State
  const [gradingSubmission, setGradingSubmission] = useState<any | null>(null);
  const [gradeScore, setGradeScore] = useState<string>('');
  const [gradeFeedback, setGradeFeedback] = useState('');

  // Create Assignment State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingAssignmentId, setEditingAssignmentId] = useState<string | null>(null);
  const [assignmentForm, setAssignmentForm] = useState({
    courseId: '',
    title: '',
    description: '',
    type: 'mixed',
    maxScore: 100,
    deadline: ''
  });

  // Fetch Courses for Dropdown
  const { data: coursesData } = useQuery({
    queryKey: ['instructor-courses-dropdown'],
    queryFn: () => api.get('/instructor/courses', { params: { limit: 100 } }).then(res => res.data?.data?.courses || [])
  });

  // Fetch Submissions
  const { data: submissionsData, isLoading: isLoadingSubmissions } = useQuery({
    queryKey: ['instructor-submissions', submissionTab, page],
    queryFn: () => api.get('/instructor/submissions', { 
      params: { 
        status: submissionTab === 'pending' ? 'submitted' : 'graded',
        page, 
        limit: 10 
      } 
    }).then(res => res.data?.data || res.data),
    enabled: activeMainTab === 'submissions'
  });

  // Fetch Assignments List
  const { data: assignments = [], isLoading: isLoadingAssignments } = useQuery({
    queryKey: ['instructor-assignments'],
    queryFn: () => api.get('/instructor/assignments').then(res => res.data?.data || []),
    enabled: activeMainTab === 'assignments'
  });

  // Grade Mutation
  const gradeMutation = useMutation({
    mutationFn: (data: { id: string, score: number, feedback: string }) => 
      api.patch(`/instructor/submissions/${data.id}/grade`, { score: data.score, feedback: data.feedback }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor-submissions'] });
      queryClient.invalidateQueries({ queryKey: ['instructor-assignments'] });
      setGradingSubmission(null);
      setGradeScore('');
      setGradeFeedback('');
    }
  });

  // Create / Update Assignment Mutation
  const saveAssignmentMutation = useMutation({
    mutationFn: (data: typeof assignmentForm) => {
      if (editingAssignmentId) {
        return api.patch(`/instructor/assignments/${editingAssignmentId}`, data);
      } else {
        return api.post('/instructor/assignments', data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor-assignments'] });
      closeAssignmentModal();
    }
  });

  // Delete Assignment Mutation
  const deleteAssignmentMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/instructor/assignments/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor-assignments'] });
    }
  });

  const closeAssignmentModal = () => {
    setIsCreateModalOpen(false);
    setEditingAssignmentId(null);
    setAssignmentForm({
      courseId: '',
      title: '',
      description: '',
      type: 'mixed',
      maxScore: 100,
      deadline: ''
    });
  };

  const openCreateModal = () => {
    setEditingAssignmentId(null);
    if (coursesData && coursesData.length > 0) {
      setAssignmentForm(prev => ({ ...prev, courseId: coursesData[0]._id }));
    }
    setIsCreateModalOpen(true);
  };

  const openEditModal = (a: any) => {
    setEditingAssignmentId(a._id);
    setAssignmentForm({
      courseId: a.courseId?._id || a.courseId || '',
      title: a.title || '',
      description: a.description || '',
      type: a.type || 'mixed',
      maxScore: a.maxScore || 100,
      deadline: a.deadline ? new Date(a.deadline).toISOString().split('T')[0] : ''
    });
    setIsCreateModalOpen(true);
  };

  const openGradeModal = (sub: any) => {
    setGradingSubmission(sub);
    setGradeScore(sub.score !== undefined ? String(sub.score) : '');
    setGradeFeedback(sub.feedback || '');
  };

  const submissionsList = submissionsData?.submissions || [];
  const pendingCount = submissionsList.filter((s: any) => s.status === 'submitted').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-[var(--neo-text-main)] flex items-center gap-2">
            <FileText className="w-7 h-7 text-[var(--neo-primary)]" />
            مدیریت تکالیف و پروژه‌ها
          </h1>
          <p className="text-[var(--neo-text-secondary)] mt-1">تعریف تمرین و پروژه برای دوره‌ها و بررسی و نمره‌دهی به پاسخ‌های دانشجویان</p>
        </div>
        <button 
          onClick={openCreateModal}
          className="bg-[var(--neo-primary)] hover:bg-[var(--neo-primary)] text-white px-5 py-2.5 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-[var(--neo-primary)]/20 transition-all hover:scale-105"
        >
          <Plus className="w-5 h-5" />
          تعریف تکلیف جدید
        </button>
      </div>

      {/* Main Tabs */}
      <div className="flex gap-3 border-b border-[var(--neo-border)] pb-2">
        <button
          onClick={() => setActiveMainTab('submissions')}
          className={`pb-2 px-4 text-sm font-black transition-colors relative ${
            activeMainTab === 'submissions' 
              ? 'text-[var(--neo-primary)]' 
              : 'text-[var(--neo-text-secondary)] hover:text-[var(--neo-text-main)]'
          }`}
        >
          بررسی پاسخ‌ها و نمره‌دهی
          {activeMainTab === 'submissions' && (
            <span className="absolute bottom-0 right-0 left-0 h-0.5 bg-[var(--neo-primary)] rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveMainTab('assignments')}
          className={`pb-2 px-4 text-sm font-black transition-colors relative ${
            activeMainTab === 'assignments' 
              ? 'text-[var(--neo-primary)]' 
              : 'text-[var(--neo-text-secondary)] hover:text-[var(--neo-text-main)]'
          }`}
        >
          لیست تکالیف دوره‌ها
          {activeMainTab === 'assignments' && (
            <span className="absolute bottom-0 right-0 left-0 h-0.5 bg-[var(--neo-primary)] rounded-full" />
          )}
        </button>
      </div>

      {/* TAB 1: SUBMISSIONS REVIEW */}
      {activeMainTab === 'submissions' && (
        <div className="space-y-6">
          {/* Sub-Tabs */}
          <div className="flex gap-2 bg-[var(--neo-surface)] p-1.5 rounded-2xl border border-[var(--neo-border)] shadow-sm w-fit">
            <button
              onClick={() => { setSubmissionTab('pending'); setPage(1); }}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                submissionTab === 'pending' 
                  ? 'bg-amber-50 text-amber-700 shadow-sm' 
                  : 'text-[var(--neo-text-secondary)] hover:text-[var(--neo-text-main)]'
              }`}
            >
              <Clock className="w-4 h-4" />
              در انتظار نمره
            </button>
            <button
              onClick={() => { setSubmissionTab('graded'); setPage(1); }}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                submissionTab === 'graded' 
                  ? 'bg-emerald-50 text-emerald-700 shadow-sm' 
                  : 'text-[var(--neo-text-secondary)] hover:text-[var(--neo-text-main)]'
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              نمره داده شده
            </button>
          </div>

          <div className="bg-[var(--neo-surface)] rounded-3xl shadow-sm border border-[var(--neo-border)] overflow-hidden">
            {isLoadingSubmissions ? (
              <div className="p-16 flex justify-center text-[var(--neo-primary)]"><Loader2 className="w-8 h-8 animate-spin" /></div>
            ) : submissionsList.length === 0 ? (
              <div className="p-16 text-center text-[var(--neo-text-secondary)] font-medium flex flex-col items-center">
                <FileText className="w-12 h-12 text-[var(--neo-text-secondary)]/40 mb-3" />
                هیچ پاسخی در این بخش یافت نشد.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right">
                  <thead>
                    <tr className="border-b border-[var(--neo-border)] bg-[var(--neo-surface-2)]/60">
                      <th className="p-4 font-bold text-[var(--neo-text-secondary)] text-sm">دانشجو</th>
                      <th className="p-4 font-bold text-[var(--neo-text-secondary)] text-sm">عنوان تکلیف</th>
                      <th className="p-4 font-bold text-[var(--neo-text-secondary)] text-sm">تاریخ ارسال</th>
                      <th className="p-4 font-bold text-[var(--neo-text-secondary)] text-sm text-center">وضعیت / نمره</th>
                      <th className="p-4 font-bold text-[var(--neo-text-secondary)] text-sm text-center">عملیات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--neo-border)]">
                    {submissionsList.map((sub: any) => (
                      <tr key={sub._id} className="hover:bg-[var(--neo-surface-2)]/40 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-[var(--neo-primary)]/10 text-[var(--neo-primary)] flex items-center justify-center font-bold text-sm">
                              {sub.userId?.firstName?.[0] || 'د'}
                            </div>
                            <div>
                              <div className="font-bold text-sm text-[var(--neo-text-main)]">
                                {sub.userId?.firstName} {sub.userId?.lastName}
                              </div>
                              <div className="text-xs text-[var(--neo-text-secondary)]">
                                {sub.userId?.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="font-bold text-sm text-[var(--neo-text-main)]">
                            {sub.assignmentId?.title || 'تکلیف بدون نام'}
                          </div>
                          {sub.assignmentId?.maxScore && (
                            <div className="text-xs text-[var(--neo-text-secondary)] mt-0.5">
                              حداکثر نمره: {sub.assignmentId.maxScore}
                            </div>
                          )}
                        </td>
                        <td className="p-4 text-xs font-medium text-[var(--neo-text-secondary)]">
                          {new Date(sub.submittedAt || sub.createdAt).toLocaleDateString('fa-IR')}
                        </td>
                        <td className="p-4 text-center">
                          {sub.status === 'graded' ? (
                            <span className="px-3 py-1 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 inline-flex items-center gap-1">
                              <CheckCircle className="w-3.5 h-3.5" />
                              نمره: {sub.score}
                            </span>
                          ) : (
                            <span className="px-3 py-1 rounded-xl text-xs font-bold bg-amber-50 text-amber-700 inline-flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              در انتظار بررسی
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => openGradeModal(sub)}
                            className="px-4 py-2 rounded-xl bg-[var(--neo-primary)] text-white text-xs font-bold hover:bg-[var(--neo-primary)] shadow-sm transition-all"
                          >
                            {sub.status === 'graded' ? 'مشاهده و ویرایش نمره' : 'بررسی و ثبت نمره'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: ASSIGNMENTS MANAGEMENT */}
      {activeMainTab === 'assignments' && (
        <div className="space-y-6">
          <div className="bg-[var(--neo-surface)] rounded-3xl shadow-sm border border-[var(--neo-border)] overflow-hidden">
            {isLoadingAssignments ? (
              <div className="p-16 flex justify-center text-[var(--neo-primary)]"><Loader2 className="w-8 h-8 animate-spin" /></div>
            ) : assignments.length === 0 ? (
              <div className="p-16 text-center text-[var(--neo-text-secondary)] font-medium flex flex-col items-center">
                <FileText className="w-12 h-12 text-[var(--neo-text-secondary)]/40 mb-3" />
                هنوز هیچ تکلیفی برای دوره‌ها تعریف نکرده‌اید.
                <button
                  onClick={openCreateModal}
                  className="mt-4 bg-[var(--neo-primary)] text-white px-5 py-2.5 rounded-2xl font-bold text-xs"
                >
                  تعریف اولین تکلیف
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right">
                  <thead>
                    <tr className="border-b border-[var(--neo-border)] bg-[var(--neo-surface-2)]/60">
                      <th className="p-4 font-bold text-[var(--neo-text-secondary)] text-sm">عنوان تکلیف و دوره</th>
                      <th className="p-4 font-bold text-[var(--neo-text-secondary)] text-sm text-center">نوع ارسال</th>
                      <th className="p-4 font-bold text-[var(--neo-text-secondary)] text-sm text-center">حداکثر نمره</th>
                      <th className="p-4 font-bold text-[var(--neo-text-secondary)] text-sm text-center">مهلت تحویل</th>
                      <th className="p-4 font-bold text-[var(--neo-text-secondary)] text-sm text-center">پاسخ‌های دریافتی</th>
                      <th className="p-4 font-bold text-[var(--neo-text-secondary)] text-sm text-center">عملیات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--neo-border)]">
                    {assignments.map((a: any) => (
                      <tr key={a._id} className="hover:bg-[var(--neo-surface-2)]/40 transition-colors">
                        <td className="p-4">
                          <div>
                            <div className="font-black text-sm text-[var(--neo-text-main)]">{a.title}</div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-lg bg-[var(--neo-primary)]/10 text-[var(--neo-primary)] font-bold">
                                <BookOpen className="w-3 h-3" />
                                {a.courseId?.title || 'دوره نامشخص'}
                              </span>
                              {a.lessonId?.title && (
                                <span className="text-xs text-[var(--neo-text-secondary)]">
                                  • درس: {a.lessonId.title}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-[var(--neo-surface-2)] text-[var(--neo-text-secondary)]">
                            {a.type === 'file_upload' ? 'ارسال فایل' : a.type === 'text_answer' ? 'پاسخ متنی' : 'ترکیبی (متن یا فایل)'}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <span className="text-xs font-black text-[var(--neo-text-main)] bg-[var(--neo-surface-2)] px-2.5 py-1 rounded-xl">
                            {a.maxScore || 100} نمره
                          </span>
                        </td>
                        <td className="p-4 text-center text-xs font-medium text-[var(--neo-text-secondary)]">
                          {a.deadline ? new Date(a.deadline).toLocaleDateString('fa-IR') : 'نامحدود'}
                        </td>
                        <td className="p-4 text-center">
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[var(--neo-surface-2)] rounded-xl text-xs font-bold">
                            <Users className="w-3.5 h-3.5 text-[var(--neo-primary)]" />
                            <span>{a.totalSubmissions || 0} پاسخ</span>
                            {a.pendingSubmissions > 0 && (
                              <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded-md text-[10px]">
                                {a.pendingSubmissions} نیازمند نمره
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => openEditModal(a)}
                              title="ویرایش تکلیف"
                              className="p-2 text-[var(--neo-text-secondary)] hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`آیا از حذف تکلیف «${a.title}» اطمینان دارید؟`)) {
                                  deleteAssignmentMutation.mutate(a._id);
                                }
                              }}
                              title="حذف تکلیف"
                              className="p-2 text-[var(--neo-text-secondary)] hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
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
        </div>
      )}

      {/* CREATE / EDIT ASSIGNMENT MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[var(--neo-surface)] w-full max-w-xl rounded-3xl shadow-2xl border border-[var(--neo-border)] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-[var(--neo-border)] flex justify-between items-center bg-[var(--neo-surface-2)]/50">
              <div>
                <h3 className="text-lg font-black text-[var(--neo-text-main)]">
                  {editingAssignmentId ? 'ویرایش تکلیف' : 'تعریف تکلیف جدید'}
                </h3>
                <p className="text-xs text-[var(--neo-text-secondary)] mt-1">مشخصات تکلیف و صورت سوال را وارد کنید.</p>
              </div>
              <button 
                onClick={closeAssignmentModal}
                className="w-9 h-9 rounded-2xl bg-[var(--neo-surface)] border border-[var(--neo-border)] flex items-center justify-center text-[var(--neo-text-secondary)] hover:text-red-500"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[var(--neo-text-secondary)] mb-1.5">
                  دوره آموزشی مربوطه *
                </label>
                <select
                  value={assignmentForm.courseId}
                  onChange={(e) => setAssignmentForm(prev => ({ ...prev, courseId: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-2xl bg-[var(--neo-surface-2)] border border-[var(--neo-border)] text-sm font-medium focus:outline-none focus:border-[var(--neo-primary)]"
                >
                  <option value="">انتخاب دوره</option>
                  {coursesData?.map((c: any) => (
                    <option key={c._id} value={c._id}>{c.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--neo-text-secondary)] mb-1.5">
                  عنوان تکلیف یا پروژه *
                </label>
                <input
                  type="text"
                  placeholder="مثال: تمرین پیاده‌سازی فرم لاگین با فرمیک"
                  value={assignmentForm.title}
                  onChange={(e) => setAssignmentForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-2xl bg-[var(--neo-surface-2)] border border-[var(--neo-border)] text-sm font-medium focus:outline-none focus:border-[var(--neo-primary)]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[var(--neo-text-secondary)] mb-1.5">
                    نوع دریافت پاسخ
                  </label>
                  <select
                    value={assignmentForm.type}
                    onChange={(e) => setAssignmentForm(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-2xl bg-[var(--neo-surface-2)] border border-[var(--neo-border)] text-sm font-medium focus:outline-none focus:border-[var(--neo-primary)]"
                  >
                    <option value="mixed">ترکیبی (متن یا فایل)</option>
                    <option value="file_upload">فقط ارسال فایل (Zip, PDF...)</option>
                    <option value="text_answer">فقط پاسخ متنی</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--neo-text-secondary)] mb-1.5">
                    حداکثر نمره (بارم)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={assignmentForm.maxScore}
                    onChange={(e) => setAssignmentForm(prev => ({ ...prev, maxScore: Number(e.target.value) }))}
                    className="w-full px-3 py-2.5 rounded-2xl bg-[var(--neo-surface-2)] border border-[var(--neo-border)] text-sm font-medium focus:outline-none focus:border-[var(--neo-primary)]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--neo-text-secondary)] mb-1.5">
                  مهلت ارسال (اختیاری)
                </label>
                <input
                  type="date"
                  value={assignmentForm.deadline}
                  onChange={(e) => setAssignmentForm(prev => ({ ...prev, deadline: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-2xl bg-[var(--neo-surface-2)] border border-[var(--neo-border)] text-sm font-medium focus:outline-none focus:border-[var(--neo-primary)]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--neo-text-secondary)] mb-1.5">
                  دستورالعمل و توضیحات تکلیف
                </label>
                <textarea
                  rows={4}
                  placeholder="شرح دقیق صورت مسئله، فایل‌های مورد نیاز و معیارهای ارزیابی را بنویسید..."
                  value={assignmentForm.description}
                  onChange={(e) => setAssignmentForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full p-3 rounded-2xl bg-[var(--neo-surface-2)] border border-[var(--neo-border)] text-sm font-medium focus:outline-none focus:border-[var(--neo-primary)]"
                />
              </div>
            </div>

            <div className="p-5 border-t border-[var(--neo-border)] flex justify-between items-center bg-[var(--neo-surface-2)]/50">
              <button
                type="button"
                onClick={closeAssignmentModal}
                className="px-5 py-2.5 rounded-2xl bg-[var(--neo-surface)] border border-[var(--neo-border)] text-xs font-bold text-[var(--neo-text-secondary)]"
              >
                انصراف
              </button>

              <button
                type="button"
                disabled={saveAssignmentMutation.isPending || !assignmentForm.title || !assignmentForm.courseId}
                onClick={() => saveAssignmentMutation.mutate(assignmentForm)}
                className="px-6 py-2.5 rounded-2xl bg-[var(--neo-primary)] text-white text-xs font-bold shadow-lg shadow-[var(--neo-primary)]/20 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {saveAssignmentMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                {editingAssignmentId ? 'ذخیره تغییرات' : 'ثبت و انتشار تکلیف'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GRADING MODAL */}
      {gradingSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[var(--neo-surface)] w-full max-w-xl rounded-3xl shadow-2xl border border-[var(--neo-border)] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-[var(--neo-border)] flex justify-between items-center bg-[var(--neo-surface-2)]/50">
              <div>
                <h3 className="text-lg font-black text-[var(--neo-text-main)] flex items-center gap-2">
                  <Award className="w-5 h-5 text-[var(--neo-primary)]" />
                  ارزیابی و نمره‌دهی تکلیف
                </h3>
                <p className="text-xs text-[var(--neo-text-secondary)] mt-1">
                  دانشجو: {gradingSubmission.userId?.firstName} {gradingSubmission.userId?.lastName}
                </p>
              </div>
              <button 
                onClick={() => setGradingSubmission(null)}
                className="w-9 h-9 rounded-2xl bg-[var(--neo-surface)] border border-[var(--neo-border)] flex items-center justify-center text-[var(--neo-text-secondary)] hover:text-red-500"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Submission Answer Content */}
              <div className="p-4 rounded-2xl bg-[var(--neo-surface-2)] border border-[var(--neo-border)]">
                <div className="text-xs font-bold text-[var(--neo-text-secondary)] mb-2">
                  پاسخ متنی ارسال شده توسط دانشجو:
                </div>
                {gradingSubmission.answerText ? (
                  <p className="text-sm font-medium text-[var(--neo-text-main)] leading-relaxed whitespace-pre-line">
                    {gradingSubmission.answerText}
                  </p>
                ) : (
                  <span className="text-xs text-[var(--neo-text-secondary)]">پاسخ متنی ارسال نشده است.</span>
                )}

                {/* Attached File */}
                {(gradingSubmission.fileUrl || (gradingSubmission.files && gradingSubmission.files.length > 0)) && (
                  <div className="mt-4 pt-3 border-t border-[var(--neo-border)] flex items-center gap-3">
                    <a
                      href={gradingSubmission.fileUrl || gradingSubmission.files[0]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--neo-primary)]/10 text-[var(--neo-primary)] rounded-xl text-xs font-bold hover:bg-[var(--neo-primary)] hover:text-white transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      دانلود فایل پیوست ارسالی دانشجو
                    </a>
                  </div>
                )}
              </div>

              {/* Score Input */}
              <div>
                <label className="block text-xs font-bold text-[var(--neo-text-secondary)] mb-1.5">
                  نمره اختصاص داده شده (از {gradingSubmission.assignmentId?.maxScore || 100}) *
                </label>
                <input
                  type="number"
                  min="0"
                  max={gradingSubmission.assignmentId?.maxScore || 100}
                  placeholder="مثال: 85"
                  value={gradeScore}
                  onChange={(e) => setGradeScore(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-[var(--neo-surface-2)] border border-[var(--neo-border)] text-sm font-black focus:outline-none focus:border-[var(--neo-primary)]"
                />
              </div>

              {/* Feedback Input */}
              <div>
                <label className="block text-xs font-bold text-[var(--neo-text-secondary)] mb-1.5">
                  بازخورد و پیام استاد برای دانشجو (اختیاری)
                </label>
                <textarea
                  rows={3}
                  placeholder="نکات مثبت، ایرادات و پیشنهادات اصلاحی را برای راهنمایی دانشجو بنویسید..."
                  value={gradeFeedback}
                  onChange={(e) => setGradeFeedback(e.target.value)}
                  className="w-full p-3 rounded-2xl bg-[var(--neo-surface-2)] border border-[var(--neo-border)] text-sm font-medium focus:outline-none focus:border-[var(--neo-primary)]"
                />
              </div>
            </div>

            <div className="p-5 border-t border-[var(--neo-border)] flex justify-between items-center bg-[var(--neo-surface-2)]/50">
              <button
                type="button"
                onClick={() => setGradingSubmission(null)}
                className="px-5 py-2.5 rounded-2xl bg-[var(--neo-surface)] border border-[var(--neo-border)] text-xs font-bold text-[var(--neo-text-secondary)]"
              >
                انصراف
              </button>

              <button
                type="button"
                disabled={gradeMutation.isPending || gradeScore === ''}
                onClick={() => gradeMutation.mutate({
                  id: gradingSubmission._id,
                  score: Number(gradeScore),
                  feedback: gradeFeedback
                })}
                className="px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {gradeMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                ثبت نمره و ارسال بازخورد
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
