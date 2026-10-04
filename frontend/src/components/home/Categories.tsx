import Link from "next/link";
import { Hexagon } from "lucide-react";

export function Categories({ data = [], isLoading = false }: { data?: any[], isLoading?: boolean }) {
  if (!isLoading && !data?.length) return null;

  return (
    <section className="py-16 sm:py-24 bg-[var(--neo-surface-2)] relative border-b border-[var(--neo-border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div dir="rtl" className="flex flex-row justify-between items-center sm:items-end mb-8 sm:mb-16 gap-3 sm:gap-6 text-right w-full">
          <div className="text-right flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 sm:mb-3 justify-start">
              <span className="w-6 sm:w-8 h-px bg-[var(--neo-primary)] shrink-0"></span>
              <span className="text-[var(--neo-primary)] font-bold tracking-widest text-xs sm:text-sm uppercase truncate">مسیرهای یادگیری</span>
            </div>
            <h2 className="text-xl sm:text-3xl md:text-4xl font-black text-[var(--neo-text-main)] text-right truncate">گسترش مرزهای دانش</h2>
          </div>
          <Link href="/courses" className="text-[var(--neo-text-secondary)] hover:text-[var(--neo-primary)] transition font-medium inline-flex items-center gap-1.5 text-xs sm:text-sm shrink-0 pb-1 border-b border-transparent hover:border-[var(--neo-primary)] whitespace-nowrap">
            <span>همه دسته‌ها</span>
            <span className="text-base leading-none">←</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading
            ? [...Array(4)].map((_, index) => (
                <div key={index} className="bg-white p-8 rounded-[20px] border border-[var(--neo-border)] flex flex-col animate-pulse">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-gray-200"></div>
                    <div className="w-8 h-8 rounded bg-gray-100"></div>
                  </div>
                  <div className="h-6 bg-gray-200 rounded-md w-3/4 mb-3"></div>
                  <div className="h-4 bg-gray-100 rounded-md w-full mb-2"></div>
                  <div className="h-4 bg-gray-100 rounded-md w-2/3 mb-6"></div>
                  <div className="mt-auto pt-4 border-t border-[var(--neo-border)] flex items-center justify-between">
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                    <div className="h-4 bg-gray-200 rounded w-6"></div>
                  </div>
                </div>
              ))
            : data.map((cat: any, index: number) => (
                <Link key={cat._id} href={`/courses?category=${cat.slug}`} dir="rtl" className="group relative overflow-hidden bg-white p-8 rounded-[20px] border border-[var(--neo-border)] hover:border-[var(--neo-primary)]/30 transition-all duration-300 flex flex-col hover:-translate-y-1 shadow-sm hover:shadow-lg hover:shadow-[var(--neo-primary)]/5 text-right">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-14 h-14 rounded-2xl border border-[var(--neo-border)] bg-[var(--neo-bg)] text-[var(--neo-primary)] flex items-center justify-center group-hover:bg-[var(--neo-primary)] group-hover:text-white transition-colors duration-300">
                      <Hexagon className="w-7 h-7" />
                    </div>
                    <span className="text-[var(--neo-border)] font-en text-4xl font-black opacity-50 group-hover:text-[var(--neo-primary)]/10 transition-colors">
                      {(index + 1).toString().padStart(2, '0')}
                    </span>
                  </div>

                  <h3 className="font-bold text-[var(--neo-text-main)] mb-2 text-xl relative z-10 text-right w-full">{cat.name}</h3>
                  <p className="text-sm text-[var(--neo-text-secondary)] line-clamp-2 relative z-10 text-right w-full">{cat.description || "آشنایی با مفاهیم و تکنولوژی‌های روز"}</p>

                  <div className="mt-6 pt-4 border-t border-[var(--neo-border)] flex items-center justify-between text-sm text-[var(--neo-text-secondary)] group-hover:text-[var(--neo-primary)] transition-colors relative z-10 font-medium">
                    <span>شروع مسیر</span>
                    <span>←</span>
                  </div>
                </Link>
              ))}
        </div>
      </div>
    </section>
  );
}
