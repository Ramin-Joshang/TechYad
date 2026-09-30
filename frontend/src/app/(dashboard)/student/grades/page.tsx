'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { quizzesApi } from '@/features/learning/api/quizzes.api';
import { assignmentsApi } from '@/features/learning/api/assignments.api';
import { classesApi } from '@/features/learning/api/classes.api';
import { 
  Award, BookOpen, CheckCircle2, XCircle, Clock, 
  HelpCircle, FileText, Video, ChevronLeft, Loader2, 
  AlertCircle, TrendingUp, Sparkles, BarChart2, Star
} from 'lucide-react';
import Link from 'next/link';

export default function StudentGradesPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'quizzes' | 'assignments' | 'classes'>('all');

  // Fetch student quizzes
  const { data: quizzesData, isLoading: isQuizzesLoading } = useQuery({
    queryKey: ['myQuizzes'],
    queryFn: async () => {
      const res = await quizzesApi.getMyQuizzes();
      return res.data || [];
    }
  });

  // Fetch student assignments
  const { data: assignmentsData, isLoading: isAssignmentsLoading } = useQuery({
    queryKey: ['myAssignments'],
    queryFn: async () => {
      const res = await assignmentsApi.getMyAssignments();
      return res.data || [];
    }
  });

  // Fetch student classes & attendance
  const { data: classesData, isLoading: isClassesLoading } = useQuery({
    queryKey: ['myClasses'],
    queryFn: async () => {
      const res = await classesApi.getMyClasses();
      return res.data || [];
    }
  });

  const quizzes = Array.isArray(quizzesData) ? quizzesData : [];
  const assignments = Array.isArray(assignmentsData) ? assignmentsData : [];
  const classes = Array.isArray(classesData) ? classesData : [];

  const isLoading = isQuizzesLoading || isAssignmentsLoading || isClassesLoading;

  // Compute metrics
  const completedQuizzes = quizzes.filter((q: any) => q.status === 'completed' || (q.attempts && q.attempts.length > 0));
  const passedQuizzes = completedQuizzes.filter((q: any) => {
    const latestAttempt = q.attempts?.[q.attempts.length - 1];
    return latestAttempt?.passed || (latestAttempt?.percentage >= 60);
  });

  const gradedAssignments = assignments.filter((a: any) => a.submission?.status === 'graded');
  
  // Calculate average score across graded quizzes and assignments
  let totalScoreSum = 0;
  let totalScoreCount = 0;

  completedQuizzes.forEach((q: any) => {
    const latest = q.attempts?.[q.attempts.length - 1];
    if (typeof latest?.percentage === 'number') {
      totalScoreSum += latest.percentage;
      totalScoreCount++;
    }
  });

  gradedAssignments.forEach((a: any) => {
    if (typeof a.submission?.grade === 'number') {
      totalScoreSum += a.submission.grade;
      totalScoreCount++;
    }
  });

  classes.forEach((c: any) => {
    if (typeof c.finalGrade === 'number' && c.finalGrade > 0) {
      totalScoreSum += c.finalGrade;
      totalScoreCount++;
    }
  });

  const averageGPA = totalScoreCount > 0 ? (totalScoreSum / totalScoreCount).toFixed(1) : '—';

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-[var(--neo-border)] shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[var(--neo-text-main)]">کارنامه تحصیلی و نمرات</h1>
            <p className="text-xs sm:text-sm text-[var(--neo-text-secondary)] mt-0.5">
              مشاهده سوابق آزمون‌ها، ارزیابی تکالیف و کارنامه حضور در کلاس‌های زنده و حضوری
            </p>
          </div>
        </div>

        <Link
          href="/student/progress"
          className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
        >
          <TrendingUp className="w-4 h-4 text-emerald-600" />
          مشاهده پیشرفت دوره‌ها
        </Link>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[var(--neo-border)] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[var(--neo-text-muted)]">میانگین کل نمرات</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Star className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-black text-[var(--neo-text-main)] font-mono">{averageGPA}</span>
            <span className="text-xs text-[var(--neo-text-muted)] font-bold">از ۱۰۰</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[var(--neo-border)] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[var(--neo-text-muted)]">آزمون‌های گذرانده‌شده</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-black text-emerald-600 font-mono">{passedQuizzes.length}</span>
            <span className="text-xs text-[var(--neo-text-muted)]">از {quizzes.length} آزمون</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[var(--neo-border)] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[var(--neo-text-muted)]">تکالیف ارزیابی‌شده</span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-black text-purple-600 font-mono">{gradedAssignments.length}</span>
            <span className="text-xs text-[var(--neo-text-muted)]">از {assignments.length} تکلیف</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[var(--neo-border)] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[var(--neo-text-muted)]">کلاس‌های فعال</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Video className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-black text-amber-600 font-mono">{classes.length}</span>
            <span className="text-xs text-[var(--neo-text-muted)]">کلاس</span>
          </div>
        </div>
      </div>

      {/* Tabs Filter */}
      <div className="flex items-center gap-2 border-b border-[var(--neo-border)] pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap ${
            activeTab === 'all' 
              ? 'bg-[var(--neo-primary)] text-white shadow-xs' 
              : 'text-[var(--neo-text-secondary)] hover:bg-white'
          }`}
        >
          همه فعالیت‌ها
        </button>
        <button
          onClick={() => setActiveTab('quizzes')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'quizzes' 
              ? 'bg-[var(--neo-primary)] text-white shadow-xs' 
              : 'text-[var(--neo-text-secondary)] hover:bg-white'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          نمرات آزمون‌ها ({quizzes.length})
        </button>
        <button
          onClick={() => setActiveTab('assignments')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'assignments' 
              ? 'bg-[var(--neo-primary)] text-white shadow-xs' 
              : 'text-[var(--neo-text-secondary)] hover:bg-white'
          }`}
        >
          <FileText className="w-4 h-4" />
          تکالیف و پروژه‌ها ({assignments.length})
        </button>
        <button
          onClick={() => setActiveTab('classes')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'classes' 
              ? 'bg-[var(--neo-primary)] text-white shadow-xs' 
              : 'text-[var(--neo-text-secondary)] hover:bg-white'
          }`}
        >
          <Video className="w-4 h-4" />
          کلاس‌ها و حضور و غیاب ({classes.length})
        </button>
      </div>

      {/* Content Area */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-24">
          <Loader2 className="w-10 h-10 animate-spin text-[var(--neo-primary)] mb-3" />
          <span className="text-xs font-bold text-[var(--neo-text-secondary)]">در حال بارگذاری کارنامه تحصیلی...</span>
        </div>
      ) : (
        <div className="space-y-6">

          {/* Section 1: Quizzes */}
          {(activeTab === 'all' || activeTab === 'quizzes') && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[var(--neo-text-main)] flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-blue-600" />
                  آزمون‌ها و کوییزهای دوره‌ها
                </h3>
                <Link href="/student/quizzes" className="text-xs text-blue-600 hover:underline flex items-center gap-0.5 font-bold">
                  مشاهده صفحه آزمون‌ها <ChevronLeft className="w-3.5 h-3.5" />
                </Link>
              </div>

              {quizzes.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-2xl border border-[var(--neo-border)] text-xs text-[var(--neo-text-muted)]">
                  هنوز در آزمونی شرکت نکرده‌اید.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {quizzes.map((quiz: any) => {
                    const latest = quiz.attempts?.[quiz.attempts.length - 1];
                    const hasAttempted = !!latest;
                    const score = latest?.percentage ?? latest?.score ?? 0;
                    const isPassed = latest?.passed || score >= 60;

                    return (
                      <div key={quiz._id} className="p-4 bg-white rounded-2xl border border-[var(--neo-border)] hover:border-blue-200 transition shadow-xs flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h4 className="text-xs sm:text-sm font-bold text-[var(--neo-text-main)] line-clamp-1">
                              {quiz.title}
                            </h4>
                            {hasAttempted ? (
                              <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                                isPassed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                              }`}>
                                {isPassed ? 'قبول شده' : 'نیاز به تلاش مجدد'}
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-600">
                                انجام نشده
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-[var(--neo-text-secondary)] line-clamp-1 mb-3">
                            {quiz.courseId?.title || quiz.lessonId?.title || 'آزمون دوره‌ای'}
                          </p>
                        </div>

                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-[var(--neo-text-muted)]">نمره:</span>
                            <span className="text-sm font-black text-slate-900 font-mono">
                              {hasAttempted ? `${score}٪` : '—'}
                            </span>
                          </div>

                          <Link
                            href={`/student/quizzes/${quiz._id}`}
                            className="text-xs text-blue-600 hover:text-blue-700 font-bold transition flex items-center gap-0.5"
                          >
                            {hasAttempted ? 'مرور پاسخ‌ها' : 'شروع آزمون'}
                            <ChevronLeft className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Section 2: Assignments */}
          {(activeTab === 'all' || activeTab === 'assignments') && (
            <div className="space-y-3 pt-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[var(--neo-text-main)] flex items-center gap-2">
                  <FileText className="w-4 h-4 text-purple-600" />
                  تکالیف و پروژه‌های تحویلی
                </h3>
                <Link href="/student/assignments" className="text-xs text-purple-600 hover:underline flex items-center gap-0.5 font-bold">
                  مشاهده صفحه تکالیف <ChevronLeft className="w-3.5 h-3.5" />
                </Link>
              </div>

              {assignments.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-2xl border border-[var(--neo-border)] text-xs text-[var(--neo-text-muted)]">
                  هیچ تکلیفی برای بررسی ثبت نشده است.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {assignments.map((assignment: any) => {
                    const sub = assignment.submission;
                    const isGraded = sub?.status === 'graded';
                    const grade = sub?.grade;

                    return (
                      <div key={assignment._id} className="p-4 bg-white rounded-2xl border border-[var(--neo-border)] hover:border-purple-200 transition shadow-xs flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h4 className="text-xs sm:text-sm font-bold text-[var(--neo-text-main)] line-clamp-1">
                              {assignment.title}
                            </h4>
                            <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                              isGraded ? 'bg-emerald-100 text-emerald-800' :
                              sub ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                            }`}>
                              {isGraded ? 'تصحیح شده' : sub ? 'در انتظار تصحیح' : 'ارسال نشده'}
                            </span>
                          </div>
                          <p className="text-[11px] text-[var(--neo-text-secondary)] line-clamp-1 mb-2">
                            {assignment.courseId?.title || assignment.lessonId?.title || 'تکلیف کلاسی'}
                          </p>

                          {sub?.instructorFeedback && (
                            <div className="p-2.5 bg-purple-50/60 rounded-xl border border-purple-100 text-[11px] text-purple-900 mb-3">
                              <strong>بازخورد استاد:</strong> {sub.instructorFeedback}
                            </div>
                          )}
                        </div>

                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-[var(--neo-text-muted)]">نمره کسب‌شده:</span>
                            <span className="text-sm font-black text-slate-900 font-mono">
                              {isGraded ? `${grade} / ۱۰۰` : '—'}
                            </span>
                          </div>

                          <Link
                            href={`/student/assignments/${assignment._id}`}
                            className="text-xs text-purple-600 hover:text-purple-700 font-bold transition flex items-center gap-0.5"
                          >
                            جزئیات تکلیف <ChevronLeft className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Section 3: Classes & Attendance */}
          {(activeTab === 'all' || activeTab === 'classes') && (
            <div className="space-y-3 pt-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[var(--neo-text-main)] flex items-center gap-2">
                  <Video className="w-4 h-4 text-emerald-600" />
                  کلاس‌ها، حضور و غیاب و ارزیابی استاد
                </h3>
                <Link href="/student/classes" className="text-xs text-emerald-600 hover:underline flex items-center gap-0.5 font-bold">
                  مشاهده همه کلاس‌ها <ChevronLeft className="w-3.5 h-3.5" />
                </Link>
              </div>

              {classes.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-2xl border border-[var(--neo-border)] text-xs text-[var(--neo-text-muted)]">
                  هنوز در کلاسی ثبت‌نام نکرده‌اید.
                </div>
              ) : (
                <div className="space-y-3">
                  {classes.map((clsItem: any) => {
                    const cls = clsItem.classId || clsItem;
                    const attended = clsItem.attendedSessionsCount || 0;
                    const finalGrade = clsItem.finalGrade;
                    const evaluationNote = clsItem.evaluationNote;

                    return (
                      <div key={clsItem._id || cls._id} className="p-4 sm:p-5 bg-white rounded-2xl border border-[var(--neo-border)] hover:border-emerald-200 transition shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1.5">
                            <h4 className="text-sm font-bold text-[var(--neo-text-main)]">
                              {cls.title}
                            </h4>
                            <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-blue-50 text-blue-700">
                              {cls.mode === 'online' ? 'آنلاین' : 'حضوری'}
                            </span>
                          </div>
                          <p className="text-xs text-[var(--neo-text-secondary)] line-clamp-1 mb-2">
                            {cls.shortDescription || cls.description || 'کلاس تعاملی تک‌یاد'}
                          </p>

                          {evaluationNote && (
                            <div className="p-2.5 bg-emerald-50/70 border border-emerald-100 rounded-xl text-xs text-emerald-900 mt-2">
                              <strong>ارزیابی و نظر استاد:</strong> {evaluationNote}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-4 shrink-0 self-end md:self-auto">
                          {/* Attendance */}
                          <div className="bg-slate-50 px-3 py-2 rounded-xl text-center border border-slate-100">
                            <span className="text-[10px] text-slate-500 font-bold block">جلسات حضور</span>
                            <strong className="text-xs font-mono text-slate-800">{attended} جلسه</strong>
                          </div>

                          {/* Grade */}
                          <div className="bg-slate-50 px-4 py-2 rounded-xl text-center border border-slate-100">
                            <span className="text-[10px] text-slate-500 font-bold block">نمره نهایی</span>
                            <strong className="text-sm font-black text-indigo-700 font-mono">
                              {typeof finalGrade === 'number' ? `${finalGrade} / ۱۰۰` : 'ثبت نشده'}
                            </strong>
                          </div>

                          <Link
                            href={`/classes/${cls.slug || cls._id}`}
                            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition"
                          >
                            ورود به کلاس
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>
      )}

    </div>
  );
}
