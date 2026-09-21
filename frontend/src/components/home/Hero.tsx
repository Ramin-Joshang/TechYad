'use client';

import Link from 'next/link';
import { ArrowLeft, Brain, Code2, Cpu, Sigma, Layers, Sparkles } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-[var(--neo-bg)] border-b border-[var(--neo-border)] pt-16">
      {/* Knowledge Network Background (Light CSS based) */}
      <div className="absolute inset-0 z-0 opacity-50 pointer-events-none">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="grid-light"
              width="80"
              height="80"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="2" cy="2" r="1.5" fill="var(--neo-border)" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-light)" />

          {/* Background glowing nodes */}
          <circle
            cx="18%"
            cy="28%"
            r="4"
            fill="var(--neo-primary)"
            className="animate-pulse"
          />
          <circle
            cx="78%"
            cy="58%"
            r="4"
            fill="var(--neo-secondary)"
            className="animate-pulse"
            style={{ animationDelay: '1.2s' }}
          />
          <circle
            cx="88%"
            cy="22%"
            r="5"
            fill="var(--neo-accent)"
            className="animate-pulse"
            style={{ animationDelay: '0.6s' }}
          />

          <line
            x1="18%"
            y1="28%"
            x2="78%"
            y2="58%"
            stroke="var(--neo-primary)"
            strokeWidth="1"
            strokeOpacity="0.15"
          />
          <line
            x1="78%"
            y1="58%"
            x2="88%"
            y2="22%"
            stroke="var(--neo-secondary)"
            strokeWidth="1"
            strokeOpacity="0.15"
          />
        </svg>
      </div>

      {/* Atmospheric Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-gradient-to-tr from-[var(--neo-primary)]/10 via-[var(--neo-secondary)]/5 to-[var(--neo-accent)]/10 rounded-full blur-[110px] -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full py-8 lg:py-12">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Right Column: Copy & Value Proposition (User's chosen content) */}
          <div className="lg:col-span-6 text-right max-w-2xl">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-[var(--neo-border)] bg-white/85 backdrop-blur-md mb-8 shadow-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--neo-primary)] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--neo-primary)]"></span>
              </span>
              <span className="text-xs sm:text-sm font-medium text-[var(--neo-text-main)]">
                پلتفرم یکپارچه آموزش آکادمیک و تخصصی
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[var(--neo-text-main)] mb-6 leading-[1.2] tracking-tight">
              یادگیری برای
              <br />
              آینده‌ای که <span className="neo-gradient-text">می‌سازی.</span>
            </h1>

            <p className="text-base sm:text-lg lg:text-xl text-[var(--neo-text-secondary)] mb-10 leading-relaxed font-normal">
              دروس دانشگاهی، آموزش‌های تخصصی و کلاس‌های حضوری؛ با اساتیدی که
              واقعاً می‌دانند چه چیزی را باید آموزش دهند. مسیر یادگیری خودت را
              پیدا کن.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/courses"
                className="inline-flex justify-center items-center gap-2 px-8 py-4 bg-[var(--neo-primary)] hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-[var(--neo-primary)]/25 text-base sm:text-lg hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>شروع یادگیری</span>
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <Link
                href="/courses?free=true"
                className="inline-flex justify-center items-center gap-2 px-8 py-4 bg-white hover:bg-[var(--neo-surface-2)] text-[var(--neo-text-main)] border border-[var(--neo-border)] hover:border-[var(--neo-primary)] hover:text-[var(--neo-primary)] rounded-xl font-bold transition text-base sm:text-lg shadow-xs"
              >
                <span>دوره‌های رایگان</span>
              </Link>
            </div>
          </div>

          {/* Left Column: Knowledge Network (Refined, High-End & Dynamic) */}
          <div className="hidden lg:flex lg:col-span-6 relative h-[560px] w-full items-center justify-center">
            
            {/* Background Glow for Center Node */}
            <div className="absolute w-72 h-72 bg-gradient-to-tr from-[var(--neo-primary)]/20 via-[var(--neo-secondary)]/15 to-transparent rounded-full blur-2xl pointer-events-none" />

            {/* Orbit System Container */}
            <div className="relative w-[460px] h-[460px]">
              
              {/* Concentric Orbit Rings */}
              <div className="absolute inset-0 rounded-full border border-dashed border-slate-300/60 pointer-events-none" />
              <div className="absolute inset-12 rounded-full border border-dashed border-slate-200/80 pointer-events-none" />
              <div 
                className="absolute inset-24 rounded-full border border-dotted border-[var(--neo-primary)]/30 pointer-events-none animate-spin" 
                style={{ animationDuration: '40s' }} 
              />

              {/* Dynamic Connecting Lines SVG */}
              <svg className="absolute inset-0 w-full h-full -z-10 overflow-visible">
                <defs>
                  <linearGradient id="net-line-1" x1="50%" y1="50%" x2="82%" y2="8%">
                    <stop offset="0%" stopColor="var(--neo-primary)" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="var(--neo-secondary)" stopOpacity="0.2" />
                  </linearGradient>
                  <linearGradient id="net-line-2" x1="50%" y1="50%" x2="16%" y2="22%">
                    <stop offset="0%" stopColor="var(--neo-primary)" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#FF6B6B" stopOpacity="0.2" />
                  </linearGradient>
                  <linearGradient id="net-line-3" x1="50%" y1="50%" x2="8%" y2="52%">
                    <stop offset="0%" stopColor="var(--neo-primary)" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="var(--neo-success)" stopOpacity="0.2" />
                  </linearGradient>
                  <linearGradient id="net-line-4" x1="50%" y1="50%" x2="88%" y2="68%">
                    <stop offset="0%" stopColor="var(--neo-primary)" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="var(--neo-warning)" stopOpacity="0.2" />
                  </linearGradient>
                  <linearGradient id="net-line-5" x1="50%" y1="50%" x2="22%" y2="86%">
                    <stop offset="0%" stopColor="var(--neo-primary)" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="var(--neo-primary)" stopOpacity="0.2" />
                  </linearGradient>
                </defs>

                {/* Main Lines from Central Hub to Orbit Nodes */}
                <line x1="50%" y1="50%" x2="82%" y2="8%" stroke="url(#net-line-1)" strokeWidth="1.75" strokeDasharray="5 5" />
                <line x1="50%" y1="50%" x2="16%" y2="22%" stroke="url(#net-line-2)" strokeWidth="1.75" strokeDasharray="5 5" />
                <line x1="50%" y1="50%" x2="8%" y2="52%" stroke="url(#net-line-3)" strokeWidth="1.75" strokeDasharray="5 5" />
                <line x1="50%" y1="50%" x2="88%" y2="68%" stroke="url(#net-line-4)" strokeWidth="1.75" strokeDasharray="5 5" />
                <line x1="50%" y1="50%" x2="22%" y2="86%" stroke="url(#net-line-5)" strokeWidth="1.75" strokeDasharray="5 5" />

                {/* Secondary Inter-node Synapses */}
                <line x1="82%" y1="8%" x2="88%" y2="68%" stroke="var(--neo-border)" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
                <line x1="16%" y1="22%" x2="8%" y2="52%" stroke="var(--neo-border)" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
                <line x1="8%" y1="52%" x2="22%" y2="86%" stroke="var(--neo-border)" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />

                {/* Animated Signal Pulses */}
                <circle r="3" fill="var(--neo-primary)">
                  <animateMotion path="M 230 230 L 377 36" dur="3.5s" repeatCount="indefinite" />
                </circle>
                <circle r="3" fill="var(--neo-secondary)">
                  <animateMotion path="M 230 230 L 37 239" dur="4.2s" repeatCount="indefinite" />
                </circle>
                <circle r="3" fill="#FF6B6B">
                  <animateMotion path="M 230 230 L 73 101" dur="5s" repeatCount="indefinite" />
                </circle>
              </svg>

              {/* SATELLITE NODE 1: AI Models (Top Right) */}
              <div 
                className="absolute top-2 right-4 group cursor-default transition-all duration-300 hover:scale-110 z-20"
                style={{ animation: 'bounce 5s ease-in-out infinite' }}
              >
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/95 backdrop-blur-md border border-sky-100 shadow-md hover:shadow-lg hover:border-sky-300 transition">
                  <div className="w-6 h-6 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center">
                    <Brain className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-slate-800 tracking-wide font-en">AI Models</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse"></span>
                </div>
              </div>

              {/* SATELLITE NODE 2: MATLAB (Top Left) */}
              <div 
                className="absolute top-16 left-8 group cursor-default transition-all duration-300 hover:scale-110 z-20"
                style={{ animation: 'bounce 4.2s ease-in-out infinite', animationDelay: '0.8s' }}
              >
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/95 backdrop-blur-md border border-rose-100 shadow-md hover:shadow-lg hover:border-rose-300 transition">
                  <div className="w-6 h-6 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
                    <Layers className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-slate-800 tracking-wide font-en">MATLAB</span>
                </div>
              </div>

              {/* SATELLITE NODE 3: Python (Middle Left) */}
              <div 
                className="absolute top-1/2 -translate-y-1/2 -left-2 group cursor-default transition-all duration-300 hover:scale-110 z-20"
                style={{ animation: 'bounce 4.8s ease-in-out infinite', animationDelay: '1.5s' }}
              >
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/95 backdrop-blur-md border border-emerald-100 shadow-md hover:shadow-lg hover:border-emerald-300 transition">
                  <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Code2 className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-slate-800 tracking-wide font-en">Python</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                </div>
              </div>

              {/* SATELLITE NODE 4: Mechanics (Middle Right) */}
              <div 
                className="absolute bottom-28 -right-2 group cursor-default transition-all duration-300 hover:scale-110 z-20"
                style={{ animation: 'bounce 5.4s ease-in-out infinite', animationDelay: '0.4s' }}
              >
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/95 backdrop-blur-md border border-amber-100 shadow-md hover:shadow-lg hover:border-amber-300 transition">
                  <div className="w-6 h-6 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Cpu className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-slate-800 tracking-wide font-en">Mechanics</span>
                </div>
              </div>

              {/* SATELLITE NODE 5: Calculus (Bottom Left) */}
              <div 
                className="absolute bottom-6 left-12 group cursor-default transition-all duration-300 hover:scale-110 z-20"
                style={{ animation: 'bounce 4.6s ease-in-out infinite', animationDelay: '1.2s' }}
              >
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/95 backdrop-blur-md border border-blue-100 shadow-md hover:shadow-lg hover:border-blue-300 transition">
                  <div className="w-6 h-6 rounded-full bg-blue-50 text-[var(--neo-primary)] flex items-center justify-center">
                    <Sigma className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-slate-800 tracking-wide font-en">Calculus</span>
                </div>
              </div>

              {/* CENTRAL CORE NODE: شبکه دانش (Refined, Polished & Majestic) */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 group cursor-default">
                {/* Outer Glow Halo */}
                <div className="absolute -inset-2 bg-gradient-to-r from-[var(--neo-primary)] to-[var(--neo-secondary)] rounded-full blur-md opacity-25 group-hover:opacity-40 transition duration-500"></div>

                {/* Central Sphere */}
                <div className="relative w-36 h-36 rounded-full border-2 border-white/80 bg-white/95 backdrop-blur-xl flex flex-col items-center justify-center shadow-2xl shadow-blue-500/15 p-4 text-center">
                  
                  {/* Subtle Top Sparkle */}
                  <div className="w-6 h-6 rounded-full bg-blue-50 text-[var(--neo-primary)] flex items-center justify-center mb-1 shadow-2xs">
                    <Sparkles className="w-3.5 h-3.5 text-[var(--neo-primary)] animate-spin" style={{ animationDuration: '8s' }} />
                  </div>

                  <span className="font-black text-xl neo-gradient-text leading-tight tracking-tight">
                    شبکه
                    <br />
                    دانش
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase mt-1">
                    TechYad
                  </span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
