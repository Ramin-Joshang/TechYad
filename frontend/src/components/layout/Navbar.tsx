"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useQuery } from "@tanstack/react-query";
import { commerceApi } from "@/features/commerce/api/commerce.api";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/features/auth/stores/auth.store";
import { useCartStore } from "@/features/commerce/stores/cart.store";
import { superAdminApi } from "@/features/admin/api/super-admin.api";
import { catalogApi } from "@/features/catalog/api/catalog.api";
import { NotificationDropdown } from "@/app/(dashboard)/components/NotificationDropdown";
import {
  LogOut,
  User,
  Search,
  ShoppingCart,
  Menu,
  X,
  LayoutDashboard,
  Home,
  BookOpen,
  Users,
  GraduationCap,
  FileText,
  Info,
  Phone,
  LayoutGrid,
  ChevronDown,
  ChevronLeft,
} from "lucide-react";

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
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
    } else {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    }
    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  // Sync cart from server, populating local store
  const { data: cartData } = useQuery({
    queryKey: ["cart"],
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

  const { data: publicSettings } = useQuery({
    queryKey: ["publicSettings"],
    queryFn: async () => {
      const res = await superAdminApi.getPublicSettings();
      return res.data;
    },
    staleTime: 1000 * 60 * 10,
  });

  const { data: categoryTreeData } = useQuery({
    queryKey: ["navbarCategoryTree"],
    queryFn: async () => {
      const res = await catalogApi.getCategoryTree();
      return res?.data || res || [];
    },
    staleTime: 1000 * 60 * 10,
  });

  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState<any>(null);
  const [mobileCategoriesOpen, setMobileCategoriesOpen] = useState(false);

  const cartItems = cartData?.items || localCartItems || [];
  const cartItemCount = cartItems.length;

  const NAV_LINKS = [
    { name: "خانه", href: "/", icon: Home },
    { name: "کلاس‌ها", href: "/classes", icon: GraduationCap },
    { name: "دوره‌ها", href: "/courses", icon: BookOpen },
    { name: "اساتید", href: "/instructors", icon: Users },
    { name: "وبلاگ", href: "/blog", icon: FileText },
    { name: "درباره ما", href: "/about", icon: Info },
    { name: "تماس با ما", href: "/contact", icon: Phone },
  ];

  if (
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/super-admin") ||
    pathname?.startsWith("/student") ||
    (pathname?.startsWith("/instructor") &&
      !pathname?.startsWith("/instructors")) ||
    pathname?.startsWith("/profile") ||
    pathname?.startsWith("/learn")
  ) {
    return null;
  }

  const userDashboardHref =
    user?.role === "super-admin"
      ? "/super-admin"
      : user?.role === "student"
        ? "/student"
        : user?.role === "instructor"
          ? "/instructor"
          : "/admin";

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

              <Link href="/" className="flex items-center gap-2.5">
                <img
                  src={publicSettings?.siteLogo || "/logo.png"}
                  alt={publicSettings?.siteName || "لوگو تک‌یاد"}
                  className="h-10 w-auto max-w-[140px] object-contain rounded-lg"
                  onError={(e: any) => {
                    e.target.src = "/logo.png";
                  }}
                />
                <span className="font-bold text-xl text-[var(--neo-text-main)] hidden sm:inline-flex items-center gap-1.5 tracking-tight">
                  <span>
                    {publicSettings?.siteName
                      ? publicSettings.siteName.split("|")[0].trim()
                      : "تک‌یاد"}
                  </span>
                  <span className="text-[10px] tracking-wider font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded uppercase">
                    Tecyad
                  </span>
                </span>
              </Link>
            </div>

            {/* Center: Desktop Navigation Links */}
            <nav className="hidden md:flex items-center justify-center gap-6 lg:gap-7 text-sm font-medium text-[var(--neo-text-secondary)]">
              {/* 1. خانه */}
              <Link
                href="/"
                className={`transition-colors py-1 relative ${
                  pathname === "/"
                    ? "text-[var(--neo-primary)] font-bold"
                    : "hover:text-[var(--neo-primary)]"
                }`}
              >
                خانه
                {pathname === "/" && (
                  <span className="absolute -bottom-1 right-0 left-0 h-0.5 bg-[var(--neo-primary)] rounded-full"></span>
                )}
              </Link>

              {/* دسته‌بندی‌ها (Mega Menu Dropdown) */}
              <div 
                className="relative"
                onMouseEnter={() => setIsCategoryMenuOpen(true)}
                onMouseLeave={() => {
                  setIsCategoryMenuOpen(false);
                  setHoveredCategory(null);
                }}
              >
                <button
                  type="button"
                  onClick={() => setIsCategoryMenuOpen(!isCategoryMenuOpen)}
                  className={`flex items-center gap-1.5 transition-colors py-1 ${
                    pathname?.startsWith("/categories") || isCategoryMenuOpen
                      ? "text-[var(--neo-primary)] font-bold"
                      : "hover:text-[var(--neo-primary)]"
                  }`}
                >
                  <LayoutGrid className="w-4 h-4 text-[var(--neo-primary)]" />
                  <span>دسته‌بندی‌ها</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isCategoryMenuOpen ? "rotate-180" : ""}`} />
                </button>

                {/* Dropdown Card */}
                {isCategoryMenuOpen && categoryTreeData && categoryTreeData.length > 0 && (
                  <div className="absolute top-full right-0 mt-2 w-[620px] bg-white rounded-2xl shadow-2xl border border-[var(--neo-border)] p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="grid grid-cols-12 gap-3 min-h-[260px]">
                      {/* Main Root Categories */}
                      <div className="col-span-5 border-l border-[var(--neo-border)] pl-3 space-y-1">
                        <div className="text-[11px] font-bold text-[var(--neo-text-muted)] px-2.5 py-1 uppercase tracking-wider">
                          شاخه‌های آموزشی
                        </div>
                        {categoryTreeData.map((cat: any) => {
                          const isCurrentActive = (hoveredCategory?._id || categoryTreeData[0]._id) === cat._id;
                          return (
                            <Link
                              key={cat._id}
                              href={`/categories/${cat.slug}`}
                              onMouseEnter={() => setHoveredCategory(cat)}
                              onClick={() => setIsCategoryMenuOpen(false)}
                              className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition ${
                                isCurrentActive
                                  ? "bg-[var(--neo-primary)]/10 text-[var(--neo-primary)]"
                                  : "text-[var(--neo-text-main)] hover:bg-[var(--neo-surface-2)]"
                              }`}
                            >
                              <span className="truncate">{cat.name}</span>
                              <ChevronLeft className="w-3.5 h-3.5 shrink-0 opacity-60" />
                            </Link>
                          );
                        })}
                      </div>

                      {/* Subcategories View */}
                      <div className="col-span-7 pr-1 flex flex-col justify-between">
                        <div>
                          {(() => {
                            const activeCat = hoveredCategory || categoryTreeData[0];
                            if (!activeCat) return null;
                            const children = activeCat.children || [];
                            return (
                              <div className="space-y-2.5">
                                <div className="flex items-center justify-between pb-2 border-b border-[var(--neo-border)]">
                                  <span className="font-bold text-xs text-[var(--neo-text-main)]">
                                    زیردسته‌های {activeCat.name}
                                  </span>
                                  <Link
                                    href={`/categories/${activeCat.slug}`}
                                    onClick={() => setIsCategoryMenuOpen(false)}
                                    className="font-bold text-xs text-[var(--neo-primary)] hover:underline flex items-center gap-1"
                                  >
                                    <span>مشاهده کامل</span>
                                    <span>←</span>
                                  </Link>
                                </div>
                                {children.length > 0 ? (
                                  <div className="grid grid-cols-2 gap-2 pt-1 max-h-[220px] overflow-y-auto pr-1">
                                    {children.map((sub: any) => (
                                      <Link
                                        key={sub._id}
                                        href={`/categories/${sub.slug}`}
                                        onClick={() => setIsCategoryMenuOpen(false)}
                                        className="group p-2 rounded-xl hover:bg-[var(--neo-surface-2)] border border-transparent hover:border-[var(--neo-border)] transition"
                                      >
                                        <div className="text-xs font-bold text-[var(--neo-text-main)] group-hover:text-[var(--neo-primary)] truncate">
                                          {sub.name}
                                        </div>
                                        <div className="text-[10px] text-[var(--neo-text-muted)] mt-0.5">
                                          {(sub.courseCount || 0) + (sub.classCount || 0) > 0
                                            ? `${(sub.courseCount || 0) + (sub.classCount || 0)} دوره و کلاس`
                                            : "مشاهده دوره‌ها"}
                                        </div>
                                      </Link>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="py-10 text-center text-xs text-[var(--neo-text-muted)]">
                                    دوره‌ها و کلاس‌های تخصصی این دسته‌بندی
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                        </div>

                        {/* All Categories Link */}
                        <div className="pt-2.5 mt-2 border-t border-[var(--neo-border)] flex items-center justify-between text-xs">
                          <Link
                            href="/categories"
                            onClick={() => setIsCategoryMenuOpen(false)}
                            className="text-[var(--neo-text-secondary)] hover:text-[var(--neo-primary)] font-bold flex items-center gap-1"
                          >
                            <span>مشاهده همه دسته‌بندی‌ها</span>
                            <span>←</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 2. کلاس‌ها */}
              <Link
                href="/classes"
                className={`transition-colors py-1 relative ${
                  pathname === "/classes"
                    ? "text-[var(--neo-primary)] font-bold"
                    : "hover:text-[var(--neo-primary)]"
                }`}
              >
                کلاس‌ها
                {pathname === "/classes" && (
                  <span className="absolute -bottom-1 right-0 left-0 h-0.5 bg-[var(--neo-primary)] rounded-full"></span>
                )}
              </Link>

              {/* 3. دوره‌ها */}
              <Link
                href="/courses"
                className={`transition-colors py-1 relative ${
                  pathname === "/courses"
                    ? "text-[var(--neo-primary)] font-bold"
                    : "hover:text-[var(--neo-primary)]"
                }`}
              >
                دوره‌ها
                {pathname === "/courses" && (
                  <span className="absolute -bottom-1 right-0 left-0 h-0.5 bg-[var(--neo-primary)] rounded-full"></span>
                )}
              </Link>

              {/* 4. اساتید */}
              <Link
                href="/instructors"
                className={`transition-colors py-1 relative ${
                  pathname === "/instructors"
                    ? "text-[var(--neo-primary)] font-bold"
                    : "hover:text-[var(--neo-primary)]"
                }`}
              >
                اساتید
                {pathname === "/instructors" && (
                  <span className="absolute -bottom-1 right-0 left-0 h-0.5 bg-[var(--neo-primary)] rounded-full"></span>
                )}
              </Link>

              {/* 5. وبلاگ */}
              <Link
                href="/blog"
                className={`transition-colors py-1 relative ${
                  pathname === "/blog"
                    ? "text-[var(--neo-primary)] font-bold"
                    : "hover:text-[var(--neo-primary)]"
                }`}
              >
                وبلاگ
                {pathname === "/blog" && (
                  <span className="absolute -bottom-1 right-0 left-0 h-0.5 bg-[var(--neo-primary)] rounded-full"></span>
                )}
              </Link>

              {/* 6. درباره ما */}
              <Link
                href="/about"
                className={`transition-colors py-1 relative ${
                  pathname === "/about"
                    ? "text-[var(--neo-primary)] font-bold"
                    : "hover:text-[var(--neo-primary)]"
                }`}
              >
                درباره ما
                {pathname === "/about" && (
                  <span className="absolute -bottom-1 right-0 left-0 h-0.5 bg-[var(--neo-primary)] rounded-full"></span>
                )}
              </Link>

              {/* 7. تماس با ما */}
              <Link
                href="/contact"
                className={`transition-colors py-1 relative ${
                  pathname === "/contact"
                    ? "text-[var(--neo-primary)] font-bold"
                    : "hover:text-[var(--neo-primary)]"
                }`}
              >
                تماس با ما
                {pathname === "/contact" && (
                  <span className="absolute -bottom-1 right-0 left-0 h-0.5 bg-[var(--neo-primary)] rounded-full"></span>
                )}
              </Link>
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
                    {cartItemCount > 9
                      ? "+9"
                      : cartItemCount.toLocaleString("fa-IR")}
                  </span>
                )}
              </Link>

              {isInitializing && !user ? (
                <div className="flex items-center">
                  <div className="w-28 h-9 bg-gray-100 animate-pulse rounded-xl"></div>
                </div>
              ) : isAuthenticated && user ? (
                <div className="flex items-center gap-2 sm:gap-3">
                  <NotificationDropdown role={user.role || 'student'} />
                  <div className="w-px h-6 bg-[var(--neo-border)] mx-0.5 hidden sm:block"></div>
                  <Link
                    href={userDashboardHref}
                    className="flex items-center gap-2 p-1.5 pr-3 rounded-full border border-[var(--neo-border)] hover:bg-[var(--neo-surface-2)] transition cursor-pointer"
                  >
                    <span className="text-sm font-medium text-[var(--neo-text-main)] hidden sm:block">
                      {user.firstName}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-[var(--neo-surface-2)] text-[var(--neo-primary)] flex items-center justify-center font-bold text-sm overflow-hidden shrink-0">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.firstName}
                          className="w-full h-full object-cover"
                        />
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
                  className="flex items-center gap-2.5"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <img
                    src="/logo.png"
                    alt="لوگو تک‌یاد"
                    className="h-9 w-auto max-w-[120px] object-contain rounded-lg"
                  />
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
                  {/* 1. خانه */}
                  <Link
                    href="/"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition ${
                      pathname === "/"
                        ? "bg-[var(--neo-primary)]/10 text-[var(--neo-primary)]"
                        : "text-[var(--neo-text-secondary)] hover:bg-[var(--neo-surface-2)] hover:text-[var(--neo-primary)]"
                    }`}
                  >
                    <Home className="w-5 h-5 shrink-0" />
                    <span>خانه</span>
                  </Link>

                  {/* دسته‌بندی‌ها (Collapsible Accordion) */}
                  <div className="rounded-xl overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setMobileCategoriesOpen(!mobileCategoriesOpen)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition ${
                        pathname?.startsWith("/categories") || mobileCategoriesOpen
                          ? "bg-[var(--neo-primary)]/10 text-[var(--neo-primary)]"
                          : "text-[var(--neo-text-secondary)] hover:bg-[var(--neo-surface-2)] hover:text-[var(--neo-primary)]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <LayoutGrid className="w-5 h-5 shrink-0 text-[var(--neo-primary)]" />
                        <span>دسته‌بندی‌ها</span>
                      </div>
                      <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${mobileCategoriesOpen ? "rotate-180" : ""}`} />
                    </button>

                    {mobileCategoriesOpen && (
                      <div className="py-2 pr-4 pl-2 space-y-1.5 bg-[var(--neo-surface-2)]/60 rounded-xl my-1 border border-[var(--neo-border)]/60 text-right">
                        <Link
                          href="/categories"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="block px-2 py-1 text-xs font-black text-[var(--neo-primary)] hover:underline"
                        >
                          مشاهده همه دسته‌بندی‌ها ←
                        </Link>
                        {categoryTreeData?.map((cat: any) => (
                          <div key={cat._id} className="space-y-0.5 pt-1">
                            <Link
                              href={`/categories/${cat.slug}`}
                              onClick={() => setIsMobileMenuOpen(false)}
                              className="block px-2 py-1 text-xs font-bold text-[var(--neo-text-main)] hover:text-[var(--neo-primary)]"
                            >
                              • {cat.name}
                            </Link>
                            {cat.children && cat.children.length > 0 && (
                              <div className="pr-3 space-y-0.5">
                                {cat.children.map((sub: any) => (
                                  <Link
                                    key={sub._id}
                                    href={`/categories/${sub.slug}`}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="block px-2 py-0.5 text-[11px] text-[var(--neo-text-muted)] hover:text-[var(--neo-primary)]"
                                  >
                                    - {sub.name}
                                  </Link>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Rest of Navigation Links: کلاس‌ها، دوره‌ها، اساتید، وبلاگ، درباره ما، تماس با ما */}
                  {NAV_LINKS.filter((l) => l.href !== "/").map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition ${
                          isActive
                            ? "bg-[var(--neo-primary)]/10 text-[var(--neo-primary)]"
                            : "text-[var(--neo-text-secondary)] hover:bg-[var(--neo-surface-2)] hover:text-[var(--neo-primary)]"
                        }`}
                      >
                        <Icon className="w-5 h-5 shrink-0" />
                        <span>{link.name}</span>
                      </Link>
                    );
                  })}
                </nav>

                {/* Direct Contact & Socials Banner for Mobile */}
                <div className="p-4 mx-3 mb-2 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200/80 shadow-xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-emerald-950 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      مشاوره و پشتیبانی فوری
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-white px-2 py-0.5 rounded-full border border-emerald-200">
                      پاسخگویی
                    </span>
                  </div>
                  <a
                    href="tel:09372731037"
                    className="flex items-center justify-center gap-2 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
                  >
                    <Phone className="w-4 h-4" />
                    <span>تماس تلفنی:</span>
                    <span dir="ltr" style={{ direction: 'ltr', unicodeBidi: 'plaintext' }} className="font-bold">۰۹۳۷ ۲۷۳ ۱۰۳۷</span>
                  </a>
                  <div className="grid grid-cols-3 gap-1.5 pt-1 text-[11px] font-bold text-center">
                    <a
                      href="https://t.me/tecyad_ir"
                      target="_blank"
                      rel="noreferrer"
                      className="py-1.5 bg-white hover:bg-sky-50 text-sky-600 border border-sky-200 rounded-lg transition"
                    >
                      تلگرام
                    </a>
                    <a
                      href="https://wa.me/989372731037"
                      target="_blank"
                      rel="noreferrer"
                      className="py-1.5 bg-white hover:bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-lg transition"
                    >
                      واتس‌اپ
                    </a>
                    <a
                      href="https://instagram.com/tecyad.ir"
                      target="_blank"
                      rel="noreferrer"
                      className="py-1.5 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 rounded-lg transition"
                    >
                      اینستاگرام
                    </a>
                  </div>
                </div>
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
                        <img
                          src={user.avatar}
                          alt={user.firstName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-6 h-6" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-[var(--neo-text-main)] truncate">
                        {user.firstName} {user.lastName}
                      </div>
                      <div className="text-xs text-[var(--neo-text-secondary)] truncate">
                        {user.email}
                      </div>
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
          document.body,
        )}
    </>
  );
}
