export const generalPaths = {
  '/health': {
    get: {
      tags: ['System & General (سیستم و عمومی)'],
      summary: 'بررسی سلامت سرویس‌ها و وضعیت اتصال به پایگاه داده',
      description: 'ارائه وضعیت اتصال MongoDB، تایم‌استمپ سرور و بررسی کارکرد کلی بک‌اند.',
      responses: {
        '200': {
          description: 'وضعیت سلامت سیستم',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: {
                    type: 'object',
                    properties: {
                      timestamp: { type: 'string', example: '2026-09-24T20:50:00.000Z' },
                      api: { type: 'string', example: 'ok' },
                      database: { type: 'string', example: 'connected' }
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
  '/home': {
    get: {
      tags: ['System & General (سیستم و عمومی)'],
      summary: 'دریافت داده‌های کامل صفحه اصلی سایت',
      description: 'واکشی بنرهای اسلایدر، دوره‌های ویژه، پرفروش‌ترین‌ها، وبینارهای فعال، اساتید برتر و آمار کلان سایت.',
      responses: {
        '200': {
          description: 'داده‌های صفحه نخست پلتفرم تک‌یاد',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: {
                    type: 'object',
                    properties: {
                      featuredCourses: { type: 'array', items: { type: 'object' } },
                      upcomingClasses: { type: 'array', items: { type: 'object' } },
                      topInstructors: { type: 'array', items: { type: 'object' } },
                      platformStats: { type: 'object' }
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
  '/search': {
    get: {
      tags: ['System & General (سیستم و عمومی)'],
      summary: 'جستجوی سراسری و یکپارچه در تمام بخش‌های پلتفرم',
      description: 'جستجوی هوشمند به زبان فارسی در عناوین و متون دوره‌ها، کلاس‌های زنده، مقالات وبلاگ و اساتید.',
      parameters: [
        { name: 'q', in: 'query', required: true, schema: { type: 'string' }, description: 'عبارت جستجو' },
        { name: 'type', in: 'query', schema: { type: 'string', enum: ['all', 'courses', 'classes', 'articles', 'instructors'] }, description: 'فیلتر بر اساس نوع محتوا' }
      ],
      responses: {
        '200': {
          description: 'نتایج جستجوی جامع',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: {
                    type: 'object',
                    properties: {
                      courses: { type: 'array', items: { type: 'object' } },
                      classes: { type: 'array', items: { type: 'object' } },
                      articles: { type: 'array', items: { type: 'object' } },
                      instructors: { type: 'array', items: { type: 'object' } }
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
  '/faqs': {
    get: {
      tags: ['System & General (سیستم و عمومی)'],
      summary: 'دریافت پرسش‌ها و پاسخ‌های متداول (FAQ)',
      description: 'فهرست سوالات پرتکرار کاربران در خصوص ثبت‌نام، دوره‌ها، پرداخت‌ها، کیف پول و گواهینامه‌ها.',
      responses: {
        '200': { description: 'لیست سوالات متداول' }
      }
    }
  },
  '/contact': {
    post: {
      tags: ['System & General (سیستم و عمومی)'],
      summary: 'ثبت پیام در فرم تماس با ما',
      description: 'ارسال پیام، پیشنهادات و انتقادات کاربران برای واحد پشتیبانی و مدیریت.',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['name', 'email', 'subject', 'message'],
              properties: {
                name: { type: 'string', example: 'محمد علیزاده' },
                email: { type: 'string', example: 'mohammad@example.com' },
                phone: { type: 'string', example: '09123456789' },
                subject: { type: 'string', example: 'درخواست همکاری آموزشی' },
                message: { type: 'string', example: 'با سلام، تمایل به ارائه دوره‌های حوزه دیتا ساینس دارم...' }
              }
            }
          }
        }
      },
      responses: {
        '201': { description: 'پیام شما با موفقیت ثبت شد' }
      }
    }
  },
  '/careers': {
    post: {
      tags: ['System & General (سیستم و عمومی)'],
      summary: 'ارسال رزومه و درخواست تدریس / استخدام',
      description: 'ثبت اطلاعات متقاضی تدریس یا همکاری در تیم فنی و محتوای تک‌یاد.',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['name', 'email', 'position'],
              properties: {
                name: { type: 'string', example: 'سارا رضایی' },
                email: { type: 'string', example: 'sara@example.com' },
                phone: { type: 'string', example: '09129876543' },
                position: { type: 'string', example: 'مدرس دوره پایتون و هوش مصنوعی' },
                resumeUrl: { type: 'string', example: 'https://tecyad.ir/uploads/resume.pdf' },
                portfolioUrl: { type: 'string', example: 'https://github.com/example' },
                coverLetter: { type: 'string' }
              }
            }
          }
        }
      },
      responses: {
        '201': { description: 'رزومه با موفقیت ثبت شد' }
      }
    }
  }
};
