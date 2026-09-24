export const learningPaths = {
  '/dashboard': {
    get: {
      tags: ['Learning (میز یادگیری دانشجو)'],
      summary: 'دریافت داده‌های داشبورد آموزشی دانشجو',
      description: 'واکشی دوره‌های اخیر، تمرین‌های در انتظار، وضعیت پیشرفت و اعلان‌های آموزشی کاربر.',
      security: [{ bearerAuth: [] }],
      responses: {
        '200': { description: 'اطلاعات داشبورد دانشجو' }
      }
    }
  },
  '/enrollments': {
    get: {
      tags: ['Learning (میز یادگیری دانشجو)'],
      summary: 'دریافت فهرست تمام دوره‌های ثبت‌نامی دانشجو با جزئیات کامل',
      description: 'شامل عنوان دوره، مشخصات مدرس، درصد پیشرفت، آخرین جلسه مشاهده‌شده و تعداد جلسات سپری شده.',
      security: [{ bearerAuth: [] }],
      responses: {
        '200': { description: 'لیست دوره‌های ثبت‌نامی دانشجو' }
      }
    }
  },
  '/enrollments/{courseId}': {
    get: {
      tags: ['Learning (میز یادگیری دانشجو)'],
      summary: 'بررسی وضعیت ثبت‌نام و درصد پیشرفت دانشجو در یک دوره خاص',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'courseId', in: 'path', required: true, schema: { type: 'string' } }],
      responses: {
        '200': { description: 'اطلاعات ثبت‌نام دوره' }
      }
    }
  },
  '/enrollments/free/{courseId}': {
    post: {
      tags: ['Learning (میز یادگیری دانشجو)'],
      summary: 'ثبت‌نام مستقیم و آنی در دوره آموزشی رایگان',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'courseId', in: 'path', required: true, schema: { type: 'string' } }],
      responses: {
        '201': { description: 'ثبت‌نام در دوره رایگان با موفقیت انجام شد' }
      }
    }
  },
  '/lessons/{lessonId}': {
    get: {
      tags: ['Learning (میز یادگیری دانشجو)'],
      summary: 'دسترسی امن به محتوا، ویدیو و منابع جلسه آموزشی',
      description: 'اعتبارسنجی ثبت‌نام دانشجو و تولید لینک امن استریم ویدیو یا فایل‌های جلسه.',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'lessonId', in: 'path', required: true, schema: { type: 'string' } }],
      responses: {
        '200': { description: 'محتوای امن جلسه' },
        '403': { description: 'کاربر در این دوره ثبت‌نام نکرده است' }
      }
    }
  },
  '/progress/{lessonId}': {
    get: {
      tags: ['Learning (میز یادگیری دانشجو)'],
      summary: 'دریافت میزان پیشرفت و ثانیه‌های تماشا شده در این جلسه',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'lessonId', in: 'path', required: true, schema: { type: 'string' } }],
      responses: { '200': { description: 'اطلاعات پیشرفت جلسه' } }
    },
    post: {
      tags: ['Learning (میز یادگیری دانشجو)'],
      summary: 'به‌روزرسانی خودکار زمان تماشا و علامت‌گذاری تکمیل جلسه',
      description: 'ارسال ثانیه پخش شده، درصد مشاهده و محاسبه مجدد درصد پیشرفت کل دوره.',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'lessonId', in: 'path', required: true, schema: { type: 'string' } }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                watchedSeconds: { type: 'number', example: 345 },
                progress: { type: 'number', example: 85 },
                completed: { type: 'boolean', example: true }
              }
            }
          }
        }
      },
      responses: { '200': { description: 'پیشرفت جلسه ثبت شد' } }
    }
  }
};
