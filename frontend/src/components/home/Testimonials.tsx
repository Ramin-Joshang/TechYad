import { Star, Quote } from "lucide-react";

export function Testimonials({ data = [], isLoading = false }: { data?: any[], isLoading?: boolean }) {
  if (!isLoading && !data?.length) return null;

  return (
    <section className="py-24 bg-white border-b border-[var(--neo-border)] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="flex justify-center items-center gap-2 mb-3">
            <span className="w-8 h-px bg-[var(--neo-primary)]"></span>
            <span className="text-[var(--neo-primary)] font-bold tracking-widest text-sm uppercase">داستان‌های موفقیت</span>
            <span className="w-8 h-px bg-[var(--neo-primary)]"></span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-[var(--neo-text-main)]">نظرات دانشجویان تک‌یاد</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {isLoading
            ? [...Array(3)].map((_, idx) => (
                <div key={idx} className="bg-[var(--neo-surface)] border border-[var(--neo-border)] p-8 rounded-[20px] animate-pulse">
                  <div className="flex gap-1 mb-6">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="w-5 h-5 bg-gray-200 rounded"></div>
                    ))}
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-4/5 mb-8"></div>
                  <div className="flex items-center gap-4 pt-6 border-t border-[var(--neo-border)]">
                    <div className="w-12 h-12 rounded-full bg-gray-200"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                      <div className="h-3 bg-gray-100 rounded w-20"></div>
                    </div>
                  </div>
                </div>
              ))
            : data.slice(0, 3).map((item: any, idx: number) => (
                <div key={item._id || idx} className="bg-[var(--neo-surface)] border border-[var(--neo-border)] p-8 rounded-[20px] relative neo-card">
                  <Quote className="absolute top-6 left-6 w-12 h-12 text-[var(--neo-primary)] opacity-10" />

                  <div className="flex items-center gap-1 mb-6 text-[var(--neo-warning)]">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-5 h-5 ${i < (item.rating || 5) ? 'fill-current' : 'text-gray-200'}`} />
                    ))}
                  </div>

                  <p className="text-[var(--neo-text-main)] mb-8 leading-relaxed font-medium">"{item.comment || item.content}"</p>

                  <div className="flex items-center gap-4 mt-auto pt-6 border-t border-[var(--neo-border)]">
                    <div className="w-12 h-12 rounded-full border border-[var(--neo-border)] overflow-hidden bg-[var(--neo-surface-2)] text-[var(--neo-primary)]">
                      {item.user?.avatar || item.avatar ? (
                        <img src={item.user?.avatar || item.avatar} alt={item.user?.firstName || item.studentName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-sm">
                          {item.user?.firstName?.charAt(0) || item.studentName?.charAt(0) || 'D'}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="font-bold text-[var(--neo-text-main)]">{item.user?.firstName ? `${item.user.firstName} ${item.user.lastName}` : item.studentName}</div>
                      <div className="text-xs text-[var(--neo-text-secondary)] mt-1">{item.course?.title || item.courseName || 'دانشجوی تک‌یاد'}</div>
                    </div>
                  </div>
                </div>
              ))}
        </div>
      </div>
    </section>
  );
}
