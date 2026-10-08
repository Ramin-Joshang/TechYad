'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Phone, X, Headphones } from 'lucide-react';
import { TelegramIcon, InstagramIcon, WhatsAppIcon } from '@/components/common/BrandSocialIcons';

export function FloatingContactWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Hide completely on all dashboard panels and learning player
  if (
    pathname === "/dashboard" ||
    pathname?.startsWith("/dashboard") ||
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/super-admin") ||
    pathname?.startsWith("/student") ||
    (pathname?.startsWith("/instructor") && !pathname?.startsWith("/instructors")) ||
    pathname?.startsWith("/profile") ||
    pathname?.startsWith("/learn")
  ) {
    return null;
  }

  return (
    <aside 
      aria-label="پشتیبانی و راه‌های ارتباطی سریع" 
      className="fixed bottom-6 left-6 z-50 print:hidden select-none flex flex-col items-start" 
      dir="ltr"
    >
      <div className="relative flex flex-col items-start">
        {/* Expanded Menu of Socials & Phone - anchored strictly above the button */}
        {isOpen && (
          <div 
            dir="rtl"
            className="absolute bottom-full left-0 mb-3 bg-white/98 backdrop-blur-xl p-4 rounded-3xl border border-[var(--neo-border)] shadow-2xl flex flex-col gap-2.5 w-72 sm:w-80 animate-in slide-in-from-bottom-2 fade-in duration-200 z-50"
            role="dialog"
            aria-modal="true"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-2.5 border-b border-[var(--neo-border)]">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-black text-[var(--neo-text-main)]">پشتیبانی و ارتباط با تک‌یاد</span>
              </div>
              <button 
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-xl text-[var(--neo-text-muted)] hover:text-[var(--neo-text-main)] hover:bg-[var(--neo-surface-2)] transition cursor-pointer"
                aria-label="بستن منوی ارتباط"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 1. Direct Phone Call */}
            <a
              href="tel:+989372731037"
              className="flex items-center justify-between p-2.5 rounded-2xl bg-[var(--neo-surface-2)]/80 hover:bg-[var(--neo-surface-2)] border border-[var(--neo-border)] transition group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[var(--neo-primary)] text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                  <Phone className="w-4 h-4" />
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-[var(--neo-text-main)]">تماس تلفنی مستقیم</div>
                  <div 
                    dir="ltr" 
                    style={{ direction: 'ltr', unicodeBidi: 'plaintext' }} 
                    className="text-xs text-[var(--neo-text-secondary)] font-bold tracking-wide"
                  >
                    +98 937 273 1037
                  </div>
                </div>
              </div>
              <span className="text-[10px] bg-white px-2.5 py-0.5 rounded-full text-emerald-700 font-bold border border-emerald-200 shadow-2xs">
                پاسخگو
              </span>
            </a>

            {/* 2. WhatsApp Direct Chat */}
            <a
              href="https://wa.me/989372731037"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-2.5 rounded-2xl bg-emerald-50/70 hover:bg-emerald-50 border border-emerald-200/60 transition group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#25D366] text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                  <WhatsAppIcon className="w-4 h-4" />
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-emerald-950">ارتباط در واتس‌اپ</div>
                  <div 
                    dir="ltr" 
                    style={{ direction: 'ltr', unicodeBidi: 'plaintext' }} 
                    className="text-xs text-emerald-700 font-semibold"
                  >
                    0937 273 1037
                  </div>
                </div>
              </div>
              <span className="text-[10px] bg-white px-2.5 py-0.5 rounded-full text-emerald-700 font-bold border border-emerald-200 shadow-2xs">
                آنلاین
              </span>
            </a>

            {/* 3. Telegram Channel & Support */}
            <a
              href="https://t.me/tecyad_ir"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-2.5 rounded-2xl bg-sky-50/70 hover:bg-sky-50 border border-sky-200/60 transition group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#229ED9] text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                  <TelegramIcon className="w-4 h-4" />
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-sky-950">کانال و پشتیبانی تلگرام</div>
                  <div 
                    dir="ltr" 
                    style={{ direction: 'ltr', unicodeBidi: 'plaintext' }} 
                    className="text-xs text-sky-700 font-semibold"
                  >
                    @tecyad_ir
                  </div>
                </div>
              </div>
              <span className="text-[10px] bg-white px-2.5 py-0.5 rounded-full text-sky-700 font-bold border border-sky-200 shadow-2xs">
                عضویت
              </span>
            </a>

            {/* 4. Instagram Page */}
            <a
              href="https://instagram.com/tecyad.ir"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-2.5 rounded-2xl bg-rose-50/70 hover:bg-rose-50 border border-rose-200/60 transition group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                  <InstagramIcon className="w-4 h-4" />
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-rose-950">صفحه اینستاگرام</div>
                  <div 
                    dir="ltr" 
                    style={{ direction: 'ltr', unicodeBidi: 'plaintext' }} 
                    className="text-xs text-rose-700 font-semibold"
                  >
                    @tecyad.ir
                  </div>
                </div>
              </div>
              <span className="text-[10px] bg-white px-2.5 py-0.5 rounded-full text-rose-700 font-bold border border-rose-200 shadow-2xs">
                آموزش‌ها
              </span>
            </a>
          </div>
        )}

        {/* Main Trigger Button - stays fixed in position */}
        <button
          type="button"
          dir="rtl"
          onClick={() => setIsOpen(!isOpen)}
          className="group relative flex items-center gap-2.5 px-4 py-2.5 bg-gradient-to-r from-[var(--neo-primary)] to-[#8362FF] hover:from-[#5C39FA] hover:to-[var(--neo-primary)] text-white rounded-full shadow-lg shadow-[var(--neo-primary)]/25 hover:shadow-xl hover:shadow-[var(--neo-primary)]/40 border border-white/20 transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] cursor-pointer"
          title="ارتباط با پشتیبانی و شبکه‌های اجتماعی تک‌یاد"
          aria-expanded={isOpen}
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
          </span>

          <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
            <Headphones className="w-4 h-4 text-white group-hover:rotate-12 transition-transform" />
          </div>

          <div className="text-right">
            <span className="text-xs font-bold block leading-tight">پشتیبانی و مشاوره</span>
            <span 
              dir="ltr" 
              style={{ direction: 'ltr', unicodeBidi: 'plaintext' }} 
              className="text-[11px] text-white/90 font-bold block tracking-wide"
            >
              0937 273 1037
            </span>
          </div>
        </button>
      </div>
    </aside>
  );
}
