export const assessmentPaths = {
  // --- Student Assignments ---
  '/lessons/{lessonId}/assignments': {
    get: {
      tags: ['Assignments (تمرین‌ها و تکالیف)'],
      summary: 'دریافت تمرین‌های تعریف شده برای یک درس',
      parameters: [{ name: 'lessonId', in: 'path', required: true, schema: { type: 'string' } }],
      responses: { '200': { description: 'لیست تمرین‌ها' } }
    }
  },
  '/me/assignments': {
    get: {
      tags: ['Assignments (تمرین‌ها و تکالیف)'],
      summary: 'فهرست تمامی تمرین‌های دوره‌های من',
      security: [{ bearerAuth: [] }],
      responses: { '200': { description: 'فهرست تکالیف دانشجو' } }
    }
  },
  '/me/assignments/{id}': {
    get: {
      tags: ['Assignments (تمرین‌ها و تکالیف)'],
      summary: 'مشاهده جزئیات یک تمرین به همراه پاسخ‌های ارسال‌شده و نمره',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: { '200': { description: 'جزئیات تمرین و نمره' } }
    }
  },
  '/assignments/{assignmentId}/submit': {
    post: {
      tags: ['Assignments (تمرین‌ها و تکالیف)'],
      summary: 'ارسال پاسخ و تحویل تکلیف توسط دانشجو',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'assignmentId', in: 'path', required: true, schema: { type: 'string' } }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                answerText: { type: 'string', example: 'کد تمرین حل شده به همراه توضیحات متدولوژی' },
                attachments: { type: 'array', items: { type: 'string' }, example: ['https://tecyad.ir/uploads/solution.zip'] }
              }
            }
          }
        }
      },
      responses: { '201': { description: 'تکلیف با موفقیت ارسال شد' } }
    }
  },
  '/me/submissions': {
    get: {
      tags: ['Assignments (تمرین‌ها و تکالیف)'],
      summary: 'مشاهده تمامی پاسخ‌های ارسالی من برای تکالیف',
      security: [{ bearerAuth: [] }],
      responses: { '200': { description: 'فهرست پاسخ‌های دانشجو' } }
    }
  },

  // --- Instructor Assignments ---
  '/instructor/assignments': {
    get: {
      tags: ['Assignments (Instructor) (مدیریت تکالیف مدرس)'],
      summary: 'فهرست تمرین‌های ایجاد شده توسط مدرس',
      security: [{ bearerAuth: [] }],
      responses: { '200': { description: 'لیست تمرین‌های مدرس' } }
    },
    post: {
      tags: ['Assignments (Instructor) (مدیریت تکالیف مدرس)'],
      summary: 'تعریف یک تکلیف جدید برای دوره',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['title', 'courseId'],
              properties: {
                title: { type: 'string', example: 'پیاده‌سازی فروشگاه با Redux Toolkit' },
                description: { type: 'string', example: 'در این پروژه باید استیت‌های سبد خرید را...' },
                courseId: { type: 'string' },
                lessonId: { type: 'string' },
                dueDate: { type: 'string', format: 'date-time' },
                maxScore: { type: 'number', default: 100 }
              }
            }
          }
        }
      },
      responses: { '201': { description: 'تکلیف جدید ایجاد شد' } }
    }
  },
  '/instructor/lessons/{lessonId}/assignments': {
    post: {
      tags: ['Assignments (Instructor) (مدیریت تکالیف مدرس)'],
      summary: 'اتصال تکلیف به جلسه مشخصی از دوره',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'lessonId', in: 'path', required: true, schema: { type: 'string' } }],
      responses: { '201': { description: 'تکلیف به جلسه اضافه شد' } }
    }
  },
  '/instructor/submissions': {
    get: {
      tags: ['Assignments (Instructor) (مدیریت تکالیف مدرس)'],
      summary: 'مشاهده تمامی پاسخ‌های ارسالی دانشجویان برای تصحیح',
      security: [{ bearerAuth: [] }],
      responses: { '200': { description: 'فهرست ارسال‌های در انتظار نمره‌دهی' } }
    }
  },
  '/instructor/assignments/{assignmentId}/submissions': {
    get: {
      tags: ['Assignments (Instructor) (مدیریت تکالیف مدرس)'],
      summary: 'مشاهده پاسخ‌های ارسال‌شده برای یک تمرین خاص',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'assignmentId', in: 'path', required: true, schema: { type: 'string' } }],
      responses: { '200': { description: 'پاسخ‌های دانشجویان' } }
    }
  },
  '/instructor/submissions/{submissionId}/grade': {
    patch: {
      tags: ['Assignments (Instructor) (مدیریت تکالیف مدرس)'],
      summary: 'ثبت نمره و بازخورد متنی برای تمرین دانشجو',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'submissionId', in: 'path', required: true, schema: { type: 'string' } }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['score'],
              properties: {
                score: { type: 'number', example: 95 },
                feedback: { type: 'string', example: 'عالی بود، بهینه‌سازی توابع خیلی خوب انجام شده بود.' }
              }
            }
          }
        }
      },
      responses: { '200': { description: 'نمره با موفقیت ثبت شد' } }
    }
  },
  '/instructor/assignments/{assignmentId}': {
    patch: {
      tags: ['Assignments (Instructor) (مدیریت تکالیف مدرس)'],
      summary: 'ویرایش مشخصات تکلیف',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'assignmentId', in: 'path', required: true, schema: { type: 'string' } }],
      responses: { '200': { description: 'تکلیف به‌روزرسانی شد' } }
    },
    delete: {
      tags: ['Assignments (Instructor) (مدیریت تکالیف مدرس)'],
      summary: 'حذف تکلیف',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'assignmentId', in: 'path', required: true, schema: { type: 'string' } }],
      responses: { '200': { description: 'تکلیف حذف شد' } }
    }
  },

  // --- Student Quizzes ---
  '/me/quizzes': {
    get: {
      tags: ['Quizzes (آزمون‌ها و کوییزها)'],
      summary: 'فهرست آزمون‌های دوره‌های دانشجو',
      security: [{ bearerAuth: [] }],
      responses: { '200': { description: 'لیست آزمون‌ها' } }
    }
  },
  '/me/quizzes/{quizId}': {
    get: {
      tags: ['Quizzes (آزمون‌ها و کوییزها)'],
      summary: 'مشاهده مشخصات آزمون (بدون فاش شدن گزینه‌های صحیح)',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'quizId', in: 'path', required: true, schema: { type: 'string' } }],
      responses: { '200': { description: 'مشخصات آزمون' } }
    }
  },
  '/me/quizzes/{quizId}/start': {
    post: {
      tags: ['Quizzes (آزمون‌ها و کوییزها)'],
      summary: 'شروع آزمون و آغاز محاسبه زمان آزمون',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'quizId', in: 'path', required: true, schema: { type: 'string' } }],
      responses: { '200': { description: 'آزمون آغاز شد' } }
    }
  },
  '/me/quizzes/{quizId}/submit': {
    post: {
      tags: ['Quizzes (آزمون‌ها و کوییزها)'],
      summary: 'ارسال گزینه‌های انتخابی و اتمام آزمون',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'quizId', in: 'path', required: true, schema: { type: 'string' } }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                answers: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      questionId: { type: 'string' },
                      selectedOptionIds: { type: 'array', items: { type: 'string' } }
                    }
                  }
                }
              }
            }
          }
        }
      },
      responses: { '200': { description: 'آزمون با موفقیت ثبت و تصحیح شد' } }
    }
  },
  '/me/quizzes/{quizId}/result': {
    get: {
      tags: ['Quizzes (آزمون‌ها و کوییزها)'],
      summary: 'مشاهده کارنامه، نمره نهایی و تحلیل پاسخ‌ها',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'quizId', in: 'path', required: true, schema: { type: 'string' } }],
      responses: { '200': { description: 'کارنامه آزمون' } }
    }
  },

  // --- Instructor Quizzes ---
  '/instructor/quizzes': {
    get: {
      tags: ['Quizzes (Instructor) (مدیریت آزمون‌های مدرس)'],
      summary: 'فهرست آزمون‌های ساخته شده توسط مدرس',
      security: [{ bearerAuth: [] }],
      responses: { '200': { description: 'فهرست کوییزهای مدرس' } }
    },
    post: {
      tags: ['Quizzes (Instructor) (مدیریت آزمون‌های مدرس)'],
      summary: 'طراحی آزمون تستی ۴ گزینه‌ای جدید',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['title', 'courseId', 'questions'],
              properties: {
                title: { type: 'string', example: 'آزمون پایان فصل جاوااسکریپت پیشرفته' },
                courseId: { type: 'string' },
                timeLimitMinutes: { type: 'number', example: 30 },
                passingScore: { type: 'number', example: 70 },
                questions: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      questionText: { type: 'string' },
                      options: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            text: { type: 'string' },
                            isCorrect: { type: 'boolean' }
                          }
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
      responses: { '201': { description: 'آزمون ایجاد شد' } }
    }
  },
  '/instructor/quizzes/{quizId}': {
    get: {
      tags: ['Quizzes (Instructor) (مدیریت آزمون‌های مدرس)'],
      summary: 'مشاهده سوالات و کلید آزمون توسط مدرس',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'quizId', in: 'path', required: true, schema: { type: 'string' } }],
      responses: { '200': { description: 'اطلاعات کامل آزمون' } }
    },
    patch: {
      tags: ['Quizzes (Instructor) (مدیریت آزمون‌های مدرس)'],
      summary: 'ویرایش سوالات و تنظیمات آزمون',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'quizId', in: 'path', required: true, schema: { type: 'string' } }],
      responses: { '200': { description: 'آزمون به‌روزرسانی شد' } }
    },
    delete: {
      tags: ['Quizzes (Instructor) (مدیریت آزمون‌های مدرس)'],
      summary: 'حذف آزمون',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'quizId', in: 'path', required: true, schema: { type: 'string' } }],
      responses: { '200': { description: 'آزمون حذف شد' } }
    }
  },
  '/instructor/quizzes/{quizId}/attempts': {
    get: {
      tags: ['Quizzes (Instructor) (مدیریت آزمون‌های مدرس)'],
      summary: 'فهرست نمرات و کارنامه‌های دانشجویان در این آزمون',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'quizId', in: 'path', required: true, schema: { type: 'string' } }],
      responses: { '200': { description: 'لیست تلاش‌های دانشجویان' } }
    }
  }
};
