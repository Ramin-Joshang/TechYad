import Link from "next/link";
import { Hexagon } from "lucide-react";

export function Categories({ data = [] }: { data: any[] }) {
  if (!data?.length) return null;
  
  return (
    <section className="py-24 bg-[var(--neo-bg)] relative border-b border-[var(--neo-border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-8 h-px bg-[var(--neo-primary)]"></span>
              <span className="text-[var(--neo-primary)] font-bold tracking-widest text-sm uppercase font-en">01 / Categories</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-white">مسیرهای یادگیری</h2>
          </div>
          <Link href="/courses" className="text-[var(--neo-muted)] hover:text-[var(--neo-secondary)] transition font-medium flex items-center gap-2 pb-1 border-b border-transparent hover:border-[var(--neo-secondary)]">
            مشاهده همه دسته‌بندی‌ها
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {data.map((cat: any, index: number) => (
            <Link key={cat._id} href={`/courses?category=${cat.slug}`} className="group relative overflow-hidden bg-[var(--neo-surface)] p-8 rounded-2xl border border-[var(--neo-border)] hover:border-[var(--neo-primary)]/50 transition-all duration-300 flex flex-col hover:-translate-y-1 shadow-[0_0_0_rgba(124,92,255,0)] hover:shadow-[0_8px_30px_-4px_rgba(124,92,255,0.15)]">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[var(--neo-primary)]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <div className="w-12 h-12 rounded-xl border border-[var(--neo-border)] bg-[var(--neo-surface-2)] text-[var(--neo-muted)] flex items-center justify-center mb-6 group-hover:text-[var(--neo-secondary)] group-hover:border-[var(--neo-secondary)]/30 transition-colors">
                <Hexagon className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-white mb-2 text-lg relative z-10">{cat.name}</h3>
              <p className="text-sm text-[var(--neo-muted)] line-clamp-2 relative z-10">{cat.description || "بدون توضیحات"}</p>
              
              <div className="mt-6 pt-4 border-t border-[var(--neo-border)] flex items-center justify-between text-sm text-[var(--neo-muted)] group-hover:text-white transition-colors relative z-10">
                <span>شروع مسیر</span>
                <span className="font-en">→</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
