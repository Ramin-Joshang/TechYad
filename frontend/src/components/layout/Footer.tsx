import Link from 'next/link';
import { Mail, Phone, MapPin, Camera, MessageCircle, Briefcase, Hexagon } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[#05060A] border-t border-[var(--neo-border)] pt-20 pb-10 text-[var(--neo-muted)] relative overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 z-0 opacity-10">
         <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="footer-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1" fill="var(--neo-primary)" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#footer-grid)" />
         </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-full border border-[var(--neo-secondary)] flex items-center justify-center relative overflow-hidden">
                 <div className="w-2 h-2 bg-[var(--neo-accent)] rounded-full shadow-[0_0_8px_#B8FF5A]"></div>
              </div>
              <span className="font-bold text-2xl text-white font-en tracking-wider neo-gradient-text">NeoAcademia</span>
            </Link>
            <p className="mb-6 leading-relaxed text-sm">
              پلتفرمی برای یادگیری عمیق، مهارت‌افزایی و آینده‌سازی. دوره‌های حضوری و آنلاین با رویکردی متفاوت و حرفه‌ای.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full border border-[var(--neo-border)] flex items-center justify-center hover:bg-[var(--neo-surface)] hover:text-[var(--neo-primary)] transition-colors">
                <Camera className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full border border-[var(--neo-border)] flex items-center justify-center hover:bg-[var(--neo-surface)] hover:text-[var(--neo-secondary)] transition-colors">
                <MessageCircle className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full border border-[var(--neo-border)] flex items-center justify-center hover:bg-[var(--neo-surface)] hover:text-[var(--neo-primary)] transition-colors">
                <Briefcase className="w-4 h-4" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-white font-bold mb-6 font-en tracking-widest text-sm uppercase">Explore</h3>
            <ul className="space-y-3">
              <li><Link href="/courses" className="hover:text-[var(--neo-secondary)] transition">همه دوره‌ها</Link></li>
              <li><Link href="/classes" className="hover:text-[var(--neo-secondary)] transition">کلاس‌های زنده</Link></li>
              <li><Link href="/instructors" className="hover:text-[var(--neo-secondary)] transition">اساتید برتر</Link></li>
              <li><Link href="/blog" className="hover:text-[var(--neo-secondary)] transition">وبلاگ</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-bold mb-6 font-en tracking-widest text-sm uppercase">Support</h3>
            <ul className="space-y-3">
              <li><Link href="/faq" className="hover:text-[var(--neo-secondary)] transition">سوالات متداول</Link></li>
              <li><Link href="/rules" className="hover:text-[var(--neo-secondary)] transition">قوانین و مقررات</Link></li>
              <li><Link href="/privacy" className="hover:text-[var(--neo-secondary)] transition">حریم خصوصی</Link></li>
              <li><Link href="/contact" className="hover:text-[var(--neo-secondary)] transition">تماس با ما</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-bold mb-6 font-en tracking-widest text-sm uppercase">Contact</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[var(--neo-primary)] mt-0.5" />
                <span className="text-sm">تهران، خیابان آزادی، دانشگاه صنعتی شریف، مرکز نوآوری</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-[var(--neo-secondary)]" />
                <span className="font-en text-sm">021 - 91234567</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-[var(--neo-accent)]" />
                <span className="font-en text-sm">hello@neoacademia.edu</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-[var(--neo-border)] flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-en">
          <p>© {new Date().getFullYear()} NeoAcademia. All rights reserved.</p>
          <div className="flex gap-4">
             <span>Learn.</span>
             <span>Build.</span>
             <span>Become.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
