import Link from "next/link";
import { Clock, Users, PlayCircle, Star } from "lucide-react";

export function CourseList({ title, data = [], sectionName = "Explore" }: { title: string, data: any[], sectionName?: string }) {
  if (!data?.length) return null;
  
  return (
    <section className="py-20 bg-[var(--neo-bg)] border-b border-[var(--neo-border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
             <div className="flex items-center gap-2 mb-3">
              <span className="w-8 h-px bg-[var(--neo-primary)]"></span>
              <span className="text-[var(--neo-primary)] font-bold tracking-widest text-sm uppercase">{sectionName}</span>
            </div>
            <h2 className="text-3xl font-black text-[var(--neo-text-main)]">{title}</h2>
          </div>
          <Link href="/courses" className="text-[var(--neo-text-secondary)] hover:text-[var(--neo-primary)] transition font-medium flex items-center gap-2 pb-1 border-b border-transparent hover:border-[var(--neo-primary)]">
            مشاهده همه
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {data.map((course: any) => (
            <Link key={course._id} href={`/courses/${course.slug}`} className="neo-card group flex flex-col overflow-hidden relative bg-white">
              <div className="relative aspect-[16/10] overflow-hidden bg-[var(--neo-surface-2)]">
                <img src={course.coverImage || course.thumbnail || `https://picsum.photos/seed/${course.slug}/400/250`} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-700 ease-out" />
                
                {/* Overlays */}
                <div className="absolute top-4 right-4 z-20 flex gap-2">
                  {course.price === 0 && (
                    <div className="bg-[var(--neo-accent)] text-[var(--neo-text-main)] text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                      رایگان
                    </div>
                  )}
                  {course.type === 'in-person' && (
                     <div className="bg-[var(--neo-surface)]/90 backdrop-blur text-[var(--neo-text-main)] text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--neo-primary)] animate-pulse"></span> حضوری
                    </div>
                  )}
                  {course.type === 'online-class' && (
                     <div className="bg-[var(--neo-surface)]/90 backdrop-blur text-[var(--neo-error)] text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--neo-error)] animate-pulse"></span> زنده (Live)
                    </div>
                  )}
                </div>
              </div>
              
              <div className="p-5 flex flex-col flex-grow">
                <div className="flex items-center justify-between mb-3">
                   <div className="text-[var(--neo-text-muted)] text-xs font-medium bg-[var(--neo-surface-2)] px-2 py-1 rounded">
                      {course.category?.name || 'عمومی'}
                   </div>
                   <div className="flex items-center gap-1 text-[var(--neo-warning)] font-en text-xs font-bold">
                     <Star className="w-3.5 h-3.5 fill-current" />
                     {course.averageRating ? course.averageRating.toFixed(1) : "4.9"}
                   </div>
                </div>
                
                <h3 className="font-bold text-[var(--neo-text-main)] mb-2 line-clamp-2 leading-relaxed group-hover:text-[var(--neo-primary)] transition-colors">{course.title}</h3>
                
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 rounded-full bg-[var(--neo-surface-2)] flex items-center justify-center text-[var(--neo-primary)] overflow-hidden">
                    {course.instructor?.avatar || course.instructors?.[0]?.avatar ? (
                      <img src={course.instructor?.avatar || course.instructors?.[0]?.avatar} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <Users className="w-3 h-3" />
                    )}
                  </div>
                  <span className="text-sm text-[var(--neo-text-secondary)] font-medium">
                    {course.instructor?.name || course.instructor || (course.instructors?.[0]?.firstName ? `${course.instructors[0].firstName} ${course.instructors[0].lastName}` : 'استاد مدعو')}
                  </span>
                </div>
                
                <div className="mt-auto pt-4 border-t border-[var(--neo-border)] flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-[var(--neo-text-muted)]">
                    <div className="flex items-center gap-1"><Clock className="w-3.5 h-3.5"/> {typeof course.duration === 'string' ? course.duration : course.totalDuration ? Math.round(course.totalDuration / 60) + ' ساعت' : '0 ساعت'}</div>
                    <div className="flex items-center gap-1"><PlayCircle className="w-3.5 h-3.5"/> {course.totalLessons || 0} جلسه</div>
                  </div>
                  <div className="font-bold text-[var(--neo-primary)]">
                    {course.price === 0 ? "رایگان" : `${course.price.toLocaleString()} تومان`}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
