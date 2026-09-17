import Link from "next/link";
import { Star, User, ChevronLeft } from "lucide-react";

export function InstructorGrid({ data = [] }: { data: any[] }) {
  if (!data?.length) return null;
  
  return (
    <section className="py-24 bg-[var(--neo-bg)] border-b border-[var(--neo-border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-8 h-px bg-[var(--neo-primary)]"></span>
              <span className="text-[var(--neo-primary)] font-bold tracking-widest text-sm uppercase font-en">05 / Mentors</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-white">اساتید برتر</h2>
          </div>
          <Link href="/instructors" className="text-[var(--neo-muted)] hover:text-[var(--neo-secondary)] transition font-medium flex items-center gap-2 pb-1 border-b border-transparent hover:border-[var(--neo-secondary)]">
            مشاهده همه اساتید
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {data.map((inst: any) => (
            <Link key={inst._id} href={`/instructors/${inst.userId?._id}`} className="group bg-[var(--neo-surface)] rounded-2xl border border-[var(--neo-border)] overflow-hidden hover:border-[var(--neo-secondary)]/50 transition-all duration-300 relative neo-card">
              <div className="aspect-[4/5] relative overflow-hidden bg-[var(--neo-surface-2)]">
                {inst.userId?.avatar ? (
                  <img src={inst.userId.avatar} alt={`${inst.userId.firstName} ${inst.userId.lastName}`} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition duration-700 opacity-80 group-hover:opacity-100" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-[var(--neo-muted)]">
                    <User className="w-16 h-16 mb-4 opacity-50" />
                    <span className="text-sm font-en">NO PHOTO</span>
                  </div>
                )}
                
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--neo-surface)] via-transparent to-transparent"></div>
              </div>
              
              <div className="absolute bottom-0 w-full p-6 text-center transform group-hover:-translate-y-2 transition-transform duration-300">
                <h3 className="font-bold text-white mb-1 text-lg">{inst.userId?.firstName} {inst.userId?.lastName}</h3>
                <p className="text-sm text-[var(--neo-secondary)] mb-4 tracking-widest font-en uppercase text-[10px]">{inst.title || 'Instructor'}</p>
                
                <div className="flex items-center justify-center gap-3">
                   {inst.expertise?.slice(0,2).map((exp: string, idx: number) => (
                      <span key={idx} className="text-xs px-2 py-1 rounded border border-[var(--neo-border)] bg-[var(--neo-surface-2)] text-[var(--neo-muted)] font-en">
                        {exp}
                      </span>
                   ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
