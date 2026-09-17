import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function Hero() {
  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-[var(--neo-bg)] border-b border-[var(--neo-border)] pt-16">
      {/* Knowledge Network Background (Light CSS based) */}
      <div className="absolute inset-0 z-0 opacity-60 pointer-events-none">
         <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid-light" width="100" height="100" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.5" fill="var(--neo-border)" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-light)" />
            
            {/* Glowing nodes */}
            <circle cx="20%" cy="30%" r="5" fill="var(--neo-primary)" className="animate-pulse" />
            <circle cx="75%" cy="60%" r="4" fill="var(--neo-secondary)" className="animate-pulse" style={{ animationDelay: '1s' }} />
            <circle cx="85%" cy="20%" r="6" fill="var(--neo-accent)" className="animate-pulse" style={{ animationDelay: '0.5s' }} />
            
            <line x1="20%" y1="30%" x2="75%" y2="60%" stroke="var(--neo-primary)" strokeWidth="1" strokeOpacity="0.2" />
            <line x1="75%" y1="60%" x2="85%" y2="20%" stroke="var(--neo-secondary)" strokeWidth="1" strokeOpacity="0.2" />
         </svg>
      </div>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-[var(--neo-primary)]/10 to-[var(--neo-secondary)]/10 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          <div className="text-right max-w-2xl">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-[var(--neo-border)] bg-white/80 backdrop-blur-md mb-8 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--neo-primary)] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--neo-primary)]"></span>
              </span>
              <span className="text-sm font-medium text-[var(--neo-text-main)]">
                 پلتفرم یکپارچه آموزش آکادمیک و تخصصی
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black text-[var(--neo-text-main)] mb-6 leading-[1.15]">
              یادگیری برای<br/>
              آینده‌ای که <span className="neo-gradient-text">می‌سازی.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-[var(--neo-text-secondary)] mb-10 leading-relaxed font-medium">
              دروس دانشگاهی، آموزش‌های تخصصی و کلاس‌های حضوری؛ با اساتیدی که واقعاً می‌دانند چه چیزی را باید آموزش دهند. مسیر یادگیری خودت را پیدا کن.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/courses" className="inline-flex justify-center items-center gap-2 px-8 py-4 bg-[var(--neo-primary)] text-white hover:bg-opacity-90 rounded-xl font-bold transition shadow-lg shadow-[var(--neo-primary)]/25 text-lg">
                شروع یادگیری
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <Link href="/courses?free=true" className="inline-flex justify-center items-center gap-2 px-8 py-4 bg-white text-[var(--neo-text-main)] border border-[var(--neo-border)] hover:border-[var(--neo-primary)] hover:text-[var(--neo-primary)] rounded-xl font-bold transition text-lg shadow-sm">
                دوره‌های رایگان
              </Link>
            </div>
          </div>
          
          <div className="hidden lg:block relative h-[600px] w-full">
             <div className="absolute inset-0 bg-gradient-to-tr from-[var(--neo-primary)]/10 to-transparent rounded-[40px] border border-[var(--neo-border)] -rotate-3 transition-transform duration-500 hover:rotate-0"></div>
             <div className="absolute inset-0 bg-white rounded-[40px] border border-[var(--neo-border)] shadow-xl overflow-hidden p-8 flex flex-col items-center justify-center rotate-3 transition-transform duration-500 hover:rotate-0 group">
                <div className="w-full max-w-sm mx-auto relative">
                  {/* Decorative elements representing academic UI */}
                  <div className="space-y-4">
                     <div className="h-20 bg-[var(--neo-surface-1)] rounded-2xl border border-[var(--neo-border)] p-4 flex gap-4 items-center group-hover:-translate-y-2 transition-transform duration-500">
                        <div className="w-12 h-12 rounded-xl bg-[var(--neo-primary)]/10 flex-shrink-0"></div>
                        <div className="space-y-2 flex-1">
                          <div className="h-3 w-3/4 bg-gray-200 rounded-full"></div>
                          <div className="h-2 w-1/2 bg-gray-100 rounded-full"></div>
                        </div>
                     </div>
                     <div className="h-20 bg-[var(--neo-surface-1)] rounded-2xl border border-[var(--neo-border)] p-4 flex gap-4 items-center -translate-x-4 group-hover:-translate-y-1 transition-transform duration-500 delay-75">
                        <div className="w-12 h-12 rounded-xl bg-[var(--neo-secondary)]/10 flex-shrink-0"></div>
                        <div className="space-y-2 flex-1">
                          <div className="h-3 w-2/3 bg-gray-200 rounded-full"></div>
                          <div className="h-2 w-1/2 bg-gray-100 rounded-full"></div>
                        </div>
                     </div>
                     <div className="h-20 bg-[var(--neo-surface-1)] rounded-2xl border border-[var(--neo-border)] p-4 flex gap-4 items-center translate-x-4 group-hover:translate-y-1 transition-transform duration-500 delay-150">
                        <div className="w-12 h-12 rounded-xl bg-[var(--neo-accent)]/10 flex-shrink-0"></div>
                        <div className="space-y-2 flex-1">
                          <div className="h-3 w-5/6 bg-gray-200 rounded-full"></div>
                          <div className="h-2 w-1/3 bg-gray-100 rounded-full"></div>
                        </div>
                     </div>
                  </div>
                </div>
             </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}
