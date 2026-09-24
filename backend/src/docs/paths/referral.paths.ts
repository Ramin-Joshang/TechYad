export const referralPaths = {
  '/referrals/validate/{code}': {
    get: {
      tags: ['Referral (همکاری در فروش و معرفی دوستان)'],
      summary: 'اعتبارسنجی کد رفرال یا نام کاربری معرف',
      description: 'بررسی صحت و فعال بودن کد معرف یا نام کاربری در هنگام ثبت‌نام یا پیش‌نمایش.',
      parameters: [
        { name: 'code', in: 'path', required: true, schema: { type: 'string' }, description: 'کد معرفی یا نام کاربری' }
      ],
      responses: {
        '200': {
          description: 'نتیجه اعتبارسنجی کد',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: {
                    type: 'object',
                    properties: {
                      valid: { type: 'boolean', example: true },
                      referrerName: { type: 'string', example: 'علی رضایی' },
                      welcomeBonus: { type: 'number', example: 50000 }
                    }
                  }
                }
              }
            }
          }
        },
        '404': { description: 'کد معرفی یافت نشد یا معتبر نیست' }
      }
    }
  },
  '/referrals/leaderboard': {
    get: {
      tags: ['Referral (همکاری در فروش و معرفی دوستان)'],
      summary: 'جدول رده‌بندی برترین همکاران و معرف‌های برتر پلتفرم',
      description: 'فهرست ۱۰ کاربر برتر بر اساس تعداد افراد دعوت‌شده و درآمد حاصل از همکاری در فروش به همراه بج‌های افتخاری.',
      responses: {
        '200': {
          description: 'فهرست لیدربورد با موفقیت دریافت شد',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        rank: { type: 'integer', example: 1 },
                        name: { type: 'string', example: 'سارا کاظمی' },
                        referralCount: { type: 'integer', example: 38 },
                        avatar: { type: 'string' }
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
  '/referrals/my-info': {
    get: {
      tags: ['Referral (همکاری در فروش و معرفی دوستان)'],
      summary: 'اطلاعات، آمار و لینک اختصاصی رفرال دانشجو',
      description: 'شامل کد معرفی اختصاصی، لینک ثبت‌نام مستقیم، مانده درآمد رفرال، تعداد افراد دعوت‌شده، درصد کمیسیون فعال و فهرست زیرمجموعه‌ها.',
      security: [{ bearerAuth: [] }],
      responses: {
        '200': {
          description: 'اطلاعات رفرال دانشجو',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: {
                    type: 'object',
                    properties: {
                      referralCode: { type: 'string', example: 'ALI2024' },
                      referralLink: { type: 'string', example: 'https://tecyad.ir/register?ref=ALI2024' },
                      totalEarnings: { type: 'number', example: 420000 },
                      availableBalance: { type: 'number', example: 120000 },
                      referralCount: { type: 'integer', example: 7 },
                      commissionRate: { type: 'number', example: 15 },
                      referrals: { type: 'array', items: { type: 'object' } }
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
  '/referrals/instructor-info': {
    get: {
      tags: ['Referral (همکاری در فروش و معرفی دوستان)'],
      summary: 'آمار رفرال و پیوندهای معرفی ویژه مدرسان',
      description: 'مشاهده آمار ثبت‌نام‌های انجام شده از طریق لینک ویژه دوره‌ها و کلاس‌های مدرس با درصد کمیسیون اختصاصی.',
      security: [{ bearerAuth: [] }],
      responses: {
        '200': { description: 'اطلاعات همکاری در فروش مدرس' }
      }
    }
  },
  '/referrals/request-payout': {
    post: {
      tags: ['Referral (همکاری در فروش و معرفی دوستان)'],
      summary: 'درخواست تسویه درآمد حاصل از همکاری در فروش',
      description: 'ثبت درخواست واریز درآمدهای رفرال به حساب بانکی به همراه ثبت در گردش کیف پول به عنوان تسویه در انتظار.',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['amount', 'shabaNumber'],
              properties: {
                amount: { type: 'number', minimum: 50000, example: 150000 },
                shabaNumber: { type: 'string', example: 'IR120120000000001234567890' },
                accountHolder: { type: 'string', example: 'علی رضایی' },
                bankName: { type: 'string', example: 'بانک پاسارگاد' }
              }
            }
          }
        }
      },
      responses: {
        '201': { description: 'درخواست تسویه درآمد رفرال ثبت شد' }
      }
    }
  },
  '/referrals/admin/overview': {
    get: {
      tags: ['Referral Admin (مدیریت رفرال)'],
      summary: 'داشبورد جامع و شاخص‌های کلیدی سیستم رفرال پلتفرم',
      description: 'آمار کل درآمدهای تولید شده از رفرال، مجموع پرداختی‌ها به معرف‌ها، نرخ تبدیل کاربران دعوت‌شده و تعداد ثبت‌نامی‌ها.',
      security: [{ bearerAuth: [] }],
      responses: {
        '200': { description: 'آمار کلان رفرال' }
      }
    }
  },
  '/referrals/admin/list': {
    get: {
      tags: ['Referral Admin (مدیریت رفرال)'],
      summary: 'فهرست تمامی رفرال‌ها و زیرمجموعه‌ها در سامانه با فیلتر',
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
        { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
        { name: 'search', in: 'query', schema: { type: 'string' } }
      ],
      responses: {
        '200': { description: 'لیست رفرال‌ها' }
      }
    }
  },
  '/referrals/admin/payouts': {
    get: {
      tags: ['Referral Admin (مدیریت رفرال)'],
      summary: 'فهرست درخواست‌های تسویه حساب رفرال',
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'status', in: 'query', schema: { type: 'string', enum: ['all', 'pending', 'paid', 'rejected'] } }
      ],
      responses: {
        '200': { description: 'فهرست درخواست‌های تسویه' }
      }
    }
  },
  '/referrals/admin/payouts/{id}': {
    patch: {
      tags: ['Referral Admin (مدیریت رفرال)'],
      summary: 'به‌روزرسانی وضعیت درخواست تسویه درآمد رفرال (تأیید یا رد)',
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['status'],
              properties: {
                status: { type: 'string', enum: ['paid', 'rejected'] },
                referenceNumber: { type: 'string', example: 'PAYA-112233' },
                adminNotes: { type: 'string', example: 'واریز شد' }
              }
            }
          }
        }
      },
      responses: {
        '200': { description: 'وضعیت تسویه به‌روزرسانی شد' }
      }
    }
  },
  '/referrals/admin/settings': {
    get: {
      tags: ['Referral Admin (مدیریت رفرال)'],
      summary: 'دریافت تنظیمات درصد کمیسیون، پاداش ثبت‌نام و قوانین رفرال',
      security: [{ bearerAuth: [] }],
      responses: {
        '200': { description: 'تنظیمات جاری رفرال' }
      }
    },
    put: {
      tags: ['Referral Admin (مدیریت رفرال)'],
      summary: 'به‌روزرسانی درصد کمیسیون و تنظیمات سیستم رفرال',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                defaultCommissionPercent: { type: 'number', example: 15 },
                instructorCommissionPercent: { type: 'number', example: 25 },
                refereeWelcomeCredit: { type: 'number', example: 30000 },
                referrerBonusOnFirstPurchase: { type: 'number', example: 50000 },
                minimumPayoutAmount: { type: 'number', example: 50000 },
                isSystemEnabled: { type: 'boolean', example: true }
              }
            }
          }
        }
      },
      responses: {
        '200': { description: 'تنظیمات با موفقیت ذخیره شد' }
      }
    }
  },
  '/referrals/admin/manual-bonus': {
    post: {
      tags: ['Referral Admin (مدیریت رفرال)'],
      summary: 'اعطای پاداش دستی یا کمیسیون تشویقی به کاربر توسط ادمین',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['userId', 'amount', 'title'],
              properties: {
                userId: { type: 'string' },
                amount: { type: 'number', example: 100000 },
                title: { type: 'string', example: 'پاداش دستی رکورد جذب مخاطب' },
                description: { type: 'string' }
              }
            }
          }
        }
      },
      responses: {
        '200': { description: 'پاداش با موفقیت به کیف پول کاربر اضافه شد' }
      }
    }
  }
};
