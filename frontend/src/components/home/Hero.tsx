import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function Hero() {
  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-[var(--neo-bg)] border-b border-[var(--neo-border)] pt-16">
      {/* Knowledge Network Background (CSS based) */}
      <div className="absolute inset-0 z-0 opacity-40">
         <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.5" fill="var(--neo-muted)" />
                <path d="M 2 2 L 102 2" stroke="var(--neo-border)" strokeWidth="0.5" strokeDasharray="4 4"/>
                <path d="M 2 2 L 2 102" stroke="var(--neo-border)" strokeWidth="0.5" strokeDasharray="4 4"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            
            {/* Glowing nodes */}
            <circle cx="20%" cy="30%" r="4" fill="var(--neo-primary)" className="animate-pulse" />
            <circle cx="75%" cy="60%" r="3" fill="var(--neo-secondary)" className="animate-pulse" style={{ animationDelay: '1s' }} />
            <circle cx="85%" cy="20%" r="5" fill="var(--neo-accent)" className="animate-pulse" style={{ animationDelay: '0.5s' }} />
            
            <line x1="20%" y1="30%" x2="75%" y2="60%" stroke="var(--neo-primary)" strokeWidth="0.5" strokeOpacity="0.2" />
            <line x1="75%" y1="60%" x2="85%" y2="20%" stroke="var(--neo-secondary)" strokeWidth="0.5" strokeOpacity="0.2" />
         </svg>
      </div>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[var(--neo-primary)]/10 rounded-full blur-[120px] -z-10 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          <div className="text-right max-w-2xl">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-[var(--neo-border)] bg-[var(--neo-surface-2)]/50 backdrop-blur-md mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--neo-accent)] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--neo-accent)]"></span>
              </span>
              <span className="text-sm font-medium text-[var(--neo-text)] tracking-wider">
                 پلتفرم یکپارچه دوره‌های آنلاین و حضوری
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-[1.15]">
              یادگیری برای<br/>
              آینده‌ای که <span className="neo-gradient-text">می‌سازی.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-[var(--neo-muted)] mb-10 leading-relaxed font-light">
              دروس دانشگاهی، آموزش‌های تخصصی و کلاس‌های حضوری؛ با اساتیدی که واقعاً می‌دانند چه چیزی را باید آموزش دهند. مسیر یادگیری خودت را پیدا کن.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-5">
              <Link href="/courses" className="inline-flex justify-center items-center gap-2 px-8 py-4 bg-white text-black hover:bg-gray-200 rounded-xl font-bold transition shadow-[0_0_20px_rgba(255,255,255,0.15)] text-lg">
                شروع یادگیری
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <Link href="/courses?free=true" className="inline-flex justify-center items-center gap-2 px-8 py-4 bg-transparent text-[var(--neo-text)] border border-[var(--neo-border)] hover:bg-[var(--neo-surface-2)] rounded-xl font-bold transition text-lg">
                دوره‌های رایگان
              </Link>
            </div>
          </div>
          
          <div className="hidden lg:block relative h-[600px] w-full">
             <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-[400px] h-[400px]">
                   <div className="absolute top-0 right-10 px-4 py-2 bg-[var(--neo-surface)] border border-[var(--neo-border)] rounded-full text-sm font-en text-[var(--neo-secondary)] animate-bounce" style={{ animationDuration: '4s' }}>AI Models</div>
                   <div className="absolute bottom-10 left-0 px-4 py-2 bg-[var(--neo-surface)] border border-[var(--neo-border)] rounded-full text-sm font-en text-[var(--neo-primary)] animate-bounce" style={{ animationDuration: '5s' }}>Calculus</div>
                   <div className="absolute top-1/2 left-10 px-4 py-2 bg-[var(--neo-surface)] border border-[var(--neo-border)] rounded-full text-sm font-en text-[var(--neo-accent)] animate-bounce" style={{ animationDuration: '4.5s' }}>Python</div>
                   <div className="absolute bottom-1/3 right-0 px-4 py-2 bg-[var(--neo-surface)] border border-[var(--neo-border)] rounded-full text-sm font-en text-[#FF5A5A] animate-bounce" style={{ animationDuration: '6s' }}>Mechanics</div>
                   <div className="absolute top-1/4 left-1/4 px-4 py-2 bg-[var(--neo-surface)] border border-[var(--neo-border)] rounded-full text-sm font-en text-[#FFB800] animate-bounce" style={{ animationDuration: '3.5s' }}>MATLAB</div>
                   
                   {/* Center node */}
                   <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border border-[var(--neo-border)] bg-[var(--neo-surface-2)] flex items-center justify-center shadow-[0_0_40px_var(--neo-primary)]">
                     <span className="font-en font-bold tracking-widest text-lg neo-gradient-text">KNOWLEDGE</span>
                   </div>
                   
                   {/* Connection lines */}
                   <svg className="absolute inset-0 w-full h-full -z-10 opacity-30">
                     <line x1="50%" y1="50%" x2="10%" y2="20%" stroke="var(--neo-border)" strokeWidth="1" />
                     <line x1="50%" y1="50%" x2="90%" y2="80%" stroke="var(--neo-border)" strokeWidth="1" />
                     <line x1="50%" y1="50%" x2="20%" y2="80%" stroke="var(--neo-border)" strokeWidth="1" />
                     <line x1="50%" y1="50%" x2="80%" y2="20%" stroke="var(--neo-border)" strokeWidth="1" />
                   </svg>
                </div>
             </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}
