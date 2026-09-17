'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { LogOut, User, Search, Bell, ShoppingCart, Menu, X, LayoutDashboard } from 'lucide-react';

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const NAV_LINKS = [
    { name: 'دوره‌ها', href: '/courses' },
    { name: 'کلاس‌ها', href: '/classes' },
    { name: 'اساتید', href: '/instructors' },
    { name: 'وبلاگ', href: '/blog' },
    { name: 'درباره ما', href: '/about' },
    { name: 'تماس با ما', href: '/contact' },
  ];

  // Hide Navbar in dashboard routes
  if (pathname?.startsWith('/admin') || pathname?.startsWith('/student') || pathname?.startsWith('/instructor') || pathname?.startsWith('/profile')) {
    return null;
  }

  return (
    <header className="bg-[#080A12]/80 backdrop-blur-md border-b border-white/5 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          <div className="flex items-center gap-4 md:gap-8">
            {/* Mobile Menu Nodeoggle */}
            <button 
              className="md:hidden text-[#9097AB] hover:text-[#28D7FF] transition"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>

            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full border border-[#28D7FF] flex items-center justify-center relative overflow-hidden"><div className="w-2 h-2 bg-[#B8FF5A] rounded-full shadow-[0_0_8px_#B8FF5A]"></div></div>
              <span className="font-bold text-xl hidden sm:block font-en tracking-wider neo-gradient-text">NeoAcademia</span>
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-[#9097AB]">
              {NAV_LINKS.map(link => (
                <Link 
                  key={link.href} 
                  href={link.href} 
                  className={`transition ${pathname === link.href ? 'text-[#28D7FF] font-bold' : 'hover:text-[#28D7FF]'}`}
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <Link href="/search" className="text-[#9097AB] hover:text-[#28D7FF] transition ml-1 sm:ml-2">
              <Search className="w-5 h-5" />
            </Link>
            
            <Link href="/cart" className="text-[#9097AB] hover:text-[#28D7FF] transition relative">
              <ShoppingCart className="w-5 h-5" />
            </Link>

            {isAuthenticated && user ? (
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-px h-6 bg-white/10 mx-1 hidden sm:block"></div>
                <Link href={user.role === 'student' ? '/student' : user.role === 'instructor' ? '/instructor' : '/admin'} className="flex items-center gap-2 p-1.5 pr-3 rounded-full border border-white/10 hover:bg-white/5 transition cursor-pointer">
                  <span className="text-sm font-medium text-[#F5F7FF] hidden sm:block">{user.firstName}</span>
                  <div className="w-8 h-8 rounded-full bg-[#7C5CFF]/20 text-[#7C5CFF] flex items-center justify-center font-bold text-sm overflow-hidden shrink-0">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.firstName} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-4 h-4" />
                    )}
                  </div>
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2 sm:gap-3">
                <Link href="/login" className="text-sm font-medium text-[#9097AB] hover:text-[#28D7FF] transition">
                  ورود
                </Link>
                <Link href="/register" className="text-sm font-medium px-3 sm:px-4 py-2 bg-white/5 text-[#28D7FF] rounded-lg hover:bg-blue-100 transition">
                  ثبت‌نام
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer (Right Side) */}
      {isMobileMenuOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden" 
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
          <div className="fixed top-0 right-0 h-full w-64 bg-[#10131F] z-50 shadow-2xl md:hidden flex flex-col transform transition-transform duration-300 ease-in-out">
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
                <div className="w-8 h-8 rounded-full border border-[#28D7FF] flex items-center justify-center relative overflow-hidden"><div className="w-2 h-2 bg-[#B8FF5A] rounded-full shadow-[0_0_8px_#B8FF5A]"></div></div>
                <span className="font-bold text-xl text-[#F5F7FF]">NeoAcademia</span>
              </Link>
              <button 
                className="p-2 text-gray-500 hover:text-red-500 transition rounded-full hover:bg-red-500/10"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {isAuthenticated && user && (
              <div className="p-4 border-b border-white/5 bg-white/5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-[#7C5CFF]/20 text-[#7C5CFF] flex items-center justify-center font-bold text-lg overflow-hidden shrink-0">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.firstName} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <div className="font-bold text-[#F5F7FF]">{user.firstName} {user.lastName}</div>
                    <div className="text-xs text-gray-500">{user.email}</div>
                  </div>
                </div>
                <Link 
                  href={user.role === 'student' ? '/student' : user.role === 'instructor' ? '/instructor' : '/admin'} 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 py-2 bg-[#7C5CFF] text-white rounded-xl text-sm font-bold shadow-sm"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  ورود به پنل کاربری
                </Link>
              </div>
            )}

            <div className="flex-1 overflow-y-auto py-4">
              <nav className="flex flex-col px-3 space-y-1">
                {NAV_LINKS.map(link => (
                  <Link 
                    key={link.href} 
                    href={link.href} 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block px-4 py-3 rounded-xl text-sm font-bold transition ${
                      pathname === link.href ? 'bg-white/5 text-[#28D7FF]' : 'text-[#9097AB] hover:bg-white/5 hover:text-[#28D7FF]'
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
              </nav>
            </div>
            
            {isAuthenticated && user && (
              <div className="p-4 border-t border-white/5">
                <button 
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                  }} 
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 text-red-600 hover:bg-red-500/10 rounded-xl transition font-bold text-sm"
                >
                  <LogOut className="w-5 h-5" />
                  خروج از حساب
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </header>
  );
}
