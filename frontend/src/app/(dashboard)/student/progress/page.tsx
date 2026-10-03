'use client';

import { useQuery } from '@tanstack/react-query';
import { learningApi } from '@/features/learning/api/learning.api';
import { classesApi } from '@/features/learning/api/classes.api';
import { 
  TrendingUp, BookOpen, CheckCircle2, Clock, PlayCircle, 
  Video, Calendar, Award, ChevronLeft, Loader2, Sparkles, 
  Layers, BarChart2 
} from 'lucide-react';
import Link from 'next/link';

export default function StudentProgressPage() {
  const { data: enrollmentsData, isLoading: isEnrollmentsLoading } = useQuery({
    queryKey: ['myEnrollments'],
    queryFn: async () => {
      const res = await learningApi.getMyEnrollments();
      return res.data?.data || res.data || [];
    }
  });

  const { data: classesData, isLoading: isClassesLoading } = useQuery({
    queryKey: ['myClasses'],
    queryFn: async () => {
      const res = await classesApi.getMyClasses();
      return res.data || [];
    }
  });

  const enrollments = Array.isArray(enrollmentsData) ? enrollmentsData : [];
  const classes = Array.isArray(classesData) ? classesData : [];
  const isLoading = isEnrollmentsLoading || isClassesLoading;

  // Compute metrics
  const completedCourses = enrollments.filter((e: any) => (e.progress || 0) >= 100);
  const inProgressCourses = enrollments.filter((e: any) => (e.progress || 0) < 100 && (e.progress || 0) > 0);
  
  const totalLessonsCompleted = enrollments.reduce((acc: number, curr: any) => acc + (curr.completedLessons?.length || curr.completedLessonsCount || 0), 0);
  
  const totalProgressSum = enrollments.reduce((acc: number, curr: any) => acc + (curr.progress || 0), 0);
  const averageProgress = enrollments.length > 0 ? Math.round(totalProgressSum / enrollments.length) : 0;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-[var(--neo-border)] shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[var(--neo-text-main)]">پیشرفت تحصیلی و روند یادگیری</h1>
            <p className="text-xs sm:text-sm text-[var(--neo-text-secondary)] mt-0.5">
              رهگیری میزان پیشرفت دروس، جلسات گذرانده شده و تداوم فرآیند یادگیری
            </p>
          </div>
        </div>

        <Link
          href="/student/grades"
          className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
        >
          <Award className="w-4 h-4 text-amber-600" />
          مشاهده کارنامه و نمرات
        </Link>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[var(--neo-border)] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <span className="text-xs font-bold text-[var(--neo-text-muted)]">میانگین پیشرفت کل</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-black text-emerald-600 font-mono">{averageProgress}٪</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-3">
            <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${averageProgress}%` }} />
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[var(--neo-border)] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <span className="text-xs font-bold text-[var(--neo-text-muted)]">دوره‌های تکمیل‌شده</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-black text-blue-600 font-mono">{completedCourses.length}</span>
            <span className="text-xs text-[var(--neo-text-muted)] font-bold">از {enrollments.length} دوره</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-3">
            <div 
              className="bg-blue-500 h-full rounded-full transition-all duration-500" 
              style={{ width: `${enrollments.length > 0 ? (completedCourses.length / enrollments.length) * 100 : 0}%` }} 
            />
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[var(--neo-border)] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <span className="text-xs font-bold text-[var(--neo-text-muted)]">درس‌های مشاهده‌شده</span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-black text-purple-600 font-mono">{totalLessonsCompleted}</span>
            <span className="text-xs text-[var(--neo-text-muted)] font-bold">درس / ویدیو</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-3 block">محتوای ضبط‌شده تماشا شده</span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[var(--neo-border)] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <span className="text-xs font-bold text-[var(--neo-text-muted)]">کلاس‌های فعال</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Video className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-black text-amber-600 font-mono">{classes.length}</span>
            <span className="text-xs text-[var(--neo-text-muted)] font-bold">کلاس آنلاین/حضوری</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-3 block">کارگاه‌های تعاملی</span>
        </div>
      </div>

      {/* Courses Progress List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-black text-[var(--neo-text-main)] flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            روند پیشرفت در دوره‌های ثبت‌نامی
          </h2>
          <Link href="/student/courses" className="text-xs text-blue-600 hover:underline flex items-center gap-0.5 font-bold">
            مشاهده همه دوره‌ها <ChevronLeft className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-20 bg-white rounded-3xl border border-[var(--neo-border)]">
            <Loader2 className="w-8 h-8 animate-spin text-[var(--neo-primary)] mb-2" />
            <span className="text-xs font-bold text-[var(--neo-text-secondary)]">در حال دریافت داده‌های پیشرفت...</span>
          </div>
        ) : enrollments.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-[var(--neo-border)]">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-800 mb-1">شما هنوز در دوره‌ای ثبت‌نام نکرده‌اید</h3>
            <p className="text-xs text-slate-500 mb-4">برای شروع مسیر یادگیری، از کاتالوگ دوره‌های آموزشی دیدن کنید.</p>
            <Link
              href="/courses"
              className="px-5 py-2.5 bg-[var(--neo-primary)] text-white text-xs font-bold rounded-xl shadow-xs inline-flex items-center gap-1.5"
            >
              مشاهده کاتالوگ دوره‌ها <ChevronLeft className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {enrollments.map((enr: any) => {
              const course = enr.courseId || enr;
              const progress = Math.min(100, Math.max(0, Math.round(enr.progress || 0)));
              const isCompleted = progress >= 100;
              const completedCount = enr.completedLessons?.length || enr.completedLessonsCount || 0;
              const totalLessons = course.totalLessons || enr.totalLessonsCount || 10;
              const instructor = course.instructors?.[0];

              return (
                <div 
                  key={enr._id || course._id} 
                  className="bg-white p-5 rounded-3xl border border-[var(--neo-border)] hover:border-blue-200 transition shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex gap-4 items-start mb-4">
                      <div className="w-20 h-16 rounded-2xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                        <img 
                          src={course.thumbnail || `https://picsum.photos/seed/${course._id}/200/150`} 
                          alt={course.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                            isCompleted ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-50 text-blue-700'
                          }`}>
                            {isCompleted ? 'تکمیل شده' : 'در حال یادگیری'}
                          </span>
                          <span className="text-xs font-black text-slate-800 font-mono">
                            {progress}٪
                          </span>
                        </div>
                        <h3 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-1 mt-1">
                          {course.title}
                        </h3>
                        {instructor && (
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            مدرس: {instructor.firstName} {instructor.lastName}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1.5 mb-4">
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            isCompleted ? 'bg-emerald-500' : 'bg-blue-600'
                          }`}
                          style={{ width: `${progress}%` }} 
                        />
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>جلسات پاس‌شده: {completedCount} از {totalLessons}</span>
                        <span>{isCompleted ? 'تمام مباحث کامل شد' : `${totalLessons - completedCount} درس باقیمانده`}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {course.totalDuration ? `${course.totalDuration} ساعت` : 'دوره جامع'}
                    </span>

                    <Link
                      href={`/courses/${course.slug || course._id}`}
                      className="px-4 py-2 bg-[var(--neo-primary)] hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-xs"
                    >
                      <PlayCircle className="w-3.5 h-3.5" />
                      {isCompleted ? 'مرور مجدد دوره' : 'ادامه یادگیری'}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Classes & Live Sessions Progress */}
      {classes.length > 0 && (
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-black text-[var(--neo-text-main)] flex items-center gap-2">
              <Video className="w-5 h-5 text-emerald-600" />
              کلاس‌های زنده و کارگاه‌های شما
            </h2>
            <Link href="/student/classes" className="text-xs text-emerald-600 hover:underline flex items-center gap-0.5 font-bold">
              مشاهده کلاس‌ها <ChevronLeft className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {classes.map((clsItem: any) => {
              const cls = clsItem.classId || clsItem;
              const attended = clsItem.attendedSessionsCount || 0;
              const totalSessions = cls.syllabus?.length || cls.sessions || 10;
              const attendanceRate = totalSessions > 0 ? Math.min(100, Math.round((attended / totalSessions) * 100)) : 0;

              return (
                <div key={clsItem._id || cls._id} className="p-5 bg-white rounded-3xl border border-[var(--neo-border)] shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                        {cls.mode === 'online' ? 'کلاس آنلاین' : 'کلاس حضوری'}
                      </span>
                      <span className="text-xs font-bold text-slate-500">
                        {attended} از {totalSessions} جلسه
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 mb-1 line-clamp-1">
                      {cls.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-1 mb-3">
                      {cls.scheduleDays?.join('، ') || 'روزهای برگزاری مشخص'}
                    </p>

                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-2">
                      <div 
                        className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                        style={{ width: `${attendanceRate}%` }} 
                      />
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-700">
                      حضور: {attendanceRate}٪
                    </span>
                    <Link
                      href={`/classes/${cls.slug || cls._id}`}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1"
                    >
                      ورود به کلاس <ChevronLeft className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
