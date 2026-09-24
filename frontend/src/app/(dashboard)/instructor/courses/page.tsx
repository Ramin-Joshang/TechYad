'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { coursesApi } from '@/features/courses/api/courses.api';
import Link from 'next/link';
import { BookOpen, Plus, Loader2, Edit, AlertCircle, FileText, CheckCircle, Clock, Users } from 'lucide-react';
import { useAuthStore } from '@/features/auth/stores/auth.store';

export default function InstructorCoursesPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'published' | 'pending_review' | 'draft' | 'rejected'>('all');
  const [page, setPage] = useState(1);
  const { user } = useAuthStore();

  const { data, isLoading, error } = useQuery({
    queryKey: ['instructor-courses', activeTab, page],
    queryFn: () => coursesApi.getInstructorCourses({ 
      status: activeTab === 'all' ? undefined : activeTab,
      page,
      limit: 10
    }).then(res => res.data)
  });

  const TABS = [
    { id: 'all', label: 'همه دوره‌ها' },
    { id: 'published', label: 'منتشر شده' },
    { id: 'pending_review', label: 'در انتظار تایید' },
    { id: 'draft', label: 'پیش‌نویس' },
    { id: 'rejected', label: 'رد شده' },
  ];

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'published': return <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold flex items-center gap-1"><CheckCircle className="w-3 h-3"/> منتشر شده</span>;
      case 'pending_review': return <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold flex items-center gap-1"><Clock className="w-3 h-3"/> در انتظار تایید</span>;
      case 'draft': return <span className="px-3 py-1 bg-[var(--neo-surface-2)] text-[var(--neo-text-main)] rounded-full text-xs font-bold flex items-center gap-1"><FileText className="w-3 h-3"/> پیش‌نویس</span>;
      case 'rejected': return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold flex items-center gap-1"><AlertCircle className="w-3 h-3"/> رد شده</span>;
      default: return <span className="px-3 py-1 bg-[var(--neo-surface-2)] text-[var(--neo-text-main)] rounded-full text-xs font-bold">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-[var(--neo-text-main)]">دوره‌های من</h1>
          <p className="text-[var(--neo-text-secondary)] mt-1">مدیریت دوره‌های آموزشی، فصول و دروس</p>
        </div>
        <Link href="/instructor/courses/new" className="bg-[var(--neo-primary)] hover:bg-[var(--neo-primary)] text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-colors">
          <Plus className="w-5 h-5" />
          ایجاد دوره جدید
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
        <div className="flex gap-2 bg-[var(--neo-surface)] p-1.5 rounded-2xl border border-[var(--neo-border)] shadow-sm min-w-max">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id as any); setPage(1); }}
              className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${
                activeTab === tab.id 
                  ? 'bg-[var(--neo-primary)]/10 text-[var(--neo-primary)] shadow-sm' 
                  : 'text-[var(--neo-text-secondary)] hover:text-[var(--neo-text-main)] hover:bg-[var(--neo-surface-2)]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="bg-[var(--neo-surface)] rounded-3xl shadow-sm border border-[var(--neo-border)] overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex justify-center items-center text-[var(--neo-primary)]">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : error ? (
          <div className="p-12 text-center text-red-500 font-bold">
            خطا در دریافت لیست دوره‌ها
          </div>
        ) : data?.courses.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-[var(--neo-surface-2)] rounded-full flex items-center justify-center mb-4">
              <BookOpen className="w-10 h-10 text-[var(--neo-text-muted)]" />
            </div>
            <h3 className="text-lg font-bold text-[var(--neo-text-main)] mb-2">هنوز دوره‌ای ندارید</h3>
            <p className="text-[var(--neo-text-secondary)] mb-6">اولین دوره آموزشی خود را بسازید و کسب درآمد را شروع کنید.</p>
            <Link href="/instructor/courses/new" className="bg-[var(--neo-primary)] hover:bg-[var(--neo-primary)] text-white px-6 py-3 rounded-xl font-bold transition-colors">
              ایجاد اولین دوره
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="border-b border-[var(--neo-border)] bg-[var(--neo-surface-2)]/50">
                  <th className="p-4 font-bold text-[var(--neo-text-secondary)] text-sm">دوره</th>
                  <th className="p-4 font-bold text-[var(--neo-text-secondary)] text-sm">وضعیت</th>
                  <th className="p-4 font-bold text-[var(--neo-text-secondary)] text-sm">قیمت</th>
                  <th className="p-4 font-bold text-[var(--neo-text-secondary)] text-sm">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {data?.courses.map((course: any) => (
                  <tr key={course._id} className="border-b border-[var(--neo-border)] hover:bg-[var(--neo-surface-2)]/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-12 bg-[var(--neo-surface-2)] rounded-lg overflow-hidden shrink-0 border border-[var(--neo-border)]">
                          {course.thumbnail ? (
                            <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[var(--neo-text-muted)]">
                              <BookOpen className="w-5 h-5" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-[var(--neo-text-main)] text-sm md:text-base line-clamp-1">{course.title}</div>
                          {course.rejectionReason && course.status === 'rejected' && (
                            <div className="text-xs text-red-500 font-medium mt-1 truncate max-w-xs">
                              علت رد: {course.rejectionReason}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      {getStatusBadge(course.status)}
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-[var(--neo-text-main)]">
                        {course.price === 0 ? 'رایگان' : `${course.price.toLocaleString()} تومان`}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        <Link 
                          href={`/instructor/students?course=${course._id}`}
                          className="inline-flex items-center justify-center p-2 text-[var(--neo-text-secondary)] hover:bg-emerald-500/10 hover:text-emerald-600 rounded-lg transition-colors"
                          title="مشاهده دانشجویان این دوره"
                        >
                          <Users className="w-5 h-5" />
                        </Link>
                        <Link 
                          href={`/instructor/courses/${course._id}/edit`}
                          className="inline-flex items-center justify-center p-2 text-[var(--neo-text-secondary)] hover:bg-[var(--neo-primary)]/10 hover:text-[var(--neo-primary)] rounded-lg transition-colors"
                          title="ویرایش / مدیریت دروس"
                        >
                          <Edit className="w-5 h-5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Pagination Mock (Could be improved) */}
      {data && data.pages > 1 && (
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
    </div>
  );
}
