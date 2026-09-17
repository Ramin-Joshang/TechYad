import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function CTA() {
  return (
    <section className="py-32 bg-[var(--neo-bg)] relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--neo-primary)]/10 to-transparent"></div>
      
      {/* Knowledge Nodes Decorative */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl opacity-20 pointer-events-none">
         <svg width="100%" height="400" xmlns="http://www.w3.org/2000/svg">
            <line x1="20%" y1="20%" x2="50%" y2="50%" stroke="var(--neo-secondary)" strokeWidth="1" />
            <line x1="50%" y1="50%" x2="80%" y2="80%" stroke="var(--neo-primary)" strokeWidth="1" />
            <circle cx="20%" cy="20%" r="4" fill="var(--neo-secondary)" />
            <circle cx="50%" cy="50%" r="6" fill="var(--neo-accent)" />
            <circle cx="80%" cy="80%" r="4" fill="var(--neo-primary)" />
         </svg>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <h2 className="text-5xl md:text-6xl font-black text-white mb-8 font-en tracking-tight">
          Ready to<br/>start learning?
        </h2>
        <p className="text-xl text-[var(--neo-muted)] mb-12 max-w-2xl mx-auto font-light">
          همین حالا به جمع هزاران دانشجوی تک‌یاد بپیوندید و مسیر یادگیری، ساختن و رشد کردن را آغاز کنید.
        </p>
        <Link href="/register" className="inline-flex justify-center items-center gap-2 px-10 py-5 bg-[var(--neo-primary)] text-white hover:bg-[var(--neo-secondary)] hover:text-black rounded-xl font-bold transition-all shadow-[0_0_30px_rgba(124,92,255,0.3)] hover:shadow-[0_0_40px_rgba(40,215,255,0.4)] text-lg">
          شروع یادگیری
          <ArrowLeft className="w-5 h-5" />
        </Link>
      </div>
    </section>
  );
}
