export const commercePaths = {
  '/me/cart': {
    get: {
      tags: ['Commerce (سبد خرید، تسویه و پرداخت)'],
      summary: 'دریافت محتویات سبد خرید کاربر جاری',
      description: 'واکشی آیتم‌های موجود در سبد خرید، محاسبه مجموع قیمت و تخفیف‌ها.',
      security: [{ bearerAuth: [] }],
      responses: {
        '200': {
          description: 'اطلاعات سبد خرید',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: {
                    type: 'object',
                    properties: {
                      items: { type: 'array', items: { type: 'object' } },
                      subtotal: { type: 'number' },
                      discountAmount: { type: 'number' },
                      totalAmount: { type: 'number' }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    delete: {
      tags: ['Commerce (سبد خرید، تسویه و پرداخت)'],
      summary: 'خالی کردن کامل سبد خرید',
      security: [{ bearerAuth: [] }],
      responses: { '200': { description: 'سبد خرید با موفقیت خالی شد' } }
    }
  },
  '/me/cart/items': {
    post: {
      tags: ['Commerce (سبد خرید، تسویه و پرداخت)'],
      summary: 'افزودن دوره یا کلاس به سبد خرید',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['itemType', 'itemId'],
              properties: {
                itemType: { type: 'string', enum: ['course', 'class'], example: 'course' },
                itemId: { type: 'string', example: '66f369d72728...' }
              }
            }
          }
        }
      },
      responses: { '201': { description: 'آیتم با موفقیت به سبد خرید افزوده شد' } }
    }
  },
  '/me/cart/items/{itemId}': {
    delete: {
      tags: ['Commerce (سبد خرید، تسویه و پرداخت)'],
      summary: 'حذف یک آیتم از سبد خرید',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'itemId', in: 'path', required: true, schema: { type: 'string' } }],
      responses: { '200': { description: 'آیتم از سبد خرید حذف شد' } }
    }
  },
  '/checkout/preview': {
    post: {
      tags: ['Commerce (سبد خرید، تسویه و پرداخت)'],
      summary: 'پیش‌نمایش صورت‌حساب، اعمال کوپن تخفیف و محاسبه کسر از کیف پول',
      description: 'محاسبه مبالغ نهایی، تخفیف کد کوپن، موجودی زنده کیف پول کاربر، سهم قابل کسر از کیف پول و باقیمانده پرداختی درگاه.',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: false,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                couponCode: { type: 'string', example: 'SPRING40' }
              }
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'پیش‌نمایش مالی پرداخت',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: {
                    type: 'object',
                    properties: {
                      items: { type: 'array', items: { type: 'object' } },
                      subtotal: { type: 'number', example: 1000000 },
                      discountAmount: { type: 'number', example: 200000 },
                      totalAmount: { type: 'number', example: 800000 },
                      couponCode: { type: 'string', example: 'SPRING40' },
                      walletBalance: { type: 'number', example: 300000 },
                      walletAmountApplicable: { type: 'number', example: 300000 },
                      remainingToPay: { type: 'number', example: 500000 }
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
  '/checkout/create': {
    post: {
      tags: ['Commerce (سبد خرید، تسویه و پرداخت)'],
      summary: 'ایجاد و ثبت نهایی سفارش (با پشتیبانی از پرداخت ترکیبی و کیف پول)',
      description: 'ثبت سفارش از روی آیتم‌های سبد خرید، کسر کوپن، و تفکیک خودکار سهم کیف پول (walletAmountApplied) و سهم درگاه شتاب (gatewayAmount) بر اساس پرچم useWallet.',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: false,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                couponCode: { type: 'string', example: 'SPRING40' },
                useWallet: { type: 'boolean', example: true, description: 'آیا از موجودی در دسترس کیف پول کسر شود؟' }
              }
            }
          }
        }
      },
      responses: {
        '201': {
          description: 'سفارش ثبت شد',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: {
                    type: 'object',
                    properties: {
                      _id: { type: 'string' },
                      totalAmount: { type: 'number' },
                      walletAmountApplied: { type: 'number' },
                      gatewayAmount: { type: 'number' },
                      paymentMethod: { type: 'string', enum: ['gateway', 'wallet', 'hybrid'] }
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
  '/me/orders': {
    get: {
      tags: ['Commerce (سبد خرید، تسویه و پرداخت)'],
      summary: 'فهرست سفارشات و صورت‌حساب‌های دانشجو به همراه اطلاعات پرداخت',
      description: 'واکشی سوابق سفارشات به همراه اطلاعات تراکنش‌های بانکی، کدهای رهگیری و وضعیت‌های مالی.',
      security: [{ bearerAuth: [] }],
      responses: {
        '200': { description: 'لیست سفارشات دانشجو' }
      }
    }
  },
  '/me/orders/{id}': {
    get: {
      tags: ['Commerce (سبد خرید، تسویه و پرداخت)'],
      summary: 'دریافت جزئیات کامل و اطلاعات صدور فاکتور رسمی سفارش',
      description: 'ارائه مشخصات خریدار، اقلام، مبالغ ناخالص و خالص، سهم کیف پول، شناسه شاپرک Authority و شماره RRN جهت چاپ و مشاهده فاکتور.',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      responses: { '200': { description: 'اطلاعات کامل فاکتور سفارش' } }
    }
  },
  '/payments/{orderId}/create': {
    post: {
      tags: ['Commerce (سبد خرید، تسویه و پرداخت)'],
      summary: 'ایجاد تراکنش پرداخت آنلاین شتاب برای سفارش (خالص یا ترکیبی)',
      description: 'تولید شناسه پرداخت و آدرس بازگشت درگاه شاپرک/زرین‌پال. در پرداخت ترکیبی تنها مبلغ باقیمانده به درگاه فرستاده می‌شود.',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'orderId', in: 'path', required: true, schema: { type: 'string' } }],
      responses: {
        '200': {
          description: 'آدرس اتصال به درگاه ایجاد شد',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: {
                    type: 'object',
                    properties: {
                      paymentUrl: { type: 'string' },
                      authority: { type: 'string' }
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
  '/payments/verify': {
    post: {
      tags: ['Commerce (سبد خرید، تسویه و پرداخت)'],
      summary: 'اعتبارسنجی و تأیید بازگشت از درگاه پرداخت شتاب (زرین‌پال)',
      description: 'تأیید تراکنش بانکی، فعال‌سازی دسترسی دوره‌ها/کلاس‌ها برای کاربر، کسر اتمیک سهم کیف پول در پرداخت ترکیبی، محاسبه کمیسیون رفرال و خالی کردن سبد خرید.',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['authority', 'status'],
              properties: {
                authority: { type: 'string', example: 'AUTH_1727211111_123' },
                status: { type: 'string', enum: ['OK', 'NOK'], example: 'OK' }
              }
            }
          }
        }
      },
      responses: {
        '200': { description: 'پرداخت با موفقیت تأیید شد و ثبت‌نام انجام پذیرفت' },
        '400': { description: 'پرداخت ناموفق بود یا سفارش منقضی شده است' }
      }
    }
  },
  '/instructor/sales': {
    get: {
      tags: ['Commerce (سبد خرید، تسویه و پرداخت)'],
      summary: 'گزارش و آمار فروش دوره‌ها و درآمدهای مدرس',
      security: [{ bearerAuth: [] }],
      responses: { '200': { description: 'آمار مالی و فروش مدرس' } }
    }
  }
};
