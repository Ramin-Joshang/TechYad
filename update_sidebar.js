const fs = require('fs');
let code = fs.readFileSync('frontend/src/app/(dashboard)/layout.tsx', 'utf8');

const itemsToRemove = [
  "{ name: 'پرداخت‌ها', href: '/super-admin/payments', icon: CreditCard },",
  "{ name: 'بلاگ', href: '/super-admin/blog', icon: FileText },",
  "{ name: 'لاگ‌های سیستم', href: '/super-admin/audit-logs', icon: Activity },",
  "{ name: 'امنیت', href: '/super-admin/security', icon: Shield },"
];

itemsToRemove.forEach(item => {
  code = code.replace(item, "");
});

fs.writeFileSync('frontend/src/app/(dashboard)/layout.tsx', code);
