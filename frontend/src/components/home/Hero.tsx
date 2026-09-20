'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Sparkles, 
  Play, 
  Star, 
  Users, 
  CheckCircle2, 
  GraduationCap, 
  Flame, 
  ShieldCheck, 
  Terminal, 
  Zap,
  BookOpen,
  Search
} from 'lucide-react';

const TRENDING_TAGS = [
  { name: 'هوش مصنوعی و LLM', href: '/courses?search=هوش مصنوعی' },
  { name: 'پایتون پیشرفته', href: '/courses?search=پایتون' },
  { name: 'ریاضیات مهندسی', href: '/courses?search=ریاضیات' },
  { name: 'معماری وب و میکروسرویس', href: '/courses?search=وب' },
  { name: 'یادگیری ماشین', href: '/courses?search=یادگیری ماشین' },
];

export function Hero() {
  const [activeTab, setActiveTab] = useState<'code' | 'curriculum'>('code');

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-[var(--neo-bg)] border-b border-[var(--neo-border)] pt-12 pb-16 lg:py-20">
      {/* Dynamic Background Grid & Ambient Glows */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="hero-neo-grid" width="48" height="48" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.2" fill="var(--neo-border)" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-neo-grid)" />
        </svg>
      </div>

      {/* Atmospheric Radial Gradients */}
      <div className="absolute top-1/4 right-5 w-96 h-96 bg-[var(--neo-primary)]/15 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse" style={{ animationDuration: '6s' }} />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-[var(--neo-secondary)]/15 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse" style={{ animationDuration: '8s' }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Right Column (Text & Value Proposition) */}
          <div className="lg:col-span-7 text-right">
            
            {/* Top Badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-[var(--neo-border)] bg-white/80 backdrop-blur-md mb-6 shadow-sm">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--neo-primary)] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[var(--neo-primary)]"></span>
              </span>
              <span className="text-xs sm:text-sm font-bold text-[var(--neo-text-main)] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                سامانه هوشمند و یکپارچه آموزش تخصصی و دانشگاهی
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[var(--neo-text-main)] mb-6 leading-[1.2] tracking-tight">
              یادگیری عمیق، مهارت واقعی؛
              <br />
              برای آینده‌ای که <span className="neo-gradient-text">می‌سازی.</span>
            </h1>

            {/* Subtitle / Description */}
            <p className="text-base sm:text-lg text-[var(--neo-text-secondary)] mb-8 leading-relaxed max-w-2xl font-normal">
              دروس مرجع دانشگاهی، فناوری‌های روز دنیای نرم‌افزار، و کارگاه‌های زنده با هیئت علمی برتر و متخصصان ارشد صنعت. همراه با پشتیبانی مرحله‌به‌مرحله و گواهی معتبر مهارت.
            </p>

            {/* Trending Quick Tags */}
            <div className="flex flex-wrap items-center gap-2 mb-8">
              <span className="text-xs font-bold text-[var(--neo-text-muted)] flex items-center gap-1 ml-1">
                <Flame className="w-3.5 h-3.5 text-rose-500" />
                محبوب‌ترین مباحث:
              </span>
              {TRENDING_TAGS.map((tag) => (
                <Link
                  key={tag.name}
                  href={tag.href}
                  className="text-xs px-3 py-1.5 rounded-lg bg-white border border-[var(--neo-border)] text-[var(--neo-text-secondary)] hover:text-[var(--neo-primary)] hover:border-[var(--neo-primary)] transition shadow-2xs font-medium"
                >
                  {tag.name}
                </Link>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-10">
              <Link
                href="/courses"
                className="inline-flex justify-center items-center gap-2.5 px-8 py-4 bg-[var(--neo-primary)] hover:bg-blue-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-[var(--neo-primary)]/25 text-base hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>شروع یادگیری و دوره‌ها</span>
                <ArrowLeft className="w-5 h-5" />
              </Link>
              
              <Link
                href="/classes"
                className="inline-flex justify-center items-center gap-2 px-6 py-4 bg-white hover:bg-[var(--neo-surface-2)] text-[var(--neo-text-main)] border border-[var(--neo-border)] rounded-2xl font-bold transition text-base shadow-sm hover:border-[var(--neo-primary)]/40"
              >
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></div>
                <span>کلاس‌های زنده و آنلاین</span>
              </Link>
            </div>

            {/* Live Social Proof Stats */}
            <div className="pt-6 border-t border-[var(--neo-border)] grid grid-cols-3 gap-4 sm:gap-6">
              <div className="flex flex-col">
                <div className="flex items-center gap-1 text-lg sm:text-2xl font-black text-[var(--neo-text-main)]">
                  <span>۱۲,۵۰۰+</span>
                </div>
                <span className="text-xs font-medium text-[var(--neo-text-muted)] mt-0.5">دانشجوی فعال</span>
              </div>

              <div className="flex flex-col">
                <div className="flex items-center gap-1 text-lg sm:text-2xl font-black text-[var(--neo-text-main)]">
                  <span>۴.۹</span>
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                </div>
                <span className="text-xs font-medium text-[var(--neo-text-muted)] mt-0.5">رضایت از دوره‌ها</span>
              </div>

              <div className="flex flex-col">
                <div className="flex items-center gap-1 text-lg sm:text-2xl font-black text-[var(--neo-text-main)]">
                  <span>۳۵۰+</span>
                </div>
                <span className="text-xs font-medium text-[var(--neo-text-muted)] mt-0.5">سرفصل جامع و عملی</span>
              </div>
            </div>

          </div>

          {/* Left Column (Modern Interactive Learning Showcase) */}
          <div className="lg:col-span-5 relative">
            
            {/* Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[var(--neo-primary)]/20 via-transparent to-[var(--neo-secondary)]/20 rounded-3xl blur-2xl -z-10" />

            {/* Main Interactive Showcase Card */}
            <div className="bg-white/95 backdrop-blur-xl border border-[var(--neo-border)] rounded-3xl shadow-xl p-5 sm:p-6 relative overflow-hidden transition-all duration-300 hover:shadow-2xl">
              
              {/* Header Bar */}
              <div className="flex items-center justify-between pb-4 border-b border-[var(--neo-border)] mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-400"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                </div>
                
                {/* Live Pill */}
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                  <span>جلسه زنده فعال</span>
                </div>
              </div>

              {/* Course Title Preview */}
              <div className="mb-4">
                <span className="text-xs font-bold text-[var(--neo-primary)] uppercase tracking-wider">مهندسی هوش مصنوعی مدرن</span>
                <h3 className="text-base sm:text-lg font-bold text-[var(--neo-text-main)] mt-1">
                  پیاده‌سازی مدل‌های زبانی بزرگ (LLM) و RAG از صفر تا استقرار
                </h3>
              </div>

              {/* Instructor & Active Attendees info */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-[var(--neo-surface-2)] border border-[var(--neo-border)] mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-sm">
                    ع‌ک
                  </div>
                  <div>
                    <div className="font-bold text-sm text-[var(--neo-text-main)] flex items-center gap-1">
                      دکتر علیرضا کاظمی
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div className="text-xs text-[var(--neo-text-muted)]">عضو هیئت علمی دانشکده کامپیوتر</div>
                  </div>
                </div>

                <div className="text-left">
                  <div className="text-xs font-bold text-emerald-600 flex items-center gap-1 justify-end">
                    <Users className="w-3.5 h-3.5" />
                    <span>۱۸۴ آنلاین</span>
                  </div>
                  <div className="text-[10px] text-[var(--neo-text-muted)]">اتاق تعاملی</div>
                </div>
              </div>

              {/* Interactive Tabs */}
              <div className="flex items-center gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('code')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                    activeTab === 'code' 
                      ? 'bg-[var(--neo-primary)] text-white shadow-sm' 
                      : 'bg-gray-100 text-[var(--neo-text-secondary)] hover:bg-gray-200'
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span>کدنویسی زنده</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('curriculum')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                    activeTab === 'curriculum' 
                      ? 'bg-[var(--neo-primary)] text-white shadow-sm' 
                      : 'bg-gray-100 text-[var(--neo-text-secondary)] hover:bg-gray-200'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>سرفصل و تمرین‌ها</span>
                </button>
              </div>

              {/* Tab Content: Code Editor or Curriculum */}
              {activeTab === 'code' ? (
                <div className="bg-[#1e1e2e] rounded-2xl p-4 font-mono text-xs text-left dir-ltr shadow-inner border border-slate-700/50 space-y-1.5">
                  <div className="text-slate-500 text-[11px]">// پروژه عملی: خط لوله استنتاج هوش مصنوعی</div>
                  <div>
                    <span className="text-purple-400">from</span> <span className="text-sky-300">techyad_ai</span>{' '}
                    <span className="text-purple-400">import</span> <span className="text-amber-300">AgentPipeline</span>
                  </div>
                  <div>
                    <span className="text-sky-300">agent</span> ={' '}
                    <span className="text-amber-300">AgentPipeline</span>(model=<span className="text-emerald-400">&quot;gemini-pro&quot;</span>)
                  </div>
                  <div>
                    <span className="text-sky-300">result</span> = agent.<span className="text-blue-300">evaluate_knowledge</span>(user_query)
                  </div>
                  <div className="text-emerald-400 font-bold mt-2 pt-2 border-t border-slate-700/50">
                    &gt;&gt;&gt; [وضعیت]: مدل با دقت ۹۹.۲٪ کامپایل و آماده شد ✓
                  </div>
                </div>
              ) : (
                <div className="bg-[var(--neo-surface-2)] rounded-2xl p-3 text-xs space-y-2 border border-[var(--neo-border)]">
                  <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-[var(--neo-border)]">
                    <span className="font-bold text-[var(--neo-text-main)]">فصل ۱: ریاضیات و جبر خطی یادگیری عمیق</span>
                    <span className="text-emerald-600 font-bold">۱۰۰٪ تکمیل</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-[var(--neo-border)]">
                    <span className="font-bold text-[var(--neo-text-main)]">فصل ۲: معماری ترنسفورمر و Attention</span>
                    <span className="text-[var(--neo-primary)] font-bold">در حال مطالعه</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-xl bg-white/60 border border-[var(--neo-border)] opacity-70">
                    <span className="font-medium text-[var(--neo-text-secondary)]">فصل ۳: دیپلوی مدل و استقرار کلود</span>
                    <span className="text-[var(--neo-text-muted)]">پروژه پایانی</span>
                  </div>
                </div>
              )}

              {/* Progress & Milestone */}
              <div className="mt-4 pt-3 border-t border-[var(--neo-border)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-bold text-[var(--neo-text-main)]">پیشرفت دوره: ۷۲٪</span>
                </div>
                <Link
                  href="/courses"
                  className="text-xs font-bold text-[var(--neo-primary)] hover:underline flex items-center gap-1"
                >
                  <span>ورود به جلسه آزمایشی</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </Link>
              </div>

            </div>

            {/* Floating Satellite Badges */}
            <div 
              className="hidden sm:flex absolute -top-5 -left-4 bg-white/95 backdrop-blur-md border border-[var(--neo-border)] px-4 py-2.5 rounded-2xl shadow-lg items-center gap-2 animate-bounce z-20"
              style={{ animationDuration: '4s' }}
            >
              <GraduationCap className="w-5 h-5 text-[var(--neo-primary)]" />
              <div className="text-right">
                <div className="text-xs font-black text-[var(--neo-text-main)]">گواهینامه پایان دوره</div>
                <div className="text-[10px] text-[var(--neo-text-muted)]">قابل ارائه در رزومه و لینکدین</div>
              </div>
            </div>

            <div 
              className="hidden sm:flex absolute -bottom-5 -right-4 bg-white/95 backdrop-blur-md border border-[var(--neo-border)] px-4 py-2.5 rounded-2xl shadow-lg items-center gap-2 animate-bounce z-20"
              style={{ animationDuration: '5s' }}
            >
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              <div className="text-right">
                <div className="text-xs font-black text-[var(--neo-text-main)]">ضمانت کیفیت سرفصل</div>
                <div className="text-[10px] text-[var(--neo-text-muted)]">پشتیبانی و منتورینگ اختصاصی</div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
