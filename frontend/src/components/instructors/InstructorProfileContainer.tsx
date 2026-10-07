'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { 
  Star, BookOpen, Users, MapPin, Award, CheckCircle2, 
  GraduationCap, Briefcase, ChevronLeft, Monitor, Globe, 
  ExternalLink, Calendar, Clock, Video, Sparkles, MessageSquare 
} from 'lucide-react';
import Link from 'next/link';

// Custom SVG Icons for LinkedIn and Instagram
function LinkedinIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

export function InstructorProfileContainer({ id, initialData }: { id: string; initialData?: any }) {
  // Fetch instructor profile (now includes real courses, classes & calculated stats from backend)
  const { data: profileData, isLoading: queryLoading } = useQuery({
    queryKey: ['instructor', id],
    queryFn: () => api.get(`/instructors/${id}`).then((res: any) => res.data?.data || res.data),
    initialData: initialData,
  });

  const profile = profileData || initialData;
  const isLoading = !profile && queryLoading;

  // Fallback queries for courses and classes if not bundled
  const { data: allClassesData } = useQuery({
    queryKey: ['classes-all'],
    queryFn: () => api.get('/classes?limit=100').then((res: any) => res.data),
    enabled: !profile?.classes || profile?.classes?.length === 0
  });
  
  const { data: allCoursesData } = useQuery({
    queryKey: ['courses-all'],
    queryFn: () => api.get('/courses?limit=100').then((res: any) => res.data),
    enabled: !profile?.courses || profile?.courses?.length === 0
  });

  if (isLoading) {
    return (
      <div className="bg-[var(--neo-bg)] min-h-screen pb-20 animate-pulse">
        {/* Skeleton Header */}
        <div className="bg-slate-900 pt-16 sm:pt-24 pb-28 sm:pb-36">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
            <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl bg-slate-800 border-4 border-white/10 mb-6"></div>
            <div className="h-8 bg-slate-800 rounded-lg w-56 mb-3"></div>
            <div className="h-5 bg-slate-800 rounded-md w-72 mb-8"></div>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="w-32 h-12 bg-slate-800 rounded-2xl"></div>
              <div className="w-32 h-12 bg-slate-800 rounded-2xl"></div>
              <div className="w-32 h-12 bg-slate-800 rounded-2xl"></div>
            </div>
          </div>
        </div>

        {/* Skeleton Content */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-20 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[var(--neo-border)] shadow-xs space-y-6">
            <div className="h-6 bg-gray-200 rounded w-40"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-100 rounded w-full"></div>
              <div className="h-4 bg-gray-100 rounded w-5/6"></div>
              <div className="h-4 bg-gray-100 rounded w-4/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-4 text-2xl font-bold shadow-xs">
          !
        </div>
        <h2 className="text-xl font-bold text-[var(--neo-text-main)] mb-2">استاد مورد نظر یافت نشد</h2>
        <p className="text-[var(--neo-text-secondary)] text-sm mb-6">ممکن است این پروفایل تغییر یافته یا آدرس اشتباه باشد.</p>
        <Link href="/instructors" className="px-6 py-2.5 bg-[var(--neo-primary)] text-white rounded-xl font-bold hover:bg-blue-700 transition shadow-xs text-sm">
          مشاهده لیست تمام اساتید
        </Link>
      </div>
    );
  }

  const { userId, title, bio, avatar, specialties = [], education = [], experience = [], socialLinks = {} } = profile;
  const userObj = typeof userId === 'object' && userId !== null ? userId : {};
  const fullName = `${userObj.firstName || ''} ${userObj.lastName || ''}`.trim() || 'استاد تک‌یاد';
  const displayAvatar = userObj.personnelPhoto || profile.personnelPhoto || avatar || userObj.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&size=200&background=0284c7&color=fff`;

  // Real courses and classes from server (with fallback to client filter)
  const targetInstructorId = (userObj._id || profile.userId || id)?.toString();
  
  let instructorClasses = profile.classes || [];
  if (!instructorClasses.length && allClassesData) {
    const allClasses = Array.isArray(allClassesData?.classes) ? allClassesData.classes : (Array.isArray(allClassesData) ? allClassesData : []);
    instructorClasses = allClasses.filter((c: any) => c.instructors?.some((i: any) => (i?._id || i)?.toString() === targetInstructorId));
  }

  let instructorCourses = profile.courses || [];
  if (!instructorCourses.length && allCoursesData) {
    const allCourses = Array.isArray(allCoursesData?.courses) ? allCoursesData.courses : (Array.isArray(allCoursesData) ? allCoursesData : []);
    instructorCourses = allCourses.filter((c: any) => 
      c.instructors?.some((i: any) => (i?._id || i)?.toString() === targetInstructorId) || 
      (c.instructor?._id || c.instructor)?.toString() === targetInstructorId
    );
  }

  const studentsCount = profile.totalStudents || 0;
  const rating = profile.rating > 0 ? profile.rating : 5;

  return (
    <div className="bg-[var(--neo-bg)] min-h-screen pb-20">
      
      {/* Profile Hero Header */}
      <div className="bg-slate-900 text-white pt-16 sm:pt-24 pb-28 sm:pb-36 relative overflow-hidden">
        {/* Background Network Accent */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-400 via-transparent to-transparent pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          
          {/* Avatar */}
          <div className="relative inline-block mb-6">
            <img 
              src={displayAvatar} 
              alt={fullName} 
              className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl object-cover shadow-2xl mx-auto border-4 border-white/15 ring-4 ring-black/20" 
            />
            <div className="absolute -bottom-2 -left-2 bg-emerald-500 text-white p-1.5 rounded-xl shadow-lg border-2 border-slate-900" title="مدرس تاییدشده">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>

          {/* Name & Title */}
          <h1 className="text-2xl sm:text-4xl font-black mb-2">{fullName}</h1>
          <p className="text-sm sm:text-lg text-blue-400 font-medium max-w-xl mx-auto mb-6">
            {title || userObj.specialty || 'مدرس و متخصص آموزشی در تک‌یاد'}
          </p>

          {/* Social Links */}
          {(socialLinks.linkedin || socialLinks.instagram || socialLinks.website) && (
            <div className="flex items-center justify-center gap-3 mb-8">
              {socialLinks.linkedin && (
                <a 
                  href={socialLinks.linkedin} 
                  target="_blank" 
                  rel="noreferrer"
                  className="w-9 h-9 rounded-xl bg-white/10 hover:bg-blue-600 text-white flex items-center justify-center transition shadow-xs"
                  title="پروفایل لینکدین"
                >
                  <LinkedinIcon className="w-4 h-4" />
                </a>
              )}
              {socialLinks.instagram && (
                <a 
                  href={socialLinks.instagram} 
                  target="_blank" 
                  rel="noreferrer"
                  className="w-9 h-9 rounded-xl bg-white/10 hover:bg-pink-600 text-white flex items-center justify-center transition shadow-xs"
                  title="صفحه اینستاگرام"
                >
                  <InstagramIcon className="w-4 h-4" />
                </a>
              )}
              {socialLinks.website && (
                <a 
                  href={socialLinks.website} 
                  target="_blank" 
                  rel="noreferrer"
                  className="w-9 h-9 rounded-xl bg-white/10 hover:bg-emerald-600 text-white flex items-center justify-center transition shadow-xs"
                  title="وبسایت شخصی"
                >
                  <Globe className="w-4 h-4" />
                </a>
              )}
            </div>
          )}

          {/* Stats Bar */}
          <div className="flex flex-wrap justify-center gap-3 sm:gap-6 text-gray-300">
            <div className="flex items-center gap-3 bg-white/5 px-4 sm:px-6 py-2.5 sm:py-3 rounded-2xl border border-white/10 backdrop-blur-xs">
              <Star className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400 fill-amber-400" />
              <div className="text-right">
                <div className="font-black text-white text-base sm:text-lg leading-tight font-mono">{Number(rating).toFixed(1)}</div>
                <div className="text-[11px] text-slate-300">امتیاز دانشجویان</div>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-white/5 px-4 sm:px-6 py-2.5 sm:py-3 rounded-2xl border border-white/10 backdrop-blur-xs">
              <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
              <div className="text-right">
                <div className="font-black text-white text-base sm:text-lg leading-tight font-mono">
                  {studentsCount > 0 ? studentsCount.toLocaleString('fa-IR') : '—'}
                </div>
                <div className="text-[11px] text-slate-300">دانشجوی ثبت‌نامی</div>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-white/5 px-4 sm:px-6 py-2.5 sm:py-3 rounded-2xl border border-white/10 backdrop-blur-xs">
              <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
              <div className="text-right">
                <div className="font-black text-white text-base sm:text-lg leading-tight font-mono">
                  {instructorCourses.length + instructorClasses.length}
                </div>
                <div className="text-[11px] text-slate-300">دوره و کلاس فعال</div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Main Profile Body */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 sm:-mt-20 relative z-20 space-y-8">
        
        {/* Bio & Specialties Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-[var(--neo-border)] p-6 sm:p-10 space-y-8">
          
          {/* Bio */}
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-[var(--neo-text-main)] mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-[var(--neo-primary)]" />
              درباره و معرفی استاد
            </h2>
            <p className="text-xs sm:text-sm text-[var(--neo-text-secondary)] leading-relaxed text-justify whitespace-pre-wrap">
              {bio || userObj.bio || 'مدرس باسابقه و متخصص در حوزه آموزش‌های تخصصی و کاربردی در آکادمی تک‌یاد.'}
            </p>
          </div>

          {/* Specialties */}
          {specialties && specialties.length > 0 && (
            <div className="pt-6 border-t border-slate-100">
              <h3 className="text-sm font-bold text-[var(--neo-text-main)] mb-3 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-blue-600" />
                حوزه‌های تخصصی و مهارت‌ها
              </h3>
              <div className="flex flex-wrap gap-2">
                {specialties.map((spec: string, idx: number) => (
                  <span 
                    key={idx} 
                    className="px-3 py-1.5 bg-blue-50/70 text-blue-700 border border-blue-100 rounded-xl text-xs font-bold shadow-2xs"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Education & Experience Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-slate-100">
            
            {/* Education */}
            <div>
              <h3 className="text-base font-bold text-[var(--neo-text-main)] mb-4 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-[var(--neo-primary)]" />
                سوابق تحصیلی
              </h3>
              
              {education && education.length > 0 ? (
                <div className="space-y-4">
                  {education.map((edu: any, idx: number) => (
                    <div key={idx} className="relative pr-4 border-r-2 border-blue-200">
                      <div className="absolute w-2.5 h-2.5 bg-[var(--neo-primary)] rounded-full -right-[6px] top-1.5"></div>
                      <h4 className="font-bold text-xs sm:text-sm text-[var(--neo-text-main)]">
                        {edu.degree} {edu.field}
                      </h4>
                      <p className="text-xs text-[var(--neo-text-secondary)] mt-0.5">{edu.university}</p>
                      {(edu.startYear || edu.endYear) && (
                        <span className="text-[10px] text-slate-500 font-mono mt-1 inline-block bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                          {edu.startYear ? `${edu.startYear} - ` : ''}{edu.endYear || 'اکنون'}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[var(--neo-text-muted)] italic">
                  سوابق تحصیلی توسط استاد ثبت نشده است.
                </p>
              )}
            </div>

            {/* Work Experience */}
            <div>
              <h3 className="text-base font-bold text-[var(--neo-text-main)] mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-emerald-600" />
                سوابق کاری و تجربیات
              </h3>

              {experience && experience.length > 0 ? (
                <div className="space-y-4">
                  {experience.map((exp: any, idx: number) => (
                    <div key={idx} className="relative pr-4 border-r-2 border-emerald-200">
                      <div className="absolute w-2.5 h-2.5 bg-emerald-600 rounded-full -right-[6px] top-1.5"></div>
                      <h4 className="font-bold text-xs sm:text-sm text-[var(--neo-text-main)]">
                        {exp.position}
                      </h4>
                      <p className="text-xs text-[var(--neo-text-secondary)] mt-0.5">{exp.company}</p>
                      {exp.description && (
                        <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{exp.description}</p>
                      )}
                      {(exp.startYear || exp.endYear || exp.current) && (
                        <span className="text-[10px] text-slate-500 font-mono mt-1 inline-block bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                          {exp.startYear ? `${exp.startYear} - ` : ''}{exp.current ? 'اکنون' : exp.endYear || 'تاکنون'}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="relative pr-4 border-r-2 border-emerald-200">
                  <div className="absolute w-2.5 h-2.5 bg-emerald-600 rounded-full -right-[6px] top-1.5"></div>
                  <h4 className="font-bold text-xs sm:text-sm text-[var(--neo-text-main)]">
                    مدرس و متخصص آموزشی
                  </h4>
                  <p className="text-xs text-[var(--neo-text-secondary)] mt-0.5">آکادمی آموزش تخصصی تک‌یاد</p>
                  <span className="text-[10px] text-slate-500 font-mono mt-1 inline-block bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                    فعال
                  </span>
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Classes Section */}
        {instructorClasses.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-bold text-[var(--neo-text-main)] flex items-center gap-2">
                <Video className="w-5 h-5 text-emerald-600" />
                کلاس‌ها و کارگاه‌های این استاد ({instructorClasses.length})
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {instructorClasses.map((cls: any) => {
                const isOnline = cls.mode === 'online';
                const hasDiscount = cls.discountPrice && cls.discountPrice < cls.price;

                return (
                  <Link 
                    key={cls._id} 
                    href={`/classes/${cls.slug || cls._id}`}
                    className="bg-white p-4 rounded-2xl border border-[var(--neo-border)] shadow-xs hover:border-emerald-300 hover:shadow-sm transition-all flex gap-4 group"
                  >
                    <div className="w-24 h-24 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                      <img 
                        src={cls.thumbnail || `https://picsum.photos/seed/${cls._id}/300/300`} 
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300" 
                        alt={cls.title} 
                      />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                            isOnline ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'
                          }`}>
                            {isOnline ? 'آنلاین' : 'حضوری'}
                          </span>
                        </div>
                        <h3 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-emerald-600 transition line-clamp-1">
                          {cls.title}
                        </h3>
                        <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                          {cls.scheduleDays?.join('، ') || 'روزهای اعلامی'}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                        <span className="font-bold text-emerald-700 font-mono">
                          {cls.price === 0 ? 'رایگان' : `${(hasDiscount ? cls.discountPrice : cls.price).toLocaleString('fa-IR')} تومان`}
                        </span>
                        <span className="text-[11px] text-slate-400 group-hover:text-emerald-600 font-bold flex items-center gap-0.5">
                          مشاهده کلاس <ChevronLeft className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Courses Section */}
        {instructorCourses.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-bold text-[var(--neo-text-main)] flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-purple-600" />
                دوره‌های ویدیویی این استاد ({instructorCourses.length})
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {instructorCourses.map((course: any) => {
                const isFree = course.price === 0;
                const hasDiscount = course.discountPrice && course.discountPrice < course.price;

                return (
                  <Link 
                    key={course._id} 
                    href={`/courses/${course.slug || course._id}`}
                    className="bg-white p-4 rounded-2xl border border-[var(--neo-border)] shadow-xs hover:border-purple-300 hover:shadow-sm transition-all flex gap-4 group"
                  >
                    <div className="w-24 h-24 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                      <img 
                        src={course.thumbnail || `https://picsum.photos/seed/${course._id}/300/300`} 
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300" 
                        alt={course.title} 
                      />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        {course.categoryId?.name && (
                          <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-lg inline-block mb-1">
                            {course.categoryId.name}
                          </span>
                        )}
                        <h3 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-purple-600 transition line-clamp-1">
                          {course.title}
                        </h3>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {course.totalLessons ? `${course.totalLessons} جلسه ویدیویی` : 'دوره ویدیویی تخصصی'}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                        <span className="font-bold text-purple-700 font-mono">
                          {isFree ? 'رایگان' : `${(hasDiscount ? course.discountPrice : course.price).toLocaleString('fa-IR')} تومان`}
                        </span>
                        <span className="text-[11px] text-slate-400 group-hover:text-purple-600 font-bold flex items-center gap-0.5">
                          مشاهده دوره <ChevronLeft className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty state if instructor has neither classes nor courses */}
        {instructorClasses.length === 0 && instructorCourses.length === 0 && (
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[var(--neo-border)] text-center space-y-4 shadow-xs">
            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto text-xl font-bold">
              <BookOpen className="w-7 h-7" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-[var(--neo-text-main)]">
              دوره‌ها و کلاس‌های جدید این استاد به‌زودی آغاز می‌شود
            </h3>
            <p className="text-xs sm:text-sm text-[var(--neo-text-secondary)] max-w-md mx-auto">
              سرفصل‌های آموزشی و برنامه‌ریزی کارگاه‌های تخصصی این استاد در حال تدوین است. برای اطلاع از برگزاری کلاس‌ها، می‌توانید از صفحه کلاس‌ها دیدن فرمایید.
            </p>
            <div className="pt-2">
              <Link
                href="/classes"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[var(--neo-primary)] text-white text-xs sm:text-sm font-bold hover:bg-blue-700 transition shadow-xs"
              >
                مشاهده همه کلاس‌های فعال
                <ChevronLeft className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
