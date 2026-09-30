import Link from "next/link";
import { Clock, Users, PlayCircle, Star } from "lucide-react";

export function CourseList({
  title,
  data = [],
  sectionName = "Explore",
  isLoading = false
}: {
  title: string;
  data?: any[];
  sectionName?: string;
  isLoading?: boolean;
}) {
  if (!isLoading && !data?.length) return null;

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
          {isLoading
            ? [...Array(4)].map((_, i) => (
                <div key={i} className="neo-card flex flex-col overflow-hidden bg-white animate-pulse border border-[var(--neo-border)] rounded-2xl">
                  <div className="aspect-[16/10] bg-gray-200 w-full"></div>
                  <div className="p-5 flex flex-col flex-grow">
                    <div className="flex justify-between items-center mb-3">
                      <div className="h-4 bg-gray-200 rounded w-16"></div>
                      <div className="h-4 bg-gray-100 rounded w-10"></div>
                    </div>
                    <div className="h-5 bg-gray-200 rounded w-4/5 mb-3"></div>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-6 h-6 rounded-full bg-gray-200"></div>
                      <div className="h-4 bg-gray-100 rounded w-24"></div>
                    </div>
                    <div className="mt-auto pt-4 border-t border-[var(--neo-border)] flex items-center justify-between">
                      <div className="h-4 bg-gray-100 rounded w-20"></div>
                      <div className="h-5 bg-gray-200 rounded w-20"></div>
                    </div>
                  </div>
                </div>
              ))
            : data.map((item: any) => {
                const isClass = item.mode !== undefined || item.capacity !== undefined || item.scheduleDays !== undefined;
                const linkHref = isClass ? `/classes/${item.slug || item._id}` : `/courses/${item.slug || item._id}`;
                const instructorObj = item.instructor || item.instructors?.[0];
                const instructorName = typeof instructorObj === 'object' && instructorObj !== null
                  ? `${instructorObj.firstName || ''} ${instructorObj.lastName || ''}`.trim() || instructorObj.name
                  : (typeof item.instructor === 'string' ? item.instructor : 'استاد تک‌یاد');
                const instructorAvatar = instructorObj?.avatar;
                const isFree = item.price === 0;
                const hasDiscount = item.discountPrice && item.discountPrice < item.price;
                const displayPrice = hasDiscount ? item.discountPrice : item.price;

                return (
                  <Link key={item._id} href={linkHref} className="neo-card group flex flex-col overflow-hidden relative bg-white border border-[var(--neo-border)] rounded-2xl hover:shadow-lg transition-all duration-300">
                    <div className="relative aspect-[16/10] overflow-hidden bg-[var(--neo-surface-2)]">
                      <img
                        src={item.coverImage || item.thumbnail || `https://picsum.photos/seed/${item.slug || item._id}/400/250`}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-700 ease-out"
                      />

                      {/* Overlays */}
                      <div className="absolute top-3 right-3 z-20 flex flex-wrap gap-1.5">
                        {isFree && (
                          <div className="bg-emerald-500 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-xs">
                            رایگان
                          </div>
                        )}
                        {item.mode === 'online' && (
                          <div className="bg-blue-600/90 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span> آنلاین (Live)
                          </div>
                        )}
                        {item.mode === 'in_person' && (
                          <div className="bg-amber-600/90 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-white"></span> حضوری
                          </div>
                        )}
                        {!item.mode && item.tags?.includes('آنلاین') && (
                          <div className="bg-blue-600/90 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-xs">
                            آنلاین
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-4 sm:p-5 flex flex-col flex-grow">
                      <div className="flex items-center justify-between mb-2.5">
                        <div className="text-[var(--neo-text-muted)] text-[11px] font-medium bg-[var(--neo-surface-2)] px-2 py-0.5 rounded-md">
                          {item.categoryId?.name || item.category?.name || (isClass ? 'کلاس تعاملی' : 'دوره آموزشی')}
                        </div>
                        <div className="flex items-center gap-1 text-amber-500 text-xs font-bold font-mono">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span>{item.averageRating || item.rating ? Number(item.averageRating || item.rating).toFixed(1) : "5.0"}</span>
                        </div>
                      </div>

                      <h3 className="font-bold text-[var(--neo-text-main)] mb-2 text-sm sm:text-base line-clamp-2 leading-relaxed group-hover:text-[var(--neo-primary)] transition-colors">
                        {item.title}
                      </h3>

                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 overflow-hidden border border-blue-100 shrink-0">
                          {instructorAvatar ? (
                            <img
                              src={instructorAvatar}
                              className="w-full h-full object-cover"
                              alt=""
                            />
                          ) : (
                            <Users className="w-3 h-3" />
                          )}
                        </div>
                        <span className="text-xs text-[var(--neo-text-secondary)] font-medium line-clamp-1">
                          {instructorName || 'استاد تک‌یاد'}
                        </span>
                      </div>

                      <div className="mt-auto pt-3 border-t border-[var(--neo-border)] flex items-center justify-between">
                        <div className="flex items-center gap-2 text-[11px] text-[var(--neo-text-muted)]">
                          {isClass ? (
                            <span>{item.sessions || 10} جلسه</span>
                          ) : (
                            <span>{item.totalLessons || 12} درس</span>
                          )}
                        </div>
                        <div className="font-bold text-xs sm:text-sm text-[var(--neo-primary)] font-mono">
                          {isFree ? (
                            <span className="text-emerald-600">رایگان</span>
                          ) : (
                            <span>{displayPrice.toLocaleString('fa-IR')} <span className="text-[10px] text-gray-500 font-normal">تومان</span></span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
        </div>
      </div>
    </section>
  );
}
