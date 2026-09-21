'use client';

import Link from 'next/link';

interface AuthCardLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export function AuthCardLayout({ children, title, subtitle }: AuthCardLayoutProps) {
  return (
    <main className="min-h-[calc(100vh-4.5rem)] flex items-center justify-center p-4 sm:p-6 bg-[var(--neo-bg)] relative">
      {/* Subtle Background Glows */}
      <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-[var(--neo-primary)]/5 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-1/3 left-1/4 w-72 h-72 bg-[var(--neo-secondary)]/5 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Clean & Focused Auth Card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-[var(--neo-border)] p-6 sm:p-8 relative z-10 transition-all">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2 mb-3 group">
            <div className="w-8 h-8 rounded-full border-2 border-[var(--neo-primary)] flex items-center justify-center bg-white shadow-2xs group-hover:scale-105 transition">
              <div className="w-2.5 h-2.5 bg-[var(--neo-secondary)] rounded-full"></div>
            </div>
            <span className="font-black text-xl text-[var(--neo-text-main)] tracking-tight">
              تک‌یاد
            </span>
          </Link>
          
          <h1 className="text-xl sm:text-2xl font-black text-[var(--neo-text-main)] tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs sm:text-sm text-[var(--neo-text-secondary)] mt-1.5">
              {subtitle}
            </p>
          )}
        </div>

        {/* Content */}
        <div>
          {children}
        </div>
      </div>
    </main>
  );
}
