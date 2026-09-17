const fs = require('fs');

let code = fs.readFileSync('frontend/src/app/(dashboard)/layout.tsx', 'utf8');

// Update imports
if (!code.includes('ShieldAlert')) {
  code = code.replace(
    'import { \n  LayoutDashboard, Users, BookOpen, Video, FileText, \n  MessageSquare, DollarSign, Settings, LogOut, ChevronRight, \n  ChevronLeft, Menu, X, Bell, Heart, CreditCard, CheckSquare, \n  GraduationCap, Briefcase, List, Activity, Ticket\n} from \'lucide-react\';',
    'import { \n  LayoutDashboard, Users, BookOpen, Video, FileText, \n  MessageSquare, DollarSign, Settings, LogOut, ChevronRight, \n  ChevronLeft, Menu, X, Bell, Heart, CreditCard, CheckSquare, \n  GraduationCap, Briefcase, List, Activity, Ticket, ShieldAlert, Key, Tag, BarChart2, Shield\n} from \'lucide-react\';'
  );
}

// Update navLinks
code = code.replace(
  `if (user?.role === 'super-admin' || user?.role === 'admin') {
      return [
        { name: 'داشبورد', href: '/admin', icon: LayoutDashboard },
        { name: 'مدیریت کاربران', href: '/admin/users', icon: Users },
        { name: 'دانشجویان', href: '/admin/students', icon: GraduationCap },
        { name: 'اساتید', href: '/admin/instructors', icon: Briefcase },
        { name: 'کل دوره‌ها', href: '/admin/courses', icon: BookOpen },
        { name: 'دوره‌های منتشر شده', href: '/admin/courses/published', icon: CheckSquare },
        { name: 'دوره‌های در انتظار', href: '/admin/courses/pending', icon: Activity },
        { name: 'کلاس‌ها', href: '/admin/classes', icon: Video },
        { name: 'سفارشات', href: '/admin/orders', icon: List },
        { name: 'درآمد و مالی', href: '/admin/revenue', icon: DollarSign },
        { name: 'تیکت‌های پشتیبانی', href: '/admin/tickets', icon: Ticket },
        profileLink
      ];
    }`,
  `if (user?.role === 'super-admin') {
      return [
        { name: 'داشبورد کلان', href: '/super-admin', icon: LayoutDashboard },
        { name: 'مدیران و کارکنان', href: '/super-admin/admins', icon: ShieldAlert },
        { name: 'نقش‌ها و دسترسی‌ها', href: '/super-admin/roles', icon: Key },
        { name: 'کاربران', href: '/super-admin/users', icon: Users },
        { name: 'اساتید', href: '/super-admin/instructors', icon: Briefcase },
        { name: 'دوره‌ها', href: '/super-admin/courses', icon: BookOpen },
        { name: 'کلاس‌ها', href: '/super-admin/classes', icon: Video },
        { name: 'سفارشات', href: '/super-admin/orders', icon: List },
        { name: 'پرداخت‌ها', href: '/super-admin/payments', icon: CreditCard },
        { name: 'کد تخفیف', href: '/super-admin/coupons', icon: Tag },
        { name: 'بلاگ', href: '/super-admin/blog', icon: FileText },
        { name: 'پشتیبانی', href: '/super-admin/tickets', icon: Ticket },
        { name: 'گزارش‌ها', href: '/super-admin/reports', icon: BarChart2 },
        { name: 'لاگ‌های سیستم', href: '/super-admin/audit-logs', icon: Activity },
        { name: 'تنظیمات سیستم', href: '/super-admin/settings', icon: Settings },
        { name: 'امنیت', href: '/super-admin/security', icon: Shield },
        profileLink
      ];
    } else if (user?.role === 'admin') {
      return [
        { name: 'داشبورد', href: '/admin', icon: LayoutDashboard },
        { name: 'مدیریت کاربران', href: '/admin/users', icon: Users },
        { name: 'دانشجویان', href: '/admin/students', icon: GraduationCap },
        { name: 'اساتید', href: '/admin/instructors', icon: Briefcase },
        { name: 'کل دوره‌ها', href: '/admin/courses', icon: BookOpen },
        { name: 'دوره‌های منتشر شده', href: '/admin/courses/published', icon: CheckSquare },
        { name: 'دوره‌های در انتظار', href: '/admin/courses/pending', icon: Activity },
        { name: 'کلاس‌ها', href: '/admin/classes', icon: Video },
        { name: 'سفارشات', href: '/admin/orders', icon: List },
        { name: 'درآمد و مالی', href: '/admin/revenue', icon: DollarSign },
        { name: 'تیکت‌های پشتیبانی', href: '/admin/tickets', icon: Ticket },
        profileLink
      ];
    }`
);

// Fix link isActive matching
code = code.replace(
  `const isActive = (link.href === '/student' || link.href === '/admin' || link.href === '/instructor')
                ? pathname === link.href
                : pathname.startsWith(link.href);`,
  `const isActive = (link.href === '/student' || link.href === '/admin' || link.href === '/instructor' || link.href === '/super-admin')
                ? pathname === link.href
                : pathname.startsWith(link.href);`
);

fs.writeFileSync('frontend/src/app/(dashboard)/layout.tsx', code);
console.log('Layout updated');
