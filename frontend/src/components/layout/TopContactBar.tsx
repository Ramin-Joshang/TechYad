'use client';

import { Phone, Mail } from 'lucide-react';
import { TelegramIcon, InstagramIcon, WhatsAppIcon } from '@/components/common/BrandSocialIcons';

export function TopContactBar() {
  return (
    <div className="bg-slate-900 text-slate-300 text-xs border-b border-slate-800 py-1.5 px-4 sm:px-6 lg:px-8 print:hidden select-none">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
        
        {/* Right side on RTL: Direct Call & Support */}
        <div className="flex items-center gap-4 flex-wrap justify-center sm:justify-start">
          <a
            href="tel:+989372731037"
            className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-bold transition group"
            title="تماس مستقیم با واحد پشتیبانی و مشاوره تک‌یاد"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <Phone className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform text-emerald-400" />
            <span className="text-[11px] text-slate-300 font-normal">مشاوره و پشتیبانی:</span>
            <span 
              dir="ltr" 
              style={{ direction: 'ltr', unicodeBidi: 'bidi-override' }} 
              className="font-mono text-xs font-bold text-white tracking-wider"
            >
              +98 937 273 1037
            </span>
          </a>

          <span className="hidden md:inline-block w-px h-3.5 bg-slate-700" />

          <a
            href="mailto:support@tecyad.ir"
            className="hidden md:flex items-center gap-1.5 text-slate-300 hover:text-white transition text-[11px]"
          >
            <Mail className="w-3.5 h-3.5 text-slate-400" />
            <span dir="ltr" style={{ direction: 'ltr' }} className="font-mono">support@tecyad.ir</span>
          </a>
        </div>

        {/* Left side on RTL: Social Networks */}
        <div className="flex items-center gap-2.5 text-[11px]">
          <span className="text-slate-400 hidden lg:inline text-[11px]">شبکه‌های رسمی:</span>
          
          {/* Telegram */}
          <a
            href="https://t.me/tecyad_ir"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-slate-200 hover:text-sky-300 transition bg-sky-950/70 hover:bg-sky-900 px-2.5 py-1 rounded-lg border border-sky-700/60 shadow-xs"
            title="کانال و پشتیبانی تلگرام"
          >
            <TelegramIcon className="w-3.5 h-3.5 text-sky-400" />
            <span dir="ltr" style={{ direction: 'ltr' }} className="font-mono text-[11px] font-bold">@tecyad_ir</span>
          </a>

          {/* Instagram */}
          <a
            href="https://instagram.com/tecyad.ir"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-slate-200 hover:text-rose-300 transition bg-rose-950/70 hover:bg-rose-900 px-2.5 py-1 rounded-lg border border-rose-700/60 shadow-xs"
            title="پیج رسمی اینستاگرام تک‌یاد"
          >
            <InstagramIcon className="w-3.5 h-3.5 text-rose-400" />
            <span dir="ltr" style={{ direction: 'ltr' }} className="font-mono text-[11px] font-bold">@tecyad.ir</span>
          </a>

          {/* WhatsApp */}
          <a
            href="https://wa.me/989372731037"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-slate-200 hover:text-emerald-300 transition bg-emerald-950/70 hover:bg-emerald-900 px-2.5 py-1 rounded-lg border border-emerald-700/60 shadow-xs"
            title="ارتباط در واتس‌اپ"
          >
            <WhatsAppIcon className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-bold text-[11px]">واتس‌اپ</span>
          </a>
        </div>

      </div>
    </div>
  );
}
