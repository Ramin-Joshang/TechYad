import Link from "next/link";
import { Star, User, GraduationCap } from "lucide-react";

export function InstructorGrid({ data = [] }: { data: any[] }) {
  if (!data?.length) return null;
  
  return (
    <section className="py-24 bg-white border-b border-[var(--neo-border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-8 h-px bg-[var(--neo-primary)]"></span>
              <span className="text-[var(--neo-primary)] font-bold tracking-widest text-sm uppercase">اساتید برتر</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-[var(--neo-text-main)]">تجربه یادگیری از بهترین‌ها</h2>
          </div>
          <Link href="/instructors" className="text-[var(--neo-text-secondary)] hover:text-[var(--neo-primary)] transition font-medium flex items-center gap-2 pb-1 border-b border-transparent hover:border-[var(--neo-primary)]">
            مشاهده همه اساتید
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {data.map((inst: any) => (
            <Link key={inst._id} href={`/instructors/${inst.userId?._id}`} className="group bg-[var(--neo-bg)] rounded-[20px] border border-[var(--neo-border)] overflow-hidden hover:border-[var(--neo-primary)]/30 transition-all duration-300 relative neo-card">
              <div className="aspect-square relative overflow-hidden bg-[var(--neo-surface-2)] m-4 rounded-[16px]">
                {inst.userId?.avatar ? (
                  <img src={inst.userId.avatar} alt={`${inst.userId.firstName} ${inst.userId.lastName}`} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-[var(--neo-text-muted)]">
                    <User className="w-16 h-16 mb-2 opacity-50" />
                  </div>
                )}
              </div>
              
              <div className="p-5 text-center">
                <h3 className="font-bold text-[var(--neo-text-main)] mb-1 text-lg group-hover:text-[var(--neo-primary)] transition-colors">{inst.userId?.firstName} {inst.userId?.lastName}</h3>
                <div className="flex items-center justify-center gap-1 text-[var(--neo-text-secondary)] text-sm mb-3">
                   <GraduationCap className="w-4 h-4" />
                   <span>{inst.title || 'مدرس ارشد'}</span>
                </div>
                
                <div className="flex flex-wrap items-center justify-center gap-2">
                   {inst.expertise?.slice(0,2).map((exp: string, idx: number) => (
                      <span key={idx} className="text-xs px-2.5 py-1 rounded-full border border-[var(--neo-border)] bg-white text-[var(--neo-text-secondary)]">
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
