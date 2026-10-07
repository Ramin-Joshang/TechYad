'use client';

import { Phone, Mail } from 'lucide-react';
import { TelegramIcon, InstagramIcon, WhatsAppIcon } from '@/components/common/BrandSocialIcons';

export function TopContactBar() {
  return (
    <div className="bg-white/95 backdrop-blur-md text-[var(--neo-text-secondary)] text-xs border-b border-[var(--neo-border)]/80 py-1.5 px-4 sm:px-6 lg:px-8 print:hidden select-none transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
        
        {/* Right side on RTL: Direct Call & Consultation Chip */}
        <div className="flex items-center gap-3 sm:gap-4 flex-wrap justify-center sm:justify-start">
          <a
            href="tel:+989372731037"
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--neo-surface-2)]/80 hover:bg-[var(--neo-surface-2)] text-[var(--neo-text-main)] border border-[var(--neo-border)]/80 transition-all duration-200 group hover:border-[var(--neo-primary)]/40 hover:shadow-xs"
            title="تماس مستقیم با واحد پشتیبانی و مشاوره تک‌یاد"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <Phone className="w-3.5 h-3.5 text-[var(--neo-primary)] group-hover:scale-110 transition-transform" />
            <span className="text-[11px] text-[var(--neo-text-secondary)] font-normal">مشاوره و پشتیبانی:</span>
            <span 
              dir="ltr" 
              style={{ direction: 'ltr', unicodeBidi: 'plaintext' }} 
              className="text-xs font-bold text-[var(--neo-text-main)] group-hover:text-[var(--neo-primary)] transition-colors tracking-wide"
            >
              +98 937 273 1037
            </span>
          </a>

          <span className="hidden md:inline-block w-px h-3.5 bg-[var(--neo-border)]" />

          <a
            href="mailto:support@tecyad.ir"
            className="hidden md:inline-flex items-center gap-1.5 text-[var(--neo-text-secondary)] hover:text-[var(--neo-primary)] transition-colors text-[11px]"
            title="ایمیل واحد پشتیبانی تک‌یاد"
          >
            <Mail className="w-3.5 h-3.5 text-[var(--neo-secondary)]" />
            <span dir="ltr" style={{ direction: 'ltr', unicodeBidi: 'plaintext' }}>support@tecyad.ir</span>
          </a>
        </div>

        {/* Left side on RTL: Social Networks */}
        <div className="flex items-center gap-2 text-[11px]">
          <span className="text-[var(--neo-text-muted)] hidden lg:inline text-[11px]">شبکه‌های رسمی:</span>
          
          {/* Telegram */}
          <a
            href="https://t.me/tecyad_ir"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#229ED9]/8 hover:bg-[#229ED9]/15 text-[#229ED9] border border-[#229ED9]/20 hover:border-[#229ED9]/40 transition-all text-[11px] font-medium"
            title="کانال و پشتیبانی تلگرام"
          >
            <TelegramIcon className="w-3.5 h-3.5" />
            <span dir="ltr" style={{ direction: 'ltr', unicodeBidi: 'plaintext' }} className="font-semibold text-[11px]">@tecyad_ir</span>
          </a>

          {/* Instagram */}
          <a
            href="https://instagram.com/tecyad.ir"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/8 hover:bg-rose-500/15 text-rose-600 border border-rose-500/20 hover:border-rose-500/40 transition-all text-[11px] font-medium"
            title="پیج رسمی اینستاگرام تک‌یاد"
          >
            <InstagramIcon className="w-3.5 h-3.5" />
            <span dir="ltr" style={{ direction: 'ltr', unicodeBidi: 'plaintext' }} className="font-semibold text-[11px]">@tecyad.ir</span>
          </a>

          {/* WhatsApp */}
          <a
            href="https://wa.me/989372731037"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#25D366]/10 hover:bg-[#25D366]/20 text-emerald-700 border border-[#25D366]/25 hover:border-[#25D366]/50 transition-all text-[11px] font-bold"
            title="ارتباط در واتس‌اپ"
          >
            <WhatsAppIcon className="w-3.5 h-3.5 text-[#25D366]" />
            <span>واتس‌اپ</span>
          </a>
        </div>

      </div>
    </div>
  );
}
