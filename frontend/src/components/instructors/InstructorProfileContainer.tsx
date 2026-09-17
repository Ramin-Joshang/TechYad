'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Star, BookOpen, Users, MapPin, Award, CheckCircle, GraduationCap, Briefcase, ChevronLeft, Monitor } from 'lucide-react';
import Link from 'next/link';

export function InstructorProfileContainer({ id }: { id: string }) {
  const { data: profile, isLoading } = useQuery({
    queryKey: ['instructor', id],
    queryFn: () => api.get(`/instructors/${id}`).then((res: any) => res.data)
  });

  // Since backend doesn't specifically filter classes by instructorId natively in a public route easily, 
  // we fetch all and filter in frontend for this specific requirement to make sure it works seamlessly.
  const { data: allClassesData } = useQuery({
    queryKey: ['classes'],
    queryFn: () => api.get('/classes').then(res => res.data || res.data)
  });
  
  const { data: allCoursesData } = useQuery({
    queryKey: ['courses'],
    queryFn: () => api.get('/courses').then(res => res.data || res.data)
  });

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-[var(--neo-text-muted)]">درحال بارگذاری پروفایل...</div>;
  }

  if (!profile) {
    return <div className="min-h-screen flex items-center justify-center text-red-500">استاد پیدا نشد</div>;
  }

  const { userId, title, bio, avatar, specialties, education } = profile;
  const fullName = `${userId?.firstName} ${userId?.lastName}`;
  const displayAvatar = avatar || `https://ui-avatars.com/api/?name=${userId?.firstName}+${userId?.lastName}&size=200`;

  // Mocks and filtering
  const rating = profile.rating || (4 + (((userId?.firstName.length || 0) % 10) / 10));
  
  const allClasses = allClassesData?.classes || allClassesData?.data || [];
  const allCourses = allCoursesData?.courses || allCoursesData?.data || [];
  
  const instructorClasses = allClasses?.filter((c: any) => c.instructors?.some((i: any) => i._id === userId?._id || i === userId?._id)) || [];
  const instructorCourses = allCourses?.filter((c: any) => c.instructor?._id === userId?._id || c.instructor === userId?._id) || [];
  
  const studentsCount = profile.totalStudents || (instructorCourses.length * 120) + (instructorClasses.length * 15) || 420;

  return (
    <div className="bg-[var(--neo-bg)] min-h-screen pb-20">
      {/* Profile Header */}
      <div className="bg-slate-900 text-white pt-20 pb-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/texture/1920/1080')] opacity-5 mix-blend-overlay"></div>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
           <img src={displayAvatar} alt={fullName} className="w-32 h-32 rounded-3xl object-cover shadow-2xl mx-auto border-4 border-white/10 mb-6" />
           <h1 className="text-3xl md:text-4xl font-bold mb-2">{fullName}</h1>
           <p className="text-lg md:text-xl text-blue-400 font-medium mb-8">{title}</p>
           
           <div className="flex flex-wrap justify-center gap-4 md:gap-8 text-gray-300">
             <div className="flex items-center gap-2 bg-white/5 px-6 py-3 rounded-2xl backdrop-blur">
               <Star className="w-6 h-6 text-amber-400 fill-current" />
               <div className="text-right">
                 <div className="font-bold text-white text-lg leading-tight">{rating.toFixed(1)}</div>
                 <div className="text-xs">۹۶٪ رضایت</div>
               </div>
             </div>
             <div className="flex items-center gap-2 bg-white/5 px-6 py-3 rounded-2xl backdrop-blur">
               <Users className="w-6 h-6 text-blue-400" />
               <div className="text-right">
                 <div className="font-bold text-white text-lg leading-tight">{studentsCount.toLocaleString()}</div>
                 <div className="text-xs">دانشجو</div>
               </div>
             </div>
             <div className="flex items-center gap-2 bg-white/5 px-6 py-3 rounded-2xl backdrop-blur">
               <BookOpen className="w-6 h-6 text-purple-400" />
               <div className="text-right">
                 <div className="font-bold text-white text-lg leading-tight">{instructorCourses.length + instructorClasses.length}</div>
                 <div className="text-xs">دوره و کلاس</div>
               </div>
             </div>
           </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-20">
        <div className="bg-white rounded-3xl shadow-xl border border-[var(--neo-border)] p-6 md:p-12 mb-8">
            
           {/* About */}
           <section className="mb-12">
             <h2 className="text-2xl font-bold text-[var(--neo-text-main)] mb-6 flex items-center gap-2">
               <Award className="w-6 h-6 text-[var(--neo-primary)]" />
               درباره استاد
             </h2>
             <p className="text-[var(--neo-text-secondary)] leading-loose whitespace-pre-wrap text-justify md:text-right">{bio}</p>
           </section>

           {/* Specialties */}
           {specialties && specialties.length > 0 && (
             <section className="mb-12">
               <h3 className="text-lg font-bold text-[var(--neo-text-main)] mb-4">تخصص‌ها</h3>
               <div className="flex flex-wrap gap-3">
                 {specialties.map((spec: string, idx: number) => (
                   <span key={idx} className="px-4 py-2 bg-[var(--neo-primary)]/5 text-blue-700 border border-blue-100 rounded-xl text-sm font-bold shadow-sm">
                     {spec}
                   </span>
                 ))}
               </div>
             </section>
           )}

           <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* Education */}
              {education && education.length > 0 && (
                <section>
                  <h2 className="text-xl font-bold text-[var(--neo-text-main)] mb-6 flex items-center gap-2">
                    <GraduationCap className="w-6 h-6 text-[var(--neo-primary)]" />
                    سوابق تحصیلی
                  </h2>
                  <div className="space-y-6">
                    {education.map((edu: any, idx: number) => (
                      <div key={idx} className="relative pl-6 border-r-2 border-[var(--neo-border)] ml-4">
                        <div className="absolute w-3 h-3 bg-[var(--neo-primary)] rounded-full -right-[7px] top-1.5 ring-4 ring-white"></div>
                        <h4 className="font-bold text-[var(--neo-text-main)]">{edu.degree} {edu.field}</h4>
                        <p className="text-[var(--neo-text-muted)] text-sm mt-1">{edu.university}</p>
                        {(edu.startYear || edu.endYear) && (
                          <p className="text-xs text-[var(--neo-text-muted)] mt-2 font-mono bg-[var(--neo-bg)] border border-[var(--neo-border)] inline-block px-2.5 py-1 rounded-md">
                            {edu.startYear} - {edu.endYear || 'اکنون'}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Work Experience - Mocked visually based on instructions */}
              <section>
                  <h2 className="text-xl font-bold text-[var(--neo-text-main)] mb-6 flex items-center gap-2">
                    <Briefcase className="w-6 h-6 text-[var(--neo-primary)]" />
                    سوابق کاری
                  </h2>
                  <div className="space-y-6">
                      <div className="relative pl-6 border-r-2 border-[var(--neo-border)] ml-4">
                        <div className="absolute w-3 h-3 bg-[var(--neo-primary)] rounded-full -right-[7px] top-1.5 ring-4 ring-white"></div>
                        <h4 className="font-bold text-[var(--neo-text-main)]">مدرس ارشد</h4>
                        <p className="text-[var(--neo-text-muted)] text-sm mt-1">آکادمی تک‌یاد</p>
                        <p className="text-xs text-[var(--neo-text-muted)] mt-2 font-mono bg-[var(--neo-bg)] border border-[var(--neo-border)] inline-block px-2.5 py-1 rounded-md">
                          ۱۴۰۰ - اکنون
                        </p>
                      </div>
                      <div className="relative pl-6 border-r-2 border-[var(--neo-border)] ml-4">
                        <div className="absolute w-3 h-3 bg-[var(--neo-border)] rounded-full -right-[7px] top-1.5 ring-4 ring-white"></div>
                        <h4 className="font-bold text-[var(--neo-text-main)]">مهندس نرم‌افزار / محقق</h4>
                        <p className="text-[var(--neo-text-muted)] text-sm mt-1">شرکت‌های معتبر فناوری</p>
                        <p className="text-xs text-[var(--neo-text-muted)] mt-2 font-mono bg-[var(--neo-bg)] border border-[var(--neo-border)] inline-block px-2.5 py-1 rounded-md">
                          ۱۳۹۵ - ۱۴۰۰
                        </p>
                      </div>
                  </div>
              </section>
           </div>
        </div>

        {/* Classes Section */}
        {instructorClasses.length > 0 && (
          <div className="mb-12">
             <div className="flex items-center justify-between mb-6">
               <h2 className="text-2xl font-bold text-[var(--neo-text-main)] flex items-center gap-2">
                 <Users className="w-6 h-6 text-[var(--neo-primary)]" />
                 کلاس‌های در حال برگزاری
               </h2>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {instructorClasses.map((cls: any) => (
                  <Link key={cls._id} href={`/classes/${cls.slug}`} className="bg-white p-4 rounded-2xl border border-[var(--neo-border)] shadow-sm hover:shadow-md transition flex items-center gap-4 group">
                    <img src={`https://picsum.photos/seed/${cls._id}/200/200`} className="w-20 h-20 rounded-xl object-cover" alt="" />
                    <div className="flex-1">
                      <h3 className="font-bold text-[var(--neo-text-main)] group-hover:text-[var(--neo-primary)] transition line-clamp-1">{cls.title}</h3>
                      <div className="flex items-center gap-3 mt-2 text-xs text-[var(--neo-text-muted)]">
                         <span className="flex items-center gap-1"><Monitor className="w-3 h-3" /> {cls.mode === 'online' ? 'آنلاین' : 'حضوری'}</span>
                         <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {cls.capacity} نفر</span>
                      </div>
                    </div>
                    <ChevronLeft className="w-5 h-5 text-gray-300 group-hover:text-[var(--neo-primary)]" />
                  </Link>
               ))}
             </div>
          </div>
        )}

        {/* Courses Section */}
        {instructorCourses.length > 0 && (
          <div className="mb-12">
             <div className="flex items-center justify-between mb-6">
               <h2 className="text-2xl font-bold text-[var(--neo-text-main)] flex items-center gap-2">
                 <BookOpen className="w-6 h-6 text-purple-600" />
                 دوره‌های آموزشی
               </h2>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {instructorCourses.map((course: any) => (
                  <Link key={course._id} href={`/courses/${course.slug}`} className="bg-white p-4 rounded-2xl border border-[var(--neo-border)] shadow-sm hover:shadow-md transition flex items-center gap-4 group">
                    <img src={`https://picsum.photos/seed/${course._id}/200/200`} className="w-20 h-20 rounded-xl object-cover" alt="" />
                    <div className="flex-1">
                      <h3 className="font-bold text-[var(--neo-text-main)] group-hover:text-[var(--neo-primary)] transition line-clamp-1">{course.title}</h3>
                      <div className="flex items-center gap-3 mt-2 text-xs text-[var(--neo-text-muted)]">
                         <span className="font-medium text-[var(--neo-primary)]">{course.price === 0 ? 'رایگان' : `${course.price.toLocaleString()} تومان`}</span>
                      </div>
                    </div>
                    <ChevronLeft className="w-5 h-5 text-gray-300 group-hover:text-[var(--neo-primary)]" />
                  </Link>
               ))}
             </div>
          </div>
        )}

        {/* Reviews Section */}
        <div className="bg-white rounded-3xl shadow-sm border border-[var(--neo-border)] p-8">
           <h2 className="text-2xl font-bold text-[var(--neo-text-main)] mb-8 flex items-center gap-2">
             <Star className="w-6 h-6 text-amber-500" />
             نظرات دانشجویان
           </h2>
           <div className="space-y-6">
              {[
                { name: 'علی حسینی', text: 'یکی از بهترین اساتیدی که تا به حال داشتم. تسلط روی مباحث فوق‌العاده است.', rating: 5, date: 'دو هفته پیش' },
                { name: 'مریم رضایی', text: 'فن بیان بسیار خوب و پشتیبانی عالی در طول دوره.', rating: 5, date: 'یک ماه پیش' },
                { name: 'رضا محمدی', text: 'کلاس‌های عملی بسیار مفیدی بود و کاملا کاربردی تدریس می‌کردند.', rating: 4, date: 'دو ماه پیش' }
              ].map((review, i) => (
                 <div key={i} className="pb-6 border-b border-gray-50 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between mb-2">
                       <div className="font-bold text-[var(--neo-text-main)]">{review.name}</div>
                       <div className="text-xs text-[var(--neo-text-muted)]">{review.date}</div>
                    </div>
                    <div className="flex text-amber-400 mb-3">
                       {[...Array(5)].map((_, idx) => (
                         <Star key={idx} className={`w-4 h-4 ${idx < review.rating ? 'fill-current' : 'text-gray-200'}`} />
                       ))}
                    </div>
                    <p className="text-sm text-[var(--neo-text-secondary)]">{review.text}</p>
                 </div>
              ))}
           </div>
        </div>

      </div>
    </div>
  );
}
