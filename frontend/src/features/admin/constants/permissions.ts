export const PERMISSION_GROUPS = [
  {
    group: 'کاربران و اعضا',
    permissions: [
      { id: 'users.read', label: 'مشاهده لیست کاربران' },
      { id: 'users.create', label: 'ایجاد کاربر جدید' },
      { id: 'users.update', label: 'ویرایش اطلاعات کاربران' },
      { id: 'users.delete', label: 'حذف کاربر' },
      { id: 'users.manage', label: 'مدیریت کامل کاربران (تعلیق، تغییر نقش)' }
    ]
  },
  {
    group: 'دوره‌ها و محتوای آموزشی',
    permissions: [
      { id: 'courses.read', label: 'مشاهده دوره‌ها' },
      { id: 'courses.create', label: 'ایجاد دوره' },
      { id: 'courses.update', label: 'ویرایش دوره‌ها' },
      { id: 'courses.delete', label: 'حذف دوره' },
      { id: 'courses.publish', label: 'تایید و انتشار دوره‌ها' }
    ]
  },
  {
    group: 'کلاس‌های زنده',
    permissions: [
      { id: 'classes.read', label: 'مشاهده کلاس‌ها' },
      { id: 'classes.create', label: 'ایجاد کلاس' },
      { id: 'classes.update', label: 'ویرایش اطلاعات کلاس' },
      { id: 'classes.delete', label: 'حذف کلاس' },
      { id: 'classes.manage', label: 'مدیریت ظرفیت و جلسات کلاس' }
    ]
  },
  {
    group: 'مالی و فروش',
    permissions: [
      { id: 'orders.read', label: 'مشاهده سفارشات' },
      { id: 'orders.manage', label: 'مدیریت سفارشات و لغو' },
      { id: 'payments.read', label: 'مشاهده تراکنش‌ها' },
      { id: 'payments.manage', label: 'مدیریت و استرداد وجه' },
      { id: 'coupons.manage', label: 'مدیریت کامل کدهای تخفیف' }
    ]
  },
  {
    group: 'پشتیبانی و ارتباطات',
    permissions: [
      { id: 'tickets.read', label: 'مشاهده تیکت‌ها' },
      { id: 'tickets.reply', label: 'پاسخ به تیکت‌ها' },
      { id: 'tickets.manage', label: 'مدیریت تیکت‌ها (بستن، ارجاع)' },
      { id: 'reviews.manage', label: 'تایید و حذف نظرات و نقدها' }
    ]
  },
  {
    group: 'بلاگ و محتوا',
    permissions: [
      { id: 'blog.read', label: 'مشاهده مقالات' },
      { id: 'blog.create', label: 'نوشتن مقاله' },
      { id: 'blog.update', label: 'ویرایش مقالات' },
      { id: 'blog.publish', label: 'انتشار مقاله' },
      { id: 'blog.delete', label: 'حذف مقاله' }
    ]
  },
  {
    group: 'تنظیمات و امنیت (ویژه)',
    permissions: [
      { id: 'settings.manage', label: 'تغییر تنظیمات اصلی سایت' },
      { id: 'roles.manage', label: 'مدیریت نقش‌ها و دسترسی‌ها' },
      { id: 'security.view', label: 'مشاهده لاگ‌های امنیتی' },
      { id: 'admin.access', label: 'دسترسی ورود به پنل مدیریت (پیش‌نیاز اجباری)' },
      { id: 'super_admin.access', label: 'دسترسی ریشه و تنظیمات کلان' }
    ]
  }
];

export const SYSTEM_ROLES = ['super-admin', 'admin', 'instructor', 'student', 'support'];
