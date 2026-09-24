import { authPaths } from './paths/auth.paths.js';
import { catalogPaths } from './paths/catalog.paths.js';
import { coursesPaths } from './paths/courses.paths.js';
import { learningPaths } from './paths/learning.paths.js';
import { commercePaths } from './paths/commerce.paths.js';
import { communityPaths } from './paths/community.paths.js';
import { mediaPaths } from './paths/media.paths.js';
import { blogPaths } from './paths/blog.paths.js';
import { notificationPaths } from './paths/notification.paths.js';
import { supportPaths } from './paths/support.paths.js';
import { classPaths } from './paths/class.paths.js';
import { adminPaths } from './paths/admin.paths.js';
import { instructorPaths } from './paths/instructor.paths.js';
import { commentPaths } from './paths/comment.paths.js';
import { walletPaths } from './paths/wallet.paths.js';
import { referralPaths } from './paths/referral.paths.js';
import { assessmentPaths } from './paths/assessment.paths.js';
import { generalPaths } from './paths/general.paths.js';

export const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Tecyad API — سامانه جامع آموزش و مدیریت یادگیری تک‌یاد',
    version: '1.0.0',
    description: `
مستندات کامل و یکپارچه تمامی وب‌سرویس‌های پلتفرم آموزشی تک‌یاد (Tecyad).

### ویژگی‌ها و بخش‌های کلیدی:
- **احراز هویت و کاربران (Auth):** ثبت‌نام، ورود، رفرش توکن، بازنشانی رمز و مدیریت نشست‌ها.
- **کیف پول دیجیتال (Wallet):** موجودی زنده، شارژ آنلاین شتاب، تراکنش‌ها، پرداخت آنی دوره‌ها، تسویه شبا و پنل مدیریت مالی.
- **همکاری در فروش و رفرال (Referral & Affiliate):** کدهای معرفی، لیدربورد، کمیسیون خرید، پاداش ثبت‌نام و تسویه‌ها.
- **سبد خرید و درگاه پرداخت (Commerce):** تسویه حساب، تخفیف، پرداخت ترکیبی (کسر هوشمند کیف پول + درگاه شتاب) و صدور فاکتور رسمی.
- **میز یادگیری و دوره‌ها (Learning & Courses):** سرفصل‌ها، ویدیوهای امن، پیگیری پیشرفت دروس و گواهی پایان دوره.
- **کلاس‌ها و کارگاه‌ها (Classes):** وبینارهای تعاملی آنلاین، کارگاه‌های حضوری، ظرفیت‌ها و ورود به جلسات زنده.
- **تکالیف و آزمون‌ها (Assignments & Quizzes):** سیستم ارزیابی دانشجو، نمره‌دهی مدرس و کارنامه تحلیلی.
- **وبلاگ و عمومی (Blog & General):** مقالات، جستجوی سراسری، تماس با ما، رزومه‌ها و پرسش‌های متداول.
- **مدیریت کلان (Admin & Super Admin):** کنترل کاربران، نقش‌ها (RBAC)، درآمدها، گزارش‌های تحلیلی و تنظیمات.
    `,
    contact: {
      name: 'تیم فنی و توسعه تک‌یاد',
      url: 'https://tecyad.ir',
      email: 'support@tecyad.ir'
    }
  },
  servers: [
    { url: '/api/v1', description: 'سرور اصلی نسخه ۱ (/api/v1)' }
  ],
  tags: [
    { name: 'Auth', description: 'احراز هویت، ورود، ثبت‌نام و نشست‌ها' },
    { name: 'Wallet (کیف پول)', description: 'موجودی زنده، شارژ شتاب، پرداخت سفارش، تسویه به شبا' },
    { name: 'Wallet Admin (مدیریت کیف پول)', description: 'آمار مالی کلان پلتفرم، مبالغ تسویه، تعدیل دستی و گزارش‌ها' },
    { name: 'Referral (همکاری در فروش و معرفی دوستان)', description: 'کدهای اختصاصی، جدول رده‌بندی، پورسانت‌ها و درخواست تسویه' },
    { name: 'Referral Admin (مدیریت رفرال)', description: 'مدیریت رفرال‌ها، تسویه‌ها و تنظیم درصد کمیسیون‌ها' },
    { name: 'Commerce (سبد خرید، تسویه و پرداخت)', description: 'سبد خرید، کوپن، پرداخت ترکیبی، سفارشات و فاکتورها' },
    { name: 'Learning (میز یادگیری دانشجو)', description: 'داشبورد دانشجو، دوره‌های ثبت‌نامی، پیشرفت دروس و استریم امن' },
    { name: 'Classes (کلاس‌ها و کارگاه‌های آنلاین/حضوری)', description: 'مشاهده، ثبت‌نام و پیوند ورود به وبینارها و جلسات زنده' },
    { name: 'Classes (Instructor) (مدیریت کلاس‌های مدرس)', description: 'تعریف و زمان‌بندی کلاس‌ها و جلسات توسط مدرس' },
    { name: 'Classes Admin (مدیریت کلان کلاس‌ها)', description: 'مدیریت کلان ظرفیت‌ها و کلاس‌های سراسر پلتفرم' },
    { name: 'Assignments (تمرین‌ها و تکالیف)', description: 'دریافت تمرین‌های دوره و ارسال پاسخ توسط دانشجو' },
    { name: 'Assignments (Instructor) (مدیریت تکالیف مدرس)', description: 'طراحی تکلیف، مشاهده پاسخ‌ها و ثبت نمره و فیدبک' },
    { name: 'Quizzes (آزمون‌ها و کوییزها)', description: 'شرکت در آزمون‌های تستی، محاسبه زمان و دریافت کارنامه' },
    { name: 'Quizzes (Instructor) (مدیریت آزمون‌های مدرس)', description: 'طراحی کوییز ۴ گزینه‌ای، کلید سوالات و مشاهده نمرات' },
    { name: 'Courses', description: 'کاتالوگ و مشخصات دوره‌های آموزشی' },
    { name: 'Catalog', description: 'دسته‌بندی‌ها و فیلترهای آموزشی' },
    { name: 'Blog', description: 'مقالات، دسته‌ها و دیدگاه‌های وبلاگ' },
    { name: 'Community', description: 'انجمن و پرسش‌وپاسخ دانشجویان' },
    { name: 'Support', description: 'تیکت‌ها و پشتیبانی کاربران' },
    { name: 'Notifications', description: 'اعلان‌های درون‌برنامه‌ای و سیستمی' },
    { name: 'Media', description: 'آپلود فایل، تصاویر و اسناد' },
    { name: 'System & General (سیستم و عمومی)', description: 'بررسی سلامت سرور، داده‌های صفحه اول، جستجوی سراسری و فرم‌ها' },
    { name: 'Admin & Super Admin (مدیریت کلان پلتفرم)', description: 'داشبورد مدیریت، آمار، مدیریت کاربران، نقش‌ها و تنظیمات' }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'توکن دسترسی JWT را در قالب Bearer <token> وارد نمایید یا از کوکی‌های فعال مرورگر استفاده کنید.'
      }
    }
  },
  paths: {
    ...generalPaths,
    ...authPaths,
    ...walletPaths,
    ...referralPaths,
    ...commercePaths,
    ...learningPaths,
    ...assessmentPaths,
    ...classPaths,
    ...coursesPaths,
    ...catalogPaths,
    ...blogPaths,
    ...communityPaths,
    ...supportPaths,
    ...notificationPaths,
    ...mediaPaths,
    ...adminPaths,
    ...instructorPaths,
    ...commentPaths
  }
};
