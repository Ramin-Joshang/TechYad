"use client";

import { NotificationDropdown } from "./components/NotificationDropdown";
import { useAuthStore } from "@/features/auth/stores/auth.store";
import { AuthGuard } from "@/features/auth/components/guards/AuthGuard";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { authApi } from "@/features/auth/api/auth.api";
import { superAdminApi } from "@/features/admin/api/super-admin.api";
import { walletApi } from "@/features/wallet/api/wallet.api";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  BookOpen,
  LayoutDashboard,
  LogOut,
  UserCircle,
  Settings,
  PlayCircle,
  BarChart,
  FileText,
  CheckSquare,
  MessageSquare,
  GraduationCap,
  CreditCard,
  Heart,
  Ticket,
  Bell,
  Users,
  DollarSign,
  List,
  Shield,
  Menu,
  X,
  Video,
  Activity,
  Briefcase,
  ChevronRight,
  ChevronLeft,
  ShieldAlert,
  Key,
  Tag,
  Send,
  MessageCircle,
  History,
  Lock,
  Wallet,
  Share2,
  Gift,
  Award,
  TrendingUp,
  Mail,
  HelpCircle,
  Quote,
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const { data: publicSettings } = useQuery({
    queryKey: ["publicSettings"],
    queryFn: async () => {
      const res = await superAdminApi.getPublicSettings();
      return res.data;
    },
    staleTime: 1000 * 60 * 10,
  });

  const { data: walletOverview } = useQuery({
    queryKey: ["myWalletOverview", user?.id],
    queryFn: () => walletApi.getOverview().then((res) => res.data),
    enabled: !!user,
    staleTime: 1000 * 20,
  });

  const walletHref =
    user?.role === "super-admin"
      ? "/super-admin/wallet"
      : user?.role === "admin"
        ? "/admin/wallet"
        : user?.role === "instructor"
          ? "/instructor/wallet"
          : "/student/wallet";

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (e) {
      console.error(e);
    } finally {
      logout();
      router.push("/login");
    }
  };

  const closeMenu = () => setMobileMenuOpen(false);

  const getNavLinks = () => {
    const profileLink = {
      name: "تنظیمات پروفایل",
      href: "/profile",
      icon: Settings,
    };

    if (user?.role === "super-admin") {
      return [
        { name: "داشبورد کلان", href: "/super-admin", icon: LayoutDashboard },
        {
          name: "مدیران و کارکنان",
          href: "/super-admin/admins",
          icon: ShieldAlert,
        },
        { name: "نقش‌ها و دسترسی‌ها", href: "/super-admin/roles", icon: Key },
        { name: "کاربران", href: "/super-admin/users", icon: Users },
        {
          name: "دانشجویان",
          href: "/super-admin/students",
          icon: GraduationCap,
        },
        { name: "اساتید", href: "/super-admin/instructors", icon: Briefcase },
        {
          name: "تسویه‌حساب اساتید",
          href: "/super-admin/settlements",
          icon: Wallet,
        },
        { name: "دوره‌ها", href: "/super-admin/courses", icon: BookOpen },
        {
          name: "مدیریت نظرات",
          href: "/super-admin/comments",
          icon: MessageCircle,
        },
        { name: "دسته‌بندی‌ها", href: "/super-admin/categories", icon: List },
        { name: "کلاس‌ها", href: "/super-admin/classes", icon: Video },
        { name: "سفارشات", href: "/super-admin/orders", icon: List },
        {
          name: "تراکنش‌های مالی",
          href: "/super-admin/payments",
          icon: CreditCard,
        },
        { name: "کد تخفیف", href: "/super-admin/coupons", icon: Tag },
        {
          name: "ارسال اعلان همگانی",
          href: "/super-admin/broadcast",
          icon: Send,
        },
        { name: "پشتیبانی", href: "/super-admin/tickets", icon: Ticket },
        { name: "گزارش‌ها", href: "/super-admin/reports", icon: BarChart },
        { name: "مدیریت وبلاگ", href: "/super-admin/blog", icon: FileText },
        {
          name: "پیام‌های تماس با ما",
          href: "/super-admin/contacts",
          icon: Mail,
        },
        {
          name: "فرصت‌های شغلی و استخدام",
          href: "/super-admin/careers",
          icon: Briefcase,
        },
        {
          name: "مدیریت سوالات متداول",
          href: "/super-admin/faqs",
          icon: HelpCircle,
        },
        {
          name: "نظرات صفحه اصلی",
          href: "/super-admin/testimonials",
          icon: Quote,
        },
        {
          name: "لاگ‌های امنیتی و رویدادها",
          href: "/super-admin/audit-logs",
          icon: History,
        },
        {
          name: "لاگ پیامک‌ها",
          href: "/super-admin/sms-logs",
          icon: MessageSquare,
        },
        {
          name: "لاگ درگاه پرداخت",
          href: "/super-admin/payment-logs",
          icon: CreditCard,
        },
        {
          name: "مدیریت کیف پول‌ها",
          href: "/super-admin/wallet",
          icon: Wallet,
        },
        {
          name: "سیستم همکاری و رفرال",
          href: "/super-admin/referrals",
          icon: Share2,
        },
        {
          name: "امنیت و کنترل دسترسی",
          href: "/super-admin/security",
          icon: Lock,
        },
        {
          name: "تنظیمات سیستم",
          href: "/super-admin/settings",
          icon: Settings,
        },

        profileLink,
      ];
    } else if (user?.role === "admin") {
      return [
        { name: "داشبورد", href: "/admin", icon: LayoutDashboard },
        { name: "مدیریت کاربران", href: "/admin/users", icon: Users },
        { name: "دانشجویان", href: "/admin/students", icon: GraduationCap },
        { name: "اساتید", href: "/admin/instructors", icon: Briefcase },
        { name: "تسویه‌حساب اساتید", href: "/admin/settlements", icon: Wallet },
        { name: "دسته‌بندی‌ها", href: "/admin/categories", icon: List },
        { name: "کل دوره‌ها", href: "/admin/courses", icon: BookOpen },
        {
          name: "دوره‌های منتشر شده",
          href: "/admin/courses/published",
          icon: CheckSquare,
        },
        {
          name: "دوره‌های در انتظار",
          href: "/admin/courses/pending",
          icon: Activity,
        },
        { name: "مدیریت نظرات", href: "/admin/comments", icon: MessageCircle },
        { name: "کلاس‌ها", href: "/admin/classes", icon: Video },
        { name: "سفارشات", href: "/admin/orders", icon: List },
        { name: "تراکنش‌های مالی", href: "/admin/payments", icon: CreditCard },
        { name: "مدیریت کیف پول‌ها", href: "/admin/wallet", icon: Wallet },
        { name: "کد تخفیف", href: "/admin/coupons", icon: Tag },
        {
          name: "ارسال اعلان همگانی",
          href: "/super-admin/broadcast",
          icon: Send,
        },
        {
          name: "سیستم رفرال و بازاریابی",
          href: "/admin/referrals",
          icon: Share2,
        },
        { name: "تیکت‌های پشتیبانی", href: "/admin/tickets", icon: Ticket },
        { name: "گزارش‌ها و آمار", href: "/admin/reports", icon: BarChart },
        { name: "مدیریت وبلاگ", href: "/admin/blog", icon: FileText },
        {
          name: "پیام‌های تماس با ما",
          href: "/admin/contacts",
          icon: Mail,
        },
        {
          name: "فرصت‌های شغلی و استخدام",
          href: "/admin/careers",
          icon: Briefcase,
        },
        {
          name: "مدیریت سوالات متداول",
          href: "/admin/faqs",
          icon: HelpCircle,
        },
        {
          name: "نظرات صفحه اصلی",
          href: "/admin/testimonials",
          icon: Quote,
        },
        {
          name: "لاگ‌ها و رویدادها",
          href: "/admin/logs",
          icon: History,
        },
        {
          name: "لاگ پیامک‌ها",
          href: "/admin/sms-logs",
          icon: MessageSquare,
        },
        {
          name: "لاگ درگاه پرداخت",
          href: "/admin/payment-logs",
          icon: CreditCard,
        },
        { name: "تنظیمات و برندینگ", href: "/admin/settings", icon: Settings },
        profileLink,
      ];
    } else if (user?.role === "instructor") {
      return [
        { name: "داشبورد", href: "/instructor", icon: LayoutDashboard },
        { name: "مدیریت دوره‌ها", href: "/instructor/courses", icon: BookOpen },
        {
          name: "آزمون‌ها و کوییزها",
          href: "/instructor/quizzes",
          icon: CheckSquare,
        },
        {
          name: "تکالیف و پروژه‌ها",
          href: "/instructor/assignments",
          icon: FileText,
        },
        { name: "کلاس‌های زنده", href: "/instructor/classes", icon: Video },
        { name: "دانشجویان من", href: "/instructor/students", icon: Users },
        {
          name: "اعلان‌ها و پیام‌ها",
          href: "/instructor/notifications",
          icon: Bell,
        },
        {
          name: "نظرات دانشجویان",
          href: "/instructor/comments",
          icon: MessageSquare,
        },
        {
          name: "کیف پول و تسویه‌حساب",
          href: "/instructor/wallet",
          icon: Wallet,
        },
        {
          name: "همکاری در فروش (رفرال)",
          href: "/instructor/referrals",
          icon: Share2,
        },
        { name: "مقالات وبلاگ", href: "/instructor/blog", icon: FileText },
        {
          name: "رزومه و سوابق مدرس",
          href: "/instructor/resume",
          icon: Award,
        },
        {
          name: "گزارش مالی و فروش",
          href: "/instructor/sales",
          icon: DollarSign,
        },
        profileLink,
      ];
    } else {
      return [
        { name: "داشبورد", href: "/student", icon: LayoutDashboard },
        { name: "دوره‌های من", href: "/student/courses", icon: BookOpen },
        { name: "کلاس‌های من", href: "/student/classes", icon: Video },
        { name: "کارنامه و نمرات", href: "/student/grades", icon: Award },
        { name: "پیشرفت تحصیلی", href: "/student/progress", icon: TrendingUp },
        { name: "کیف پول من", href: "/student/wallet", icon: Wallet },
        {
          name: "معرفی دوستان (کسب درآمد)",
          href: "/student/referrals",
          icon: Gift,
        },
        { name: "تکالیف", href: "/student/assignments", icon: FileText },
        { name: "آزمون‌ها", href: "/student/quizzes", icon: CheckSquare },
        { name: "پرداخت‌های من", href: "/student/orders", icon: CreditCard },
        { name: "علاقه‌مندی‌ها", href: "/student/favorites", icon: Heart },
        { name: "تیکت‌های پشتیبانی", href: "/student/support", icon: Ticket },
        { name: "اعلان‌ها", href: "/student/notifications", icon: Bell },
        profileLink,
      ];
    }
  };

  const navLinks = getNavLinks();

  return (
    <AuthGuard>
      <div className="flex h-screen bg-[var(--neo-bg)] overflow-hidden">
        {/* Mobile Sidebar Overlay */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 bg-gray-900/50 z-40 lg:hidden backdrop-blur-sm"
            onClick={closeMenu}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`
          fixed lg:static inset-y-0 right-0 z-50 ${isSidebarCollapsed ? "w-20" : "w-64"} bg-[var(--neo-surface)] border-l border-[var(--neo-border)] flex flex-col transform transition-all duration-300 ease-in-out
          ${mobileMenuOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"}
        `}
        >
          <div className="p-6 border-b border-[var(--neo-border)] flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2.5 overflow-hidden"
              onClick={closeMenu}
            >
              <img
                src={publicSettings?.siteLogo || "/logo.png"}
                alt={publicSettings?.siteName || "لوگو"}
                className={`${isSidebarCollapsed ? "w-8 h-8" : "h-9 max-w-[140px]"} object-contain shrink-0 rounded-lg`}
                onError={(e: any) => {
                  e.target.src = "/logo.png";
                }}
              />
              {!isSidebarCollapsed && (
                <span className="font-bold text-xl text-[var(--neo-text-main)] tracking-tight truncate">
                  {publicSettings?.siteName
                    ? publicSettings.siteName.split("|")[0].trim()
                    : "تک‌یاد"}
                </span>
              )}
            </Link>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="hidden lg:block text-[var(--neo-text-muted)] hover:text-[var(--neo-primary)] p-1.5 rounded-lg hover:bg-[var(--neo-surface-2)] transition"
                title={isSidebarCollapsed ? "باز کردن سایدبار" : "جمع کردن سایدبار"}
              >
                {isSidebarCollapsed ? (
                  <ChevronLeft className="w-5 h-5" />
                ) : (
                  <ChevronRight className="w-5 h-5" />
                )}
              </button>
              <button
                onClick={closeMenu}
                className="lg:hidden text-[var(--neo-text-muted)] hover:text-[var(--neo-primary)] p-1.5 rounded-lg hover:bg-[var(--neo-surface-2)] transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto p-4 space-y-1 hide-scrollbar">
            {navLinks.map((link) => {
              const Icon = link.icon;
              // Strict exact match for root dashboard paths, partial for others
              const isActive =
                link.href === "/student" ||
                link.href === "/admin" ||
                link.href === "/instructor" ||
                link.href === "/super-admin"
                  ? pathname === link.href
                  : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeMenu}
                  title={isSidebarCollapsed ? link.name : undefined}
                  className={`flex items-center ${isSidebarCollapsed ? "justify-center px-0" : "gap-3 px-4"} py-3 rounded-xl font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-[var(--neo-primary)] text-white shadow-md shadow-[var(--neo-primary)]/20"
                      : "text-[var(--neo-text-secondary)] hover:bg-[var(--neo-surface-2)] hover:text-[var(--neo-primary)]"
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 ${isActive ? "text-white" : "text-[var(--neo-text-muted)]"}`}
                  />
                  {!isSidebarCollapsed && link.name}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-[var(--neo-border)] bg-[var(--neo-bg)]">
            <button
              onClick={handleLogout}
              title={isSidebarCollapsed ? "خروج" : undefined}
              className={`flex items-center ${isSidebarCollapsed ? "justify-center px-0" : "gap-3 px-4"} py-3 w-full rounded-xl font-bold text-red-600 hover:bg-red-500/10 hover:text-red-700 transition-colors`}
            >
              <LogOut className="w-5 h-5" />
              {!isSidebarCollapsed && "خروج از حساب"}
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col h-full overflow-hidden w-full relative">
          {/* Header with Complete User Information & Controls */}
          <header className="bg-[var(--neo-surface)] border-b border-[var(--neo-border)] min-h-16 py-2.5 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs backdrop-blur-md bg-white/95">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="p-2 text-[var(--neo-text-muted)] hover:bg-[var(--neo-surface-2)] rounded-xl lg:hidden transition"
                title="منوی ناوبری"
              >
                <Menu className="w-6 h-6" />
              </button>

              <div className="flex items-center gap-3">
                <Link
                  href="/"
                  target="_blank"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-xs font-bold text-slate-700 transition"
                  title="مشاهده صفحه اصلی وب‌سایت در برگه جدید"
                >
                  <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                  <span>صفحه اصلی سایت</span>
                </Link>

                <div className="h-4 w-px bg-slate-200 hidden sm:block"></div>

                <div className="hidden md:flex items-center gap-2">
                  <span className="text-xs font-black text-slate-900">
                    {user?.role === "super-admin"
                      ? "پنل مدیریت کلان"
                      : user?.role === "admin"
                        ? "پنل مدیریت آموزشی"
                        : user?.role === "instructor"
                          ? "پنل اساتید و مدرسین"
                          : "پنل یادگیری دانشجو"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-3.5 relative">
              {/* Wallet Balance Pill */}
              <Link
                href={walletHref}
                className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-2xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100/80 transition text-[11px] sm:text-xs font-bold text-indigo-700 shadow-xs shrink-0"
                title="مشاهده و شارژ آنلاین کیف پول"
              >
                <Wallet className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-600 shrink-0" />
                <span className="hidden sm:inline">کیف پول:</span>
                <span className="font-black text-indigo-950 font-mono">
                  {(
                    (walletOverview?.balance ?? user?.walletBalance) ||
                    0
                  ).toLocaleString("fa-IR")}
                </span>
                <span className="text-[9px] sm:text-[10px] font-normal text-indigo-600 hidden xs:inline">
                  تومان
                </span>
              </Link>

              {/* Notifications */}
              <NotificationDropdown role={user?.role || "student"} />

              {/* Complete User Profile Card in Header */}
              <div className="flex items-center gap-1.5 sm:gap-2.5 pl-1 pr-1.5 sm:pr-2.5 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl transition group">
                <Link
                  href="/profile"
                  className="flex items-center gap-1.5 sm:gap-2.5"
                  title="مشاهده و ویرایش پروفایل کاربری"
                >
                  <div className="relative">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs sm:text-sm overflow-hidden shadow-xs shrink-0">
                      {user?.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.firstName || "کاربر"}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        user?.firstName?.charAt(0) || "U"
                      )}
                    </div>
                    <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 bg-emerald-500 border-2 border-white rounded-full absolute -bottom-0.5 -right-0.5"></span>
                  </div>

                  <div className="hidden sm:block text-right">
                    <div className="font-black text-xs text-slate-900 leading-tight truncate max-w-[100px] md:max-w-none">
                      {user?.firstName} {user?.lastName}
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md ${
                        user?.role === "super-admin"
                          ? "bg-amber-100 text-amber-800"
                          : user?.role === "admin"
                            ? "bg-blue-100 text-blue-800"
                            : user?.role === "instructor"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-purple-100 text-purple-800"
                      }`}>
                        {user?.role === "super-admin"
                          ? "مدیر ارشد"
                          : user?.role === "admin"
                            ? "مدیریت"
                            : user?.role === "instructor"
                              ? "استاد"
                              : "دانشجو"}
                      </span>
                    </div>
                  </div>
                </Link>

                <div className="h-4 w-px bg-slate-200 mr-1 hidden sm:block"></div>

                <button
                  onClick={handleLogout}
                  className="p-1 text-slate-400 hover:text-rose-600 rounded-lg transition"
                  title="خروج از حساب کاربری"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto bg-[var(--neo-bg)] p-3 sm:p-5 md:p-8 pb-24 lg:pb-8">
            <div className="max-w-7xl mx-auto">{children}</div>
          </div>

          {/* Student Mobile Bottom Navigation Bar */}
          {user?.role === "student" && (
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1 shadow-lg">
              <div className="grid grid-cols-5 items-center h-14">
                <Link
                  href="/student"
                  className={`flex flex-col items-center justify-center gap-0.5 py-1 rounded-xl transition ${
                    pathname === "/student"
                      ? "text-blue-600 font-bold"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  <LayoutDashboard className={`w-5 h-5 ${pathname === "/student" ? "text-blue-600" : "text-slate-400"}`} />
                  <span className="text-[10px]">داشبورد</span>
                </Link>

                <Link
                  href="/student/courses"
                  className={`flex flex-col items-center justify-center gap-0.5 py-1 rounded-xl transition ${
                    pathname.startsWith("/student/courses")
                      ? "text-blue-600 font-bold"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  <BookOpen className={`w-5 h-5 ${pathname.startsWith("/student/courses") ? "text-blue-600" : "text-slate-400"}`} />
                  <span className="text-[10px]">دوره‌ها</span>
                </Link>

                <Link
                  href="/student/classes"
                  className={`flex flex-col items-center justify-center gap-0.5 py-1 rounded-xl transition ${
                    pathname.startsWith("/student/classes")
                      ? "text-purple-600 font-bold"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  <Video className={`w-5 h-5 ${pathname.startsWith("/student/classes") ? "text-purple-600" : "text-slate-400"}`} />
                  <span className="text-[10px]">کلاس‌ها</span>
                </Link>

                <Link
                  href="/student/wallet"
                  className={`flex flex-col items-center justify-center gap-0.5 py-1 rounded-xl transition ${
                    pathname.startsWith("/student/wallet")
                      ? "text-indigo-600 font-bold"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  <Wallet className={`w-5 h-5 ${pathname.startsWith("/student/wallet") ? "text-indigo-600" : "text-slate-400"}`} />
                  <span className="text-[10px]">کیف پول</span>
                </Link>

                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(true)}
                  className="flex flex-col items-center justify-center gap-0.5 py-1 text-slate-500 hover:text-blue-600 rounded-xl transition"
                >
                  <Menu className="w-5 h-5 text-slate-400" />
                  <span className="text-[10px]">منو کامل</span>
                </button>
              </div>
            </nav>
          )}
        </main>
      </div>
    </AuthGuard>
  );
}
