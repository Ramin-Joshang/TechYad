import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function Hero() {
  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-[var(--neo-bg)] border-b border-[var(--neo-border)] pt-16">
      {/* Knowledge Network Background (Light CSS based) */}
      <div className="absolute inset-0 z-0 opacity-60 pointer-events-none">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="grid-light"
              width="100"
              height="100"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="2" cy="2" r="1.5" fill="var(--neo-border)" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-light)" />

          {/* Glowing nodes */}
          <circle
            cx="20%"
            cy="30%"
            r="5"
            fill="var(--neo-primary)"
            className="animate-pulse"
          />
          <circle
            cx="75%"
            cy="60%"
            r="4"
            fill="var(--neo-secondary)"
            className="animate-pulse"
            style={{ animationDelay: "1s" }}
          />
          <circle
            cx="85%"
            cy="20%"
            r="6"
            fill="var(--neo-accent)"
            className="animate-pulse"
            style={{ animationDelay: "0.5s" }}
          />

          <line
            x1="20%"
            y1="30%"
            x2="75%"
            y2="60%"
            stroke="var(--neo-primary)"
            strokeWidth="1"
            strokeOpacity="0.2"
          />
          <line
            x1="75%"
            y1="60%"
            x2="85%"
            y2="20%"
            stroke="var(--neo-secondary)"
            strokeWidth="1"
            strokeOpacity="0.2"
          />
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
              یادگیری برای
              <br />
              آینده‌ای که <span className="neo-gradient-text">می‌سازی.</span>
            </h1>

            <p className="text-lg md:text-xl text-[var(--neo-text-secondary)] mb-10 leading-relaxed font-medium">
              دروس دانشگاهی، آموزش‌های تخصصی و کلاس‌های حضوری؛ با اساتیدی که
              واقعاً می‌دانند چه چیزی را باید آموزش دهند. مسیر یادگیری خودت را
              پیدا کن.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/courses"
                className="inline-flex justify-center items-center gap-2 px-8 py-4 bg-[var(--neo-primary)] text-white hover:bg-opacity-90 rounded-xl font-bold transition shadow-lg shadow-[var(--neo-primary)]/25 text-lg"
              >
                شروع یادگیری
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <Link
                href="/courses?free=true"
                className="inline-flex justify-center items-center gap-2 px-8 py-4 bg-white text-[var(--neo-text-main)] border border-[var(--neo-border)] hover:border-[var(--neo-primary)] hover:text-[var(--neo-primary)] rounded-xl font-bold transition text-lg shadow-sm"
              >
                دوره‌های رایگان
              </Link>
            </div>
          </div>

          <div className="hidden lg:block relative h-[600px] w-full">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-[400px] h-[400px]">
                <div
                  className="absolute top-0 right-10 px-5 py-2 bg-white border border-[var(--neo-border)] rounded-full text-sm font-en text-[var(--neo-secondary)] font-semibold shadow-sm animate-bounce"
                  style={{ animationDuration: "4s" }}
                >
                  AI Models
                </div>
                <div
                  className="absolute bottom-10 left-0 px-5 py-2 bg-white border border-[var(--neo-border)] rounded-full text-sm font-en text-[var(--neo-primary)] font-semibold shadow-sm animate-bounce"
                  style={{ animationDuration: "5s" }}
                >
                  Calculus
                </div>
                <div
                  className="absolute top-1/2 left-10 px-5 py-2 bg-white border border-[var(--neo-border)] rounded-full text-sm font-en text-[var(--neo-success)] font-semibold shadow-sm animate-bounce"
                  style={{ animationDuration: "4.5s" }}
                >
                  Python
                </div>
                <div
                  className="absolute bottom-1/3 right-0 px-5 py-2 bg-white border border-[var(--neo-border)] rounded-full text-sm font-en text-[var(--neo-warning)] font-semibold shadow-sm animate-bounce"
                  style={{ animationDuration: "6s" }}
                >
                  Mechanics
                </div>
                <div
                  className="absolute top-1/4 left-1/4 px-5 py-2 bg-white border border-[var(--neo-border)] rounded-full text-sm font-en text-[#FF6B6B] font-semibold shadow-sm animate-bounce"
                  style={{ animationDuration: "3.5s" }}
                >
                  MATLAB
                </div>

                {/* Center node */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border border-[var(--neo-border)] bg-white flex items-center justify-center shadow-xl shadow-[var(--neo-primary)]/10 z-20">
                  <span className="font-black tracking-widest text-lg neo-gradient-text text-center">
                    شبکه
                    <br />
                    دانش
                  </span>
                </div>

                {/* Connection lines */}
                <svg className="absolute inset-0 w-full h-full -z-10 opacity-40">
                  <line
                    x1="50%"
                    y1="50%"
                    x2="10%"
                    y2="20%"
                    stroke="var(--neo-primary)"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />
                  <line
                    x1="50%"
                    y1="50%"
                    x2="90%"
                    y2="80%"
                    stroke="var(--neo-secondary)"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />
                  <line
                    x1="50%"
                    y1="50%"
                    x2="20%"
                    y2="80%"
                    stroke="var(--neo-primary)"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />
                  <line
                    x1="50%"
                    y1="50%"
                    x2="80%"
                    y2="20%"
                    stroke="var(--neo-secondary)"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
