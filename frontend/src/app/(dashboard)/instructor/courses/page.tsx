'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { coursesApi } from '@/features/courses/api/courses.api';
import Link from 'next/link';
import { 
  BookOpen, Plus, Loader2, Edit, AlertCircle, FileText, 
  CheckCircle, Clock, Users, Search, LayoutGrid, List, 
  Star, ExternalLink, CheckSquare, Layers, DollarSign, 
  ChevronRight, ChevronLeft, Sparkles
} from 'lucide-react';
import { useAuthStore } from '@/features/auth/stores/auth.store';

export default function InstructorCoursesPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'published' | 'pending_review' | 'draft' | 'rejected'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const { user } = useAuthStore();

  const { data, isLoading, error } = useQuery({
    queryKey: ['instructor-courses', activeTab, page],
    queryFn: () => coursesApi.getInstructorCourses({ 
      status: activeTab === 'all' ? undefined : activeTab,
      page,
      limit: 12
    }).then(res => res.data)
  });

  const courses = data?.courses || [];
  const totalPages = data?.pages || 1;
  const totalCount = data?.total || courses.length;

  const TABS = [
    { id: 'all', label: 'همه دوره‌ها' },
    { id: 'published', label: 'منتشر شده' },
    { id: 'pending_review', label: 'در انتظار تایید' },
    { id: 'draft', label: 'پیش‌نویس' },
    { id: 'rejected', label: 'رد شده' },
  ];

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'published': 
        return <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5"/> منتشر شده</span>;
      case 'pending_review': 
        return <span className="px-3 py-1 bg-amber-50 text-amber-700 rounded-xl text-xs font-bold flex items-center gap-1"><Clock className="w-3.5 h-3.5"/> در انتظار بررسی</span>;
      case 'draft': 
        return <span className="px-3 py-1 bg-[var(--neo-surface-2)] text-[var(--neo-text-main)] rounded-xl text-xs font-bold flex items-center gap-1"><FileText className="w-3.5 h-3.5"/> پیش‌نویس</span>;
      case 'rejected': 
        return <span className="px-3 py-1 bg-red-50 text-red-700 rounded-xl text-xs font-bold flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5"/> رد شده</span>;
      default: 
        return <span className="px-3 py-1 bg-[var(--neo-surface-2)] text-[var(--neo-text-main)] rounded-xl text-xs font-bold">{status}</span>;
    }
  };

  const filteredCourses = courses.filter((c: any) => 
    c.title?.toLowerCase().includes(search.toLowerCase()) || 
    c.slug?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[var(--neo-text-main)] flex items-center gap-2">
            <BookOpen className="w-7 h-7 text-[var(--neo-primary)]" />
            مدیریت دوره‌های آموزشی
          </h1>
          <p className="text-[var(--neo-text-secondary)] mt-1 text-sm">
            طراحی سرفصل‌ها، بارگذاری ویدیوها، تنظیم قیمت و پایش آمار دانشجویان
          </p>
        </div>

        <Link 
          href="/instructor/courses/new" 
          className="bg-[var(--neo-primary)] hover:bg-[var(--neo-primary)] text-white px-5 py-2.5 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-[var(--neo-primary)]/20 transition-all hover:scale-105"
        >
          <Plus className="w-5 h-5" />
          ایجاد دوره جدید
        </Link>
      </div>

      {/* KPI Cards Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[var(--neo-surface)] p-4 rounded-3xl border border-[var(--neo-border)] shadow-sm">
          <div className="text-xs font-bold text-[var(--neo-text-secondary)] mb-1">کل دوره‌ها</div>
          <div className="text-2xl font-black text-[var(--neo-text-main)]">{totalCount}</div>
        </div>
        <div className="bg-[var(--neo-surface)] p-4 rounded-3xl border border-[var(--neo-border)] shadow-sm">
          <div className="text-xs font-bold text-emerald-600 mb-1">دوره‌های منتشر شده</div>
          <div className="text-2xl font-black text-emerald-600">{courses.filter((c: any) => c.status === 'published').length}</div>
        </div>
        <div className="bg-[var(--neo-surface)] p-4 rounded-3xl border border-[var(--neo-border)] shadow-sm">
          <div className="text-xs font-bold text-amber-600 mb-1">در انتظار بررسی</div>
          <div className="text-2xl font-black text-amber-600">{courses.filter((c: any) => c.status === 'pending_review').length}</div>
        </div>
        <div className="bg-[var(--neo-surface)] p-4 rounded-3xl border border-[var(--neo-border)] shadow-sm">
          <div className="text-xs font-bold text-[var(--neo-text-secondary)] mb-1">پیش‌نویس</div>
          <div className="text-2xl font-black text-[var(--neo-text-main)]">{courses.filter((c: any) => c.status === 'draft').length}</div>
        </div>
      </div>

      {/* Filter and View Mode Controls */}
      <div className="bg-[var(--neo-surface)] p-4 rounded-3xl border border-[var(--neo-border)] shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        {/* Status Tabs */}
        <div className="flex overflow-x-auto pb-1 -mx-2 px-2 sm:mx-0 sm:px-0 w-full md:w-auto scrollbar-hide">
          <div className="flex gap-1.5 bg-[var(--neo-surface-2)] p-1 rounded-2xl border border-[var(--neo-border)] min-w-max">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id as any); setPage(1); }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === tab.id 
                    ? 'bg-[var(--neo-surface)] text-[var(--neo-primary)] shadow-sm font-black' 
                    : 'text-[var(--neo-text-secondary)] hover:text-[var(--neo-text-main)]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search & View Switcher */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--neo-text-secondary)]" />
            <input
              type="text"
              placeholder="جستجوی دوره..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-3 pr-9 py-2 rounded-2xl bg-[var(--neo-surface-2)] border border-[var(--neo-border)] text-xs font-medium focus:outline-none focus:border-[var(--neo-primary)]"
            />
          </div>

          <div className="flex items-center gap-1 bg-[var(--neo-surface-2)] p-1 rounded-2xl border border-[var(--neo-border)] shrink-0">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-xl transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-[var(--neo-surface)] text-[var(--neo-primary)] shadow-sm' 
                  : 'text-[var(--neo-text-secondary)] hover:text-[var(--neo-text-main)]'
              }`}
              title="نمایش شبکه‌ای"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-xl transition-colors ${
                viewMode === 'table' 
                  ? 'bg-[var(--neo-surface)] text-[var(--neo-primary)] shadow-sm' 
                  : 'text-[var(--neo-text-secondary)] hover:text-[var(--neo-text-main)]'
              }`}
              title="نمایش جدولی"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Courses List */}
      {isLoading ? (
        <div className="p-20 flex flex-col items-center justify-center text-[var(--neo-primary)] gap-3 bg-[var(--neo-surface)] rounded-3xl border border-[var(--neo-border)]">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="text-sm font-bold text-[var(--neo-text-secondary)]">در حال دریافت دوره‌ها...</span>
        </div>
      ) : error ? (
        <div className="p-16 text-center text-red-500 font-bold bg-[var(--neo-surface)] rounded-3xl border border-[var(--neo-border)]">
          خطا در دریافت لیست دوره‌ها
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="p-16 text-center flex flex-col items-center bg-[var(--neo-surface)] rounded-3xl border border-[var(--neo-border)]">
          <div className="w-20 h-20 bg-[var(--neo-surface-2)] rounded-3xl flex items-center justify-center mb-4 text-[var(--neo-text-secondary)]">
            <BookOpen className="w-10 h-10" />
          </div>
          <h3 className="text-lg font-bold text-[var(--neo-text-main)] mb-1">دوره‌ای یافت نشد</h3>
          <p className="text-sm text-[var(--neo-text-secondary)] mb-6 max-w-sm">
            شما هنوز در این وضعیت دوره‌ای ندارید یا با عبارت جستجو همخوانی ندارد.
          </p>
          <Link href="/instructor/courses/new" className="bg-[var(--neo-primary)] hover:bg-[var(--neo-primary)] text-white px-6 py-2.5 rounded-2xl font-bold transition-all shadow-md">
            ایجاد دوره جدید
          </Link>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course: any) => (
            <div key={course._id} className="bg-[var(--neo-surface)] rounded-3xl border border-[var(--neo-border)] overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col group">
              {/* Thumbnail */}
              <div className="relative aspect-video w-full bg-[var(--neo-surface-2)] overflow-hidden">
                {course.thumbnail ? (
                  <img 
                    src={course.thumbnail} 
                    alt={course.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[var(--neo-text-secondary)]">
                    <BookOpen className="w-12 h-12" />
                  </div>
                )}
                
                <div className="absolute top-3 right-3 z-10">
                  {getStatusBadge(course.status)}
                </div>

                <div className="absolute bottom-3 left-3 z-10">
                  <span className="px-3 py-1 rounded-xl bg-black/70 backdrop-blur-md text-white text-xs font-black">
                    {course.price === 0 ? 'رایگان' : `${course.price?.toLocaleString()} تومان`}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-black text-base text-[var(--neo-text-main)] line-clamp-1 mb-2">
                    {course.title}
                  </h3>

                  {course.rejectionReason && course.status === 'rejected' && (
                    <div className="p-2.5 rounded-xl bg-red-50 text-red-700 text-xs font-medium mb-3 border border-red-200">
                      علت رد دوره: {course.rejectionReason}
                    </div>
                  )}

                  {/* Course Stats Pills */}
                  <div className="grid grid-cols-2 gap-2 py-3 border-y border-[var(--neo-border)] my-3 text-xs text-[var(--neo-text-secondary)] font-bold">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-[var(--neo-primary)]" />
                      <span>{course.studentsCount || course.enrollmentsCount || 0} دانشجو</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-purple-600" />
                      <span>{course.chapters?.length || 0} فصل آموزشی</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      <span>{course.rating ? Number(course.rating).toFixed(1) : '۵.۰'} رضایت</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-emerald-600" />
                      <span>{course.level === 'beginner' ? 'مقدماتی' : course.level === 'intermediate' ? 'متوسط' : 'پیشرفته'}</span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-2 flex items-center justify-between gap-2">
                  <Link
                    href={`/instructor/courses/${course._id}/edit`}
                    className="flex-1 py-2.5 rounded-2xl bg-[var(--neo-primary)] hover:bg-[var(--neo-primary)] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-[var(--neo-primary)]/20 transition-all"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    ویرایش محتوا و دروس
                  </Link>

                  <Link
                    href={`/instructor/students?course=${course._id}`}
                    title="دانشجویان این دوره"
                    className="p-2.5 rounded-2xl bg-[var(--neo-surface-2)] text-[var(--neo-text-secondary)] hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                  >
                    <Users className="w-4 h-4" />
                  </Link>

                  <Link
                    href={`/courses/${course.slug || course._id}`}
                    target="_blank"
                    title="مشاهده صفحه عمومی دوره"
                    className="p-2.5 rounded-2xl bg-[var(--neo-surface-2)] text-[var(--neo-text-secondary)] hover:text-[var(--neo-primary)] hover:bg-blue-50 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-[var(--neo-surface)] rounded-3xl shadow-sm border border-[var(--neo-border)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="border-b border-[var(--neo-border)] bg-[var(--neo-surface-2)]/60">
                  <th className="p-4 font-bold text-[var(--neo-text-secondary)] text-sm">عنوان دوره</th>
                  <th className="p-4 font-bold text-[var(--neo-text-secondary)] text-sm text-center">وضعیت</th>
                  <th className="p-4 font-bold text-[var(--neo-text-secondary)] text-sm text-center">دانشجویان</th>
                  <th className="p-4 font-bold text-[var(--neo-text-secondary)] text-sm text-center">قیمت</th>
                  <th className="p-4 font-bold text-[var(--neo-text-secondary)] text-sm text-center">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--neo-border)]">
                {filteredCourses.map((course: any) => (
                  <tr key={course._id} className="hover:bg-[var(--neo-surface-2)]/40 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-11 rounded-xl bg-[var(--neo-surface-2)] overflow-hidden shrink-0 border border-[var(--neo-border)]">
                          {course.thumbnail ? (
                            <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[var(--neo-text-secondary)]">
                              <BookOpen className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-sm text-[var(--neo-text-main)] line-clamp-1">{course.title}</div>
                          {course.rejectionReason && course.status === 'rejected' && (
                            <div className="text-xs text-red-500 font-medium mt-0.5">
                              علت رد: {course.rejectionReason}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      {getStatusBadge(course.status)}
                    </td>
                    <td className="p-4 text-center">
                      <span className="text-xs font-bold text-[var(--neo-text-secondary)]">
                        {course.studentsCount || course.enrollmentsCount || 0} نفر
                      </span>
                    </td>
                    <td className="p-4 text-center font-bold text-sm text-[var(--neo-text-main)]">
                      {course.price === 0 ? 'رایگان' : `${course.price?.toLocaleString()} تومان`}
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <Link 
                          href={`/instructor/students?course=${course._id}`}
                          className="p-2 text-[var(--neo-text-secondary)] hover:bg-emerald-500/10 hover:text-emerald-600 rounded-xl transition-colors"
                          title="مشاهده دانشجویان این دوره"
                        >
                          <Users className="w-4 h-4" />
                        </Link>
                        <Link 
                          href={`/instructor/courses/${course._id}/edit`}
                          className="p-2 text-[var(--neo-text-secondary)] hover:bg-[var(--neo-primary)]/10 hover:text-[var(--neo-primary)] rounded-xl transition-colors"
                          title="ویرایش / مدیریت سرفصل‌ها"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <Link 
                          href={`/courses/${course.slug || course._id}`}
                          target="_blank"
                          className="p-2 text-[var(--neo-text-secondary)] hover:bg-blue-500/10 hover:text-[var(--neo-primary)] rounded-xl transition-colors"
                          title="مشاهده در سایت"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 pt-4">
          <button
            onClick={() => setPage(p => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="p-2 rounded-xl bg-[var(--neo-surface)] border border-[var(--neo-border)] text-[var(--neo-text-secondary)] disabled:opacity-40 hover:bg-[var(--neo-surface-2)] transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          
          <span className="text-xs font-bold text-[var(--neo-text-secondary)] px-3">
            صفحه {page} از {totalPages}
          </span>

          <button
            onClick={() => setPage(p => Math.min(p + 1, totalPages))}
            disabled={page === totalPages}
            className="p-2 rounded-xl bg-[var(--neo-surface)] border border-[var(--neo-border)] text-[var(--neo-text-secondary)] disabled:opacity-40 hover:bg-[var(--neo-surface-2)] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
