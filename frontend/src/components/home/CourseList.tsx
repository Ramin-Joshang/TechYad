import Link from "next/link";
import { Clock, Users, PlayCircle, Star } from "lucide-react";

export function CourseList({ title, data = [], sectionId = "02" }: { title: string, data: any[], sectionId?: string }) {
  if (!data?.length) return null;
  
  return (
    <section className="py-20 bg-[var(--neo-bg)] border-b border-[var(--neo-border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
             <div className="flex items-center gap-2 mb-3">
              <span className="w-8 h-px bg-[var(--neo-primary)]"></span>
              <span className="text-[var(--neo-primary)] font-bold tracking-widest text-sm uppercase font-en">{sectionId} / Explore</span>
            </div>
            <h2 className="text-3xl font-black text-white">{title}</h2>
          </div>
          <Link href="/courses" className="text-[var(--neo-muted)] hover:text-[var(--neo-secondary)] transition font-medium flex items-center gap-2 pb-1 border-b border-transparent hover:border-[var(--neo-secondary)]">
            مشاهده همه
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {data.map((course: any) => (
            <Link key={course._id} href={`/courses/${course.slug}`} className="neo-card group flex flex-col rounded-2xl overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--neo-surface)] via-transparent to-transparent z-10 pointer-events-none"></div>
              
              <div className="relative aspect-[16/10] overflow-hidden bg-[var(--neo-surface-2)]">
                <img src={course.coverImage || course.thumbnail || `https://picsum.photos/seed/${course.slug}/400/250`} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-700 ease-out opacity-80 group-hover:opacity-100" />
                
                {/* Overlays */}
                <div className="absolute top-4 right-4 z-20 flex gap-2">
                  {course.price === 0 && (
                    <div className="bg-[var(--neo-accent)] text-black text-xs font-black px-2.5 py-1 rounded-md tracking-widest font-en uppercase shadow-[0_0_15px_rgba(184,255,90,0.4)]">
                      Free Access
                    </div>
                  )}
                  {course.type === 'in-person' && (
                     <div className="bg-[#FF5A5A] text-white text-xs font-black px-2.5 py-1 rounded-md tracking-widest font-en flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span> IN PERSON
                    </div>
                  )}
                  {course.type === 'online-class' && (
                     <div className="bg-[#28D7FF] text-black text-xs font-black px-2.5 py-1 rounded-md tracking-widest font-en flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse"></span> LIVE
                    </div>
                  )}
                </div>
              </div>
              
              <div className="p-6 flex flex-col flex-grow relative z-20 -mt-8 bg-[var(--neo-surface)]/80 backdrop-blur-md border-t border-[var(--neo-border)]">
                <div className="flex items-center gap-1 text-[#FFB800] mb-2 font-en text-xs font-bold">
                   <Star className="w-3.5 h-3.5 fill-current" />
                   {course.averageRating ? course.averageRating.toFixed(1) : "4.9"}
                </div>
                
                <h3 className="font-bold text-white mb-2 line-clamp-2 leading-relaxed group-hover:text-[var(--neo-secondary)] transition-colors">{course.title}</h3>
                
                <div className="text-sm text-[var(--neo-muted)] mb-4">
                  {course.instructor?.name || course.instructor || (course.instructors?.[0]?.firstName ? `${course.instructors[0].firstName} ${course.instructors[0].lastName}` : 'استاد نامشخص')}
                </div>
                
                {/* Progress bar visual motif (decorative for now, real if authenticated) */}
                <div className="mb-4">
                   <div className="h-1 w-full bg-[var(--neo-surface-2)] rounded-full overflow-hidden">
                     <div className="h-full bg-[var(--neo-border)] w-1/3 group-hover:bg-[var(--neo-primary)] transition-colors"></div>
                   </div>
                </div>
                
                <div className="mt-auto pt-4 flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-[var(--neo-muted)] font-en">
                    <div className="flex items-center gap-1"><Clock className="w-3.5 h-3.5"/> {typeof course.duration === 'string' ? course.duration : course.totalDuration ? Math.round(course.totalDuration / 60) + 'h' : '0h'}</div>
                    <div className="flex items-center gap-1"><PlayCircle className="w-3.5 h-3.5"/> {course.totalLessons || 0}</div>
                  </div>
                  <div className="font-bold text-[var(--neo-secondary)] font-en">
                    {course.price === 0 ? "FREE" : `${course.price.toLocaleString()} T`}
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
