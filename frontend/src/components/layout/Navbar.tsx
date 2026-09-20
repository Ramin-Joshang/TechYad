'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useQuery } from '@tanstack/react-query';
import { commerceApi } from '@/features/commerce/api/commerce.api';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { useCartStore } from '@/features/commerce/stores/cart.store';
import {
  LogOut,
  User,
  Search,
  ShoppingCart,
  Menu,
  X,
  LayoutDashboard,
  BookOpen,
  Users,
  GraduationCap,
  FileText,
  Info,
  Phone,
} from 'lucide-react';

export function Navbar() {
  const { user, isAuthenticated, isInitializing, logout } = useAuthStore();
  const { items: localCartItems, setCart } = useCartStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
    } else {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    }
    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  // Sync cart from server, populating local store
  const { data: cartData } = useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const res = await commerceApi.getCart();
      if (res.data) {
        setCart(res.data);
      }
      return res.data;
    },
    enabled: !!isAuthenticated,
    staleTime: 1000 * 60 * 5,
  });

  const cartItems = cartData?.items || localCartItems || [];
  const cartItemCount = cartItems.length;

  const NAV_LINKS = [
    { name: 'دوره‌ها', href: '/courses', icon: BookOpen },
    { name: 'کلاس‌ها', href: '/classes', icon: GraduationCap },
    { name: 'اساتید', href: '/instructors', icon: Users },
    { name: 'وبلاگ', href: '/blog', icon: FileText },
    { name: 'درباره ما', href: '/about', icon: Info },
    { name: 'تماس با ما', href: '/contact', icon: Phone },
  ];

  if (
    pathname?.startsWith('/admin') ||
    pathname?.startsWith('/student') ||
    (pathname?.startsWith('/instructor') && !pathname?.startsWith('/instructors')) ||
    pathname?.startsWith('/profile')
  ) {
    return null;
  }

  const userDashboardHref =
    user?.role === 'student' ? '/student' : user?.role === 'instructor' ? '/instructor' : '/admin';

  return (
    <>
      <header className="bg-white/80 backdrop-blur-md border-b border-[var(--neo-border)] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Right side: Mobile Menu Button & Logo */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="md:hidden p-2 -mr-2 text-[var(--neo-text-muted)] hover:text-[var(--neo-primary)] transition"
                onClick={() => setIsMobileMenuOpen(true)}
                aria-label="منوی دسترسی سریع"
              >
                <Menu className="w-6 h-6" />
              </button>

              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full border-2 border-[var(--neo-primary)] flex items-center justify-center relative overflow-hidden">
                  <div className="w-2 h-2 bg-[var(--neo-secondary)] rounded-full"></div>
                </div>
                <span className="font-bold text-xl text-[var(--neo-text-main)] hidden sm:block tracking-tight">
                  تک‌یاد
                </span>
              </Link>
            </div>

            {/* Center: Desktop Navigation Links */}
            <nav className="hidden md:flex items-center justify-center gap-8 text-sm font-medium text-[var(--neo-text-secondary)]">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`transition-colors py-1 relative ${
                    pathname === link.href
                      ? 'text-[var(--neo-primary)] font-bold'
                      : 'hover:text-[var(--neo-primary)]'
                  }`}
                >
                  {link.name}
                  {pathname === link.href && (
                    <span className="absolute -bottom-1 right-0 left-0 h-0.5 bg-[var(--neo-primary)] rounded-full"></span>
                  )}
                </Link>
              ))}
            </nav>

            {/* Left side: Search, Cart, User Profile / Login */}
            <div className="flex items-center gap-3 sm:gap-4">
              <Link
                href="/search"
                className="text-[var(--neo-text-muted)] hover:text-[var(--neo-primary)] transition ml-1 sm:ml-2"
                title="جستجو"
              >
                <Search className="w-5 h-5" />
              </Link>

              <Link
                href="/cart"
                className="text-[var(--neo-text-muted)] hover:text-[var(--neo-primary)] transition relative p-1.5 rounded-xl hover:bg-gray-100"
                title="سبد خرید"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm ring-2 ring-white">
                    {cartItemCount > 9 ? '+9' : cartItemCount.toLocaleString('fa-IR')}
                  </span>
                )}
              </Link>

              {isInitializing && !user ? (
                <div className="flex items-center">
                  <div className="w-28 h-9 bg-gray-100 animate-pulse rounded-xl"></div>
                </div>
              ) : isAuthenticated && user ? (
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-px h-6 bg-[var(--neo-border)] mx-1 hidden sm:block"></div>
                  <Link
                    href={userDashboardHref}
                    className="flex items-center gap-2 p-1.5 pr-3 rounded-full border border-[var(--neo-border)] hover:bg-[var(--neo-surface-2)] transition cursor-pointer"
                  >
                    <span className="text-sm font-medium text-[var(--neo-text-main)] hidden sm:block">
                      {user.firstName}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-[var(--neo-surface-2)] text-[var(--neo-primary)] flex items-center justify-center font-bold text-sm overflow-hidden shrink-0">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.firstName} className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-4 h-4" />
                      )}
                    </div>
                  </Link>
                </div>
              ) : (
                <div className="flex items-center">
                  <Link
                    href="/login"
                    className="flex items-center gap-2 text-sm font-bold px-4 py-2 bg-[var(--neo-primary)] text-white rounded-xl hover:bg-blue-700 transition shadow-sm shadow-[var(--neo-primary)]/20"
                  >
                    <User className="w-4 h-4" />
                    <span>ورود / عضویت</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer using Portal */}
      {mounted &&
        isMobileMenuOpen &&
        createPortal(
          <div className="fixed inset-0 z-[99999] md:hidden">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Sliding Drawer from Right */}
            <div className="fixed top-0 right-0 h-full w-72 max-w-[85vw] bg-white shadow-2xl flex flex-col border-l border-[var(--neo-border)] animate-in slide-in-from-right duration-200">
              {/* Drawer Header */}
              <div className="p-4 border-b border-[var(--neo-border)] flex items-center justify-between">
                <Link
                  href="/"
                  className="flex items-center gap-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <div className="w-8 h-8 rounded-full border-2 border-[var(--neo-primary)] flex items-center justify-center relative overflow-hidden">
                    <div className="w-2 h-2 bg-[var(--neo-secondary)] rounded-full"></div>
                  </div>
                  <span className="font-bold text-xl text-[var(--neo-text-main)] tracking-tight">
                    تک‌یاد
                  </span>
                </Link>
                <button
                  type="button"
                  className="p-2 text-[var(--neo-text-muted)] hover:text-red-500 transition rounded-full hover:bg-[var(--neo-surface-2)]"
                  onClick={() => setIsMobileMenuOpen(false)}
                  aria-label="بستن منو"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Links (placed above profile section) */}
              <div className="flex-1 overflow-y-auto py-4">
                <nav className="flex flex-col px-3 space-y-1">
                  {NAV_LINKS.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition ${
                          isActive
                            ? 'bg-[var(--neo-primary)]/10 text-[var(--neo-primary)]'
                            : 'text-[var(--neo-text-secondary)] hover:bg-[var(--neo-surface-2)] hover:text-[var(--neo-primary)]'
                        }`}
                      >
                        <Icon className="w-5 h-5 shrink-0" />
                        <span>{link.name}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>

              {/* User Section in Drawer */}
              {isInitializing && !user ? (
                <div className="p-4 border-t border-[var(--neo-border)] bg-gray-50">
                  <div className="w-full h-12 bg-gray-200 animate-pulse rounded-xl"></div>
                </div>
              ) : isAuthenticated && user ? (
                <div className="p-4 border-t border-[var(--neo-border)] bg-[var(--neo-surface-2)]">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-white text-[var(--neo-primary)] flex items-center justify-center font-bold text-lg overflow-hidden shrink-0 border border-[var(--neo-border)]">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.firstName} className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-6 h-6" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-[var(--neo-text-main)] truncate">
                        {user.firstName} {user.lastName}
                      </div>
                      <div className="text-xs text-[var(--neo-text-secondary)] truncate">{user.email}</div>
                    </div>
                  </div>
                  <Link
                    href={userDashboardHref}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-[var(--neo-primary)] text-white rounded-xl text-sm font-bold shadow-sm hover:bg-blue-700 transition"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>پنل کاربری</span>
                  </Link>
                </div>
              ) : (
                <div className="p-4 border-t border-[var(--neo-border)] bg-gray-50/80">
                  <Link
                    href="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-[var(--neo-primary)] text-white rounded-xl text-sm font-bold shadow-sm hover:bg-blue-700 transition"
                  >
                    <User className="w-4 h-4" />
                    <span>ورود یا ثبت‌نام</span>
                  </Link>
                </div>
              )}

              {/* Drawer Footer: Logout if authenticated */}
              {isAuthenticated && user && (
                <div className="p-4 border-t border-[var(--neo-border)]">
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-xl transition font-bold text-sm"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>خروج از حساب</span>
                  </button>
                </div>
              )}
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
