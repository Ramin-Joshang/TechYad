import Link from "next/link";
import { User, GraduationCap } from "lucide-react";

export function InstructorGrid({ data = [], isLoading = false }: { data?: any[], isLoading?: boolean }) {
  if (!isLoading && !data?.length) return null;

  return (
    <section className="py-16 sm:py-24 bg-white border-b border-[var(--neo-border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div dir="rtl" className="flex flex-row justify-between items-center sm:items-end mb-8 sm:mb-16 gap-3 sm:gap-6 text-right w-full">
          <div className="text-right flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 sm:mb-3 justify-start">
              <span className="w-6 sm:w-8 h-px bg-[var(--neo-primary)] shrink-0"></span>
              <span className="text-[var(--neo-primary)] font-bold tracking-widest text-xs sm:text-sm uppercase truncate">اساتید برتر</span>
            </div>
            <h2 className="text-xl sm:text-3xl md:text-4xl font-black text-[var(--neo-text-main)] text-right truncate">تجربه یادگیری از بهترین‌ها</h2>
          </div>
          <Link href="/instructors" className="text-[var(--neo-text-secondary)] hover:text-[var(--neo-primary)] transition font-medium inline-flex items-center gap-1.5 text-xs sm:text-sm shrink-0 pb-1 border-b border-transparent hover:border-[var(--neo-primary)] whitespace-nowrap">
            <span>همه اساتید</span>
            <span className="text-base leading-none">←</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading
            ? [...Array(4)].map((_, idx) => (
                <div key={idx} className="bg-[var(--neo-bg)] rounded-[20px] border border-[var(--neo-border)] p-5 animate-pulse flex flex-col items-center">
                  <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-gray-200 mb-4"></div>
                  <div className="h-5 bg-gray-200 rounded w-28 mb-2"></div>
                  <div className="h-4 bg-gray-100 rounded w-20 mb-4"></div>
                  <div className="flex gap-2 justify-center">
                    <div className="h-6 w-14 bg-gray-200 rounded-full"></div>
                    <div className="h-6 w-14 bg-gray-200 rounded-full"></div>
                  </div>
                </div>
              ))
            : data.map((inst: any) => {
                const instId = inst.userId?._id || inst._id;
                const fullName = inst.userId
                  ? `${inst.userId.firstName || ''} ${inst.userId.lastName || ''}`.trim()
                  : 'استاد تک‌یاد';
                const avatarUrl = inst.userId?.personnelPhoto || inst.personnelPhoto || inst.userId?.avatar || inst.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=0284c7&color=fff`;
                const specialties = inst.specialties || inst.expertise || [];

                return (
                  <Link 
                    key={inst._id} 
                    href={`/instructors/${instId}`} 
                    className="group bg-[var(--neo-bg)] rounded-[20px] border border-[var(--neo-border)] overflow-hidden hover:border-[var(--neo-primary)]/40 hover:shadow-lg transition-all duration-300 relative flex flex-col"
                  >
                    <div className="aspect-square relative overflow-hidden bg-[var(--neo-surface-2)] m-4 rounded-[16px]">
                      <img 
                        src={avatarUrl} 
                        alt={fullName} 
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
                      />
                    </div>

                    <div className="p-5 pt-1 text-center flex flex-col flex-1 justify-between">
                      <div>
                        <h3 className="font-bold text-[var(--neo-text-main)] mb-1 text-base sm:text-lg group-hover:text-[var(--neo-primary)] transition-colors line-clamp-1">
                          {fullName}
                        </h3>
                        <div className="flex items-center justify-center gap-1 text-[var(--neo-text-secondary)] text-xs sm:text-sm mb-3">
                          <GraduationCap className="w-4 h-4 text-blue-600 shrink-0" />
                          <span className="line-clamp-1">{inst.title || inst.userId?.specialty || 'مدرس ارشد تک‌یاد'}</span>
                        </div>
                      </div>

                      {specialties.length > 0 && (
                        <div className="flex flex-wrap items-center justify-center gap-1.5 mt-auto pt-3 border-t border-[var(--neo-border)]/60">
                          {specialties.slice(0, 2).map((exp: string, idx: number) => (
                            <span key={idx} className="text-[11px] font-medium px-2.5 py-0.5 rounded-full border border-[var(--neo-border)] bg-white text-[var(--neo-text-secondary)]">
                              {exp}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
        </div>
      </div>
    </section>
  );
}
