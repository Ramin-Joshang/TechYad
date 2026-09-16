"use client";
import Link from 'next/link';
import { Mail, Phone, MapPin, Send, Camera, Briefcase, MessageCircle } from 'lucide-react';

import { usePathname } from 'next/navigation';

export function Footer() {
  const pathname = usePathname();

  // Hide Footer in dashboard routes
  if (pathname?.startsWith('/admin') || pathname?.startsWith('/student') || pathname?.startsWith('/instructor') || pathname?.startsWith('/profile')) {
    return null;
  }

  return (
    <footer className="bg-gray-900 text-gray-300 pt-16 pb-8 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Brand & About */}
          <div className="col-span-1 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold text-xl">
                T
              </div>
              <span className="font-bold text-xl text-white">تک‌یاد</span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              تک‌یاد، کامل‌ترین پلتفرم آموزشی آنلاین و حضوری با هدف ارتقای سطح مهارت‌های تخصصی و کاربردی برای ورود به بازار کار طراحی شده است.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-blue-500 hover:text-white transition-colors" title="Telegram">
                <Send className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-pink-600 hover:text-white transition-colors" title="Instagram">
                <Camera className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-green-500 hover:text-white transition-colors" title="WhatsApp">
                <MessageCircle className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-blue-700 hover:text-white transition-colors" title="LinkedIn">
                <Briefcase className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold mb-6">دسترسی سریع</h4>
            <ul className="space-y-4 text-sm">
              <li><Link href="/courses" className="hover:text-blue-400 transition">همه دوره‌ها</Link></li>
              <li><Link href="/classes" className="hover:text-blue-400 transition">کلاس‌های آنلاین و حضوری</Link></li>
              <li><Link href="/instructors" className="hover:text-blue-400 transition">اساتید تک‌یاد</Link></li>
              <li><Link href="/blog" className="hover:text-blue-400 transition">وبلاگ و مقالات</Link></li>
              <li><Link href="/about" className="hover:text-blue-400 transition">درباره ما</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-bold mb-6">پشتیبانی</h4>
            <ul className="space-y-4 text-sm">
              <li><Link href="/faq" className="hover:text-blue-400 transition">سوالات متداول</Link></li>
              <li><Link href="/rules" className="hover:text-blue-400 transition">قوانین و مقررات</Link></li>
              <li><Link href="/privacy" className="hover:text-blue-400 transition">حریم خصوصی</Link></li>
              <li><Link href="/contact" className="hover:text-blue-400 transition">تماس با ما</Link></li>
              <li><Link href="/careers" className="hover:text-blue-400 transition">همکاری در تدریس</Link></li>
            </ul>
          </div>

          {/* Contact & Newsletter */}
          <div>
            <h4 className="text-white font-bold mb-6">ارتباط با ما</h4>
            <ul className="space-y-4 text-sm mb-8">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-500 shrink-0" />
                <span>تهران، خیابان ولیعصر، تقاطع مطهری، پلاک ۱۰۰، واحد ۲</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gray-500 shrink-0" />
                <span dir="ltr">۰۲۱ - ۸۸۸۸۸۸۸۸</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-500 shrink-0" />
                <span>info@techyad.com</span>
              </li>
            </ul>
            
            <form className="relative" action="#">
              <input 
                type="email" 
                placeholder="ایمیل خود را وارد کنید" 
                className="w-full bg-gray-800 border border-gray-700 rounded-lg py-3 px-4 pr-12 text-sm text-white focus:outline-none focus:border-blue-500 transition"
              />
              <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-blue-500 transition">
                <Send className="w-4 h-4 rotate-180" />
              </button>
            </form>
          </div>

        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between text-sm text-gray-500">
          <p>© {new Date().getFullYear()} تک‌یاد. تمامی حقوق محفوظ است.</p>
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            {/* Trust Badges placeholders */}
            <div className="w-16 h-16 bg-gray-800 rounded-lg flex items-center justify-center text-xs">نماد اعتماد</div>
            <div className="w-16 h-16 bg-gray-800 rounded-lg flex items-center justify-center text-xs">ساماندهی</div>
          </div>
        </div>
      </div>
    </footer>
  );
}
