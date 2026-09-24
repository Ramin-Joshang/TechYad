export const adminPaths = {
  '/admin/dashboard': {
    get: {
      tags: ['Admin & Super Admin (مدیریت کلان پلتفرم)'],
      summary: 'آمار کلان و داشبورد مرکزی مدیریت پلتفرم',
      description: 'دریافت آمار کاربران، دوره‌های فروخته شده، درآمد کل، تراکنش‌های اخیر و نمودار رشد.',
      security: [{ bearerAuth: [] }],
      responses: { '200': { description: 'آمار داشبورد مدیریت' } }
    }
  },
  '/admin/users': {
    get: {
      tags: ['Admin & Super Admin (مدیریت کلان پلتفرم)'],
      summary: 'فهرست و مدیریت کاربران با جستجو و صفحه‌بندی',
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
        { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
        { name: 'search', in: 'query', schema: { type: 'string' } },
        { name: 'role', in: 'query', schema: { type: 'string' } }
      ],
      responses: { '200': { description: 'فهرست کاربران' } }
    }
  },
  '/admin/users/{id}': {
    get: {
      tags: ['Admin & Super Admin (مدیریت کلان پلتفرم)'],
      summary: 'مشاهده پروفایل و تاریخچه فعالیت کاربر',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: { '200': { description: 'مشخصات کاربر' } }
    },
    patch: {
      tags: ['Admin & Super Admin (مدیریت کلان پلتفرم)'],
      summary: 'ویرایش اطلاعات پایه کاربر توسط ادمین',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: { '200': { description: 'اطلاعات کاربر به‌روزرسانی شد' } }
    }
  },
  '/admin/users/{id}/status': {
    patch: {
      tags: ['Admin & Super Admin (مدیریت کلان پلتفرم)'],
      summary: 'تغییر وضعیت حساب کاربری (فعال، مسدود، معلق)',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['status'],
              properties: {
                status: { type: 'string', enum: ['active', 'blocked', 'pending'] }
              }
            }
          }
        }
      },
      responses: { '200': { description: 'وضعیت کاربر تغییر کرد' } }
    }
  },
  '/admin/coupons': {
    get: {
      tags: ['Admin & Super Admin (مدیریت کلان پلتفرم)'],
      summary: 'فهرست کدهای تخفیف و کوپن‌های پلتفرم',
      security: [{ bearerAuth: [] }],
      responses: { '200': { description: 'لیست کوپن‌ها' } }
    },
    post: {
      tags: ['Admin & Super Admin (مدیریت کلان پلتفرم)'],
      summary: 'تعریف کد تخفیف جدید (درصدی یا مبلغ ثابت)',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['code', 'type', 'value'],
              properties: {
                code: { type: 'string', example: 'NOROOZ1404' },
                type: { type: 'string', enum: ['percentage', 'fixed'] },
                value: { type: 'number', example: 30 },
                maxDiscountAmount: { type: 'number', example: 200000 },
                expiresAt: { type: 'string', format: 'date-time' },
                usageLimit: { type: 'number', example: 100 }
              }
            }
          }
        }
      },
      responses: { '201': { description: 'کد تخفیف ایجاد شد' } }
    }
  },
  '/admin/coupons/{id}': {
    patch: {
      tags: ['Admin & Super Admin (مدیریت کلان پلتفرم)'],
      summary: 'ویرایش کد تخفیف',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: { '200': { description: 'کوپن به‌روزرسانی شد' } }
    },
    delete: {
      tags: ['Admin & Super Admin (مدیریت کلان پلتفرم)'],
      summary: 'حذف کد تخفیف',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: { '200': { description: 'کوپن حذف شد' } }
    }
  },
  '/admin/coupons/{id}/toggle': {
    patch: {
      tags: ['Admin & Super Admin (مدیریت کلان پلتفرم)'],
      summary: 'فعال یا غیرفعال‌سازی سریع کوپن',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: { '200': { description: 'وضعیت کوپن تغییر کرد' } }
    }
  },
  '/admin/orders': {
    get: {
      tags: ['Admin & Super Admin (مدیریت کلان پلتفرم)'],
      summary: 'فهرست کل سفارشات پلتفرم با فیلتر وضعیت و جستجو',
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'status', in: 'query', schema: { type: 'string', enum: ['all', 'paid', 'pending', 'failed'] } }
      ],
      responses: { '200': { description: 'لیست تمام سفارشات' } }
    }
  },
  '/admin/orders/{id}': {
    get: {
      tags: ['Admin & Super Admin (مدیریت کلان پلتفرم)'],
      summary: 'مشاهده فاکتور و جزئیات پرداخت سفارش برای ادمین',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: { '200': { description: 'اطلاعات سفارش' } }
    }
  },
  '/admin/orders/{id}/status': {
    patch: {
      tags: ['Admin & Super Admin (مدیریت کلان پلتفرم)'],
      summary: 'تغییر دستی وضعیت سفارش (paid, failed, refunded)',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: { '200': { description: 'وضعیت سفارش اصلاح شد' } }
    }
  },
  '/admin/revenue': {
    get: {
      tags: ['Admin & Super Admin (مدیریت کلان پلتفرم)'],
      summary: 'گزارش و تحلیل درآمدهای مالی، سهم مدرسان و سود پلتفرم',
      security: [{ bearerAuth: [] }],
      responses: { '200': { description: 'گزارش مالی پلتفرم' } }
    }
  },
  '/admin/reports/analytics': {
    get: {
      tags: ['Admin & Super Admin (مدیریت کلان پلتفرم)'],
      summary: 'گزارش تحلیلی جامع ثبت‌نام‌ها، دوره‌های محبوب و عملکرد ماهانه',
      security: [{ bearerAuth: [] }],
      responses: { '200': { description: 'داده‌های تحلیلی پلتفرم' } }
    }
  },
  '/super-admin/admins': {
    get: {
      tags: ['Super Admin (مدیران ارشد)'],
      summary: 'فهرست مدیران سیستم به همراه نقش‌ها و سطوح دسترسی',
      security: [{ bearerAuth: [] }],
      responses: { '200': { description: 'لیست مدیران' } }
    },
    post: {
      tags: ['Super Admin (مدیران ارشد)'],
      summary: 'تعریف و استخدام مدیر جدید در سیستم با نقش اختصاصی',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['firstName', 'lastName', 'email', 'password', 'roleId'],
              properties: {
                firstName: { type: 'string' },
                lastName: { type: 'string' },
                email: { type: 'string' },
                password: { type: 'string' },
                roleId: { type: 'string' }
              }
            }
          }
        }
      },
      responses: { '201': { description: 'مدیر جدید تعریف شد' } }
    }
  },
  '/super-admin/roles': {
    get: {
      tags: ['Super Admin (مدیران ارشد)'],
      summary: 'فهرست نقش‌ها (RBAC) و دسترسی‌های سیستمی',
      security: [{ bearerAuth: [] }],
      responses: { '200': { description: 'لیست نقش‌ها' } }
    },
    post: {
      tags: ['Super Admin (مدیران ارشد)'],
      summary: 'ایجاد نقش جدید با دسترسی‌های سفارشی',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['name', 'slug', 'permissions'],
              properties: {
                name: { type: 'string', example: 'مدیر محتوا' },
                slug: { type: 'string', example: 'content-manager' },
                permissions: { type: 'array', items: { type: 'string' } }
              }
            }
          }
        }
      },
      responses: { '201': { description: 'نقش ایجاد شد' } }
    }
  },
  '/settings/public': {
    get: {
      tags: ['System & General (سیستم و عمومی)'],
      summary: 'تنظیمات عمومی پلتفرم (نام سایت، اطلاعات تماس، درگاه‌ها)',
      responses: { '200': { description: 'تنظیمات عمومی سایت' } }
    }
  },
  '/super-admin/settings': {
    get: {
      tags: ['Super Admin (مدیران ارشد)'],
      summary: 'مشاهده تنظیمات امنیتی، درگاه‌ها، ایمیل و پیامک پلتفرم',
      security: [{ bearerAuth: [] }],
      responses: { '200': { description: 'تنظیمات پیشرفته' } }
    },
    patch: {
      tags: ['Super Admin (مدیران ارشد)'],
      summary: 'به‌روزرسانی تنظیمات حساس و پیکربندی پلتفرم',
      security: [{ bearerAuth: [] }],
      responses: { '200': { description: 'تنظیمات به‌روزرسانی شد' } }
    }
  }
};
