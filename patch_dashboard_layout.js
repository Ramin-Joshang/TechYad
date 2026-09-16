const fs = require('fs');
let code = fs.readFileSync('frontend/src/app/(dashboard)/layout.tsx', 'utf8');

// The instructor's links
const oldInstructorLinks = `      return [
        { name: 'داشبورد', href: '/instructor', icon: LayoutDashboard },
        { name: 'دوره‌های منتشر شده', href: '/instructor/courses/published', icon: CheckSquare },
        { name: 'دوره‌های پیش‌نویس', href: '/instructor/courses/draft', icon: FileText },
        { name: 'دوره‌های در انتظار', href: '/instructor/courses/pending', icon: Activity },
        { name: 'کلاس‌های من', href: '/instructor/classes', icon: Video },
        { name: 'دانشجویان من', href: '/instructor/students', icon: Users },
        { name: 'فروش ماهانه', href: '/instructor/sales/monthly', icon: BarChart },
        { name: 'فروش کل', href: '/instructor/sales', icon: DollarSign },
        profileLink
      ];`;

const newInstructorLinks = `      return [
        { name: 'داشبورد', href: '/instructor', icon: LayoutDashboard },
        { name: 'مدیریت دوره‌ها', href: '/instructor/courses', icon: BookOpen },
        { name: 'کلاس‌های زنده', href: '/instructor/classes', icon: Video },
        { name: 'دانشجویان من', href: '/instructor/students', icon: Users },
        { name: 'بررسی تکالیف', href: '/instructor/assignments', icon: FileText },
        { name: 'نظرات دانشجویان', href: '/instructor/comments', icon: MessageSquare },
        { name: 'گزارش مالی', href: '/instructor/sales', icon: DollarSign },
        profileLink
      ];`;

code = code.replace(oldInstructorLinks, newInstructorLinks);

// Add missing icon import MessageSquare
if (!code.includes('MessageSquare')) {
  code = code.replace("import { ", "import { MessageSquare, ");
}

fs.writeFileSync('frontend/src/app/(dashboard)/layout.tsx', code);
