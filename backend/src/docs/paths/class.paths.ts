export const classPaths = {
  '/classes': {
    get: {
      tags: ['Classes (کلاس‌ها و کارگاه‌های آنلاین/حضوری)'],
      summary: 'فهرست عمومی کلاس‌ها و وبینارهای تخصصی',
      description: 'واکشی وبینارهای فعال آنلاین و کارگاه‌های حضوری با فیلتر وضعیت و دسته‌بندی.',
      responses: { '200': { description: 'لیست کلاس‌ها' } }
    }
  },
  '/classes/{slug}': {
    get: {
      tags: ['Classes (کلاس‌ها و کارگاه‌های آنلاین/حضوری)'],
      summary: 'دریافت جزئیات کامل کلاس یا وبینار بر اساس اسلاگ',
      parameters: [{ name: 'slug', in: 'path', required: true, schema: { type: 'string' } }],
      responses: { '200': { description: 'مشخصات کامل کلاس' } }
    }
  },
  '/me/classes': {
    get: {
      tags: ['Classes (کلاس‌ها و کارگاه‌های آنلاین/حضوری)'],
      summary: 'فهرست کلاس‌ها و وبینارهای ثبت‌نامی دانشجو',
      description: 'واکشی کلاس‌های دانشجو به همراه مشخصات مدرس، زمان‌بندی برگزاری، پیوند ورود و وضعیت.',
      security: [{ bearerAuth: [] }],
      responses: { '200': { description: 'لیست کلاس‌های دانشجو' } }
    }
  },
  '/classes/{id}/enrollment': {
    get: {
      tags: ['Classes (کلاس‌ها و کارگاه‌های آنلاین/حضوری)'],
      summary: 'بررسی وضعیت ثبت‌نام کاربر جاری در کلاس',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: { '200': { description: 'وضعیت ثبت‌نام کلاس' } }
    }
  },
  '/classes/{id}/enroll-free': {
    post: {
      tags: ['Classes (کلاس‌ها و کارگاه‌های آنلاین/حضوری)'],
      summary: 'ثبت‌نام مستقیم در کلاس یا وبینار رایگان',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: { '201': { description: 'ثبت‌نام با موفقیت انجام شد' } }
    }
  },
  '/classes/{id}/join': {
    get: {
      tags: ['Classes (کلاس‌ها و کارگاه‌های آنلاین/حضوری)'],
      summary: 'دریافت لینک ورود مستقیم به اتاق وبینار و جلسه آنلاین',
      description: 'بررسی صحت ثبت‌نام و تولید پیوند هدایت به اسکای‌روم یا سرور وبینار اختصاصی تک‌یاد.',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: {
        '200': {
          description: 'پیوند ورود به جلسه آماده شد',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: {
                    type: 'object',
                    properties: {
                      meetingUrl: { type: 'string', example: 'https://skyroom.online/ch/tecyad/webinar-12' }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  '/instructor/classes': {
    get: {
      tags: ['Classes (Instructor) (مدیریت کلاس‌های مدرس)'],
      summary: 'فهرست کلاس‌ها و کارگاه‌های ایجاد شده توسط مدرس',
      security: [{ bearerAuth: [] }],
      responses: { '200': { description: 'لیست کلاس‌های مدرس' } }
    },
    post: {
      tags: ['Classes (Instructor) (مدیریت کلاس‌های مدرس)'],
      summary: 'تعریف و زمان‌بندی کلاس یا وبینار جدید',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['title', 'slug', 'mode', 'price', 'capacity'],
              properties: {
                title: { type: 'string', example: 'کارگاه معماری میکروسرویس با Node.js' },
                slug: { type: 'string', example: 'nodejs-microservices-workshop' },
                description: { type: 'string' },
                mode: { type: 'string', enum: ['online', 'in_person'] },
                price: { type: 'number', example: 450000 },
                capacity: { type: 'number', example: 40 },
                startDate: { type: 'string', format: 'date-time' },
                endDate: { type: 'string', format: 'date-time' },
                location: { type: 'string' },
                meetingLink: { type: 'string' }
              }
            }
          }
        }
      },
      responses: { '201': { description: 'کلاس با موفقیت ایجاد شد' } }
    }
  },
  '/instructor/classes/{id}': {
    patch: {
      tags: ['Classes (Instructor) (مدیریت کلاس‌های مدرس)'],
      summary: 'ویرایش مشخصات کلاس توسط مدرس',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: { '200': { description: 'کلاس به‌روزرسانی شد' } }
    },
    delete: {
      tags: ['Classes (Instructor) (مدیریت کلاس‌های مدرس)'],
      summary: 'حذف کلاس توسط مدرس',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: { '200': { description: 'کلاس حذف شد' } }
    }
  },
  '/admin/classes': {
    get: {
      tags: ['Classes Admin (مدیریت کلان کلاس‌ها)'],
      summary: 'فهرست تمامی کلاس‌ها و ظرفیت‌های پلتفرم برای ادمین',
      security: [{ bearerAuth: [] }],
      responses: { '200': { description: 'لیست کلاس‌ها' } }
    },
    post: {
      tags: ['Classes Admin (مدیریت کلان کلاس‌ها)'],
      summary: 'ایجاد مستقیم کلاس توسط مدیریت پلتفرم',
      security: [{ bearerAuth: [] }],
      responses: { '201': { description: 'کلاس ایجاد شد' } }
    }
  },
  '/admin/classes/{id}': {
    patch: {
      tags: ['Classes Admin (مدیریت کلان کلاس‌ها)'],
      summary: 'ویرایش و اصلاح کلاس توسط ادمین',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: { '200': { description: 'کلاس اصلاح شد' } }
    },
    delete: {
      tags: ['Classes Admin (مدیریت کلان کلاس‌ها)'],
      summary: 'حذف کلاس توسط ادمین',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: { '200': { description: 'کلاس حذف شد' } }
    }
  }
};
