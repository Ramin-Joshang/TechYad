export const walletPaths = {
  '/wallet/overview': {
    get: {
      tags: ['Wallet (کیف پول)'],
      summary: 'دریافت خلاصه حساب و موجودی زنده کیف پول کاربر',
      description: 'ارائه موجودی فعلی، آمار کل واریزها، پرداخت‌های دوره‌ها، درآمدهای حاصل از رفرال، مبالغ در انتظار تسویه، مبالغ پیش‌فرض شارژ سریع و آخرین تراکنش‌های کاربر.',
      security: [{ bearerAuth: [] }],
      responses: {
        '200': {
          description: 'اطلاعات کیف پول با موفقیت دریافت شد',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: {
                    type: 'object',
                    properties: {
                      balance: { type: 'number', example: 450000, description: 'موجودی فعلی به تومان' },
                      stats: {
                        type: 'object',
                        properties: {
                          totalCredited: { type: 'number', example: 1200000 },
                          totalDebited: { type: 'number', example: 750000 },
                          totalDeposits: { type: 'number', example: 500000 },
                          totalSpentOnOrders: { type: 'number', example: 600000 },
                          totalReferralEarnings: { type: 'number', example: 700000 },
                          pendingWithdrawalAmount: { type: 'number', example: 150000 },
                          pendingWithdrawalCount: { type: 'number', example: 1 }
                        }
                      },
                      quickDepositPresets: {
                        type: 'array',
                        items: { type: 'number' },
                        example: [50000, 100000, 200000, 500000, 1000000, 2000000]
                      },
                      recentTransactions: { type: 'array', items: { type: 'object' } }
                    }
                  }
                }
              }
            }
          }
        },
        '401': { description: 'کاربر احراز هویت نشده است' }
      }
    }
  },
  '/wallet/transactions': {
    get: {
      tags: ['Wallet (کیف پول)'],
      summary: 'فهرست تراکنش‌های کیف پول با فیلتر و صفحه‌بندی',
      description: 'امکان فیلتر بر اساس نوع تراکنش (deposit, purchase, referral_reward, referral_welcome, withdraw, refund, manual_adjust)، جهت (credit/debit)، وضعیت (pending, completed, failed, rejected)، بازه زمانی و صفحه‌بندی.',
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'page', in: 'query', schema: { type: 'integer', default: 1 }, description: 'شماره صفحه' },
        { name: 'limit', in: 'query', schema: { type: 'integer', default: 15 }, description: 'تعداد در هر صفحه' },
        { name: 'type', in: 'query', schema: { type: 'string', enum: ['all', 'deposit', 'purchase', 'referral_reward', 'referral_welcome', 'withdraw', 'refund', 'manual_adjust'] } },
        { name: 'direction', in: 'query', schema: { type: 'string', enum: ['all', 'credit', 'debit'] } },
        { name: 'status', in: 'query', schema: { type: 'string', enum: ['all', 'pending', 'completed', 'failed', 'rejected'] } },
        { name: 'startDate', in: 'query', schema: { type: 'string', format: 'date' }, description: 'تاریخ شروع (YYYY-MM-DD)' },
        { name: 'endDate', in: 'query', schema: { type: 'string', format: 'date' }, description: 'تاریخ پایان (YYYY-MM-DD)' }
      ],
      responses: {
        '200': {
          description: 'فهرست تراکنش‌ها و متادیتای صفحه‌بندی',
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
                      pagination: {
                        type: 'object',
                        properties: {
                          page: { type: 'integer', example: 1 },
                          limit: { type: 'integer', example: 15 },
                          total: { type: 'integer', example: 42 },
                          totalPages: { type: 'integer', example: 3 }
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
    }
  },
  '/wallet/charge': {
    post: {
      tags: ['Wallet (کیف پول)'],
      summary: 'شروع فرآیند شارژ آنلاین کیف پول از طریق درگاه شتاب',
      description: 'ایجاد تراکنش و تولید شناسه یکتای پرداخت (Authority) برای هدایت کاربر به درگاه بانکی شاپرک (زرین‌پال). حداقل مبلغ ۱۰,۰۰۰ تومان.',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['amount'],
              properties: {
                amount: { type: 'number', minimum: 10000, example: 200000, description: 'مبلغ شارژ به تومان' }
              }
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'لینک اتصال به درگاه ایجاد شد',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: {
                    type: 'object',
                    properties: {
                      transactionId: { type: 'string' },
                      authority: { type: 'string' },
                      paymentUrl: { type: 'string', example: '/payment/mock-gateway?authority=WALLET_12345&type=wallet&amount=200000' }
                    }
                  }
                }
              }
            }
          }
        },
        '400': { description: 'مبلغ کمتر از حداقل مجاز است' }
      }
    }
  },
  '/wallet/charge/verify': {
    post: {
      tags: ['Wallet (کیف پول)'],
      summary: 'تأیید شارژ آنلاین کیف پول پس از بازگشت از درگاه پرداخت',
      description: 'بررسی وضعیت پرداخت در درگاه بانکی، افزایش اتمیک موجودی کاربر، به‌روزرسانی تراکنش به completed و ارسال نوتیفیکیشن.',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['authority', 'status'],
              properties: {
                authority: { type: 'string', example: 'WALLET_1727211111_98765' },
                status: { type: 'string', enum: ['OK', 'NOK'], example: 'OK' }
              }
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'کیف پول با موفقیت شارژ شد',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: {
                    type: 'object',
                    properties: {
                      amount: { type: 'number', example: 200000 },
                      balance: { type: 'number', example: 650000 },
                      trackingCode: { type: 'string', example: 'TRK-WLT-987654' }
                    }
                  }
                }
              }
            }
          }
        },
        '400': { description: 'تراکنش ناموفق بود یا قبلاً اعتبارسنجی شده است' }
      }
    }
  },
  '/wallet/pay-order': {
    post: {
      tags: ['Wallet (کیف پول)'],
      summary: 'پرداخت مستقیم و آنی سفارش از موجودی کیف پول',
      description: 'در صورتی که موجودی کیف پول کافی باشد، کل سفارش به صورت آنی پرداخت شده، دسترسی به دوره‌ها باز شده و نیازی به درگاه بانکی نخواهد بود.',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['orderId'],
              properties: {
                orderId: { type: 'string', example: '66f369d72728...' }
              }
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'سفارش با موفقیت از طریق کیف پول پرداخت و فعال شد',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: {
                    type: 'object',
                    properties: {
                      orderId: { type: 'string' },
                      trackingCode: { type: 'string' },
                      balance: { type: 'number' }
                    }
                  }
                }
              }
            }
          }
        },
        '400': { description: 'موجودی کیف پول برای پرداخت سفارش کافی نیست' }
      }
    }
  },
  '/wallet/withdraw': {
    post: {
      tags: ['Wallet (کیف پول)'],
      summary: 'درخواست تسویه و برداشت وجه از کیف پول به حساب بانکی',
      description: 'ثبت درخواست واریز به شماره شبا و کارت بانکی. مبلغ درخواستی بلافاصله از موجودی کسر و تا زمان تأیید ادمین در وضعیت معلق قرار می‌گیرد.',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['amount', 'shabaNumber'],
              properties: {
                amount: { type: 'number', minimum: 50000, example: 300000, description: 'مبلغ برداشت (حداقل ۵۰,۰۰۰ تومان)' },
                bankName: { type: 'string', example: 'بانک ملت' },
                accountHolder: { type: 'string', example: 'محمد امینی' },
                cardNumber: { type: 'string', example: '6104337899887766' },
                shabaNumber: { type: 'string', example: 'IR120120000000001234567890' },
                notes: { type: 'string', example: 'تسویه حساب هفتگی' }
              }
            }
          }
        }
      },
      responses: {
        '201': { description: 'درخواست تسویه با موفقیت ثبت شد و در صف بررسی قرار گرفت' },
        '400': { description: 'موجودی کمتر از مبلغ درخواستی است یا شماره شبا نامعتبر است' }
      }
    }
  },
  '/wallet/admin/stats': {
    get: {
      tags: ['Wallet Admin (مدیریت کیف پول)'],
      summary: 'آمار کلان و شاخص‌های مالی سیستم کیف پول پلتفرم',
      description: 'مشاهده مجموع موجودی کاربران (تعهدات مالی پلتفرم)، مجموع مبالغ در انتظار تسویه، مجموع شارژهای شتاب، کل پرداخت‌های با کیف پول و تعداد کل کیف پول‌های فعال.',
      security: [{ bearerAuth: [] }],
      responses: {
        '200': {
          description: 'آمار مالی سامانه کیف پول',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: {
                    type: 'object',
                    properties: {
                      totalSystemLiability: { type: 'number', example: 45000000 },
                      pendingWithdrawalsAmount: { type: 'number', example: 3500000 },
                      pendingWithdrawalsCount: { type: 'integer', example: 5 },
                      totalDepositsOnline: { type: 'number', example: 120000000 },
                      totalSpentOnOrders: { type: 'number', example: 85000000 },
                      activeWalletsCount: { type: 'integer', example: 350 }
                    }
                  }
                }
              }
            }
          }
        },
        '403': { description: 'دسترسی فقط برای ادمین و سوپرادمین مجاز است' }
      }
    }
  },
  '/wallet/admin/transactions': {
    get: {
      tags: ['Wallet Admin (مدیریت کیف پول)'],
      summary: 'مشاهده و فیلتر تمام تراکنش‌های کیف پول پلتفرم',
      description: 'امکان جستجو بر اساس کاربر، نوع تراکنش، وضعیت، بازه تاریخ و کد رهگیری بانکی.',
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
        { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
        { name: 'type', in: 'query', schema: { type: 'string' } },
        { name: 'status', in: 'query', schema: { type: 'string' } },
        { name: 'search', in: 'query', schema: { type: 'string' }, description: 'جستجو در نام، ایمیل کاربر یا کد رهگیری' }
      ],
      responses: {
        '200': { description: 'فهرست تراکنش‌ها به همراه اطلاعات کاربران' }
      }
    }
  },
  '/wallet/admin/adjust': {
    post: {
      tags: ['Wallet Admin (مدیریت کیف پول)'],
      summary: 'افزایش یا کاهش دستی موجودی کیف پول کاربر توسط ادمین',
      description: 'امکان واریز اعتبار تشویقی یا کسر اصلاحی موجودی به همراه ثبت دقیق دلیل، عنوان و شناسه ادمین اقدام‌کننده.',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['userId', 'amount', 'direction', 'reason'],
              properties: {
                userId: { type: 'string', description: 'شناسه کاربر هدف' },
                amount: { type: 'number', minimum: 1000, description: 'مبلغ به تومان' },
                direction: { type: 'string', enum: ['credit', 'debit'], description: 'credit برای افزایش، debit برای کسر' },
                reason: { type: 'string', example: 'جایزه شرکت در رویداد تخصصی' }
              }
            }
          }
        }
      },
      responses: {
        '200': { description: 'تعدیل موجودی با موفقیت انجام شد' },
        '400': { description: 'موجودی کاربر برای کسر کافی نیست یا مقادیر نامعتبرند' }
      }
    }
  },
  '/wallet/admin/withdrawals/{id}/approve': {
    patch: {
      tags: ['Wallet Admin (مدیریت کیف پول)'],
      summary: 'تأیید درخواست تسویه حساب و ثبت شماره پیگیری واریز پایا/ساتنا',
      description: 'تغییر وضعیت درخواست برداشت به completed و ثبت کد پیگیری بانکی و ارسال نوتیفیکیشن موفقیت برای کاربر.',
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'شناسه تراکنش برداشت' }
      ],
      requestBody: {
        required: false,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                trackingCode: { type: 'string', example: 'PAYA-987654321', description: 'کد پیگیری واریز حواله بانکی' }
              }
            }
          }
        }
      },
      responses: {
        '200': { description: 'درخواست تسویه با موفقیت تأیید شد' }
      }
    }
  },
  '/wallet/admin/withdrawals/{id}/reject': {
    patch: {
      tags: ['Wallet Admin (مدیریت کیف پول)'],
      summary: 'رد درخواست تسویه حساب و بازگشت خودکار مبلغ به کیف پول کاربر',
      description: 'در صورت مغایرت اطلاعات شبا یا لغو، وضعیت تراکنش به rejected تغییر کرده و مبلغ بلافاصله به موجودی کاربر بازگردانده می‌شود.',
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'شناسه تراکنش برداشت' }
      ],
      requestBody: {
        required: false,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                reason: { type: 'string', example: 'شماره شبا با نام دارنده حساب همخوانی ندارد' }
              }
            }
          }
        }
      },
      responses: {
        '200': { description: 'درخواست تسویه رد شد و وجه به کیف پول بازگشت' }
      }
    }
  }
};
