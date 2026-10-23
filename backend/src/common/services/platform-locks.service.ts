import { Setting } from '../../modules/admin/setting.model.js';
import { AuditService } from './audit.service.js';

export interface IPlatformLocks {
  // 1. Full Platform Maintenance
  lockMaintenance: boolean;
  maintenanceMessage: string;
  maintenanceEstimatedReturn?: string;

  // 2. Auth & Access
  lockLogin: boolean;
  lockLoginMessage: string;
  lockRegistration: boolean;
  lockRegistrationMessage: string;

  // 3. Commerce & Finance
  lockPurchases: boolean;
  lockPurchasesMessage: string;
  lockSettlements: boolean;
  lockSettlementsMessage: string;
  lockCoupons: boolean;
  lockCouponsMessage: string;

  // 4. Teaching & Content
  lockCourseCreation: boolean;
  lockCourseCreationMessage: string;

  // 5. Infrastructure & Community
  lockSmsOtp: boolean;
  lockSmsOtpMessage: string;
  lockComments: boolean;
  lockCommentsMessage: string;
  lockSupportTickets: boolean;
  lockSupportTicketsMessage: string;

  updatedAt?: string;
  updatedBy?: string;
}

export const DEFAULT_PLATFORM_LOCKS: IPlatformLocks = {
  lockMaintenance: false,
  maintenanceMessage: 'سامانه آموزش آنلاین تک یاد در حال به‌روزرسانی و ارتقای زیرساخت است. از شکیبایی شما سپاسگزاریم.',
  maintenanceEstimatedReturn: 'به زودی در دسترس خواهد بود',

  lockLogin: false,
  lockLoginMessage: 'ورود به سامانه موقتاً به دلیل ممیزی امنیتی متوقف است. لطفاً کمی بعد مجدداً تلاش فرمایید.',

  lockRegistration: false,
  lockRegistrationMessage: 'ثبت‌نام کاربران جدید در حال حاضر موقتاً مسدود می‌باشد.',

  lockPurchases: false,
  lockPurchasesMessage: 'ثبت سفارش و پرداخت اینترنتی موقتاً به دلیل به‌روزرسانی سیستم‌های مالی غیرفعال است.',

  lockSettlements: false,
  lockSettlementsMessage: 'ثبت درخواست‌های تسویه‌حساب به دلیل ممیزی و بستن دفاتر مالی تا اطلاع ثانوی متوقف است.',

  lockCoupons: false,
  lockCouponsMessage: 'امکان استفاده از کدهای تخفیف در حال حاضر غیرفعال است.',

  lockCourseCreation: false,
  lockCourseCreationMessage: 'امکان ایجاد دوره یا کلاس جدید توسط اساتید موقتاً مسدود شده است.',

  lockSmsOtp: false,
  lockSmsOtpMessage: 'سرویس ارسال پیامک و کد تایید به دلیل محدودیت فنی موقتاً متوقف شده است.',

  lockComments: false,
  lockCommentsMessage: 'ارسال نظرات و دیدگاه‌های جدید موقتاً غیرفعال شده است.',

  lockSupportTickets: false,
  lockSupportTicketsMessage: 'ارسال تیکت پشتیبانی جدید موقتاً غیرفعال است.'
};

class PlatformLocksServiceClass {
  private cache: IPlatformLocks = { ...DEFAULT_PLATFORM_LOCKS };
  private isLoaded = false;

  async init(): Promise<IPlatformLocks> {
    try {
      const setting = await Setting.findOne({ key: 'platform_locks' }).lean();
      if (setting && setting.value) {
        this.cache = { ...DEFAULT_PLATFORM_LOCKS, ...setting.value };
      } else {
        await Setting.create({
          key: 'platform_locks',
          group: 'security',
          value: DEFAULT_PLATFORM_LOCKS
        }).catch(() => {});
        this.cache = { ...DEFAULT_PLATFORM_LOCKS };
      }
      this.isLoaded = true;
    } catch (err) {
      console.error('Failed to load platform locks from DB, using defaults:', err);
    }
    return this.cache;
  }

  async getLocks(): Promise<IPlatformLocks> {
    if (!this.isLoaded) {
      await this.init();
    }
    return { ...this.cache };
  }

  getLocksSync(): IPlatformLocks {
    return { ...this.cache };
  }

  async updateLocks(
    updates: Partial<IPlatformLocks>,
    adminUser?: { id?: string; name?: string; email?: string }
  ): Promise<IPlatformLocks> {
    const previous = await this.getLocks();
    const updated: IPlatformLocks = {
      ...previous,
      ...updates,
      updatedAt: new Date().toISOString(),
      updatedBy: adminUser?.name || adminUser?.email || 'مدیر ارشد'
    };

    this.cache = updated;

    await Setting.findOneAndUpdate(
      { key: 'platform_locks' },
      { $set: { value: updated, group: 'security' } },
      { upsert: true, returnDocument: 'after' }
    );

    // Identify changed lock keys for audit logging
    const changedKeys: string[] = [];
    (Object.keys(DEFAULT_PLATFORM_LOCKS) as (keyof IPlatformLocks)[]).forEach(k => {
      if (typeof DEFAULT_PLATFORM_LOCKS[k] === 'boolean' && previous[k] !== updated[k]) {
        changedKeys.push(`${k}: ${previous[k]} -> ${updated[k]}`);
      }
    });

    if (changedKeys.length > 0) {
      AuditService.log({
        userId: adminUser?.id,
        userRole: 'super-admin',
        action: 'platform_locks_updated',
        category: 'security',
        title: 'قفل‌های عملیاتی پلتفرم (Kill-Switches) به‌روزرسانی شد',
        details: {
          changes: changedKeys,
          actor: adminUser?.name || adminUser?.email
        }
      });
    }

    return updated;
  }
}

export const PlatformLocksService = new PlatformLocksServiceClass();
