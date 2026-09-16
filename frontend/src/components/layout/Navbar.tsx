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
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          <div className="flex items-center gap-4 md:gap-8">
            {/* Mobile Menu Toggle */}
            <button 
              className="md:hidden text-gray-500 hover:text-blue-600 transition"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>

            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold text-xl">
                T
              </div>
              <span className="font-bold text-xl text-gray-900 hidden sm:block">تک‌یاد</span>
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
              {NAV_LINKS.map(link => (
                <Link 
                  key={link.href} 
                  href={link.href} 
                  className={`transition ${pathname === link.href ? 'text-blue-600 font-bold' : 'hover:text-blue-600'}`}
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <Link href="/search" className="text-gray-500 hover:text-blue-600 transition ml-1 sm:ml-2">
              <Search className="w-5 h-5" />
            </Link>
            
            <Link href="/cart" className="text-gray-500 hover:text-blue-600 transition relative">
              <ShoppingCart className="w-5 h-5" />
            </Link>

            {isAuthenticated && user ? (
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-px h-6 bg-gray-200 mx-1 hidden sm:block"></div>
                <Link href={user.role === 'student' ? '/student' : user.role === 'instructor' ? '/instructor' : '/admin'} className="flex items-center gap-2 p-1.5 pr-3 rounded-full border border-gray-100 hover:bg-gray-50 transition cursor-pointer">
                  <span className="text-sm font-medium text-gray-700 hidden sm:block">{user.firstName}</span>
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm overflow-hidden shrink-0">
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
                <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition">
                  ورود
                </Link>
                <Link href="/register" className="text-sm font-medium px-3 sm:px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition">
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
          <div className="fixed top-0 right-0 h-full w-64 bg-white z-50 shadow-2xl md:hidden flex flex-col transform transition-transform duration-300 ease-in-out">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
                <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold text-xl">
                  T
                </div>
                <span className="font-bold text-xl text-gray-900">تک‌یاد</span>
              </Link>
              <button 
                className="p-2 text-gray-500 hover:text-red-500 transition rounded-full hover:bg-red-50"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {isAuthenticated && user && (
              <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg overflow-hidden shrink-0">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.firstName} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">{user.firstName} {user.lastName}</div>
                    <div className="text-xs text-gray-500">{user.email}</div>
                  </div>
                </div>
                <Link 
                  href={user.role === 'student' ? '/student' : user.role === 'instructor' ? '/instructor' : '/admin'} 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-sm"
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
                      pathname === link.href ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
              </nav>
            </div>
            
            {isAuthenticated && user && (
              <div className="p-4 border-t border-gray-100">
                <button 
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                  }} 
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition font-bold text-sm"
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
