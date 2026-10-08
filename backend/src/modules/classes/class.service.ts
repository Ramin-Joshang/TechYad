import { Class, IClass, getClassPhase, isClassRegistrationOpen } from './class.model.js';
import { ClassEnrollment, IClassEnrollment } from './class-enrollment.model.js';
import { Attendance, IAttendance } from './attendance.model.js';
import { User } from '../auth/user.model.js';
import { WalletTransaction } from '../wallet/wallet-transaction.model.js';
import { Notification } from '../notifications/notification.model.js';
import { AppError } from '../../common/errors/AppError.js';
import { Types } from 'mongoose';
import { parseDateSafely } from '../../common/utils/date.js';
import { AuditService } from '../../common/services/audit.service.js';

export class ClassService {
  static async getInstructorClasses(instructorId: string) {
    const list = await Class.find({ $or: [{ instructors: instructorId }, { createdBy: instructorId }] }).sort({ startDate: 1 });
    return list.map(c => {
      const obj = c.toObject();
      return {
        ...obj,
        phase: getClassPhase(obj),
        isRegistrationOpen: isClassRegistrationOpen(obj),
      };
    });
  }

  static async getClasses(query: any = {}) {
    const filter: any = { status: { $in: ['published', 'completed'] } };

    if (query.mode && query.mode !== 'all') {
      filter.mode = query.mode;
    }
    if (query.type && query.type !== 'all') {
      filter.type = query.type;
    }
    if (query.category) {
      filter.categoryId = query.category;
    }
    if (query.categoryId) {
      filter.categoryId = query.categoryId;
    }
    if (query.search) {
      filter.$or = [
        { title: { $regex: query.search, $options: 'i' } },
        { description: { $regex: query.search, $options: 'i' } },
        { location: { $regex: query.search, $options: 'i' } },
        { city: { $regex: query.search, $options: 'i' } },
      ];
    }

    const page = parseInt(query.page as string) || 1;
    const limit = parseInt(query.limit as string) || 9;
    const skip = (page - 1) * limit;

    let sortOption: any = { startDate: 1 };
    if (query.sort === 'newest') sortOption = { createdAt: -1 };
    if (query.sort === 'price_asc') sortOption = { price: 1 };
    if (query.sort === 'price_desc') sortOption = { price: -1 };

    const classes = await Class.find(filter)
      .populate('instructors', 'firstName lastName avatar personnelPhoto bio specialty')
      .populate('categoryId', 'name slug parentId')
      .sort(sortOption)
      .skip(skip)
      .limit(limit);

    const enrichedClasses = classes.map((c) => {
      const obj = c.toObject();
      return {
        ...obj,
        phase: getClassPhase(obj),
        isRegistrationOpen: isClassRegistrationOpen(obj),
      };
    });

    const total = await Class.countDocuments(filter);
    return {
      classes: enrichedClasses,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit) || 1,
    };
  }

  static async getAdminClasses(query: any = {}) {
    const filter: any = {};
    if (query.status && query.status !== 'all') {
      filter.status = query.status;
    }
    if (query.mode && query.mode !== 'all') {
      filter.mode = query.mode;
    }
    if (query.search) {
      filter.$or = [
        { title: { $regex: query.search, $options: 'i' } },
        { description: { $regex: query.search, $options: 'i' } },
        { location: { $regex: query.search, $options: 'i' } },
        { city: { $regex: query.search, $options: 'i' } },
      ];
    }

    const page = parseInt(query.page as string) || 1;
    const limit = parseInt(query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const classes = await Class.find(filter)
      .populate('instructors', 'firstName lastName avatar personnelPhoto bio specialty')
      .populate('categoryId', 'name slug parentId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const enrichedClasses = classes.map((c) => {
      const obj = c.toObject();
      return {
        ...obj,
        phase: getClassPhase(obj),
        isRegistrationOpen: isClassRegistrationOpen(obj),
      };
    });

    const total = await Class.countDocuments(filter);
    return {
      classes: enrichedClasses,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit) || 1,
    };
  }

  static async getClassBySlug(slug: string) {
    let classData = await Class.findOne({
      $or: [
        { slug },
        { slug: decodeURIComponent(slug) },
      ],
    })
      .populate('instructors', 'firstName lastName bio avatar personnelPhoto specialty')
      .populate('categoryId', 'name slug parentId');

    if (!classData && /^[0-9a-fA-F]{24}$/.test(slug)) {
      classData = await Class.findById(slug)
        .populate('instructors', 'firstName lastName bio avatar personnelPhoto specialty')
        .populate('categoryId', 'name slug parentId');
    }

    if (!classData) throw new AppError('Class not found', 404, 'NOT_FOUND');
    const obj = classData.toObject();
    return {
      ...obj,
      phase: getClassPhase(obj),
      isRegistrationOpen: isClassRegistrationOpen(obj),
    };
  }

  static async createClass(userId: string, data: any, userRole: string = 'instructor') {
    const mockRoomLink =
      data.mode === 'online'
        ? data.meetingLink || `https://www.skyroom.online/ch/tecyad/${new Types.ObjectId().toString().substring(0, 8)}`
        : undefined;

    const payload = { ...data };
    if (payload.categoryId === '' || payload.categoryId === 'none' || payload.categoryId === 'null') {
      delete payload.categoryId;
    }
    if (payload.startDate) payload.startDate = parseDateSafely(payload.startDate) || payload.startDate;
    
    // Auto calculate sessions if syllabus provided
    if (Array.isArray(payload.syllabus) && payload.syllabus.length > 0 && !payload.sessions) {
      payload.sessions = payload.syllabus.length;
    }
    const sessionCount = Number(payload.sessions) || 10;
    const sessionDurationMin = Number(payload.sessionDuration) || 90;

    // 1. Auto-calculate totalHours from sessions and sessionDuration if missing or zero
    if (!payload.totalHours || Number(payload.totalHours) <= 0) {
      payload.totalHours = Math.round(((sessionCount * sessionDurationMin) / 60) * 10) / 10;
    }

    // 2. Intelligent Auto-calculation of endDate based on schedule days and session count
    if (payload.endDate) {
      payload.endDate = parseDateSafely(payload.endDate) || payload.endDate;
    } else if (payload.startDate) {
      const sDate = payload.startDate instanceof Date ? payload.startDate : new Date(payload.startDate);
      const daysOfWeekMap: Record<string, number> = {
        'یکشنبه': 0, 'دوشنبه': 1, 'سه‌شنبه': 2, 'چهارشنبه': 3, 'پنج‌شنبه': 4, 'جمعه': 5, 'شنبه': 6
      };
      const selectedDays = Array.isArray(payload.scheduleDays) && payload.scheduleDays.length > 0
        ? payload.scheduleDays.map((d: string) => daysOfWeekMap[d]).filter((d: any) => d !== undefined)
        : [6, 2]; // default: Saturday & Tuesday

      if (selectedDays.length > 0 && sessionCount > 0) {
        let count = 0;
        const curr = new Date(sDate.getTime());
        for (let dayStep = 0; dayStep < 365; dayStep++) {
          if (selectedDays.includes(curr.getDay())) {
            count++;
            if (count >= sessionCount) break;
          }
          curr.setDate(curr.getDate() + 1);
        }
        payload.endDate = curr;
      } else {
        payload.endDate = new Date(sDate.getTime() + (sessionCount * 4 * 24 * 60 * 60 * 1000));
      }
    }

    // Default pre-registration settings if deposit provided
    if (payload.preRegistrationDeposit && Number(payload.preRegistrationDeposit) > 0) {
      payload.allowPreRegistration = true;
    }

    const isPrivilegedAdmin = userRole === 'admin' || userRole === 'super-admin' || userRole === 'super_admin';
    const initialStatus = isPrivilegedAdmin ? (payload.status || 'published') : 'pending_approval';
    if (!payload.status) payload.status = initialStatus;
    if (payload.registrationOpen === undefined) payload.registrationOpen = true;

    const createdClass = await Class.create({
      ...payload,
      meetingLink: mockRoomLink,
      createdBy: userId,
      instructors: data.instructors?.length > 0 ? data.instructors : [userId],
    });

    // Audit Log for creating class
    AuditService.log({
      userId,
      userRole: isPrivilegedAdmin ? 'admin' : 'instructor',
      action: 'create_class',
      category: 'class',
      title: `${isPrivilegedAdmin ? 'ادمین' : 'استاد'} کلاس جدید «${createdClass.title}» را تعریف کرد`,
      targetId: createdClass._id.toString(),
      targetType: 'class',
      targetTitle: createdClass.title,
      details: {
        status: createdClass.status,
        mode: createdClass.mode,
        price: createdClass.price,
        capacity: createdClass.capacity,
        startDate: createdClass.startDate
      }
    });

    return createdClass;
  }

  static async approveClass(id: string, adminId: string) {
    const cls = await Class.findById(id);
    if (!cls) throw new AppError('کلاس یافت نشد', 404);

    cls.status = 'published';
    cls.registrationOpen = true;
    await cls.save();

    AuditService.log({
      userId: adminId,
      userRole: 'admin',
      action: 'approve_class',
      category: 'class',
      title: `تایید و انتشار کلاس «${cls.title}»`,
      targetId: cls._id.toString(),
      targetType: 'class',
      targetTitle: cls.title,
    });

    for (const instId of cls.instructors || []) {
      await Notification.create({
        userId: instId,
        title: 'کلاس شما تایید و منتشر شد',
        message: `کلاس «${cls.title}» توسط مدیریت تایید و منتشر شد. فاز ثبت‌نام رسماً آغاز گردید و دانشجویان می‌توانند ثبت‌نام کنند.`,
        type: 'system',
      });
    }

    const obj = cls.toObject();
    return {
      ...obj,
      phase: getClassPhase(obj),
      isRegistrationOpen: isClassRegistrationOpen(obj),
    };
  }

  static async toggleRegistration(id: string, userId: string, isOpen?: boolean) {
    const cls = await Class.findById(id);
    if (!cls) throw new AppError('کلاس یافت نشد', 404);

    const currentOpen = isClassRegistrationOpen(cls);
    const newStatus = typeof isOpen === 'boolean' ? isOpen : !currentOpen;
    cls.registrationOpen = newStatus;
    await cls.save();

    AuditService.log({
      userId,
      userRole: 'admin',
      action: 'toggle_class_registration',
      category: 'class',
      title: `${newStatus ? 'باز کردن' : 'بستن'} ثبت‌نام کلاس «${cls.title}»`,
      targetId: cls._id.toString(),
      targetType: 'class',
      targetTitle: cls.title,
    });

    const obj = cls.toObject();
    return {
      ...obj,
      phase: getClassPhase(obj),
      isRegistrationOpen: isClassRegistrationOpen(obj),
    };
  }

  static async rescheduleClass(id: string, userId: string, days: number) {
    if (!days || isNaN(days)) throw new AppError('تعداد روز جابجایی نامعتبر است', 400);

    const cls = await Class.findById(id);
    if (!cls) throw new AppError('کلاس یافت نشد', 404);

    const msShift = Number(days) * 24 * 60 * 60 * 1000;
    cls.startDate = new Date(new Date(cls.startDate).getTime() + msShift);
    if (cls.endDate) {
      cls.endDate = new Date(new Date(cls.endDate).getTime() + msShift);
    }

    if (Array.isArray(cls.syllabus)) {
      cls.syllabus = cls.syllabus.map((s: any) => {
        if (s.date) {
          const d = parseDateSafely(s.date) || new Date(s.date);
          if (d && !isNaN(d.getTime())) {
            s.date = new Date(d.getTime() + msShift).toISOString().substring(0, 10);
          }
        }
        return s;
      });
    }

    await cls.save();

    AuditService.log({
      userId,
      userRole: 'admin',
      action: 'reschedule_class',
      category: 'class',
      title: `تغییر زمان‌بندی کلاس «${cls.title}» به میزان ${days} روز`,
      targetId: cls._id.toString(),
      targetType: 'class',
      targetTitle: cls.title,
      details: { days, newStartDate: cls.startDate, newEndDate: cls.endDate }
    });

    const enrollments = await ClassEnrollment.find({ classId: cls._id, status: 'active' });
    const shiftText = days > 0 ? `${days} روز به تعویق افتاد` : `${Math.abs(days)} روز جلو افتاد`;
    const newDateStr = new Date(cls.startDate).toLocaleDateString('fa-IR');

    for (const enr of enrollments) {
      await Notification.create({
        userId: enr.userId,
        title: `اطلاعیه تغییر زمان کلاس «${cls.title}»`,
        message: `دانشجوی گرامی، تاریخ برگزاری کلاس «${cls.title}» به میزان ${shiftText}. تاریخ شروع جدید: ${newDateStr}.`,
        type: 'system',
      });
    }

    const obj = cls.toObject();
    return {
      ...obj,
      phase: getClassPhase(obj),
      isRegistrationOpen: isClassRegistrationOpen(obj),
    };
  }

  static async updateClass(id: string, userId: string, data: any, overrideAuth: boolean = false) {
    const query = overrideAuth 
      ? { _id: id } 
      : { _id: id, $or: [{ instructors: userId }, { createdBy: userId }] };
    const payload = { ...data };
    if (payload.categoryId === '' || payload.categoryId === 'none' || payload.categoryId === 'null') {
      payload.categoryId = null;
    }
    if (payload.startDate !== undefined) payload.startDate = parseDateSafely(payload.startDate) || payload.startDate;
    if (payload.endDate !== undefined) payload.endDate = parseDateSafely(payload.endDate) || payload.endDate;
    if (payload.mode === 'in-person') payload.mode = 'in_person';

    if (payload.sessions && payload.sessionDuration && (!payload.totalHours || Number(payload.totalHours) <= 0)) {
      payload.totalHours = Math.round(((Number(payload.sessions) * Number(payload.sessionDuration)) / 60) * 10) / 10;
    }

    const cls = await Class.findOneAndUpdate(query, payload, { new: true });
    if (!cls) throw new AppError('Class not found or unauthorized', 404);

    // Audit Log for class update
    AuditService.log({
      userId,
      userRole: overrideAuth ? 'admin' : 'instructor',
      action: 'update_class',
      category: 'class',
      title: `ویرایش اطلاعات کلاس «${cls.title}»`,
      targetId: cls._id.toString(),
      targetType: 'class',
      targetTitle: cls.title,
      details: {
        status: cls.status,
        mode: cls.mode,
        price: cls.price
      }
    });

    return cls;
  }

  static async deleteClass(id: string, userId: string, overrideAuth: boolean = false) {
    const query = overrideAuth ? { _id: id } : { _id: id, instructors: userId };
    const cls = await Class.findOneAndDelete(query);
    if (!cls) throw new AppError('Class not found or unauthorized', 404);
    return cls;
  }

  static async getMyClasses(userId: string) {
    const enrollments = await ClassEnrollment.find({ userId, status: 'active' })
      .populate({
        path: 'classId',
        populate: {
          path: 'instructors',
          select: 'firstName lastName avatar bio',
        },
      })
      .sort({ createdAt: -1 });

    // Count held sessions for each class
    const classIds = enrollments.map((e) => e.classId?._id).filter(Boolean);
    const attendanceStats = await Attendance.aggregate([
      { $match: { classId: { $in: classIds } } },
      { $group: { _id: '$classId', totalHeldSessions: { $sum: 1 } } },
    ]);
    const heldMap = new Map(attendanceStats.map((s) => [s._id.toString(), s.totalHeldSessions]));

    return enrollments
      .map((e) => {
        const cls: any = e.classId;
        if (!cls) return null;
        const totalHeld = heldMap.get(cls._id.toString()) || 0;
        return {
          ...cls.toObject(),
          enrollmentId: e._id,
          enrolledAt: e.enrolledAt,
          enrollmentStatus: e.status,
          paymentType: e.paymentType || 'full',
          depositAmount: e.depositAmount || 0,
          remainingBalance: e.remainingBalance || 0,
          remainingPaid: e.remainingPaid !== false,
          remainingPaidAt: e.remainingPaidAt,
          dueNotificationSent: e.dueNotificationSent || false,
          attendedSessionsCount: e.attendedSessionsCount || 0,
          totalHeldSessions: totalHeld,
          paidAmount: e.amount,
          orderId: e.orderId,
        };
      })
      .filter(Boolean);
  }

  static async joinOnlineClass(userId: string, classId: string) {
    const classData = await Class.findById(classId);
    if (!classData) throw new AppError('Class not found', 404, 'NOT_FOUND');

    if (classData.mode !== 'online') {
      throw new AppError('این کلاس به صورت حضوری برگزار می‌شود و لینک آنلاین ندارد', 400, 'BAD_REQUEST');
    }

    const enrollment = await ClassEnrollment.findOne({ userId, classId, status: 'active' });
    if (!enrollment) {
      throw new AppError('شما در این کلاس ثبت‌نام نکرده‌اید', 403, 'FORBIDDEN');
    }

    return { meetingUrl: classData.meetingLink || 'https://www.skyroom.online/ch/tecyad' };
  }

  static async getClassEnrollmentStatus(userId: string, classId: string) {
    const enrollment = await ClassEnrollment.findOne({ userId, classId, status: 'active' });
    return enrollment || null;
  }

  // --- Class Registration (Direct Wallet & Pre-registration / Deposit) ---
  static async registerForClass(userId: string, classId: string, data: { paymentType?: 'full' | 'deposit' } = {}) {
    const classData = await Class.findById(classId);
    if (!classData) throw new AppError('کلاس مورد نظر یافت نشد', 404, 'NOT_FOUND');
    if (classData.status !== 'published') throw new AppError('این کلاس در حال حاضر در دسترس نیست یا هنوز تایید نشده است', 400, 'BAD_REQUEST');

    const regOpen = isClassRegistrationOpen(classData);
    if (!regOpen) {
      const now = new Date();
      const hasStarted = now >= new Date(classData.startDate);
      throw new AppError(
        hasStarted ? 'کلاس آغاز شده و مهلت ثبت‌نام به پایان رسیده است' : 'ثبت‌نام این کلاس در حال حاضر توسط مدیریت بسته شده است',
        400,
        'REGISTRATION_CLOSED'
      );
    }

    const existing = await ClassEnrollment.findOne({ userId, classId, status: 'active' });
    if (existing) throw new AppError('شما قبلاً در این کلاس ثبت‌نام کرده‌اید', 400, 'ALREADY_ENROLLED');

    if (classData.capacity && (classData.enrolledCount || 0) >= classData.capacity) {
      throw new AppError('ظرفیت کلاس تکمیل شده است', 400, 'CAPACITY_REACHED');
    }

    const isDeposit = data.paymentType === 'deposit';

    if (isDeposit) {
      if (!classData.allowPreRegistration || !classData.preRegistrationDeposit || classData.preRegistrationDeposit <= 0) {
        throw new AppError('امکان پیش‌ثبت‌نام با بیعانه برای این کلاس فعال نیست', 400, 'DEPOSIT_NOT_ALLOWED');
      }
    }

    const fullPrice = classData.discountPrice && classData.discountPrice < classData.price ? classData.discountPrice : classData.price;
    const requiredAmount = isDeposit ? classData.preRegistrationDeposit : fullPrice;
    const remainingBalance = isDeposit ? Math.max(0, fullPrice - classData.preRegistrationDeposit) : 0;

    // Check user wallet
    const user = await User.findById(userId);
    if (!user) throw new AppError('کاربر یافت نشد', 404, 'NOT_FOUND');

    const currentBalance = user.walletBalance || 0;
    if (requiredAmount > 0 && currentBalance < requiredAmount) {
      const shortage = requiredAmount - currentBalance;
      throw new AppError(
        `موجودی کیف پول شما کافی نیست. مبلغ مورد نیاز: ${requiredAmount.toLocaleString('fa-IR')} تومان (کسری: ${shortage.toLocaleString('fa-IR')} تومان). لطفاً کیف پول خود را شارژ کنید.`,
        400,
        'INSUFFICIENT_BALANCE'
      );
    }

    // Deduct from wallet if price > 0
    if (requiredAmount > 0) {
      user.walletBalance = currentBalance - requiredAmount;
      await user.save();

      await WalletTransaction.create({
        userId,
        type: 'purchase',
        direction: 'debit',
        amount: requiredAmount,
        balanceAfter: user.walletBalance,
        status: 'completed',
        title: isDeposit ? `پیش‌ثبت‌نام در کلاس ${classData.title}` : `ثبت‌نام در کلاس ${classData.title}`,
        description: isDeposit
          ? `پرداخت بیعانه پیش‌ثبت‌نام کلاس ${classData.title} (مابقی شهریه: ${remainingBalance.toLocaleString('fa-IR')} تومان)`
          : `تسویه کامل شهریه کلاس ${classData.title}`,
        gateway: 'wallet',
        trackingCode: `CLS-${Date.now().toString().slice(-6)}`,
      });
    }

    // Create Enrollment Record
    const enrollment = await ClassEnrollment.create({
      userId,
      classId,
      status: 'active',
      amount: requiredAmount,
      enrolledAt: new Date(),
      paymentType: isDeposit ? 'deposit' : 'full',
      depositAmount: isDeposit ? requiredAmount : 0,
      remainingBalance,
      remainingPaid: !isDeposit || remainingBalance === 0,
    });

    await Class.findByIdAndUpdate(classId, { $inc: { enrolledCount: 1 } });

    // Credit Instructor Wallet with 70% share
    const primaryInstructorId = classData.instructors?.[0] || classData.createdBy;
    if (requiredAmount > 0 && primaryInstructorId) {
      try {
        const instructorShare = Math.round(requiredAmount * 0.7);
        const instructorUser = await User.findById(primaryInstructorId);
        if (instructorUser) {
          instructorUser.walletBalance = (instructorUser.walletBalance || 0) + instructorShare;
          await instructorUser.save();

          await WalletTransaction.create({
            userId: primaryInstructorId,
            type: 'instructor_share',
            direction: 'credit',
            amount: instructorShare,
            balanceAfter: instructorUser.walletBalance,
            status: 'completed',
            title: `درآمد حاصل از کلاس «${classData.title}»`,
            description: `سهم ۷۰٪ استاد از ثبت‌نام ${user.firstName || ''} ${user.lastName || ''} در کلاس ${classData.title} (${isDeposit ? 'بیعانه' : 'تسویه کامل'})`,
            gateway: 'wallet',
            trackingCode: `INS-CLS-${Date.now().toString().slice(-6)}`,
            referenceId: `CLS-${classId}`
          });
        }
      } catch (err) {
        console.error('Failed to credit instructor for class enrollment:', err);
      }
    }

    // Send Welcome & Confirmation Notification
    if (isDeposit) {
      await Notification.create({
        userId,
        title: 'پیش‌ثبت‌نام موفق در کلاس',
        message: `پیش‌ثبت‌نام شما در کلاس «${classData.title}» با پرداخت بیعانه (${requiredAmount.toLocaleString('fa-IR')} تومان) با موفقیت ثبت شد. مابقی شهریه (${remainingBalance.toLocaleString('fa-IR')} تومان) پس از جلسه ${classData.remainingPaymentDueAfterSession || 2} تسویه خواهد شد.`,
        type: 'system',
      });
    } else {
      await Notification.create({
        userId,
        title: 'ثبت‌نام موفق در کلاس',
        message: `ثبت‌نام کامل شما در کلاس «${classData.title}» با موفقیت انجام شد. می‌توانید اطلاعات زمان‌بندی و لینک یا محل برگزاری را در پنل کاربری مشاهده نمایید.`,
        type: 'system',
      });
    }

    // Audit Log for Student class enrollment
    AuditService.log({
      userId,
      userRole: 'student',
      action: 'enroll_class',
      category: 'class',
      title: `دانشجو در کلاس «${classData.title}» ثبت‌نام کرد (${isDeposit ? 'پیش‌ثبت‌نام با بیعانه' : 'پرداخت کامل'})`,
      targetId: classId,
      targetType: 'class',
      targetTitle: classData.title,
      details: {
        paymentType: isDeposit ? 'deposit' : 'full',
        amountPaid: requiredAmount,
        remainingBalance,
        mode: classData.mode
      }
    });

    return enrollment;
  }

  // --- Pay Remaining Balance for Class ---
  static async payClassRemainingBalance(userId: string, classId: string) {
    const enrollment = await ClassEnrollment.findOne({ userId, classId, status: 'active' });
    if (!enrollment) throw new AppError('شما در این کلاس ثبت‌نام نکرده‌اید', 404, 'NOT_FOUND');

    if (enrollment.remainingPaid || !enrollment.remainingBalance || enrollment.remainingBalance <= 0) {
      throw new AppError('شهریه این کلاس قبلاً به صورت کامل تسویه شده است', 400, 'ALREADY_PAID');
    }

    const classData = await Class.findById(classId);
    if (!classData) throw new AppError('کلاس یافت نشد', 404, 'NOT_FOUND');

    const remainingAmount = enrollment.remainingBalance;

    const user = await User.findById(userId);
    if (!user) throw new AppError('کاربر یافت نشد', 404, 'NOT_FOUND');

    const currentBalance = user.walletBalance || 0;
    if (currentBalance < remainingAmount) {
      const shortage = remainingAmount - currentBalance;
      throw new AppError(
        `موجودی کیف پول شما کافی نیست. مبلغ باقیمانده: ${remainingAmount.toLocaleString('fa-IR')} تومان (کسری: ${shortage.toLocaleString('fa-IR')} تومان). لطفاً کیف پول خود را شارژ کنید.`,
        400,
        'INSUFFICIENT_BALANCE'
      );
    }

    // Deduct from wallet
    user.walletBalance = currentBalance - remainingAmount;
    await user.save();

    await WalletTransaction.create({
      userId,
      type: 'purchase',
      direction: 'debit',
      amount: remainingAmount,
      balanceAfter: user.walletBalance,
      status: 'completed',
      title: `تسویه مابقی شهریه کلاس ${classData.title}`,
      description: `تسویه قسط دوم شهریه کلاس ${classData.title}`,
      gateway: 'wallet',
      trackingCode: `CLS-REM-${Date.now().toString().slice(-6)}`,
    });

    enrollment.amount += remainingAmount;
    enrollment.remainingBalance = 0;
    enrollment.remainingPaid = true;
    enrollment.remainingPaidAt = new Date();
    await enrollment.save();

    // Credit Instructor Wallet with 70% share of remaining payment
    const primaryInstructorId = classData.instructors?.[0] || classData.createdBy;
    if (remainingAmount > 0 && primaryInstructorId) {
      try {
        const instructorShare = Math.round(remainingAmount * 0.7);
        const instructorUser = await User.findById(primaryInstructorId);
        if (instructorUser) {
          instructorUser.walletBalance = (instructorUser.walletBalance || 0) + instructorShare;
          await instructorUser.save();

          await WalletTransaction.create({
            userId: primaryInstructorId,
            type: 'instructor_share',
            direction: 'credit',
            amount: instructorShare,
            balanceAfter: instructorUser.walletBalance,
            status: 'completed',
            title: `درآمد حاصل از تسویه مابقی کلاس «${classData.title}»`,
            description: `سهم ۷۰٪ استاد از تسویه مابقی شهریه ${user.firstName || ''} ${user.lastName || ''} در کلاس ${classData.title}`,
            gateway: 'wallet',
            trackingCode: `INS-REM-${Date.now().toString().slice(-6)}`,
            referenceId: `CLS-REM-${classId}`
          });
        }
      } catch (err) {
        console.error('Failed to credit instructor for class remaining payment:', err);
      }
    }

    // Send confirmation notification
    await Notification.create({
      userId,
      title: 'تسویه کامل شهریه کلاس',
      message: `مابقی شهریه کلاس «${classData.title}» (${remainingAmount.toLocaleString('fa-IR')} تومان) با موفقیت پرداخت شد و حساب شما تسویه گردید.`,
      type: 'system',
    });

    return enrollment;
  }

  // --- ATTENDANCE SYSTEM ---
  static async getClassAttendance(classId: string, userId: string, userRole: string) {
    const classData = await Class.findById(classId);
    if (!classData) throw new AppError('کلاس یافت نشد', 404, 'NOT_FOUND');

    const isPrivileged =
      userRole === 'admin' ||
      userRole === 'super-admin' ||
      classData.instructors?.some((id) => id.toString() === userId.toString());

    // If student: get their personalized attendance record
    if (!isPrivileged) {
      const enrollment = await ClassEnrollment.findOne({ userId, classId, status: 'active' });
      if (!enrollment) {
        throw new AppError('شما دسترسی به اطلاعات این کلاس را ندارید', 403, 'FORBIDDEN');
      }

      const allSessionsAttendance = await Attendance.find({ classId }).sort({ sessionNumber: 1 });
      const totalSessions = classData.sessions || classData.syllabus?.length || allSessionsAttendance.length || 1;
      const heldSessions = allSessionsAttendance.length;

      let presentCount = 0;
      let absentCount = 0;
      let lateCount = 0;
      let excusedCount = 0;

      const sessionsLog = allSessionsAttendance.map((att) => {
        const studentRecord = att.records.find((r) => r.userId.toString() === userId.toString());
        const status = studentRecord?.status || 'absent';
        if (status === 'present') presentCount++;
        else if (status === 'late') lateCount++;
        else if (status === 'excused') excusedCount++;
        else absentCount++;

        return {
          sessionNumber: att.sessionNumber,
          sessionTitle: att.sessionTitle || `جلسه ${att.sessionNumber}`,
          sessionDate: att.sessionDate,
          status,
          note: studentRecord?.note || '',
          markedAt: studentRecord?.markedAt || att.updatedAt,
        };
      });

      return {
        classTitle: classData.title,
        totalSessions,
        heldSessions,
        presentCount,
        absentCount,
        lateCount,
        excusedCount,
        attendancePercentage: heldSessions > 0 ? Math.round(((presentCount + lateCount) / heldSessions) * 100) : 100,
        sessionsLog,
      };
    }

    // If instructor or admin: get full matrix of all sessions and students
    const enrollments = await ClassEnrollment.find({ classId, status: 'active' })
      .populate('userId', 'firstName lastName email avatar mobile')
      .sort({ enrolledAt: 1 });

    const attendanceSessions = await Attendance.find({ classId }).sort({ sessionNumber: 1 });

    return {
      class: {
        _id: classData._id,
        title: classData.title,
        sessions: classData.sessions || classData.syllabus?.length || 10,
        remainingPaymentDueAfterSession: classData.remainingPaymentDueAfterSession || 2,
        allowPreRegistration: classData.allowPreRegistration,
        preRegistrationDeposit: classData.preRegistrationDeposit,
      },
      enrolledStudents: enrollments.map((e) => ({
        enrollmentId: e._id,
        user: e.userId,
        paymentType: e.paymentType,
        depositAmount: e.depositAmount,
        remainingBalance: e.remainingBalance,
        remainingPaid: e.remainingPaid,
        attendedSessionsCount: e.attendedSessionsCount || 0,
      })),
      sessions: attendanceSessions,
    };
  }

  static async takeSessionAttendance(
    classId: string,
    instructorId: string,
    data: {
      sessionNumber: number;
      sessionTitle?: string;
      sessionDate?: Date | string;
      records: { userId: string; status: 'present' | 'absent' | 'late' | 'excused'; note?: string }[];
      notes?: string;
    }
  ) {
    const classData = await Class.findById(classId);
    if (!classData) throw new AppError('کلاس یافت نشد', 404, 'NOT_FOUND');

    const sessionNum = Number(data.sessionNumber);
    if (!sessionNum || sessionNum < 1) throw new AppError('شماره جلسه نامعتبر است', 400, 'BAD_REQUEST');

    // Create or update attendance record for this session
    const attendance = await Attendance.findOneAndUpdate(
      { classId, sessionNumber: sessionNum },
      {
        sessionTitle: data.sessionTitle || `جلسه ${sessionNum}`,
        sessionDate: data.sessionDate ? new Date(data.sessionDate) : new Date(),
        records: data.records.map((r) => ({
          userId: new Types.ObjectId(r.userId),
          status: r.status,
          note: r.note || '',
          markedAt: new Date(),
        })),
        takenBy: new Types.ObjectId(instructorId),
        notes: data.notes || '',
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Recalculate attendedSessionsCount for enrolled students in this class
    const allAttendances = await Attendance.find({ classId });
    for (const record of data.records) {
      let attendedCount = 0;
      allAttendances.forEach((att) => {
        const userRec = att.records.find((r) => r.userId.toString() === record.userId.toString());
        if (userRec && (userRec.status === 'present' || userRec.status === 'late')) {
          attendedCount++;
        }
      });

      await ClassEnrollment.findOneAndUpdate(
        { classId, userId: record.userId },
        { attendedSessionsCount: attendedCount }
      );
    }

    // AUTOMATIC NOTIFICATION: If session reached or passed remainingPaymentDueAfterSession (e.g. session 2)
    const dueThreshold = classData.remainingPaymentDueAfterSession || 2;
    if (sessionNum >= dueThreshold) {
      const debtorEnrollments = await ClassEnrollment.find({
        classId,
        status: 'active',
        paymentType: 'deposit',
        remainingPaid: false,
        remainingBalance: { $gt: 0 },
        dueNotificationSent: false,
      });

      for (const debtor of debtorEnrollments) {
        await Notification.create({
          userId: debtor.userId,
          title: `یادآوری تسویه شهریه کلاس «${classData.title}»`,
          message: `دانشجوی گرامی، جلسه ${sessionNum} کلاس «${classData.title}» برگزار شده است. طبق مقررات پیش‌ثبت‌نام، لطفاً نسبت به تسویه مابقی شهریه (${debtor.remainingBalance.toLocaleString('fa-IR')} تومان) از بخش «کلاس‌های من» اقدام فرمایید.`,
          type: 'system',
        });

        debtor.dueNotificationSent = true;
        await debtor.save();
      }
    }

    return attendance;
  }

  static async getClassStudents(classId: string) {
    const enrollments = await ClassEnrollment.find({ classId, status: 'active' })
      .populate('userId', 'firstName lastName email avatar mobile specialty')
      .sort({ enrolledAt: -1 });

    const totalHeld = await Attendance.countDocuments({ classId });

    return enrollments.map((e) => ({
      enrollmentId: e._id,
      user: e.userId,
      enrolledAt: e.enrolledAt,
      paymentType: e.paymentType || 'full',
      depositAmount: e.depositAmount || 0,
      remainingBalance: e.remainingBalance || 0,
      remainingPaid: e.remainingPaid !== false,
      attendedSessionsCount: e.attendedSessionsCount || 0,
      totalHeldSessions: totalHeld,
      dueNotificationSent: e.dueNotificationSent || false,
      finalGrade: e.finalGrade,
      evaluationNote: e.evaluationNote || '',
    }));
  }

  static async updateClassGrades(classId: string, instructorId: string, grades: { enrollmentId?: string; userId?: string; finalGrade: number; evaluationNote?: string }[]) {
    // Verify instructor or admin
    const cls = await Class.findById(classId);
    if (!cls) throw new AppError('کلاس یافت نشد', 404);

    const isInstructorOfClass = cls.instructors.some(id => id.toString() === instructorId.toString());
    const user = await User.findById(instructorId).populate('role');
    const roleSlug = (user as any)?.role?.slug || (user as any)?.role || '';
    const isAdmin = roleSlug === 'admin' || roleSlug === 'super_admin';

    if (!isInstructorOfClass && !isAdmin) {
      throw new AppError('دسترسی غیرمجاز؛ شما استاد این کلاس نیستید', 403);
    }

    const updates = grades.map(g => {
      const filter = g.enrollmentId 
        ? { _id: g.enrollmentId, classId } 
        : { userId: g.userId, classId };

      return {
        updateOne: {
          filter,
          update: {
            $set: {
              ...(typeof g.finalGrade === 'number' ? { finalGrade: g.finalGrade } : {}),
              ...(typeof g.evaluationNote === 'string' ? { evaluationNote: g.evaluationNote } : {})
            }
          }
        }
      };
    });

    if (updates.length > 0) {
      await ClassEnrollment.bulkWrite(updates);
    }

    return await this.getClassStudents(classId);
  }

  static async enrollFreeClass(userId: string, classId: string) {
    return await this.registerForClass(userId, classId, { paymentType: 'full' });
  }
}
