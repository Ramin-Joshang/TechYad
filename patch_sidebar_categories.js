const fs = require('fs');
let code = fs.readFileSync('frontend/src/app/(dashboard)/layout.tsx', 'utf8');

if (!code.includes("{ name: 'دسته‌بندی‌ها', href: '/super-admin/categories', icon: List }")) {
  code = code.replace(
    "{ name: 'دوره‌ها', href: '/super-admin/courses', icon: BookOpen },",
    "{ name: 'دوره‌ها', href: '/super-admin/courses', icon: BookOpen },\n        { name: 'دسته‌بندی‌ها', href: '/super-admin/categories', icon: List },"
  );
}

if (!code.includes("{ name: 'دسته‌بندی‌ها', href: '/admin/categories', icon: List }")) {
  code = code.replace(
    "{ name: 'کل دوره‌ها', href: '/admin/courses', icon: BookOpen },",
    "{ name: 'دسته‌بندی‌ها', href: '/admin/categories', icon: List },\n        { name: 'کل دوره‌ها', href: '/admin/courses', icon: BookOpen },"
  );
}

fs.writeFileSync('frontend/src/app/(dashboard)/layout.tsx', code);
