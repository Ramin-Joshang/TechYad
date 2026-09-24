'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { coursesApi } from '@/features/courses/api/courses.api';
import { learningApi } from '@/features/learning/api/learning.api';
import { VideoPlayer } from '@/features/learning/components/VideoPlayer';
import { LessonComments } from '@/features/learning/components/LessonComments';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import {
  Menu,
  X,
  CheckCircle2,
  PlayCircle,
  Lock,
  ChevronLeft,
  ChevronRight,
  Download,
  MessageSquare,
  ArrowRight,
  BookOpen,
  Share2,
  Bookmark,
  Award,
  Search,
  ChevronDown,
  ChevronUp,
  Clock,
  FileText,
  User,
  Sparkles,
  HelpCircle,
  Check,
  Plus,
  Trash2,
  Tv,
  CheckSquare
} from 'lucide-react';
import Link from 'next/link';

interface NoteItem {
  id: string;
  time: number;
  formattedTime: string;
  text: string;
  createdAt: string;
}

interface LessonProgressData {
  lessonId?: string;
  completed?: boolean;
  progress?: number;
  watchedSeconds?: number;
}

export default function LearnCoursePage() {
  const router = useRouter();
  const params = useParams();
  const slug = (params?.slug as string) || '';
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'notes' | 'files' | 'comments' | 'shortcuts'>('info');
  const [searchCurriculum, setSearchCurriculum] = useState('');
  const [collapsedChapters, setCollapsedChapters] = useState<Record<string, boolean>>({});
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Smart Notes
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [newNoteText, setNewNoteText] = useState('');

  // Fetch Course by slug (or ID)
  const { data: courseData, isLoading: courseLoading } = useQuery({
    queryKey: ['course', slug],
    queryFn: () => coursesApi.getCourseBySlug(slug).then((res) => res.data),
    enabled: !!slug,
  });
  const course = courseData;

  // Check enrollment
  const { data: enrollmentData, isLoading: enrollmentLoading } = useQuery({
    queryKey: ['enrollment', course?._id],
    queryFn: () => learningApi.getMyEnrollmentDetails(course!._id).then((res) => res.data),
    enabled: !!course?._id && !!user,
    retry: false,
  });
  const enrollment = enrollmentData;
  const isEnrolled = !!enrollment || user?.role === 'admin' || user?.role === 'super-admin' || (course && user && course.instructors?.some((i: any) => i._id === (user as any)._id || i._id === (user as any).id));

  // Fetch Chapters
  const { data: chaptersData, isLoading: chaptersLoading } = useQuery({
    queryKey: ['chapters', course?._id],
    queryFn: () => coursesApi.getCourseChapters(course!._id).then((res) => res.data),
    enabled: !!course?._id,
  });
  const chapters = chaptersData || [];

  // Fetch Lessons for all chapters
  const { data: allLessonsData, isLoading: lessonsLoading } = useQuery({
    queryKey: ['lessons', chapters.map((c) => c._id).join(',')],
    queryFn: async () => {
      if (chapters.length === 0) return [];
      const promises = chapters.map((c) => coursesApi.getChapterLessons(c._id).then((res) => res.data));
      const results = await Promise.all(promises);
      return results.flat();
    },
    enabled: chapters.length > 0,
  });
  const allLessons = allLessonsData || [];

  // Fetch Secure Lesson Content for active lesson
  const {
    data: secureLessonData,
    isLoading: lessonLoading,
    isError: lessonAccessError,
  } = useQuery({
    queryKey: ['secureLesson', activeLessonId],
    queryFn: () => learningApi.getSecureLesson(activeLessonId!).then((res) => res.data),
    enabled: !!activeLessonId,
    retry: false,
  });
  const secureLesson = secureLessonData;

  // Fetch Progress for the active lesson
  const { data: lessonProgressData } = useQuery({
    queryKey: ['lessonProgress', activeLessonId],
    queryFn: () => learningApi.getLessonProgress(activeLessonId!).then((res) => (res.data as any) as LessonProgressData),
    enabled: Boolean(activeLessonId && isEnrolled),
  });
  const lessonProgress = (lessonProgressData || null) as LessonProgressData | null;

  // Update Progress Mutation
  const updateProgressMutation = useMutation({
    mutationFn: (data: { lessonId: string; watchedSeconds: number; progress: number; completed: boolean }) =>
      learningApi.updateLessonProgress(data.lessonId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollment', course?._id] });
      queryClient.invalidateQueries({ queryKey: ['lessonProgress', activeLessonId] });
    },
  });

  // Auto select default lesson on load
  useEffect(() => {
    if (allLessons.length > 0 && !activeLessonId) {
      if (enrollment?.lastLessonId) {
        const lastId = enrollment.lastLessonId._id || enrollment.lastLessonId;
        const exists = allLessons.some((l) => l._id === lastId);
        setActiveLessonId(exists ? lastId : allLessons[0]._id);
      } else {
        setActiveLessonId(allLessons[0]._id);
      }
    }
  }, [allLessons, activeLessonId, enrollment]);

  // Load Notes from LocalStorage
  useEffect(() => {
    if (activeLessonId && typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(`tecyad_notes_${activeLessonId}`);
        if (saved) {
          setNotes(JSON.parse(saved));
        } else {
          setNotes([]);
        }
      } catch {
        setNotes([]);
      }
    }
  }, [activeLessonId]);

  // Save Notes to LocalStorage
  const saveNotes = (updated: NoteItem[]) => {
    setNotes(updated);
    if (activeLessonId && typeof window !== 'undefined') {
      try {
        localStorage.setItem(`tecyad_notes_${activeLessonId}`, JSON.stringify(updated));
      } catch {}
    }
  };

  const handleAddNote = () => {
    if (!newNoteText.trim() || !activeLessonId) return;
    const now = new Date();
    const formattedDate = new Intl.DateTimeFormat('fa-IR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(now);

    const newNote: NoteItem = {
      id: Date.now().toString(),
      time: 0,
      formattedTime: 'یادداشت متنی',
      text: newNoteText.trim(),
      createdAt: formattedDate,
    };

    saveNotes([newNote, ...notes]);
    setNewNoteText('');
  };

  const handleDeleteNote = (id: string) => {
    saveNotes(notes.filter((n) => n.id !== id));
  };

  const activeLessonIndex = allLessons?.findIndex((l) => l._id === activeLessonId) ?? -1;
  const activeLessonMeta = activeLessonIndex >= 0 ? allLessons[activeLessonIndex] : null;

  const handleNext = () => {
    if (allLessons && activeLessonIndex < allLessons.length - 1) {
      setActiveLessonId(allLessons[activeLessonIndex + 1]._id);
    }
  };

  const handlePrev = () => {
    if (allLessons && activeLessonIndex > 0) {
      setActiveLessonId(allLessons[activeLessonIndex - 1]._id);
    }
  };

  const handleProgressUpdate = (seconds: number, progressPercent: number, isCompleted: boolean) => {
    if (activeLessonId && isEnrolled) {
      updateProgressMutation.mutate({
        lessonId: activeLessonId,
        watchedSeconds: seconds,
        progress: progressPercent,
        completed: isCompleted,
      });
    }
  };

  const handleManualMarkCompleted = () => {
    if (!activeLessonId || !isEnrolled) return;
    const isCompleted = !lessonProgress?.completed;
    updateProgressMutation.mutate({
      lessonId: activeLessonId,
      watchedSeconds: activeLessonMeta?.duration ? activeLessonMeta.duration * 60 : 300,
      progress: isCompleted ? 100 : 0,
      completed: isCompleted,
    });
  };

  const handleShareLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const toggleChapterCollapse = (chapterId: string) => {
    setCollapsedChapters((prev) => ({
      ...prev,
      [chapterId]: !prev[chapterId],
    }));
  };

  // Convert digits to Persian / Farsi
  const toFaDigits = (str: string | number) => {
    return str.toString().replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[parseInt(d, 10)]);
  };

  // Filter lessons in sidebar
  const filteredChapters = useMemo(() => {
    if (!searchCurriculum.trim()) return chapters;
    return chapters
      .map((c) => {
        const chapterLessons = allLessons.filter(
          (l) => l.chapterId === c._id && l.title.toLowerCase().includes(searchCurriculum.toLowerCase())
        );
        return {
          ...c,
          matchingLessons: chapterLessons,
        };
      })
      .filter((c) => c.matchingLessons.length > 0);
  }, [chapters, allLessons, searchCurriculum]);

  // Overall course progress
  const completedLessonsCount = enrollment?.completedLessons || (lessonProgress?.completed ? 1 : 0);
  const totalLessonsCount = allLessons.length || course?.totalLessons || 1;
  const overallProgressPercent = Math.min(
    100,
    enrollment?.progress || Math.round((completedLessonsCount / totalLessonsCount) * 100)
  );

  // Loading State
  if (courseLoading || chaptersLoading || lessonsLoading) {
    return (
      <div className="flex h-screen items-center justify-center text-white bg-slate-950 font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin"></div>
          <p className="text-slate-400 text-sm font-medium">در حال بارگذاری میز یادگیری تک‌یاد...</p>
        </div>
      </div>
    );
  }

  // Not Found State
  if (!course) {
    return (
      <div className="flex h-screen items-center justify-center text-white bg-slate-950 font-sans p-6 text-center">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
          <div className="w-16 h-16 bg-red-500/10 text-red-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">دوره مورد نظر یافت نشد</h2>
          <p className="text-slate-400 text-xs leading-relaxed mb-6">
            ممکن است آدرس دوره تغییر کرده باشد یا هنوز منتشر نشده باشد.
          </p>
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition"
          >
            مشاهده همه دوره‌های تک‌یاد
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans select-none">
      {/* TOP HEADER BAR */}
      <header className="h-16 bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 flex items-center justify-between shrink-0 z-30">
        {/* Right side: Back, Title, Progress */}
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <Link
            href="/student"
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition shrink-0"
            title="بازگشت به پنل دانشجو"
          >
            <ArrowRight className="w-5 h-5" />
          </Link>

          <div className="h-6 w-px bg-slate-800 hidden sm:block shrink-0"></div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">
                Tecyad Class
              </span>
              <h1 className="text-xs sm:text-sm font-bold text-white truncate max-w-[200px] sm:max-w-md">
                {course.title}
              </h1>
            </div>

            {/* Course Progress Mini Bar */}
            <div className="flex items-center gap-2 mt-1">
              <div className="w-24 sm:w-36 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-emerald-400 h-full transition-all duration-500"
                  style={{ width: `${overallProgressPercent}%` }}
                ></div>
              </div>
              <span className="text-[11px] font-mono text-emerald-400 font-medium">
                {toFaDigits(overallProgressPercent)}٪
              </span>
              <span className="text-[10px] text-slate-500 hidden md:inline">
                ({toFaDigits(completedLessonsCount)} از {toFaDigits(totalLessonsCount)} جلسه)
              </span>
            </div>
          </div>
        </div>

        {/* Left side: Action Controls & Curriculum Toggle */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Bookmark Toggle */}
          <button
            onClick={() => setIsBookmarked((prev) => !prev)}
            title={isBookmarked ? 'نشانه‌گذاری شده' : 'نشانه‌گذاری این جلسه'}
            className={`p-2 rounded-xl transition ${
              isBookmarked ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>

          {/* Mark Complete Button */}
          {isEnrolled && (
            <button
              onClick={handleManualMarkCompleted}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                lessonProgress?.completed
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
              }`}
            >
              <CheckCircle2 className={`w-4 h-4 ${lessonProgress?.completed ? 'text-emerald-400' : 'text-slate-500'}`} />
              <span className="hidden sm:inline">
                {lessonProgress?.completed ? 'تکمیل شد' : 'اتمام جلسه'}
              </span>
            </button>
          )}

          {/* Theater Mode Button */}
          <button
            onClick={() => setIsTheaterMode((prev) => !prev)}
            title={isTheaterMode ? 'حالت دو ستونه' : 'حالت سینمایی عریض'}
            className={`p-2 rounded-xl transition hidden lg:block ${
              isTheaterMode ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Tv className="w-4 h-4" />
          </button>

          {/* Share Button */}
          <button
            onClick={handleShareLink}
            title="کپی لینک جلسه"
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition relative"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
          </button>

          {/* Sidebar Toggle Button */}
          <button
            onClick={() => setIsSidebarOpen((prev) => !prev)}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-blue-600/20"
          >
            <Menu className="w-4 h-4" />
            <span className="hidden sm:inline">سرفصل‌ها</span>
          </button>
        </div>
      </header>

      {/* WORKSPACE BODY */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* MAIN STAGE (Player + Controls + Tabs) */}
        <main className="flex-1 flex flex-col h-full overflow-y-auto bg-slate-950 hide-scrollbar transition-all">
          <div className={`w-full mx-auto p-4 sm:p-6 transition-all ${isTheaterMode ? 'max-w-7xl' : 'max-w-5xl'}`}>
            {/* VIDEO PLAYER CONTAINER */}
            <div className="w-full mb-4">
              {lessonAccessError ? (
                /* Unenrolled / Paid Lesson Locked State */
                <div className="w-full aspect-video bg-gradient-to-br from-slate-900 to-slate-950 rounded-2xl border border-slate-800 flex flex-col items-center justify-center p-8 text-center shadow-2xl relative overflow-hidden">
                  <div className="absolute top-4 right-4 text-xs font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1 rounded-full">
                    جلسه تخصصی دانشجویان
                  </div>

                  <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center mb-4 border border-red-500/20">
                    <Lock className="w-8 h-8" />
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2">{activeLessonMeta?.title || 'جلسه غیررایگان'}</h3>
                  <p className="text-slate-400 text-xs sm:text-sm max-w-md leading-relaxed mb-6">
                    این جلسه به همراه فایل‌ها و کدهای ضمیمه برای دانشجویان ثبت‌نام شده دوره فعال است. با ثبت‌نام در دوره به تمام ویدیوها و گواهی رسمی دسترسی خواهید داشت.
                  </p>

                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <Link
                      href={`/courses/${course.slug}`}
                      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition shadow-lg shadow-blue-500/20 flex items-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" /> مشاهده و خرید دوره ({toFaDigits(course.price?.toLocaleString('fa-IR') || 0)} تومان)
                    </Link>

                    {allLessons.some((l) => l.isFree) && (
                      <button
                        onClick={() => {
                          const firstFree = allLessons.find((l) => l.isFree);
                          if (firstFree) setActiveLessonId(firstFree._id);
                        }}
                        className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition border border-slate-700"
                      >
                        مشاهده پیش‌نمایش‌های رایگان
                      </button>
                    )}
                  </div>
                </div>
              ) : lessonLoading ? (
                <div className="w-full aspect-video bg-black rounded-2xl flex items-center justify-center border border-slate-800">
                  <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                </div>
              ) : secureLesson ? (
                <VideoPlayer
                  secureLesson={secureLesson}
                  initialProgress={lessonProgress?.progress || 0}
                  onProgressUpdate={handleProgressUpdate}
                  onNextLesson={handleNext}
                  onPrevLesson={handlePrev}
                  hasNextLesson={activeLessonIndex < allLessons.length - 1}
                  hasPrevLesson={activeLessonIndex > 0}
                  courseTitle={course.title}
                  isTheaterMode={isTheaterMode}
                  onToggleTheater={() => setIsTheaterMode((prev) => !prev)}
                />
              ) : null}
            </div>

            {/* PREV / NEXT NAVIGATION BAR */}
            <div className="flex items-center justify-between p-3.5 bg-slate-900 border border-slate-800 rounded-2xl mb-6 shadow-sm">
              <button
                onClick={handlePrev}
                disabled={activeLessonIndex <= 0}
                className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-300 hover:text-white disabled:opacity-30 disabled:hover:text-slate-300 transition rounded-xl hover:bg-slate-800"
              >
                <ChevronRight className="w-4 h-4" /> جلسه قبلی
              </button>

              <div className="text-xs text-slate-400 font-medium">
                جلسه <span className="font-bold text-white font-mono">{toFaDigits(activeLessonIndex + 1)}</span> از{' '}
                <span className="font-bold text-white font-mono">{toFaDigits(allLessons.length)}</span>
              </div>

              <button
                onClick={handleNext}
                disabled={activeLessonIndex >= allLessons.length - 1}
                className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-300 hover:text-white disabled:opacity-30 disabled:hover:text-slate-300 transition rounded-xl hover:bg-slate-800"
              >
                جلسه بعدی <ChevronLeft className="w-4 h-4" />
              </button>
            </div>

            {/* TABBED WORKSPACE BELOW PLAYER */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl mb-12">
              {/* Tab Headers */}
              <div className="flex items-center border-b border-slate-800 px-4 pt-2 gap-2 overflow-x-auto hide-scrollbar">
                {[
                  { id: 'info', label: 'توضیحات و سرفصل', icon: BookOpen },
                  { id: 'notes', label: `یادداشت‌های من (${toFaDigits(notes.length)})`, icon: Bookmark },
                  { id: 'files', label: `فایل‌ها و کدهای ضمیمه (${toFaDigits(secureLesson?.files?.length || 0)})`, icon: Download },
                  { id: 'comments', label: 'پرسش و پاسخ', icon: MessageSquare },
                  { id: 'shortcuts', label: 'کلیدهای میانبر', icon: HelpCircle },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id as any)}
                    className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition whitespace-nowrap ${
                      activeTab === t.id
                        ? 'text-blue-400 border-blue-500 bg-blue-500/5'
                        : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                  >
                    <t.icon className="w-4 h-4" />
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Tab Contents */}
              <div className="p-6">
                {/* TAB 1: OVERVIEW */}
                {activeTab === 'info' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-bold text-white mb-3">
                        {secureLesson?.title || activeLessonMeta?.title || 'عنوان جلسه'}
                      </h2>
                      <div
                        className="text-slate-300 text-sm leading-relaxed prose prose-invert max-w-none"
                        dangerouslySetInnerHTML={{
                          __html:
                            secureLesson?.description ||
                            activeLessonMeta?.description ||
                            'توضیحات تکمیلی برای این جلسه ثبت نشده است.',
                        }}
                      />
                    </div>

                    {/* Instructor Info Card */}
                    {course.instructors && course.instructors.length > 0 && (
                      <div className="pt-6 border-t border-slate-800">
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">مدرس دوره</div>
                        {course.instructors.map((instructor: any) => (
                          <div key={instructor._id} className="flex items-center gap-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                            <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-800 shrink-0 border border-slate-700">
                              {instructor.avatar ? (
                                <img src={instructor.avatar} alt={instructor.firstName} className="w-full h-full object-cover" />
                              ) : (
                                <User className="w-full h-full p-2.5 text-slate-400" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-white text-sm">
                                {instructor.firstName} {instructor.lastName}
                              </h4>
                              <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                                {instructor.bio || 'مدرس ارشد در پلتفرم آموزشی تک‌یاد'}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 2: SMART NOTES */}
                {activeTab === 'notes' && (
                  <div className="space-y-6">
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                      <h3 className="text-xs font-bold text-slate-300 mb-2">ثبت یادداشت جدید برای این درس</h3>
                      <textarea
                        value={newNoteText}
                        onChange={(e) => setNewNoteText(e.target.value)}
                        placeholder="نکات مهم، خلاصه مباحث یا کدهای این جلسه را اینجا یادداشت کنید..."
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 min-h-[80px]"
                      ></textarea>
                      <div className="flex justify-end mt-2">
                        <button
                          onClick={handleAddNote}
                          disabled={!newNoteText.trim()}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition disabled:opacity-40 flex items-center gap-1.5"
                        >
                          <Plus className="w-4 h-4" /> ذخیره یادداشت
                        </button>
                      </div>
                    </div>

                    {/* Notes List */}
                    <div className="space-y-3">
                      {notes.length === 0 ? (
                        <div className="text-center py-8 text-slate-500 text-xs">
                          هنوز یادداشتی برای این درس ثبت نکرده‌اید. با افزودن یادداشت‌ها، مرور مطالب بسیار ساده‌تر خواهد بود!
                        </div>
                      ) : (
                        notes.map((note) => (
                          <div
                            key={note.id}
                            className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 flex items-start justify-between gap-4"
                          >
                            <div className="space-y-1 flex-1">
                              <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">{note.text}</p>
                              <div className="text-[10px] text-slate-500">{note.createdAt}</div>
                            </div>
                            <button
                              onClick={() => handleDeleteNote(note.id)}
                              className="text-slate-500 hover:text-red-400 p-1 transition shrink-0"
                              title="حذف یادداشت"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* TAB 3: FILES & RESOURCES */}
                {activeTab === 'files' && (
                  <div className="space-y-3">
                    {!secureLesson?.files || secureLesson.files.length === 0 ? (
                      <div className="text-center py-10 text-slate-500 text-xs">
                        هیچ فایل یا پروژه پیوستی برای این جلسه ثبت نشده است.
                      </div>
                    ) : (
                      secureLesson.files.map((file: any, i: number) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-slate-800"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-500/10 text-blue-400 rounded-lg flex items-center justify-center shrink-0">
                              <Download className="w-5 h-5" />
                            </div>
                            <div>
                              <h4 className="font-bold text-white text-xs sm:text-sm">{file.name || `فایل ضمیمه ${i + 1}`}</h4>
                              <p className="text-[10px] text-slate-400 mt-0.5">
                                {file.size || 'نامشخص'} • {file.type || 'فایل پروژه'}
                              </p>
                            </div>
                          </div>
                          <a
                            href={file.url || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            download
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition"
                          >
                            دانلود فایل
                          </a>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* TAB 4: COMMENTS & Q&A */}
                {activeTab === 'comments' && (
                  <div>
                    {secureLesson?._id ? (
                      <LessonComments lessonId={secureLesson._id} />
                    ) : (
                      <div className="text-center py-8 text-slate-500 text-xs">در حال آماده‌سازی بخش دیدگاه‌ها...</div>
                    )}
                  </div>
                )}

                {/* TAB 5: KEYBOARD SHORTCUTS */}
                {activeTab === 'shortcuts' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {[
                      { key: 'Space / K', desc: 'توقف / ادامه پخش ویدیو' },
                      { key: 'F', desc: 'ورود یا خروج از تمام‌صفحه' },
                      { key: 'T', desc: 'حالت سینمایی (Theater Mode)' },
                      { key: 'M', desc: 'قطع / وصل صدا' },
                      { key: 'J / L', desc: '۱۰ ثانیه پرش به عقب / جلو' },
                      { key: 'جهت‌نما چپ / راست', desc: '۵ ثانیه حرکت در ویدیو' },
                      { key: 'جهت‌نما بالا / پایین', desc: 'تنظیم میزان صدا (۱۰٪)' },
                      { key: 'P / N', desc: 'رفتن به جلسه قبلی / بعدی' },
                    ].map((s, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800"
                      >
                        <span className="font-mono text-blue-400 bg-slate-900 border border-slate-700 px-2 py-1 rounded">
                          {s.key}
                        </span>
                        <span className="text-slate-300 font-medium">{s.desc}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>

        {/* CURRICULUM SIDEBAR (Collapsible & Responsive) */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <aside
          className={`
            fixed lg:static inset-y-0 left-0 lg:left-auto lg:right-0 z-50 w-80 sm:w-96 bg-slate-900 border-r lg:border-r-0 lg:border-l border-slate-800 flex flex-col h-full transform transition-transform duration-300 ease-in-out shrink-0
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}
        >
          {/* Sidebar Header */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900 sticky top-0 z-10">
            <div>
              <h2 className="font-bold text-white text-sm">سرفصل‌های دوره</h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {toFaDigits(completedLessonsCount)} از {toFaDigits(totalLessonsCount)} جلسه تکمیل شده
              </p>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search Curriculum */}
          <div className="p-3 border-b border-slate-800/80 bg-slate-950/40">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute top-1/2 -translate-y-1/2 right-3 pointer-events-none" />
              <input
                type="text"
                value={searchCurriculum}
                onChange={(e) => setSearchCurriculum(e.target.value)}
                placeholder="جستجو در بین دروس..."
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pr-9 pl-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Chapters & Lessons List */}
          <div className="flex-1 overflow-y-auto hide-scrollbar p-3 space-y-4">
            {filteredChapters.length === 0 ? (
              <div className="text-center py-10 text-slate-500 text-xs">درسی با این عنوان یافت نشد.</div>
            ) : (
              filteredChapters.map((chapter: any, cIndex: number) => {
                const chapterLessons = chapter.matchingLessons || allLessons.filter((l) => l.chapterId === chapter._id);
                const isCollapsed = collapsedChapters[chapter._id];

                return (
                  <div key={chapter._id} className="bg-slate-950/70 border border-slate-800/80 rounded-xl overflow-hidden">
                    {/* Chapter Header Accordion */}
                    <button
                      onClick={() => toggleChapterCollapse(chapter._id)}
                      className="w-full flex items-center justify-between p-3 text-right bg-slate-900/60 hover:bg-slate-900 transition"
                    >
                      <div className="min-w-0 pr-1">
                        <div className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">
                          فصل {toFaDigits(cIndex + 1)}
                        </div>
                        <div className="text-xs font-bold text-white truncate mt-0.5">{chapter.title}</div>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400 shrink-0">
                        <span className="text-[10px] text-slate-500 font-mono">
                          {toFaDigits(chapterLessons.length)} درس
                        </span>
                        {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                      </div>
                    </button>

                    {/* Lessons list */}
                    {!isCollapsed && (
                      <div className="p-1 space-y-1">
                        {chapterLessons.map((lesson: any, lIndex: number) => {
                          const isActive = lesson._id === activeLessonId;
                          const isLocked = !isEnrolled && !lesson.isFree;
                          const isCompleted = lessonProgress?.lessonId === lesson._id ? Boolean(lessonProgress?.completed) : false;

                          return (
                            <button
                              key={lesson._id}
                              onClick={() => {
                                setActiveLessonId(lesson._id);
                                setIsSidebarOpen(false);
                              }}
                              className={`w-full flex items-start gap-3 p-2.5 rounded-lg text-right transition-all ${
                                isActive
                                  ? 'bg-blue-600/15 border border-blue-500/30 text-blue-400'
                                  : isLocked
                                  ? 'opacity-60 hover:bg-slate-900 text-slate-400'
                                  : 'hover:bg-slate-900 text-slate-300'
                              }`}
                            >
                              <div className="mt-0.5 shrink-0">
                                {isLocked ? (
                                  <Lock className="w-4 h-4 text-slate-600" />
                                ) : isActive ? (
                                  <PlayCircle className="w-4 h-4 text-blue-400 fill-blue-500/20 animate-pulse" />
                                ) : isCompleted ? (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                ) : (
                                  <div className="w-4 h-4 rounded-full border border-slate-700 flex items-center justify-center text-[9px] font-mono text-slate-500">
                                    {toFaDigits(lIndex + 1)}
                                  </div>
                                )}
                              </div>

                              <div className="flex-1 min-w-0">
                                <div
                                  className={`text-xs font-medium line-clamp-2 ${
                                    isActive ? 'text-blue-300 font-bold' : isLocked ? 'text-slate-500' : 'text-slate-200'
                                  }`}
                                >
                                  {lesson.title}
                                </div>
                                <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500">
                                  {lesson.isFree && !isEnrolled && (
                                    <span className="bg-emerald-500/20 text-emerald-400 font-bold px-1.5 py-0.2 rounded">
                                      رایگان
                                    </span>
                                  )}
                                  <span>{toFaDigits(lesson.duration || 5)} دقیقه</span>
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            )}

            {/* Course Completion Certificate Card */}
            {overallProgressPercent >= 100 && (
              <div className="p-4 bg-gradient-to-br from-amber-500/20 via-slate-900 to-slate-950 border border-amber-500/40 rounded-xl text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-400 mx-auto flex items-center justify-center">
                  <Award className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-white">تبریک! دوره تکمیل شد</h4>
                <p className="text-[10px] text-slate-400">شما تمامی مباحث این دوره را با موفقیت پشت سر گذاشتید.</p>
                <Link
                  href="/student"
                  className="inline-block w-full py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs transition"
                >
                  دریافت گواهینامه معتبر
                </Link>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
