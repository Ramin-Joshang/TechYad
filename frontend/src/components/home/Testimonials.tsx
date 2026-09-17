import { Star, Quote } from "lucide-react";

export function Testimonials({ data = [] }: { data: any[] }) {
  if (!data?.length) return null;
  
  return (
    <section className="py-24 bg-[var(--neo-bg)] border-b border-[var(--neo-border)] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="flex justify-center items-center gap-2 mb-3">
             <span className="w-8 h-px bg-[var(--neo-primary)]"></span>
             <span className="text-[var(--neo-primary)] font-bold tracking-widest text-sm uppercase font-en">08 / Stories</span>
             <span className="w-8 h-px bg-[var(--neo-primary)]"></span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-white">نظرات دانشجویان</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {data.slice(0, 3).map((item: any, idx: number) => (
            <div key={item._id || idx} className="bg-[var(--neo-surface)] border border-[var(--neo-border)] p-8 rounded-2xl relative neo-card">
              <Quote className="absolute top-6 left-6 w-12 h-12 text-[var(--neo-primary)] opacity-10" />
              
              <div className="flex items-center gap-1 mb-6 text-[#FFB800]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < (item.rating || 5) ? 'fill-current' : 'text-gray-300'}`} />
                ))}
              </div>
              
              <p className="text-[var(--neo-text)] mb-8 leading-relaxed font-light">"{item.comment}"</p>
              
              <div className="flex items-center gap-4 mt-auto">
                <div className="w-12 h-12 rounded-full border border-[var(--neo-border)] overflow-hidden bg-[var(--neo-surface-2)]">
                  {item.user?.avatar ? (
                    <img src={item.user.avatar} alt={item.user.firstName} className="w-full h-full object-cover grayscale" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[var(--neo-muted)] font-en text-sm">
                      {item.user?.firstName?.charAt(0) || 'S'}
                    </div>
                  )}
                </div>
                <div>
                  <div className="font-bold text-white text-sm">{item.user?.firstName} {item.user?.lastName}</div>
                  <div className="text-xs text-[var(--neo-muted)] mt-1">{item.course?.title || 'دانشجو'}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
