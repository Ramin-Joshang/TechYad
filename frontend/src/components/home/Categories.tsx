import Link from "next/link";
import { Hexagon } from "lucide-react";

export function Categories({ data = [] }: { data: any[] }) {
  if (!data?.length) return null;
  
  return (
    <section className="py-24 bg-[var(--neo-surface-2)] relative border-b border-[var(--neo-border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-8 h-px bg-[var(--neo-primary)]"></span>
              <span className="text-[var(--neo-primary)] font-bold tracking-widest text-sm uppercase">مسیرهای یادگیری</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-[var(--neo-text-main)]">گسترش مرزهای دانش</h2>
          </div>
          <Link href="/courses" className="text-[var(--neo-text-secondary)] hover:text-[var(--neo-primary)] transition font-medium flex items-center gap-2 pb-1 border-b border-transparent hover:border-[var(--neo-primary)]">
            مشاهده همه دسته‌بندی‌ها
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {data.map((cat: any, index: number) => (
            <Link key={cat._id} href={`/courses?category=${cat.slug}`} className="group relative overflow-hidden bg-white p-8 rounded-[20px] border border-[var(--neo-border)] hover:border-[var(--neo-primary)]/30 transition-all duration-300 flex flex-col hover:-translate-y-1 shadow-sm hover:shadow-lg hover:shadow-[var(--neo-primary)]/5">
              
              <div className="flex justify-between items-start mb-6">
                <div className="w-14 h-14 rounded-2xl border border-[var(--neo-border)] bg-[var(--neo-bg)] text-[var(--neo-primary)] flex items-center justify-center group-hover:bg-[var(--neo-primary)] group-hover:text-white transition-colors duration-300">
                  <Hexagon className="w-7 h-7" />
                </div>
                <span className="text-[var(--neo-border)] font-en text-4xl font-black opacity-50 group-hover:text-[var(--neo-primary)]/10 transition-colors">
                  {(index + 1).toString().padStart(2, '0')}
                </span>
              </div>
              
              <h3 className="font-bold text-[var(--neo-text-main)] mb-2 text-xl relative z-10">{cat.name}</h3>
              <p className="text-sm text-[var(--neo-text-secondary)] line-clamp-2 relative z-10">{cat.description || "آشنایی با مفاهیم و تکنولوژی‌های روز"}</p>
              
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
