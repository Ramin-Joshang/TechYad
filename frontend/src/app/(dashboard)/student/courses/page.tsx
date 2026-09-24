'use client';

import { useQuery } from '@tanstack/react-query';
import { learningApi } from '@/features/learning/api/learning.api';
import { 
  BookOpen, Search, PlayCircle, Loader2, Award, CheckCircle2, 
  Clock, Sparkles, Filter, ChevronLeft, ArrowRight, User, 
  FileText, Download, X, Star, ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import { useState, useMemo } from 'react';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import toast from 'react-hot-toast';

export default function MyCoursesPage() {
  const { user } = useAuthStore();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'in_progress' | 'completed' | 'free' | 'purchase'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'progress_desc' | 'title'>('recent');

  // Modal States
  const [selectedCourseForSyllabus, setSelectedCourseForSyllabus] = useState<any>(null);
  const [selectedCertificate, setSelectedCertificate] = useState<any>(null);

  const { data: enrollmentsData, isLoading } = useQuery({
    queryKey: ['myEnrollments'],
    queryFn: () => learningApi.getMyEnrollments().then(res => res.data)
  });

  const enrollments: any[] = enrollmentsData || [];

  // Metrics
  const stats = useMemo(() => {
    const total = enrollments.length;
    const completed = enrollments.filter(e => (e.progress || 0) >= 100 || e.status === 'completed').length;
    const inProgress = enrollments.filter(e => (e.progress || 0) > 0 && (e.progress || 0) < 100).length;
    const notStarted = enrollments.filter(e => !e.progress || e.progress === 0).length;
    const totalCompletedLessons = enrollments.reduce((acc, curr) => acc + (curr.completedLessons || 0), 0);

    return { total, completed, inProgress, notStarted, totalCompletedLessons };
  }, [enrollments]);

  // Filtered and Sorted
  const filteredCourses = useMemo(() => {
    return enrollments
      .filter((e: any) => {
        const course = e.courseId;
        if (!course) return false;
        
        // Search Filter
        const matchesSearch = 
          course.title?.toLowerCase().includes(search.toLowerCase()) ||
          course.category?.name?.toLowerCase().includes(search.toLowerCase()) ||
          course.instructors?.[0]?.firstName?.toLowerCase().includes(search.toLowerCase()) ||
          course.instructors?.[0]?.lastName?.toLowerCase().includes(search.toLowerCase());

        if (!matchesSearch) return false;

        // Tab Filter
        const progress = e.progress || 0;
        if (activeTab === 'in_progress') return progress < 100;
        if (activeTab === 'completed') return progress >= 100 || e.status === 'completed';
        if (activeTab === 'free') return e.source === 'free' || course.price === 0;
        if (activeTab === 'purchase') return e.source === 'purchase' || course.price > 0;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'progress_desc') {
          return (b.progress || 0) - (a.progress || 0);
        }
        if (sortBy === 'title') {
          return (a.courseId?.title || '').localeCompare(b.courseId?.title || '');
        }
        // Default: recent
        const dateA = new Date(a.lastAccessedAt || a.enrolledAt || 0).getTime();
        const dateB = new Date(b.lastAccessedAt || b.enrolledAt || 0).getTime();
        return dateB - dateA;
      });
  }, [enrollments, search, activeTab, sortBy]);

  return (
    <div className="space-y-8 pb-16 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
            <span>پنل دانشجو</span>
            <span aria-hidden="true">·</span>
            <span className="text-indigo-600 font-semibold">میز یادگیری</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-indigo-600" />
            دوره‌های آموزشی من
          </h1>
          <p className="text-sm sm:text-base text-slate-600 mt-1">
            به یادگیری مداوم ادامه دهید؛ هر گام شما را به تخصص و موقعیت‌های شغلی برتر نزدیک‌تر می‌کند.
          </p>
        </div>

        <Link
          href="/courses"
          className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition shadow-sm self-start md:self-auto"
        >
          <Sparkles className="w-4 h-4" />
          کاوش دوره‌های جدید
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-3 text-xs sm:text-sm font-medium">
            <span>کل دوره‌های ثبت‌نامی</span>
            <BookOpen className="w-5 h-5 text-indigo-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">{stats.total.toLocaleString('fa-IR')}</span>
            <span className="text-xs text-slate-500">دوره</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-3 text-xs sm:text-sm font-medium">
            <span>دوره‌های در حال یادگیری</span>
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-amber-600">{stats.inProgress.toLocaleString('fa-IR')}</span>
            <span className="text-xs text-slate-500">فعال</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-3 text-xs sm:text-sm font-medium">
            <span>دوره‌های تکمیل شده</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-emerald-600">{stats.completed.toLocaleString('fa-IR')}</span>
            <span className="text-xs text-slate-500">موفق</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-3 text-xs sm:text-sm font-medium">
            <span>درس‌های گذرانده شده</span>
            <Award className="w-5 h-5 text-purple-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-purple-600">{stats.totalCompletedLessons.toLocaleString('fa-IR')}</span>
            <span className="text-xs text-slate-500">جلسه</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Interactive Segmented Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-2 text-xs sm:text-sm font-bold rounded-xl transition ${
              activeTab === 'all'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            همه دوره‌ها ({stats.total.toLocaleString('fa-IR')})
          </button>

          <button
            onClick={() => setActiveTab('in_progress')}
            className={`px-3.5 py-2 text-xs sm:text-sm font-bold rounded-xl transition ${
              activeTab === 'in_progress'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            در حال مشاهده ({stats.inProgress.toLocaleString('fa-IR')})
          </button>

          <button
            onClick={() => setActiveTab('completed')}
            className={`px-3.5 py-2 text-xs sm:text-sm font-bold rounded-xl transition ${
              activeTab === 'completed'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            تکمیل شده ({stats.completed.toLocaleString('fa-IR')})
          </button>

          <button
            onClick={() => setActiveTab('purchase')}
            className={`px-3.5 py-2 text-xs sm:text-sm font-bold rounded-xl transition ${
              activeTab === 'purchase'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            خریداری شده
          </button>
        </div>

        {/* Search & Sort Controls */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="جستجوی نام دوره، مدرس یا دسته‌بندی..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-3 pr-9 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
            />
            {search && (
              <button 
                onClick={() => setSearch('')} 
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          <select
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="recent">آخرین فعالیت</option>
            <option value="progress_desc">بیشترین پیشرفت</option>
            <option value="title">عنوان دوره</option>
          </select>
        </div>

      </div>

      {/* Content State */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-slate-200 shadow-sm">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
          <p className="text-slate-600 text-sm font-medium">در حال بارگذاری دوره‌های شما...</p>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-slate-200 shadow-sm flex flex-col items-center justify-center max-w-xl mx-auto">
          <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mb-6">
            <BookOpen className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">
            {search ? 'نتیجه‌ای برای جستجوی شما پیدا نشد' : 'دوره‌ای در این بخش موجود نیست'}
          </h3>
          <p className="text-slate-600 text-sm mb-8 leading-relaxed">
            {search
              ? 'لطفاً کلمات کلیدی دیگری را جستجو کنید یا فیلتر تب‌ها را تغییر دهید.'
              : 'شما در این دسته‌بندی دوره‌ای ندارید. می‌توانید از کاتالوگ دوره‌های سایت، دوره مورد نظر خود را انتخاب و یادگیری را شروع کنید.'}
          </p>
          <Link
            href="/courses"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-7 py-3 rounded-xl font-bold text-sm transition shadow-sm"
          >
            مشاهده کاتالوگ دوره‌های آموزشی
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCourses.map((enrollment: any) => {
            const course = enrollment.courseId;
            if (!course) return null;

            const progress = enrollment.progress || 0;
            const isCompleted = progress >= 100 || enrollment.status === 'completed';
            const totalLessons = course.totalLessons || 1;
            const completedCount = enrollment.completedLessons || Math.round((progress * totalLessons) / 100);
            const instructor = course.instructors?.[0];
            const instructorName = instructor 
              ? `${instructor.firstName} ${instructor.lastName}` 
              : 'استاد تک‌یاد';

            return (
              <div 
                key={enrollment._id} 
                className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col group"
              >
                {/* Thumbnail with overlay duration & category */}
                <div className="relative aspect-video bg-slate-100 overflow-hidden">
                  <img 
                    src={course.thumbnail || `https://picsum.photos/seed/${course._id}/500/300`} 
                    alt={course.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
                  
                  {/* Category unboxed tag */}
                  <div className="absolute top-3 right-3 text-xs text-white font-bold bg-black/40 backdrop-blur-md px-3 py-1 rounded-lg">
                    {course.category?.name || 'آموزش تخصصی'}
                  </div>

                  {/* Completed Badge */}
                  {isCompleted && (
                    <div className="absolute top-3 left-3 bg-emerald-500 text-white text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      تکمیل شده
                    </div>
                  )}

                  {/* Duration unboxed text */}
                  {course.totalDuration && (
                    <div className="absolute bottom-3 left-3 text-xs text-white/90 font-medium flex items-center gap-1 bg-black/50 px-2 py-0.5 rounded">
                      <Clock className="w-3 h-3" />
                      {course.totalDuration}
                    </div>
                  )}
                </div>

                {/* Course Body */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    {/* Instructor unboxed metadata */}
                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                      <img 
                        src={instructor?.avatar || `https://ui-avatars.com/api/?name=${instructorName}&size=32`} 
                        alt={instructorName}
                        className="w-5 h-5 rounded-full object-cover"
                      />
                      <span>{instructorName}</span>
                      <span aria-hidden="true">·</span>
                      <span>سطح {course.level === 'beginner' ? 'مقدماتی' : course.level === 'advanced' ? 'پیشرفته' : 'متوسط'}</span>
                    </div>

                    <h3 className="font-bold text-base sm:text-lg text-slate-900 group-hover:text-indigo-600 transition line-clamp-2 leading-snug">
                      <Link href={`/courses/${course.slug}`}>
                        {course.title}
                      </Link>
                    </h3>
                  </div>

                  {/* Progress & Lessons Info */}
                  <div className="space-y-2 pt-2">
                    <div className="flex justify-between items-center text-xs font-semibold">
                      <span className="text-slate-600">
                        {completedCount} از {totalLessons} جلسه تکمیل شده
                      </span>
                      <span className={isCompleted ? 'text-emerald-600' : 'text-indigo-600'}>
                        {progress}٪
                      </span>
                    </div>

                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div 
                        className={`h-2 rounded-full transition-all duration-700 ${
                          isCompleted ? 'bg-emerald-500' : 'bg-indigo-600'
                        }`} 
                        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                      />
                    </div>

                    {/* Last active lesson banner */}
                    {enrollment.lastLessonId && (
                      <p className="text-[11px] text-slate-500 truncate pt-1">
                        آخرین جلسه: <strong className="text-slate-700">{enrollment.lastLessonId.title}</strong>
                      </p>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
                    <Link
                      href={`/learn/${course.slug}`}
                      className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl font-bold text-xs sm:text-sm transition shadow-sm"
                    >
                      <PlayCircle className="w-4 h-4" />
                      {progress === 0 ? 'شروع مشاهده دوره' : 'ادامه یادگیری'}
                    </Link>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <button
                        onClick={() => setSelectedCourseForSyllabus(course)}
                        className="flex items-center justify-center gap-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 py-2 rounded-lg font-medium transition border border-slate-200"
                      >
                        <FileText className="w-3.5 h-3.5 text-slate-500" />
                        سرفصل‌ها
                      </button>

                      {isCompleted ? (
                        <button
                          onClick={() => setSelectedCertificate({ enrollment, course })}
                          className="flex items-center justify-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 py-2 rounded-lg font-bold transition border border-emerald-200"
                        >
                          <Award className="w-3.5 h-3.5 text-emerald-600" />
                          گواهی پایان دوره
                        </button>
                      ) : (
                        <Link
                          href={`/courses/${course.slug}`}
                          className="flex items-center justify-center gap-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 py-2 rounded-lg font-medium transition border border-slate-200"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                          صفحه دوره
                        </Link>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Syllabus Modal */}
      {selectedCourseForSyllabus && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg text-slate-900">سرفصل‌ها و جلسات دوره</h3>
                <p className="text-xs text-slate-500 mt-0.5">{selectedCourseForSyllabus.title}</p>
              </div>
              <button
                onClick={() => setSelectedCourseForSyllabus(null)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-100">
                <span>تعداد کل جلسات: {selectedCourseForSyllabus.totalLessons || 0} جلسه</span>
                <span>مدت زمان کل: {selectedCourseForSyllabus.totalDuration || 'مشخص نشده'}</span>
              </div>

              {selectedCourseForSyllabus.syllabus && selectedCourseForSyllabus.syllabus.length > 0 ? (
                <div className="space-y-3">
                  {selectedCourseForSyllabus.syllabus.map((item: any, idx: number) => (
                    <div key={idx} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="text-sm font-semibold text-slate-800">{item.title || item.name}</span>
                      </div>
                      <span className="text-xs text-slate-500">{item.duration || ''}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-slate-500 text-sm">
                  جلسات در حال تدوین و به‌روزرسانی هستند یا از طریق پلیر قابل مشاهده‌اند.
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
              <Link
                href={`/learn/${selectedCourseForSyllabus.slug}`}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition"
              >
                رفتن به محیط یادگیری
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Certificate Modal */}
      {selectedCertificate && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-8 shadow-2xl relative animate-in zoom-in-95 duration-200 border-4 border-amber-400/40">
            <button
              onClick={() => setSelectedCertificate(null)}
              className="absolute top-5 left-5 w-8 h-8 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 flex items-center justify-center transition"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Certificate Template */}
            <div className="border-2 border-slate-200 p-8 rounded-2xl text-center space-y-6 bg-gradient-to-b from-amber-50/40 via-white to-amber-50/20">
              <div className="w-16 h-16 mx-auto bg-amber-100 text-amber-600 rounded-full flex items-center justify-center shadow-inner">
                <Award className="w-8 h-8" />
              </div>

              <div>
                <span className="text-xs font-bold text-amber-700 uppercase tracking-widest block mb-1">
                  سامانه مدیریت آموزش و مهارت تک‌یاد
                </span>
                <h2 className="text-2xl font-black text-slate-900">گواهینامه پایان دوره آموزشی</h2>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
                بدین‌وسیله گواهی می‌شود که دانشجو <strong className="text-slate-900 font-bold">{user?.firstName} {user?.lastName}</strong> سرفصل‌های دوره تخصصی:
              </p>

              <div className="text-xl font-black text-indigo-700 py-2 border-y border-amber-200">
                «{selectedCertificate.course.title}»
              </div>

              <p className="text-xs text-slate-500">
                را با موفقیت ۱۰۰٪ و کسب مهارت‌های عملی مورد نیاز به پایان رسانده است.
              </p>

              <div className="pt-4 flex justify-between items-center text-[11px] text-slate-400 border-t border-slate-100 font-mono">
                <span>کد اصالت: TY-CERT-{selectedCertificate.enrollment._id.slice(-8).toUpperCase()}</span>
                <span>تاریخ صدور: {new Date().toLocaleDateString('fa-IR')}</span>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  window.print();
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition shadow-sm flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                چاپ و دریافت PDF گواهینامه
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
