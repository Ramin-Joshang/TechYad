'use client';

import { useState } from 'react';
import { Phone, X, Headphones } from 'lucide-react';
import { TelegramIcon, InstagramIcon, WhatsAppIcon } from '@/components/common/BrandSocialIcons';

export function FloatingContactWidget() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <aside 
      aria-label="پشتیبانی و راه‌های ارتباطی سریع" 
      className="fixed bottom-6 left-6 z-50 flex flex-col items-start gap-2.5 print:hidden select-none font-sans" 
      dir="rtl"
    >
      {/* Expanded Menu of Socials & Phone */}
      {isOpen && (
        <div 
          className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-4 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-2xl flex flex-col gap-2.5 w-72 sm:w-80 animate-in slide-in-from-bottom-4 fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-black text-slate-800 dark:text-slate-100">پشتیبانی و ارتباط با تک‌یاد</span>
            </div>
            <button 
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              aria-label="بستن منوی ارتباط"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* 1. Direct Phone Call */}
          <a
            href="tel:+989372731037"
            className="flex items-center justify-between p-2.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100/90 dark:bg-emerald-950/40 dark:hover:bg-emerald-950/70 border border-emerald-200/70 dark:border-emerald-800/60 transition group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                <Phone className="w-4 h-4" />
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-emerald-950 dark:text-emerald-100">تماس تلفنی مستقیم</div>
                <div 
                  dir="ltr" 
                  style={{ direction: 'ltr', unicodeBidi: 'bidi-override' }} 
                  className="text-[11px] text-emerald-700 dark:text-emerald-300 font-mono font-bold tracking-wider"
                >
                  +98 937 273 1037
                </div>
              </div>
            </div>
            <span className="text-[10px] bg-white dark:bg-slate-800 px-2.5 py-0.5 rounded-full text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200/80 dark:border-emerald-700/60 shadow-2xs">
              پاسخگو
            </span>
          </a>

          {/* 2. WhatsApp Direct Chat */}
          <a
            href="https://wa.me/989372731037"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-2.5 rounded-2xl bg-teal-50 hover:bg-teal-100/90 dark:bg-teal-950/40 dark:hover:bg-teal-950/70 border border-teal-200/70 dark:border-teal-800/60 transition group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#25D366] text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                <WhatsAppIcon className="w-4 h-4" />
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-teal-950 dark:text-teal-100">ارتباط در واتس‌اپ</div>
                <div 
                  dir="ltr" 
                  style={{ direction: 'ltr' }} 
                  className="text-[11px] text-teal-700 dark:text-teal-300 font-mono"
                >
                  0937 273 1037
                </div>
              </div>
            </div>
            <span className="text-[10px] bg-white dark:bg-slate-800 px-2.5 py-0.5 rounded-full text-teal-700 dark:text-teal-300 font-bold border border-teal-200/80 dark:border-teal-700/60 shadow-2xs">
              آنلاین
            </span>
          </a>

          {/* 3. Telegram Channel & Support */}
          <a
            href="https://t.me/tecyad_ir"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-2.5 rounded-2xl bg-sky-50 hover:bg-sky-100/90 dark:bg-sky-950/40 dark:hover:bg-sky-950/70 border border-sky-200/70 dark:border-sky-800/60 transition group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#229ED9] text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                <TelegramIcon className="w-4 h-4" />
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-sky-950 dark:text-sky-100">کانال و پشتیبانی تلگرام</div>
                <div 
                  dir="ltr" 
                  style={{ direction: 'ltr' }} 
                  className="text-[11px] text-sky-700 dark:text-sky-300 font-mono font-medium"
                >
                  @tecyad_ir
                </div>
              </div>
            </div>
            <span className="text-[10px] bg-white dark:bg-slate-800 px-2.5 py-0.5 rounded-full text-sky-700 dark:text-sky-300 font-bold border border-sky-200/80 dark:border-sky-700/60 shadow-2xs">
              عضویت
            </span>
          </a>

          {/* 4. Instagram Page */}
          <a
            href="https://instagram.com/tecyad.ir"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-2.5 rounded-2xl bg-rose-50 hover:bg-rose-100/90 dark:bg-rose-950/40 dark:hover:bg-rose-950/70 border border-rose-200/70 dark:border-rose-800/60 transition group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                <InstagramIcon className="w-4 h-4" />
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-rose-950 dark:text-rose-100">صفحه اینستاگرام</div>
                <div 
                  dir="ltr" 
                  style={{ direction: 'ltr' }} 
                  className="text-[11px] text-rose-700 dark:text-rose-300 font-mono font-medium"
                >
                  @tecyad.ir
                </div>
              </div>
            </div>
            <span className="text-[10px] bg-white dark:bg-slate-800 px-2.5 py-0.5 rounded-full text-rose-700 dark:text-rose-300 font-bold border border-rose-200/80 dark:border-rose-700/60 shadow-2xs">
              آموزش‌ها
            </span>
          </a>
        </div>
      )}

      {/* Main Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex items-center gap-2.5 px-4 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-full shadow-2xl transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] cursor-pointer ring-4 ring-indigo-500/20 border border-slate-700/50"
        title="ارتباط با پشتیبانی و شبکه‌های اجتماعی تک‌یاد"
        aria-expanded={isOpen}
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
        </span>

        <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
          <Headphones className="w-4 h-4 text-emerald-400 group-hover:rotate-12 transition-transform" />
        </div>

        <div className="text-right">
          <span className="text-xs font-bold block leading-tight">پشتیبانی و مشاوره</span>
          <span 
            dir="ltr" 
            style={{ direction: 'ltr', unicodeBidi: 'bidi-override' }} 
            className="text-[10px] text-emerald-400 font-mono block tracking-wider"
          >
            0937 273 1037
          </span>
        </div>
      </button>
    </aside>
  );
}
