'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { superAdminApi } from '@/features/admin/api/super-admin.api';
import { Mail, Phone, MapPin, Camera, MessageCircle, Briefcase, ShieldCheck, Award } from 'lucide-react';

export function Footer() {
  const pathname = usePathname();

  const { data: publicSettings } = useQuery({
    queryKey: ['publicSettings'],
    queryFn: async () => {
      const res = await superAdminApi.getPublicSettings();
      return res.data;
    },
    staleTime: 1000 * 60 * 10
  });

  // Hide footer completely inside user, instructor, and admin dashboards / panels
  if (
    pathname?.startsWith('/admin') ||
    pathname?.startsWith('/super-admin') ||
    pathname?.startsWith('/student') ||
    (pathname?.startsWith('/instructor') && !pathname?.startsWith('/instructors')) ||
    pathname?.startsWith('/profile') ||
    pathname?.startsWith('/learn')
  ) {
    return null;
  }

  const logoUrl = publicSettings?.siteFooterLogo || publicSettings?.siteLogo;
  const siteTitle = publicSettings?.siteName ? publicSettings.siteName.split('|')[0].trim() : 'تک‌یاد';
  const supportEmail = publicSettings?.supportEmail || 'hello@techyad.edu';
  const supportPhone = publicSettings?.supportPhone || '021 - 91234567';

  return (
    <footer className="bg-white border-t border-[var(--neo-border)] pt-20 pb-10 text-[var(--neo-text-secondary)] relative overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none">
         <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="footer-grid-light" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.5" fill="var(--neo-primary)" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#footer-grid-light)" />
         </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-16">
          
          {/* Col 1: Brand Info */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-6">
              {logoUrl ? (
                <img 
                  src={logoUrl} 
                  alt={siteTitle} 
                  className="h-9 w-auto max-w-[170px] object-contain"
                />
              ) : (
                <div className="w-8 h-8 rounded-full border-2 border-[var(--neo-primary)] flex items-center justify-center relative overflow-hidden shrink-0">
                   <div className="w-2 h-2 bg-[var(--neo-secondary)] rounded-full"></div>
                </div>
              )}
              <span className="font-bold text-2xl text-[var(--neo-text-main)] tracking-tight">
                {siteTitle}
              </span>
            </Link>
            <p className="mb-6 leading-relaxed text-sm font-medium text-gray-600 max-w-sm">
              {publicSettings?.seoDescription || 'پلتفرمی برای یادگیری عمیق، مهارت‌افزایی و آینده‌سازی. دوره‌های حضوری و آنلاین با رویکردی متفاوت و حرفه‌ای.'}
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-9 h-9 rounded-full border border-[var(--neo-border)] bg-[var(--neo-bg)] flex items-center justify-center hover:bg-[var(--neo-primary)] hover:text-white hover:border-[var(--neo-primary)] transition-colors">
                <Camera className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full border border-[var(--neo-border)] bg-[var(--neo-bg)] flex items-center justify-center hover:bg-[var(--neo-secondary)] hover:text-white hover:border-[var(--neo-secondary)] transition-colors">
                <MessageCircle className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full border border-[var(--neo-border)] bg-[var(--neo-bg)] flex items-center justify-center hover:bg-[var(--neo-primary)] hover:text-white hover:border-[var(--neo-primary)] transition-colors">
                <Briefcase className="w-4 h-4" />
              </a>
            </div>
          </div>
          
          {/* Col 2: Navigation */}
          <div>
            <h3 className="text-[var(--neo-text-main)] font-bold mb-6 font-en tracking-widest text-sm uppercase">اکتشاف</h3>
            <ul className="space-y-3 font-medium text-sm">
              <li><Link href="/courses" className="hover:text-[var(--neo-primary)] transition">همه دوره‌ها</Link></li>
              <li><Link href="/classes" className="hover:text-[var(--neo-primary)] transition">کلاس‌های زنده</Link></li>
              <li><Link href="/instructors" className="hover:text-[var(--neo-primary)] transition">اساتید برتر</Link></li>
              <li><Link href="/blog" className="hover:text-[var(--neo-primary)] transition">وبلاگ</Link></li>
            </ul>
          </div>
          
          {/* Col 3: Support & Legal */}
          <div>
            <h3 className="text-[var(--neo-text-main)] font-bold mb-6 font-en tracking-widest text-sm uppercase">پشتیبانی</h3>
            <ul className="space-y-3 font-medium text-sm">
              <li><Link href="/faq" className="hover:text-[var(--neo-primary)] transition">سوالات متداول</Link></li>
              <li><Link href="/rules" className="hover:text-[var(--neo-primary)] transition">قوانین و مقررات</Link></li>
              <li><Link href="/privacy" className="hover:text-[var(--neo-primary)] transition">حریم خصوصی</Link></li>
              <li><Link href="/contact" className="hover:text-[var(--neo-primary)] transition">تماس با ما</Link></li>
            </ul>
          </div>
          
          {/* Col 4: Trust Badges & Contact */}
          <div className="space-y-5">
            <h3 className="text-[var(--neo-text-main)] font-bold mb-4 font-en tracking-widest text-sm uppercase">ارتباط و نمادها</h3>
            
            <ul className="space-y-3 font-medium text-xs">
              <li className="flex items-center gap-2 text-gray-700">
                <Phone className="w-4 h-4 text-[var(--neo-secondary)] shrink-0" />
                <span className="font-mono dir-ltr">{supportPhone}</span>
              </li>
              <li className="flex items-center gap-2 text-gray-700">
                <Mail className="w-4 h-4 text-[var(--neo-accent)] shrink-0" />
                <span className="font-mono dir-ltr">{supportEmail}</span>
              </li>
            </ul>

            {/* Electronic Trust & Security Symbols */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              {/* Enamad Container */}
              {publicSettings?.enamadActive !== false && (
                publicSettings?.enamadCode ? (
                  <div 
                    className="p-2 bg-gray-50 border border-gray-200 rounded-xl max-w-[90px] overflow-hidden" 
                    dangerouslySetInnerHTML={{ __html: publicSettings.enamadCode }} 
                  />
                ) : (
                  <div className="w-16 h-16 bg-blue-50/70 border border-blue-200 rounded-2xl flex flex-col items-center justify-center p-2 text-center text-blue-700">
                    <ShieldCheck className="w-6 h-6 text-blue-600 mb-1" />
                    <span className="text-[9px] font-bold">اینماد</span>
                  </div>
                )
              )}

              {/* Samandehi Container */}
              {publicSettings?.samandehiActive !== false && (
                publicSettings?.samandehiCode ? (
                  <div 
                    className="p-2 bg-gray-50 border border-gray-200 rounded-xl max-w-[90px] overflow-hidden" 
                    dangerouslySetInnerHTML={{ __html: publicSettings.samandehiCode }} 
                  />
                ) : (
                  <div className="w-16 h-16 bg-amber-50/70 border border-amber-200 rounded-2xl flex flex-col items-center justify-center p-2 text-center text-amber-700">
                    <Award className="w-6 h-6 text-amber-600 mb-1" />
                    <span className="text-[9px] font-bold">ساماندهی</span>
                  </div>
                )
              )}

              {/* Custom Uploaded Badge */}
              {publicSettings?.customTrustBadgeUrl && (
                <div className="w-16 h-16 bg-white border border-gray-200 rounded-2xl flex items-center justify-center p-1.5 shadow-xs">
                  <img 
                    src={publicSettings.customTrustBadgeUrl} 
                    alt="نماد اعتماد" 
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
            </div>

          </div>
        </div>
        
        <div className="pt-8 border-t border-[var(--neo-border)] flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-en font-medium">
          <p>© {new Date().getFullYear()} {siteTitle}. All rights reserved.</p>
          <div className="flex gap-4">
             <span className="text-[var(--neo-primary)]">Learn.</span>
             <span className="text-[var(--neo-secondary)]">Build.</span>
             <span className="text-[var(--neo-accent)] text-black">Grow.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
