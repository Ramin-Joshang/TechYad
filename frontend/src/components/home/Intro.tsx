import { BookOpen, Users, Award, MonitorPlay, Sparkles } from "lucide-react";

export function Intro() {
  const stats = [
    { icon: BookOpen, value: "500+", label: "Courses" },
    { icon: Users, value: "50K+", label: "Students" },
    { icon: Award, value: "200+", label: "Instructors" },
    { icon: MonitorPlay, value: "10K+", label: "Hours" },
  ];

  return (
    <section className="py-24 bg-[var(--neo-bg)] border-b border-[var(--neo-border)] overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="w-5 h-5 text-[var(--neo-secondary)]" />
              <span className="text-[var(--neo-secondary)] font-bold tracking-widest text-sm uppercase font-en">Neo Academia</span>
            </div>
            
            <h2 className="text-3xl md:text-5xl font-black text-white mb-6 leading-tight">
              WE BUILD BETTER <br/>
              <span className="text-[var(--neo-primary)]">LEARNING</span> EXPERIENCES.
            </h2>
            
            <p className="text-lg text-[var(--neo-muted)] mb-10 leading-relaxed">
              تک‌یاد با هدف ارتقای سطح دانش و مهارت‌های تخصصی، پلتفرمی یکپارچه برای یادگیری فراهم کرده است. ما با بهره‌گیری از برترین اساتید ایران، دوره‌هایی متناسب با نیاز بازار کار طراحی کرده‌ایم تا مسیر رشد شما را هموارتر کنیم.
            </p>
            
            <div className="grid grid-cols-2 gap-8">
              {stats.map((stat, idx) => (
                <div key={idx} className="flex flex-col border-r border-[var(--neo-border)] pr-4 last:border-0">
                  <div className="flex items-center gap-3 mb-3">
                    <stat.icon className="w-5 h-5 text-[var(--neo-primary)]" />
                    <span className="text-3xl font-black text-white font-en">{stat.value}</span>
                  </div>
                  <span className="text-[var(--neo-muted)] font-medium font-en tracking-wider text-sm uppercase">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-[var(--neo-primary)]/20 to-[var(--neo-secondary)]/20 blur-3xl rounded-full -z-10"></div>
            
            {/* Minimalist image container */}
            <div className="aspect-[4/3] rounded-3xl overflow-hidden bg-[var(--neo-surface)] border border-[var(--neo-border)] relative group">
              <div className="absolute inset-0 bg-black/40 z-10 group-hover:bg-black/20 transition duration-500"></div>
              <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=800&auto=format&fit=crop" alt="دانشجویان در حال یادگیری" className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 transition duration-500" />
              
              <div className="absolute bottom-6 left-6 z-20 flex gap-2">
                 <div className="w-2 h-2 rounded-full bg-[var(--neo-primary)] animate-pulse"></div>
                 <div className="w-2 h-2 rounded-full bg-[var(--neo-secondary)] animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                 <div className="w-2 h-2 rounded-full bg-[var(--neo-accent)] animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
            
            <div className="absolute -bottom-6 -right-6 bg-[var(--neo-surface-2)]/90 backdrop-blur-md p-6 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.5)] border border-[var(--neo-border)]">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 border border-[var(--neo-accent)]/30 text-[var(--neo-accent)] rounded-full flex items-center justify-center">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-white uppercase tracking-wider font-en text-sm">Certified</p>
                  <p className="text-xs text-[var(--neo-muted)] mt-1">مورد تایید وزارت علوم</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
