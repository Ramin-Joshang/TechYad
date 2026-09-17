import { BookOpen, Users, Award, MonitorPlay, Sparkles } from "lucide-react";

export function Intro() {
  const stats = [
    { icon: BookOpen, value: "۵۰۰+", label: "دوره آموزشی" },
    { icon: Users, value: "۵۰K+", label: "دانشجو فعال" },
    { icon: Award, value: "۲۰۰+", label: "استاد مجرب" },
    { icon: MonitorPlay, value: "۱۰K+", label: "ساعت آموزش" },
  ];

  return (
    <section className="py-24 bg-white border-b border-[var(--neo-border)] overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="w-5 h-5 text-[var(--neo-secondary)]" />
              <span className="text-[var(--neo-secondary)] font-bold tracking-widest text-sm uppercase">درباره پلتفرم</span>
            </div>
            
            <h2 className="text-3xl md:text-5xl font-black text-[var(--neo-text-main)] mb-6 leading-tight">
              تجربه یادگیری <br/>
              <span className="text-[var(--neo-primary)]">بهتر و متفاوت‌تر</span>
            </h2>
            
            <p className="text-lg text-[var(--neo-text-secondary)] mb-10 leading-relaxed font-medium">
              تک‌یاد با هدف ارتقای سطح دانش و مهارت‌های تخصصی، پلتفرمی یکپارچه برای یادگیری فراهم کرده است. ما با بهره‌گیری از برترین اساتید ایران، دوره‌هایی متناسب با نیاز بازار کار طراحی کرده‌ایم تا مسیر رشد شما را هموارتر کنیم.
            </p>
            
            <div className="grid grid-cols-2 gap-8">
              {stats.map((stat, idx) => (
                <div key={idx} className="flex flex-col border-r border-[var(--neo-border)] pr-4 last:border-0">
                  <div className="flex items-center gap-3 mb-3">
                    <stat.icon className="w-5 h-5 text-[var(--neo-primary)]" />
                    <span className="text-3xl font-black text-[var(--neo-text-main)]">{stat.value}</span>
                  </div>
                  <span className="text-[var(--neo-text-muted)] font-bold text-sm">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-[var(--neo-primary)]/10 to-[var(--neo-secondary)]/10 blur-3xl rounded-full -z-10"></div>
            
            {/* Minimalist image container */}
            <div className="aspect-[4/3] rounded-[24px] overflow-hidden bg-[var(--neo-surface-2)] border border-[var(--neo-border)] relative group shadow-xl shadow-[var(--neo-primary)]/5">
              <img src="/hero-image.png" alt="دانشجویان در حال یادگیری" className="w-full h-full object-cover transition duration-700 group-hover:scale-105" />
              
              <div className="absolute bottom-6 right-6 z-20 flex gap-2">
                 <div className="w-2.5 h-2.5 rounded-full bg-[var(--neo-primary)] shadow-sm"></div>
                 <div className="w-2.5 h-2.5 rounded-full bg-[var(--neo-secondary)] shadow-sm"></div>
                 <div className="w-2.5 h-2.5 rounded-full bg-[var(--neo-accent)] shadow-sm"></div>
              </div>
            </div>
            
            <div className="absolute -bottom-6 -left-6 bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-xl shadow-[var(--neo-primary)]/10 border border-[var(--neo-border)]">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[var(--neo-bg)] text-[var(--neo-primary)] rounded-full flex items-center justify-center border border-[var(--neo-border)]">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-[var(--neo-text-main)] tracking-tight text-sm">مدرک معتبر و بین‌المللی</p>
                  <p className="text-xs text-[var(--neo-text-muted)] mt-1 font-medium">مورد تایید وزارت علوم</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
