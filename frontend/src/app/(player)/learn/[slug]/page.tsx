'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { coursesApi } from '@/features/courses/api/courses.api';
import { learningApi } from '@/features/learning/api/learning.api';
import { VideoPlayer } from '@/features/learning/components/VideoPlayer';
import { LessonComments } from '@/features/learning/components/LessonComments';
import { Menu, X, CheckCircle2, PlayCircle, Lock, ChevronLeft, ChevronRight, Download, MessageSquare, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CoursePlayerPage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter();
  const { slug } = use(params);
  
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'files' | 'comments'>('info');

  // Fetch Course
  const { data: courseData, isLoading: courseLoading } = useQuery({
    queryKey: ['course', slug],
    queryFn: () => coursesApi.getCourseBySlug(slug).then(res => res.data)
  });
  const course = courseData;

  // Fetch Enrollment
  const { data: enrollmentData, isLoading: enrollmentLoading, isError: enrollmentError } = useQuery({
    queryKey: ['enrollment', course?._id],
    queryFn: () => learningApi.getMyEnrollmentDetails(course!._id).then(res => res.data),
    enabled: !!course?._id,
    retry: false
  });
  const enrollment = enrollmentData;
  const isEnrolled = !!enrollment;

  // Fetch Chapters
  const { data: chaptersData, isLoading: chaptersLoading } = useQuery({
    queryKey: ['chapters', course?._id],
    queryFn: () => coursesApi.getCourseChapters(course!._id).then(res => res.data),
    enabled: !!course?._id
  });
  const chapters = chaptersData || [];

  // Fetch Lessons for all chapters
  const { data: allLessonsData, isLoading: lessonsLoading } = useQuery({
    queryKey: ['lessons', chapters.map(c => c._id).join(',')],
    queryFn: async () => {
      if (chapters.length === 0) return [];
      const promises = chapters.map(c => coursesApi.getChapterLessons(c._id).then(res => res.data));
      const results = await Promise.all(promises);
      return results.flat();
    },
    enabled: !!chaptersData
  });
  const allLessons = allLessonsData || [];

  // Fetch Secure Lesson
  const { data: secureLessonData, isLoading: lessonLoading, isError: lessonAccessError } = useQuery({
    queryKey: ['secureLesson', activeLessonId],
    queryFn: () => learningApi.getSecureLesson(activeLessonId!).then(res => res.data),
    enabled: !!activeLessonId,
    retry: false
  });
  const secureLesson = secureLessonData;

  // Update Progress Mutation
  const updateProgressMutation = useMutation({
    mutationFn: (data: { lessonId: string, watchedSeconds: number, progress: number, completed: boolean }) => 
      learningApi.updateLessonProgress(data.lessonId, data),
  });

  // Fetch Progress for the active lesson
  const { data: lessonProgress } = useQuery({
    queryKey: ['lessonProgress', activeLessonId],
    queryFn: () => learningApi.getLessonProgress(activeLessonId!).then(res => res.data),
    enabled: !!activeLessonId && isEnrolled
  });

  useEffect(() => {
    if (allLessons && allLessons.length > 0 && !activeLessonId) {
      if (enrollment?.lastLessonId) {
        setActiveLessonId(enrollment.lastLessonId._id || enrollment.lastLessonId);
      } else {
        setActiveLessonId(allLessons[0]._id);
      }
    }
  }, [allLessons, activeLessonId, enrollment]);

  const activeLessonIndex = allLessons?.findIndex(l => l._id === activeLessonId) ?? -1;
  const activeLessonMeta = activeLessonIndex >= 0 ? allLessons![activeLessonIndex] : null;

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

  const handleProgressUpdate = (seconds: number, progress: number, isCompleted: boolean) => {
    if (activeLessonId && isEnrolled) {
      updateProgressMutation.mutate({
        lessonId: activeLessonId,
        watchedSeconds: seconds,
        progress,
        completed: isCompleted
      });
    }
  };

  if (courseLoading || enrollmentLoading || chaptersLoading || lessonsLoading) {
    return (
      <div className="flex h-full items-center justify-center text-white bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex h-full items-center justify-center text-white bg-gray-900">
        <div className="text-center space-y-4">
          <p className="text-xl">دوره مورد نظر یافت نشد.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-gray-900 text-gray-300">
      
      {/* Mobile Menu Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Chapters & Lessons */}
      <aside className={`
        fixed lg:static inset-y-0 right-0 z-50 w-80 bg-gray-900 border-l border-gray-800 
        flex flex-col transform transition-transform duration-300 ease-in-out h-full
        ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-4 border-b border-gray-800 flex items-center justify-between sticky top-0 bg-gray-900 z-10">
          <h2 className="font-bold text-white text-lg">سرفصل‌های دوره</h2>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto hide-scrollbar p-2">
          {chapters.map((chapter, index) => {
            const chapterLessons = allLessons.filter(l => l.chapterId === chapter._id);
            return (
              <div key={chapter._id} className="mb-4">
                <div className="px-3 py-2 text-sm font-bold text-gray-400">
                  فصل {index + 1} — {chapter.title}
                </div>
                <div className="space-y-1">
                  {chapterLessons.map((lesson, lIndex) => {
                    const isActive = lesson._id === activeLessonId;
                    const isLocked = !isEnrolled && !lesson.isFree;
                    
                    return (
                      <button
                        key={lesson._id}
                        onClick={() => {
                          if (!isLocked) {
                            setActiveLessonId(lesson._id);
                            setIsSidebarOpen(false);
                          }
                        }}
                        className={`w-full flex items-start gap-3 px-3 py-2.5 rounded-xl text-right transition-colors ${
                          isActive ? 'bg-blue-600/10 text-blue-500' : 
                          isLocked ? 'opacity-50 cursor-not-allowed hover:bg-gray-800' : 'hover:bg-gray-800'
                        }`}
                      >
                        <div className="mt-0.5 shrink-0">
                          {isLocked ? (
                            <Lock className="w-4 h-4 text-gray-600" />
                          ) : isActive ? (
                            <PlayCircle className="w-4 h-4 text-blue-500" />
                          ) : lessonProgress?.completed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border border-gray-600"></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`text-sm font-medium line-clamp-2 ${isActive ? 'text-blue-500' : isLocked ? 'text-gray-600' : 'text-gray-300'}`}>
                            {lesson.title}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            {lesson.isFree && !isEnrolled && (
                              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-bold">رایگان</span>
                            )}
                            {lesson.type === 'video' && <span className="text-xs text-gray-500">{lesson.duration || 0} دقیقه</span>}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-black relative">
        
        {/* Header */}
        <header className="h-16 border-b border-gray-800 bg-gray-900 flex items-center justify-between px-4 lg:px-6 shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden text-gray-400 hover:text-white">
              <Menu className="w-6 h-6" />
            </button>
            <Link href="/student" className="hidden sm:flex text-gray-400 hover:text-white transition items-center gap-2">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="h-6 w-px bg-gray-800 hidden sm:block"></div>
            <div>
              <h1 className="text-white font-bold text-sm sm:text-base line-clamp-1">{course?.title}</h1>
              {isEnrolled && enrollment && (
                <div className="flex items-center gap-2 mt-1 hidden sm:flex">
                  <div className="w-32 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full transition-all" style={{ width: `${enrollment.progress || 0}%` }}></div>
                  </div>
                  <span className="text-xs font-medium text-emerald-500">{enrollment.progress || 0}٪ تکمیل شده</span>
                </div>
              )}
            </div>
          </div>
          
          {!isEnrolled && (
            <Link href={`/courses/${course?.slug}`} className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-blue-700 transition">
              خرید دوره
            </Link>
          )}
        </header>

        {/* Player & Content Area */}
        <div className="flex-1 overflow-y-auto">
          {lessonAccessError ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-gray-900">
              <Lock className="w-16 h-16 text-red-500/50 mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">دسترسی مسدود شد</h2>
              <p className="text-gray-400 max-w-md">شما به این جلسه دسترسی ندارید. برای مشاهده این محتوا باید دوره را خریداری کنید.</p>
            </div>
          ) : lessonLoading ? (
            <div className="flex items-center justify-center h-[50vh] bg-black">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : secureLesson ? (
            <div className="flex flex-col max-w-5xl mx-auto w-full">
              
              {/* Video Player */}
              <div className="w-full bg-black">
                <VideoPlayer 
                  secureLesson={secureLesson} 
                  initialProgress={lessonProgress?.progress || 0}
                  onProgressUpdate={handleProgressUpdate} 
                />
              </div>

              {/* Prev / Next Controls */}
              <div className="flex items-center justify-between p-4 bg-gray-900 border-b border-gray-800">
                <button 
                  onClick={handlePrev} 
                  disabled={activeLessonIndex <= 0}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-300 hover:text-white disabled:opacity-30 disabled:hover:text-gray-300 transition"
                >
                  <ChevronRight className="w-4 h-4" /> جلسه قبل
                </button>
                <div className="text-sm font-medium text-gray-500">
                  جلسه {activeLessonIndex + 1} از {allLessons.length}
                </div>
                <button 
                  onClick={handleNext} 
                  disabled={activeLessonIndex >= allLessons.length - 1}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-300 hover:text-white disabled:opacity-30 disabled:hover:text-gray-300 transition"
                >
                  جلسه بعد <ChevronLeft className="w-4 h-4" />
                </button>
              </div>

              {/* Tabs */}
              <div className="bg-gray-900 p-6 min-h-[400px]">
                <div className="flex items-center gap-6 border-b border-gray-800 mb-6">
                  <button onClick={() => setActiveTab('info')} className={`pb-3 text-sm font-bold transition-colors ${activeTab === 'info' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400 hover:text-gray-200'}`}>توضیحات</button>
                  <button onClick={() => setActiveTab('files')} className={`pb-3 text-sm font-bold transition-colors ${activeTab === 'files' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400 hover:text-gray-200'}`}>فایل‌های پیوست</button>
                  <button onClick={() => setActiveTab('comments')} className={`pb-3 text-sm font-bold transition-colors ${activeTab === 'comments' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400 hover:text-gray-200'}`}>پرسش و پاسخ</button>
                </div>

                {/* Tab Content */}
                <div className="pb-12">
                  {activeTab === 'info' && (
                    <div className="prose prose-invert max-w-none text-gray-300">
                      <h2 className="text-2xl font-bold text-white mb-4">{secureLesson.title}</h2>
                      <div dangerouslySetInnerHTML={{ __html: secureLesson.description || 'توضیحاتی برای این جلسه ثبت نشده است.' }} />
                    </div>
                  )}

                  {activeTab === 'files' && (
                    <div className="space-y-4">
                      {!secureLesson.files || secureLesson.files.length === 0 ? (
                        <p className="text-gray-500">هیچ فایل پیوستی برای این جلسه وجود ندارد.</p>
                      ) : (
                        secureLesson.files.map((file: any, i: number) => (
                          <div key={i} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-blue-500/10 text-blue-400 rounded-lg flex items-center justify-center">
                                <Download className="w-5 h-5" />
                              </div>
                              <div>
                                <h4 className="font-bold text-gray-200">{file.name || `فایل پیوست ${i+1}`}</h4>
                                <p className="text-xs text-gray-500 mt-1">{file.size || 'نامشخص'} • {file.type || 'Document'}</p>
                              </div>
                            </div>
                            <a href={file.url || '#'} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-bold rounded-lg transition border border-gray-600">
                              دانلود
                            </a>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {activeTab === 'comments' && (
                    <div>
                      {/* We will add LessonComments component here */}
                      <LessonComments lessonId={secureLesson._id} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}
