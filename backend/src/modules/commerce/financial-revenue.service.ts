import { Setting } from '../admin/setting.model.js';
import { Course } from '../courses/course.model.js';
import { Class } from '../classes/class.model.js';
import { User } from '../auth/user.model.js';
import { AppError } from '../../common/errors/AppError.js';
import { AuditService } from '../../common/services/audit.service.js';

export interface FinancialSettings {
  defaultCourseInstructorShare: number;   // e.g. 70
  defaultCoursePlatformShare: number;     // e.g. 30
  defaultClassInstructorShare: number;    // e.g. 70
  defaultClassPlatformShare: number;     // e.g. 30
  minWithdrawalAmount: number;            // e.g. 50000 (Toman)
  settlementReviewDays: number;           // e.g. 2 days
}

const SETTING_KEY = 'financial_commission_settings';

export class FinancialRevenueService {
  /**
   * Get global default commission & settlement settings from DB
   */
  static async getFinancialSettings(): Promise<FinancialSettings> {
    const record = await Setting.findOne({ key: SETTING_KEY }).lean();
    if (record && record.value) {
      return {
        defaultCourseInstructorShare: Number(record.value.defaultCourseInstructorShare) ?? 70,
        defaultCoursePlatformShare: 100 - (Number(record.value.defaultCourseInstructorShare) ?? 70),
        defaultClassInstructorShare: Number(record.value.defaultClassInstructorShare) ?? 70,
        defaultClassPlatformShare: 100 - (Number(record.value.defaultClassInstructorShare) ?? 70),
        minWithdrawalAmount: Number(record.value.minWithdrawalAmount) || 50000,
        settlementReviewDays: Number(record.value.settlementReviewDays) || 2,
      };
    }

    return {
      defaultCourseInstructorShare: 70,
      defaultCoursePlatformShare: 30,
      defaultClassInstructorShare: 70,
      defaultClassPlatformShare: 30,
      minWithdrawalAmount: 50000,
      settlementReviewDays: 2,
    };
  }

  /**
   * Update global commission settings (Super Admin only)
   */
  static async updateFinancialSettings(
    adminId: string,
    data: {
      defaultCourseInstructorShare: number;
      defaultClassInstructorShare: number;
      minWithdrawalAmount?: number;
      settlementReviewDays?: number;
    }
  ) {
    const courseInst = Math.round(Number(data.defaultCourseInstructorShare));
    const classInst = Math.round(Number(data.defaultClassInstructorShare));

    if (isNaN(courseInst) || courseInst < 0 || courseInst > 100) {
      throw new AppError('درصد سهم مدرس دوره باید عددی صحیح بین ۰ تا ۱۰۰ باشد', 400);
    }
    if (isNaN(classInst) || classInst < 0 || classInst > 100) {
      throw new AppError('درصد سهم مدرس کلاس باید عددی صحیح بین ۰ تا ۱۰۰ باشد', 400);
    }

    const minWithdrawal = Math.max(1000, Number(data.minWithdrawalAmount) || 50000);
    const reviewDays = Math.max(1, Number(data.settlementReviewDays) || 2);

    const payload: FinancialSettings = {
      defaultCourseInstructorShare: courseInst,
      defaultCoursePlatformShare: 100 - courseInst,
      defaultClassInstructorShare: classInst,
      defaultClassPlatformShare: 100 - classInst,
      minWithdrawalAmount: minWithdrawal,
      settlementReviewDays: reviewDays,
    };

    await Setting.findOneAndUpdate(
      { key: SETTING_KEY },
      { key: SETTING_KEY, value: payload, group: 'finance' },
      { upsert: true, new: true }
    );

    AuditService.log({
      userId: adminId,
      userRole: 'super-admin',
      action: 'update_financial_settings',
      category: 'settings',
      title: 'بروزرسانی درصدهای پیش‌فرض سهم مدرس و مجموعه',
      details: payload,
    });

    return payload;
  }

  /**
   * Resolve exact commission share percentages for a specific course or class
   */
  static async resolveItemCommission(
    itemType: 'course' | 'class',
    itemId: string
  ): Promise<{
    instructorSharePercent: number;
    platformSharePercent: number;
    isCustom: boolean;
    primaryInstructorId: string | null;
  }> {
    const settings = await this.getFinancialSettings();
    let instructorSharePercent = itemType === 'course'
      ? settings.defaultCourseInstructorShare
      : settings.defaultClassInstructorShare;
    let isCustom = false;
    let primaryInstructorId: string | null = null;

    if (itemType === 'course') {
      const course = await Course.findById(itemId).select('instructorSharePercent instructors createdBy');
      if (course) {
        primaryInstructorId = course.instructors?.[0]?.toString() || course.createdBy?.toString() || null;
        if (
          course.instructorSharePercent !== undefined &&
          course.instructorSharePercent !== null &&
          !isNaN(Number(course.instructorSharePercent))
        ) {
          instructorSharePercent = Number(course.instructorSharePercent);
          isCustom = true;
        }
      }
    } else {
      const cls = await Class.findById(itemId).select('instructorSharePercent instructors createdBy');
      if (cls) {
        primaryInstructorId = cls.instructors?.[0]?.toString() || cls.createdBy?.toString() || null;
        if (
          cls.instructorSharePercent !== undefined &&
          cls.instructorSharePercent !== null &&
          !isNaN(Number(cls.instructorSharePercent))
        ) {
          instructorSharePercent = Number(cls.instructorSharePercent);
          isCustom = true;
        }
      }
    }

    // Clamp between 0 and 100
    instructorSharePercent = Math.min(100, Math.max(0, instructorSharePercent));
    const platformSharePercent = 100 - instructorSharePercent;

    return {
      instructorSharePercent,
      platformSharePercent,
      isCustom,
      primaryInstructorId,
    };
  }

  /**
   * Calculate exact integer currency amounts for instructor and platform
   */
  static calculateShares(amount: number, instructorPercent: number) {
    const validAmount = Math.max(0, Math.round(Number(amount) || 0));
    const validPercent = Math.min(100, Math.max(0, Math.round(Number(instructorPercent) || 0)));

    const instructorEarnings = Math.round((validAmount * validPercent) / 100);
    const platformEarnings = validAmount - instructorEarnings;

    return {
      amount: validAmount,
      instructorSharePercent: validPercent,
      platformSharePercent: 100 - validPercent,
      instructorEarnings,
      platformEarnings,
    };
  }

  /**
   * Set custom override commission for a single Course or Class (Super Admin only)
   */
  static async setItemCommissionOverride(
    adminId: string,
    itemType: 'course' | 'class',
    itemId: string,
    instructorPercent: number | null
  ) {
    let cleanPercent: number | null = null;
    if (instructorPercent !== null && instructorPercent !== undefined) {
      const num = Math.round(Number(instructorPercent));
      if (isNaN(num) || num < 0 || num > 100) {
        throw new AppError('درصد اختصاصی باید بین ۰ تا ۱۰۰ باشد', 400);
      }
      cleanPercent = num;
    }

    if (itemType === 'course') {
      const course = await Course.findByIdAndUpdate(
        itemId,
        { instructorSharePercent: cleanPercent },
        { new: true }
      );
      if (!course) throw new AppError('دوره یافت نشد', 404);

      AuditService.log({
        userId: adminId,
        userRole: 'super-admin',
        action: 'set_course_commission',
        category: 'course',
        title: cleanPercent !== null
          ? `تعیین سهم اختصاصی ${cleanPercent}٪ برای دوره «${course.title}»`
          : `حذف سهم اختصاصی و بازگشت به نرخ پیش‌فرض برای دوره «${course.title}»`,
        targetId: course._id.toString(),
        targetType: 'course',
      });

      return {
        itemType: 'course',
        itemId: course._id,
        title: course.title,
        instructorSharePercent: cleanPercent,
        isCustom: cleanPercent !== null,
      };
    } else {
      const cls = await Class.findByIdAndUpdate(
        itemId,
        { instructorSharePercent: cleanPercent },
        { new: true }
      );
      if (!cls) throw new AppError('کلاس یافت نشد', 404);

      AuditService.log({
        userId: adminId,
        userRole: 'super-admin',
        action: 'set_class_commission',
        category: 'class',
        title: cleanPercent !== null
          ? `تعیین سهم اختصاصی ${cleanPercent}٪ برای کلاس «${cls.title}»`
          : `حذف سهم اختصاصی و بازگشت به نرخ پیش‌فرض برای کلاس «${cls.title}»`,
        targetId: cls._id.toString(),
        targetType: 'class',
      });

      return {
        itemType: 'class',
        itemId: cls._id,
        title: cls.title,
        instructorSharePercent: cleanPercent,
        isCustom: cleanPercent !== null,
      };
    }
  }

  /**
   * List courses and classes with their commission share details for Super Admin management
   */
  static async listCommissionItems(query: { search?: string; type?: 'course' | 'class'; status?: string } = {}) {
    const settings = await this.getFinancialSettings();
    const result: any[] = [];

    if (!query.type || query.type === 'course') {
      const courseFilter: any = {};
      if (query.search) {
        courseFilter.title = { $regex: query.search.trim(), $options: 'i' };
      }
      if (query.status && query.status !== 'all') {
        courseFilter.status = query.status;
      }
      const courses = await Course.find(courseFilter)
        .populate('instructors', 'firstName lastName email')
        .select('title slug price discountPrice status instructorSharePercent instructors createdAt updatedAt')
        .sort({ createdAt: -1 })
        .limit(100)
        .lean();

      for (const c of courses) {
        const isCustom = c.instructorSharePercent !== undefined && c.instructorSharePercent !== null;
        const instructorPercent = isCustom
          ? Number(c.instructorSharePercent)
          : settings.defaultCourseInstructorShare;
        result.push({
          _id: c._id,
          itemType: 'course',
          title: c.title,
          slug: c.slug,
          price: c.price,
          discountPrice: c.discountPrice,
          status: c.status,
          instructors: c.instructors,
          instructorSharePercent: instructorPercent,
          platformSharePercent: 100 - instructorPercent,
          isCustom,
          defaultPercent: settings.defaultCourseInstructorShare,
          updatedAt: (c as any).updatedAt || (c as any).createdAt,
        });
      }
    }

    if (!query.type || query.type === 'class') {
      const classFilter: any = {};
      if (query.search) {
        classFilter.title = { $regex: query.search.trim(), $options: 'i' };
      }
      if (query.status && query.status !== 'all') {
        classFilter.status = query.status;
      }
      const classes = await Class.find(classFilter)
        .populate('instructors', 'firstName lastName email')
        .select('title slug price discountPrice status instructorSharePercent instructors capacity enrolledCount createdAt updatedAt')
        .sort({ createdAt: -1 })
        .limit(100)
        .lean();

      for (const cls of classes) {
        const isCustom = cls.instructorSharePercent !== undefined && cls.instructorSharePercent !== null;
        const instructorPercent = isCustom
          ? Number(cls.instructorSharePercent)
          : settings.defaultClassInstructorShare;
        result.push({
          _id: cls._id,
          itemType: 'class',
          title: cls.title,
          slug: cls.slug,
          price: cls.price,
          discountPrice: cls.discountPrice,
          status: cls.status,
          instructors: cls.instructors,
          instructorSharePercent: instructorPercent,
          platformSharePercent: 100 - instructorPercent,
          isCustom,
          defaultPercent: settings.defaultClassInstructorShare,
          updatedAt: (cls as any).updatedAt || (cls as any).createdAt,
        });
      }
    }

    return {
      settings,
      items: result,
    };
  }
}
