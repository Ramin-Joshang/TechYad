import mongoose from 'mongoose';
import * as argon2 from 'argon2';
import { Setting } from './setting.model.js';
import { User } from '../auth/user.model.js';
import { Order } from '../commerce/order.model.js';
import { Course } from '../courses/course.model.js';
import { Coupon } from '../commerce/coupon.model.js';
import { AppError } from '../../common/errors/AppError.js';
import { Role } from '../auth/role.model.js';
import { Class } from '../classes/class.model.js';
import { Ticket } from '../support/ticket.model.js';
import { TicketMessage } from '../support/ticket-message.model.js';
import { Enrollment } from '../learning/enrollment.model.js';
import { ClassEnrollment } from '../classes/class-enrollment.model.js';
import { InstructorProfile } from '../instructors/instructor-profile.model.js';
import { AuditLog } from './audit-log.model.js';
import { Settlement } from '../commerce/settlement.model.js';
import { CourseReview } from '../community/course-review.model.js';
import { LessonComment } from '../courses/lesson-comment.model.js';
import { Comment } from '../comments/comment.model.js';
import { Notification } from '../notifications/notification.model.js';
import { parseDateSafely } from '../../common/utils/date.js';
import { AuditService } from '../../common/services/audit.service.js';
import { ReferralService } from '../referral/referral.service.js';


export class AdminService {
  
  // --- Global Settings ---
  static async getSettings() {
    const settings = await Setting.find().lean();
    return settings.reduce((acc, curr) => {
       acc[curr.key] = curr.value;
       return acc;
    }, {} as Record<string, any>);
  }

  static async getPublicSettings() {
    const privateKeys = [
      'payment_gateways_config',
      'sms_config',
      'security_config',
      'jwt_secret',
      'api_keys',
      'admin_secret'
    ];
    const settings = await Setting.find({
      key: { $nin: privateKeys },
      group: { $ne: 'secret' }
    }).lean();
    const dbSettings = settings.reduce((acc, curr) => {
       acc[curr.key] = curr.value;
       return acc;
    }, {} as Record<string, any>);

    return {
      supportPhone: '09372731037',
      supportEmail: 'support@tecyad.ir',
      telegramUrl: 'https://t.me/tecyad_ir',
      instagramUrl: 'https://instagram.com/tecyad.ir',
      whatsappPhone: '09372731037',
      ...dbSettings
    };
  }

  static async updateSettings(data: Record<string, any>) {
    const operations = Object.entries(data).map(([key, value]) => ({
      updateOne: {
        filter: { key },
        update: { $set: { value } },
        upsert: true
      }
    }));
    if (operations.length > 0) {
      await Setting.bulkWrite(operations);
    }
    return this.getSettings();
  }
  
  static async getDashboardStats() {
    const totalUsers = await User.countDocuments();
    const totalCourses = await Course.countDocuments();
    const publishedCourses = await Course.countDocuments({ status: 'published' });
    const pendingCourses = await Course.countDocuments({ status: 'pending_review' });
    const draftCourses = await Course.countDocuments({ status: 'draft' });
    const activeOrders = await Order.countDocuments({ status: 'paid' });
    const totalOrders = await Order.countDocuments();
    
    // Roles breakdown
    const studentRole = await Role.findOne({ slug: 'student' });
    const instructorRole = await Role.findOne({ slug: 'instructor' });
    const adminRole = await Role.findOne({ slug: 'admin' });
    const superAdminRole = await Role.findOne({ slug: 'super-admin' });
    const students = studentRole ? await User.countDocuments({ role: studentRole._id }) : 0;
    const instructors = instructorRole ? await User.countDocuments({ role: instructorRole._id }) : 0;
    const admins = (adminRole ? await User.countDocuments({ role: adminRole._id }) : 0) + (superAdminRole ? await User.countDocuments({ role: superAdminRole._id }) : 0);

    const classes = await Class.countDocuments({ status: 'published' });
    const totalClasses = await Class.countDocuments();
    
    // Tickets stats
    const openTickets = await Ticket.countDocuments({ status: 'open' });
    const inProgressTickets = await Ticket.countDocuments({ status: 'in_progress' });
    const answeredTickets = await Ticket.countDocuments({ status: 'answered' });
    const closedTickets = await Ticket.countDocuments({ status: 'closed' });
    const totalTickets = await Ticket.countDocuments();

    // Coupons
    const activeCoupons = await Coupon.countDocuments({ isActive: true });
    const totalCoupons = await Coupon.countDocuments();
    
    // Revenue calculations
    const paidOrders = await Order.find({ status: 'paid' }).lean();
    const totalRevenue = paidOrders.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);
    
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const thisMonthRevenue = paidOrders
      .filter(o => new Date(o.createdAt as any) >= startOfThisMonth)
      .reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);

    const todayRevenue = paidOrders
      .filter(o => new Date(o.createdAt as any) >= startOfToday)
      .reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);

    const averageOrderValue = activeOrders > 0 ? Math.round(totalRevenue / activeOrders) : 0;

    // Conversion rate: distinct paying users / total users
    const uniquePayingUsers = new Set(paidOrders.map(o => o.userId?.toString())).size;
    const conversionRate = totalUsers > 0 ? Number(((uniquePayingUsers / totalUsers) * 100).toFixed(1)) : 0;

    // Recent orders (last 6)
    const recentOrders = await Order.find()
      .populate('userId', 'firstName lastName email avatar')
      .sort({ createdAt: -1 })
      .limit(6)
      .lean();

    // Recent open/in-progress tickets (last 6)
    const recentTickets = await Ticket.find()
      .populate('userId', 'firstName lastName email avatar')
      .sort({ createdAt: -1 })
      .limit(6)
      .lean();

    // Top courses by enrollment
    const topCoursesAgg = await Enrollment.aggregate([
      { $group: { _id: '$courseId', studentCount: { $sum: 1 }, totalRevenue: { $sum: '$amount' } } },
      { $sort: { studentCount: -1 } },
      { $limit: 5 }
    ]);
    const topCourses = await Promise.all(topCoursesAgg.map(async (item) => {
      const course = await Course.findById(item._id).select('title slug thumbnail price').lean();
      return {
        ...course,
        studentCount: item.studentCount,
        revenue: item.totalRevenue
      };
    }));

    // Monthly chart data (last 12 months)
    const monthNames = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'];
    const currentYear = now.getFullYear();
    const monthlyRevenue = monthNames.map((name, idx) => {
      const monthOrders = paidOrders.filter(o => {
        const d = new Date(o.createdAt as any);
        return d.getFullYear() === currentYear && d.getMonth() === idx;
      });
      return {
        name,
        revenue: monthOrders.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0),
        orders: monthOrders.length
      };
    });

    return {
      totalUsers,
      totalCourses,
      publishedCourses,
      pendingCourses,
      draftCourses,
      activeOrders,
      totalOrders,
      totalRevenue,
      todayRevenue,
      averageOrderValue,
      conversionRate,
      uniquePayingUsers,
      students,
      instructors,
      classes,
      totalClasses,
      tickets: openTickets + inProgressTickets,
      openTickets,
      inProgressTickets,
      answeredTickets,
      closedTickets,
      totalTickets,
      admins,
      activeCoupons,
      totalCoupons,
      recentOrders,
      recentTickets,
      topCourses: topCourses.filter(Boolean),
      thisMonthRevenue,
      monthlyRevenue: thisMonthRevenue,
      monthlyRevenueChart: monthlyRevenue
    };
  }

  static async createUser(creatorUser: any, data: any) {
    const { firstName, lastName, mobile, email, password, roleId, roleSlug, status, bio, specialty } = data;

    if (!firstName || !lastName) {
      throw new AppError('نام و نام خانوادگی الزامی است', 400, 'VALIDATION_ERROR');
    }
    if (!password || String(password).length < 6) {
      throw new AppError('رمز عبور باید حداقل ۶ کاراکتر باشد', 400, 'VALIDATION_ERROR');
    }

    let cleanMobile = mobile ? String(mobile).trim() : undefined;
    if (cleanMobile) {
      cleanMobile = cleanMobile.replace(/[۰-۹]/g, (d: string) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d).toString());
      cleanMobile = cleanMobile.replace(/[\s\-_]/g, '');
      if (cleanMobile.startsWith('+98')) cleanMobile = '0' + cleanMobile.slice(3);
      else if (cleanMobile.startsWith('0098')) cleanMobile = '0' + cleanMobile.slice(4);
    }

    let cleanEmail = email ? String(email).toLowerCase().trim() : undefined;

    if (!cleanMobile && !cleanEmail) {
      throw new AppError('وارد کردن شماره موبایل یا ایمیل الزامی است', 400, 'VALIDATION_ERROR');
    }

    if (cleanMobile) {
      const existingMobile = await User.findOne({ mobile: cleanMobile });
      if (existingMobile) {
        throw new AppError('کاربری با این شماره موبایل از قبل وجود دارد', 400, 'MOBILE_ALREADY_EXISTS');
      }
    }

    if (cleanEmail) {
      const existingEmail = await User.findOne({ email: cleanEmail });
      if (existingEmail) {
        throw new AppError('کاربری با این آدرس ایمیل از قبل وجود دارد', 400, 'EMAIL_ALREADY_EXISTS');
      }
    }

    let targetRole: any = null;
    if (roleId) {
      targetRole = await Role.findById(roleId);
    } else if (roleSlug) {
      targetRole = await Role.findOne({ slug: roleSlug });
    } else {
      targetRole = await Role.findOne({ slug: 'student' });
    }

    if (!targetRole) {
      throw new AppError('نقش کاربری مشخص شده نامعتبر است', 400, 'INVALID_ROLE');
    }

    // RBAC check: only super-admin can create super-admin
    const creatorRoleSlug = creatorUser.role?.slug || creatorUser.role;
    if (creatorRoleSlug !== 'super-admin' && targetRole.slug === 'super-admin') {
      throw new AppError('تنها مدیر کل (Super Admin) مجاز به تعریف کاربر با نقش مدیر کل است', 403, 'FORBIDDEN_ROLE_ASSIGNMENT');
    }

    const passwordHash = await argon2.hash(password);

    const newUser = await User.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      mobile: cleanMobile,
      email: cleanEmail,
      passwordHash,
      role: targetRole._id,
      status: status === 'pending' || status === 'blocked' ? status : 'active',
      mobileVerified: !!cleanMobile,
      emailVerified: !!cleanEmail,
    });

    try {
      await ReferralService.ensureUserReferralCode(newUser);
    } catch (e) {
      // Non-fatal referral initialization
    }

    if (targetRole.slug === 'instructor') {
      const existingProfile = await InstructorProfile.findOne({ userId: newUser._id });
      if (!existingProfile) {
        await InstructorProfile.create({
          userId: newUser._id,
          title: specialty || 'مدرس تک‌یاد',
          bio: bio || `استاد ${newUser.firstName} ${newUser.lastName}`,
          isApproved: true,
          specialties: specialty ? [specialty] : [],
        });
      }
    }

    AuditService.log({
      userId: creatorUser._id.toString(),
      userRole: creatorRoleSlug,
      action: 'create_user',
      category: 'user',
      title: `کاربر جدید «${newUser.firstName} ${newUser.lastName}» با نقش ${targetRole.name} ایجاد شد`,
      targetId: newUser._id.toString(),
      targetType: 'user',
      targetTitle: `${newUser.firstName} ${newUser.lastName}`,
    });

    const userObj = newUser.toObject();
    delete (userObj as any).passwordHash;
    return {
      ...userObj,
      role: {
        _id: targetRole._id,
        name: targetRole.name,
        slug: targetRole.slug,
      },
    };
  }

  static async getUsers() {
    const users = await User.find().populate('role', 'name slug').select('-passwordHash').sort({ createdAt: -1 }).lean();
    
    // Enrich users with enrollment count, paid orders count, total spent, and instructor details
    const enrichedUsers = await Promise.all(users.map(async (u: any) => {
      const enrollmentsCount = await Enrollment.countDocuments({ userId: u._id });
      const userOrders = await Order.find({ userId: u._id, status: 'paid' }).select('totalAmount').lean();
      const totalSpent = userOrders.reduce((sum, ord) => sum + (ord.totalAmount || 0), 0);
      const ordersCount = userOrders.length;
      
      let instructorProfile: any = null;
      let coursesCount = 0;
      let totalStudentsCount = 0;
      
      const roleSlug = u.role?.slug || '';
      if (roleSlug === 'instructor') {
        instructorProfile = await InstructorProfile.findOne({ userId: u._id }).lean();
        coursesCount = await Course.countDocuments({ instructors: u._id });
        
        // Count total unique students across this instructor's courses
        const instructorCourses = await Course.find({ instructors: u._id }).select('_id').lean();
        if (instructorCourses.length > 0) {
          const courseIds = instructorCourses.map(c => c._id);
          totalStudentsCount = await Enrollment.countDocuments({ courseId: { $in: courseIds } });
        }
      }

      return {
        ...u,
        enrollmentsCount,
        ordersCount,
        totalSpent,
        coursesCount,
        totalStudentsCount,
        bio: u.bio || instructorProfile?.bio || '',
        specialty: u.specialty || instructorProfile?.title || (instructorProfile?.specialties && instructorProfile.specialties[0]) || '',
        instructorProfile: instructorProfile ? {
          title: instructorProfile.title,
          bio: instructorProfile.bio,
          specialties: instructorProfile.specialties || [],
          rating: instructorProfile.rating || 5,
          totalStudents: totalStudentsCount || instructorProfile.totalStudents || 0,
          isApproved: instructorProfile.isApproved,
          education: instructorProfile.education || [],
          socialLinks: instructorProfile.socialLinks || {}
        } : null
      };
    }));

    return enrichedUsers;
  }

  static async getUserDetails(id: string) {
    const user = await User.findById(id).populate('role', 'name slug permissions').select('-passwordHash').lean();
    if (!user) throw new AppError('کاربر یافت نشد', 404);

    // 1. Instructor profile
    const instructorProfile = await InstructorProfile.findOne({ userId: id }).lean();

    // 2. Enrollments (Purchased / active courses)
    const enrollments = await Enrollment.find({ userId: id })
      .populate('courseId', 'title slug thumbnail price status')
      .sort({ createdAt: -1 })
      .lean();

    // 3. Orders history
    const orders = await Order.find({ userId: id }).sort({ createdAt: -1 }).lean();

    // 4. Tickets history
    const tickets = await Ticket.find({ userId: id }).sort({ createdAt: -1 }).lean();

    // 5. If instructor: get their courses and classes
    let instructorCourses: any[] = [];
    let instructorClasses: any[] = [];
    let totalInstructorStudents = 0;
    let totalCourseRevenue = 0;

    const isInstructor = (user.role as any)?.slug === 'instructor' || !!instructorProfile;
    if (isInstructor) {
      instructorCourses = await Course.find({ instructors: id }).sort({ createdAt: -1 }).lean();
      instructorClasses = await Class.find({ $or: [{ instructors: id }, { createdBy: id }] }).sort({ createdAt: -1 }).lean();
      
      const courseIds = instructorCourses.map(c => c._id);
      if (courseIds.length > 0) {
        totalInstructorStudents = await Enrollment.countDocuments({ courseId: { $in: courseIds } });
        const paidOrders = await Order.find({
          status: 'paid',
          'items.itemType': 'course',
          'items.itemId': { $in: courseIds }
        }).lean();
        
        paidOrders.forEach((o: any) => {
          o.items?.forEach((item: any) => {
            if (item.itemType === 'course' && courseIds.some((cid: any) => cid.toString() === item.itemId?.toString())) {
              totalCourseRevenue += (item.price || 0);
            }
          });
        });
      }
    }

    const paidOrders = orders.filter(o => o.status === 'paid');
    const totalSpent = paidOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    return {
      user: {
        ...user,
        bio: user.bio || instructorProfile?.bio || '',
        specialty: user.specialty || instructorProfile?.title || '',
        instructorProfile
      },
      stats: {
        totalSpent,
        paidOrdersCount: paidOrders.length,
        totalOrdersCount: orders.length,
        enrollmentsCount: enrollments.length,
        ticketsCount: tickets.length,
        isInstructor,
        totalCoursesTaught: instructorCourses.length,
        totalClassesTaught: instructorClasses.length,
        totalStudentsTaught: totalInstructorStudents,
        totalCourseRevenue
      },
      enrollments,
      orders,
      tickets,
      instructorCourses,
      instructorClasses
    };
  }

  static async updateUser(id: string, data: any) {
    if (data.firstName && data.firstName.trim().length < 2) {
      throw new AppError('نام باید حداقل ۲ کاراکتر باشد', 400);
    }
    if (data.lastName && data.lastName.trim().length < 2) {
      throw new AppError('نام خانوادگی باید حداقل ۲ کاراکتر باشد', 400);
    }
    if (data.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        throw new AppError('فرمت ایمیل نامعتبر است', 400);
      }
      const existingEmail = await User.findOne({ email: data.email.toLowerCase().trim(), _id: { $ne: id } });
      if (existingEmail) {
        throw new AppError('این ایمیل قبلاً توسط کاربر دیگری ثبت شده است', 400);
      }
      data.email = data.email.toLowerCase().trim();
    }
    if (data.mobile) {
      const mobileClean = data.mobile.trim();
      const existingMobile = await User.findOne({ mobile: mobileClean, _id: { $ne: id } });
      if (existingMobile) {
        throw new AppError('این شماره موبایل قبلاً توسط کاربر دیگری ثبت شده است', 400);
      }
      data.mobile = mobileClean;
    }
    if (data.password) {
      if (data.password.length < 6) {
        throw new AppError('رمز عبور باید حداقل ۶ کاراکتر باشد', 400);
      }
      data.passwordHash = await argon2.hash(data.password);
      delete data.password;
    }

    // Extract instructor profile fields if provided
    const { title, specialties, education, socialLinks, ...userData } = data;
    
    // Also sync bio & specialty directly to User if provided
    if (title && !userData.specialty) {
      userData.specialty = title;
    }

    const userToUpdate = await User.findByIdAndUpdate(id, userData, { new: true }).populate('role', 'name slug');
    if (!userToUpdate) throw new AppError('User not found', 404);

    // If bio or specialty or instructor fields were provided, update/upsert InstructorProfile
    if (title !== undefined || data.bio !== undefined || specialties !== undefined || education !== undefined || socialLinks !== undefined) {
      await InstructorProfile.findOneAndUpdate(
        { userId: id },
        { 
          $set: {
            title: title || userToUpdate.specialty || 'مدرس تک‌یاد',
            bio: data.bio || userToUpdate.bio || '',
            ...(specialties ? { specialties: Array.isArray(specialties) ? specialties : [specialties] } : {}),
            ...(education ? { education } : {}),
            ...(socialLinks ? { socialLinks } : {}),
            isApproved: true
          }
        },
        { upsert: true, new: true }
      );
    }

    return userToUpdate;
  }

  static async updateUserStatus(userId: string, status: 'active' | 'blocked' | 'pending') {
    const user = await User.findByIdAndUpdate(userId, { status }, { new: true });
    if (!user) throw new AppError('User not found', 404, 'NOT_FOUND');
    return user;
  }

  static async toggleTeachingCapability(
    actingUserId: string,
    targetUserId: string,
    enabled: boolean,
    clientInfo: { ip?: string; userAgent?: string; req?: any } = {}
  ) {
    // 1. Verify acting user is Super Admin
    const actingUser = await User.findById(actingUserId).populate<{ role: any }>('role');
    if (!actingUser || actingUser.role?.slug !== 'super-admin') {
      throw new AppError('تنها مدیر ارشد سیستم (Super Admin) مجاز به تغییر قابلیت تدریس برای ادمین است', 403, 'AUTH_FORBIDDEN');
    }

    // 2. Prevent self-modification
    if (actingUserId.toString() === targetUserId.toString()) {
      throw new AppError('شما نمی‌توانید قابلیت تدریس را برای حساب کاربری خود تغییر دهید', 400, 'SELF_MODIFICATION_FORBIDDEN');
    }

    // 3. Find target user
    const targetUser = await User.findById(targetUserId).populate<{ role: any }>('role');
    if (!targetUser) {
      throw new AppError('کاربر مورد نظر یافت نشد', 404, 'NOT_FOUND');
    }

    const targetRoleSlug = targetUser.role?.slug;

    // Self-protection and role rules
    if (targetRoleSlug === 'super-admin') {
      throw new AppError('مدیر کل سیستم به طور پیش‌فرض دارای کلیه اختیارات است و نیازی به تغییر ندارد', 400, 'SUPER_ADMIN_IMMUTABLE');
    }

    if (targetRoleSlug === 'instructor') {
      throw new AppError('این کاربر دارای نقش مدرس است و به طور پیش‌فرض قابلیت تدریس دارد', 400, 'ALREADY_INSTRUCTOR');
    }

    if (targetRoleSlug !== 'admin') {
      throw new AppError('اعطای مستقیم قابلیت تدریس فقط برای مدیران (ادمین‌ها) قابل اعمال است', 400, 'INVALID_TARGET_ROLE');
    }

    // 4. Update teaching capability without touching admin role or permissions
    targetUser.canTeach = enabled;
    if (enabled) {
      targetUser.instructorCapabilityGrantedBy = actingUser._id as any;
      targetUser.instructorCapabilityGrantedAt = new Date();
      // Ensure instructor profile exists so admin can teach courses and classes
      await InstructorProfile.findOneAndUpdate(
        { userId: targetUser._id },
        {
          $setOnInsert: {
            title: targetUser.specialty || 'مدرس و مدیر آموزشی تک‌یاد',
            bio: targetUser.bio || '',
            isApproved: true,
            rating: 5,
            totalStudents: 0
          }
        },
        { upsert: true, new: true }
      );
    } else {
      targetUser.instructorCapabilityRevokedAt = new Date();
    }

    await targetUser.save();

    // 5. Record in audit log system
    try {
      await AuditService.log({
        req: clientInfo.req,
        userId: actingUser._id,
        userEmail: actingUser.email,
        userName: `${actingUser.firstName} ${actingUser.lastName}`.trim(),
        userRole: 'super-admin',
        action: enabled ? 'grant_admin_teaching_capability' : 'revoke_admin_teaching_capability',
        category: 'security',
        title: enabled
          ? `فعال‌سازی قابلیت تدریس برای مدیر «${targetUser.firstName} ${targetUser.lastName}»`
          : `لغو قابلیت تدریس مدیر «${targetUser.firstName} ${targetUser.lastName}»`,
        targetId: targetUser._id.toString(),
        targetType: 'user',
        targetTitle: `${targetUser.firstName} ${targetUser.lastName}`,
        severity: 'warning',
        status: 'success',
        details: {
          actingAdmin: `${actingUser.firstName} ${actingUser.lastName} (${actingUser.email})`,
          targetUser: `${targetUser.firstName} ${targetUser.lastName} (${targetUser.email})`,
          targetRole: targetRoleSlug,
          canTeach: enabled,
          timestamp: new Date().toISOString()
        }
      });
    } catch (auditErr) {
      console.error('Audit logging error in toggleTeachingCapability:', auditErr);
    }

    // 6. Send in-app notification to the target admin
    try {
      await Notification.create({
        userId: targetUser._id,
        type: 'system',
        title: enabled ? 'اعطای قابلیت تدریس' : 'لغو قابلیت تدریس',
        message: enabled
          ? `مدیر ارشد (${actingUser.firstName} ${actingUser.lastName}) قابلیت تدریس و ایجاد دوره‌ها و کلاس‌ها را برای شما فعال نمود.`
          : `قابلیت تدریس شما توسط مدیر ارشد (${actingUser.firstName} ${actingUser.lastName}) غیرفعال شد. دسترسی اداری شما همچنان محفوظ است.`,
      });
    } catch (notifErr) {
      console.error('Notification creation error:', notifErr);
    }

    return {
      success: true,
      user: {
        id: targetUser._id,
        firstName: targetUser.firstName,
        lastName: targetUser.lastName,
        email: targetUser.email,
        role: targetRoleSlug,
        canTeach: targetUser.canTeach,
        instructorCapabilityGrantedAt: targetUser.instructorCapabilityGrantedAt,
        instructorCapabilityRevokedAt: targetUser.instructorCapabilityRevokedAt,
      },
      message: enabled
        ? 'قابلیت تدریس برای ادمین با موفقیت فعال شد'
        : 'قابلیت تدریس ادمین با موفقیت لغو شد'
    };
  }

  
  static async getOrders(query: any) {
    const page = Math.max(1, parseInt(query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 20));
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (query.status && query.status !== 'all') {
      filter.status = query.status;
    }

    if (query.search && query.search.trim()) {
      const search = query.search.trim();
      const users = await User.find({
        $or: [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { mobile: { $regex: search, $options: 'i' } }
        ]
      }).select('_id');
      const userIds = users.map(u => u._id);

      const orConditions: any[] = [{ userId: { $in: userIds } }];
      if (search.length === 24 && /^[0-9a-fA-F]{24}$/.test(search)) {
        orConditions.push({ _id: search });
      }
      filter.$or = orConditions;
    }

    const [orders, total, allPaidOrders, allOrdersCount, pendingCount, refundedCount, failedCount] = await Promise.all([
      Order.find(filter)
        .populate('userId', 'firstName lastName email mobile avatar')
        .populate('couponId', 'code value type')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments(filter),
      Order.find({ status: 'paid' }).select('totalAmount').lean(),
      Order.countDocuments(),
      Order.countDocuments({ status: 'pending' }),
      Order.countDocuments({ status: 'refunded' }),
      Order.countDocuments({ status: 'failed' })
    ]);

    const totalRevenue = allPaidOrders.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);
    const paidCount = allPaidOrders.length;
    const averageOrderValue = paidCount > 0 ? Math.round(totalRevenue / paidCount) : 0;

    return {
      orders,
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
      stats: {
        totalRevenue,
        totalOrders: allOrdersCount,
        paidCount,
        pendingCount,
        refundedCount,
        failedCount,
        averageOrderValue
      }
    };
  }

  static async getOrderById(id: string) {
    const order = await Order.findById(id)
      .populate('userId', 'firstName lastName email mobile avatar role')
      .populate('couponId', 'code value type minOrderAmount')
      .lean();
    if (!order) throw new AppError('سفارش یافت نشد', 404);

    const [courseEnrollments, classEnrollments] = await Promise.all([
      Enrollment.find({ orderId: id }).populate('courseId', 'title slug thumbnail').lean(),
      ClassEnrollment.find({ orderId: id }).populate('classId', 'title slug thumbnail').lean()
    ]);

    return {
      order,
      enrollments: {
        courses: courseEnrollments,
        classes: classEnrollments
      }
    };
  }

  static async updateOrderStatus(orderId: string, status: 'pending' | 'paid' | 'failed' | 'refunded') {
    const validStatuses = ['pending', 'paid', 'failed', 'refunded'];
    if (!validStatuses.includes(status)) {
      throw new AppError('وضعیت سفارش نامعتبر است', 400);
    }

    const order = await Order.findById(orderId);
    if (!order) throw new AppError('سفارش یافت نشد', 404);

    const previousStatus = order.status;
    order.status = status;
    await order.save();

    // If order was marked as paid, auto-enroll user in all items
    if (status === 'paid' && previousStatus !== 'paid') {
      for (const item of order.items) {
        if (item.itemType === 'course') {
          await Enrollment.findOneAndUpdate(
            { userId: order.userId, courseId: item.itemId },
            {
              orderId: order._id,
              source: 'purchase',
              status: 'active',
              amount: item.finalPrice,
              enrolledAt: new Date()
            },
            { upsert: true, new: true }
          );
        } else if (item.itemType === 'class') {
          await ClassEnrollment.findOneAndUpdate(
            { userId: order.userId, classId: item.itemId },
            {
              orderId: order._id,
              status: 'active',
              amount: item.finalPrice,
              enrolledAt: new Date()
            },
            { upsert: true, new: true }
          );
        }
      }
    } else if (status === 'refunded') {
      await Promise.all([
        Enrollment.updateMany({ orderId: order._id }, { status: 'cancelled' }),
        ClassEnrollment.updateMany({ orderId: order._id }, { status: 'cancelled' })
      ]);
    }

    return await Order.findById(orderId)
      .populate('userId', 'firstName lastName email mobile')
      .populate('couponId', 'code value type');
  }

  static async getTickets(query: any) {
    const page = Math.max(1, parseInt(query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 20));
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (query.status && query.status !== 'all') {
      filter.status = query.status;
    }
    if (query.priority && query.priority !== 'all') {
      filter.priority = query.priority;
    }

    if (query.search && query.search.trim()) {
      const search = query.search.trim();
      const users = await User.find({
        $or: [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      }).select('_id');
      const userIds = users.map(u => u._id);

      filter.$or = [
        { subject: { $regex: search, $options: 'i' } },
        { userId: { $in: userIds } }
      ];
    }

    const [tickets, total, openCount, inProgressCount, answeredCount, closedCount] = await Promise.all([
      Ticket.find(filter)
        .populate('userId', 'firstName lastName email avatar role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Ticket.countDocuments(filter),
      Ticket.countDocuments({ status: 'open' }),
      Ticket.countDocuments({ status: 'in_progress' }),
      Ticket.countDocuments({ status: 'answered' }),
      Ticket.countDocuments({ status: 'closed' })
    ]);

    const enrichedTickets = await Promise.all(tickets.map(async (t) => {
      const lastMessage = await TicketMessage.findOne({ ticketId: t._id })
        .sort({ createdAt: -1 })
        .populate('senderId', 'firstName lastName role')
        .lean();
      const messagesCount = await TicketMessage.countDocuments({ ticketId: t._id });
      return {
        ...t,
        lastMessage,
        messagesCount
      };
    }));

    return {
      tickets: enrichedTickets,
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
      stats: {
        total: await Ticket.countDocuments(),
        open: openCount,
        inProgress: inProgressCount,
        answered: answeredCount,
        closed: closedCount
      }
    };
  }

  static async getTicketDetails(ticketId: string) {
    const ticket = await Ticket.findById(ticketId)
      .populate('userId', 'firstName lastName email mobile avatar role')
      .lean();
    if (!ticket) throw new AppError('تیکت یافت نشد', 404);

    const messages = await TicketMessage.find({ ticketId })
      .populate('senderId', 'firstName lastName role avatar')
      .sort({ createdAt: 1 })
      .lean();

    return { ticket, messages };
  }

  static async adminReplyToTicket(adminId: string, ticketId: string, message: string, status?: string) {
    if (!message || !message.trim()) {
      throw new AppError('متن پاسخ نمی‌تواند خالی باشد', 400);
    }

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) throw new AppError('تیکت یافت نشد', 404);

    const newMessage = await TicketMessage.create({
      ticketId: ticket._id,
      senderId: adminId,
      message: message.trim()
    });

    ticket.status = (status as any) || 'answered';
    await ticket.save();

    const populatedMessage = await TicketMessage.findById(newMessage._id)
      .populate('senderId', 'firstName lastName role avatar')
      .lean();

    return {
      ticket,
      message: populatedMessage
    };
  }

  static async updateTicketStatus(ticketId: string, status: string, priority?: string) {
    const update: any = {};
    if (status) update.status = status;
    if (priority) update.priority = priority;

    const updated = await Ticket.findByIdAndUpdate(ticketId, update, { new: true })
      .populate('userId', 'firstName lastName email avatar');
    if (!updated) throw new AppError('تیکت یافت نشد', 404);
    return updated;
  }

  static async getClasses(query: any) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 20;
    const skip = (page - 1) * limit;
    const classes = await Class.find().populate('instructors', 'firstName lastName').sort({ createdAt: -1 }).skip(skip).limit(limit);
    const total = await Class.countDocuments();
    return { classes, total, page, pages: Math.ceil(total / limit) };
  }

  static async getRevenueStats() {
    const orders = await Order.find({ status: 'paid' });
    const totalRevenue = orders.reduce((acc, curr) => acc + curr.totalAmount, 0);
    const thisMonthRevenue = orders
      .filter(o => new Date((o as any).createdAt).getMonth() === new Date().getMonth())
      .reduce((acc, curr) => acc + curr.totalAmount, 0);
      
    const monthNames = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'];
    const monthlyData = monthNames.map(name => ({ name, revenue: 0 }));
    
    const currentYear = new Date().getFullYear();
    orders.forEach(o => {
      const date = new Date((o as any).createdAt);
      if (date.getFullYear() === currentYear) {
         const monthIndex = date.getMonth();
         if (monthlyData[monthIndex]) {
            monthlyData[monthIndex].revenue += o.totalAmount;
         }
      }
    });

    return { totalRevenue, thisMonthRevenue, ordersCount: orders.length, chartData: monthlyData };
  }

  static async getComprehensiveReports(query?: any) {
    const paidOrders = await Order.find({ status: 'paid' }).lean();
    const allOrders = await Order.find().lean();
    const totalUsers = await User.countDocuments();
    const now = new Date();

    const totalRevenue = paidOrders.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);
    
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    const thisMonthRevenue = paidOrders
      .filter(o => new Date(o.createdAt as any) >= startOfThisMonth)
      .reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);

    const lastMonthRevenue = paidOrders
      .filter(o => {
        const d = new Date(o.createdAt as any);
        return d >= startOfLastMonth && d <= endOfLastMonth;
      })
      .reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);

    const revenueGrowth = lastMonthRevenue > 0
      ? Number((((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100).toFixed(1))
      : 100;

    const monthNames = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'];
    const currentYear = now.getFullYear();
    const monthlyRevenue = monthNames.map((name, idx) => {
      const monthOrders = paidOrders.filter(o => {
        const d = new Date(o.createdAt as any);
        return d.getFullYear() === currentYear && d.getMonth() === idx;
      });
      return {
        name,
        revenue: monthOrders.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0),
        orders: monthOrders.length
      };
    });

    const last30Days: any[] = [];
    for (let i = 29; i >= 0; i--) {
      const dayDate = new Date(now);
      dayDate.setDate(now.getDate() - i);
      dayDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(dayDate);
      nextDay.setDate(dayDate.getDate() + 1);

      const dayOrders = paidOrders.filter(o => {
        const d = new Date(o.createdAt as any);
        return d >= dayDate && d < nextDay;
      });

      last30Days.push({
        date: `${dayDate.getMonth() + 1}/${dayDate.getDate()}`,
        revenue: dayOrders.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0),
        orders: dayOrders.length
      });
    }

    let coursesRevenue = 0;
    let coursesSalesCount = 0;
    let classesRevenue = 0;
    let classesSalesCount = 0;

    paidOrders.forEach(o => {
      (o.items || []).forEach(item => {
        if (item.itemType === 'course') {
          coursesRevenue += item.finalPrice || 0;
          coursesSalesCount++;
        } else if (item.itemType === 'class') {
          classesRevenue += item.finalPrice || 0;
          classesSalesCount++;
        }
      });
    });

    const courseSalesMap: Record<string, { title: string; count: number; revenue: number; thumbnail?: string }> = {};
    const classSalesMap: Record<string, { title: string; count: number; revenue: number }> = {};

    paidOrders.forEach(o => {
      (o.items || []).forEach(item => {
        const idStr = item.itemId?.toString();
        if (item.itemType === 'course') {
          if (!courseSalesMap[idStr]) {
            courseSalesMap[idStr] = { title: item.titleSnapshot, count: 0, revenue: 0, thumbnail: item.thumbnail };
          }
          courseSalesMap[idStr].count += 1;
          courseSalesMap[idStr].revenue += item.finalPrice || 0;
        } else if (item.itemType === 'class') {
          if (!classSalesMap[idStr]) {
            classSalesMap[idStr] = { title: item.titleSnapshot, count: 0, revenue: 0 };
          }
          classSalesMap[idStr].count += 1;
          classSalesMap[idStr].revenue += item.finalPrice || 0;
        }
      });
    });

    const topCourses = Object.values(courseSalesMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 6);

    const topClasses = Object.values(classSalesMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 6);

    const orderStatuses = {
      paid: allOrders.filter(o => o.status === 'paid').length,
      pending: allOrders.filter(o => o.status === 'pending').length,
      refunded: allOrders.filter(o => o.status === 'refunded').length,
      failed: allOrders.filter(o => o.status === 'failed').length
    };

    const uniquePayingUsers = new Set(paidOrders.map(o => o.userId?.toString())).size;
    const conversionRate = totalUsers > 0 ? Number(((uniquePayingUsers / totalUsers) * 100).toFixed(1)) : 0;
    const averageOrderValue = paidOrders.length > 0 ? Math.round(totalRevenue / paidOrders.length) : 0;

    const couponsUsedAgg = await Order.aggregate([
      { $match: { couponId: { $exists: true, $ne: null }, status: 'paid' } },
      { $group: { _id: '$couponId', usageCount: { $sum: 1 }, totalDiscount: { $sum: '$discountAmount' } } },
      { $sort: { usageCount: -1 } },
      { $limit: 5 }
    ]);

    const topCoupons = await Promise.all(couponsUsedAgg.map(async (c) => {
      const couponDoc = await Coupon.findById(c._id).select('code type value').lean();
      return {
        ...couponDoc,
        usageCount: c.usageCount,
        totalDiscount: c.totalDiscount
      };
    }));

    return {
      summary: {
        totalRevenue,
        thisMonthRevenue,
        lastMonthRevenue,
        revenueGrowth,
        totalOrders: allOrders.length,
        paidOrdersCount: paidOrders.length,
        averageOrderValue,
        conversionRate,
        uniquePayingUsers,
        totalUsers
      },
      monthlyRevenue,
      last30Days,
      breakdown: {
        courses: { revenue: coursesRevenue, sales: coursesSalesCount },
        classes: { revenue: classesRevenue, sales: classesSalesCount }
      },
      topCourses,
      topClasses,
      orderStatuses,
      topCoupons: topCoupons.filter(Boolean)
    };
  }

  
  // --- Super Admin ---
  static async getAdmins() {
    const adminRoles = await Role.find({ slug: { $in: ['admin', 'super-admin'] } });
    const roleIds = adminRoles.map(r => r._id);
    return await User.find({ role: { $in: roleIds } })
      .populate('role', 'name slug')
      .sort({ createdAt: -1 });
  }

  static async createAdmin(data: any) {
    if (!data.firstName || data.firstName.trim().length < 2) {
      throw new AppError('نام باید حداقل ۲ کاراکتر باشد', 400);
    }
    if (!data.lastName || data.lastName.trim().length < 2) {
      throw new AppError('نام خانوادگی باید حداقل ۲ کاراکتر باشد', 400);
    }
    if (!data.email) {
      throw new AppError('ایمیل الزامی است', 400);
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      throw new AppError('فرمت ایمیل نامعتبر است', 400);
    }
    const normalizedEmail = data.email.toLowerCase().trim();
    const existingEmail = await User.findOne({ email: normalizedEmail });
    if (existingEmail) {
      throw new AppError('این ایمیل قبلاً در سیستم ثبت شده است', 400);
    }
    data.email = normalizedEmail;

    if (data.mobile) {
      const mobileClean = data.mobile.trim();
      if (!/^09\d{9}$/.test(mobileClean) && !/^\+98\d{10}$/.test(mobileClean) && mobileClean.length < 10) {
        throw new AppError('فرمت شماره موبایل نامعتبر است (مثال: ۰۹۱۲۳۴۵۶۷۸۹)', 400);
      }
      const existingMobile = await User.findOne({ mobile: mobileClean });
      if (existingMobile) {
        throw new AppError('این شماره موبایل قبلاً در سیستم ثبت شده است', 400);
      }
      data.mobile = mobileClean;
    }

    if (!data.password || data.password.length < 8) {
      throw new AppError('رمز عبور باید حداقل ۸ کاراکتر باشد', 400);
    }

    // Only super-admin or admin role should be assignable here
    const role = await Role.findById(data.role);
    if (!role || !['admin', 'super-admin'].includes(role.slug)) {
       throw new AppError('نقش انتخاب شده برای ایجاد مدیر نامعتبر است', 400);
    }
    
    // Hash password manually
    data.passwordHash = await argon2.hash(data.password);
    delete data.password;

    // Default status to 'active' if not explicitly blocked
    data.status = data.status === 'blocked' ? 'blocked' : 'active';
    data.emailVerified = true;
    data.mobileVerified = true;

    const newUser = await User.create(data);
    return await User.findById(newUser._id).populate('role', 'name slug').select('-passwordHash');
  }

  static async updateAdmin(id: string, data: any) {
    if (data.firstName && data.firstName.trim().length < 2) {
      throw new AppError('نام باید حداقل ۲ کاراکتر باشد', 400);
    }
    if (data.lastName && data.lastName.trim().length < 2) {
      throw new AppError('نام خانوادگی باید حداقل ۲ کاراکتر باشد', 400);
    }
    if (data.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        throw new AppError('فرمت ایمیل نامعتبر است', 400);
      }
      const normalizedEmail = data.email.toLowerCase().trim();
      const existingEmail = await User.findOne({ email: normalizedEmail, _id: { $ne: id } });
      if (existingEmail) {
        throw new AppError('این ایمیل قبلاً توسط کاربر دیگری ثبت شده است', 400);
      }
      data.email = normalizedEmail;
    }
    if (data.mobile) {
      const mobileClean = data.mobile.trim();
      const existingMobile = await User.findOne({ mobile: mobileClean, _id: { $ne: id } });
      if (existingMobile) {
        throw new AppError('این شماره موبایل قبلاً توسط کاربر دیگری ثبت شده است', 400);
      }
      data.mobile = mobileClean;
    }
    if (data.password) {
      if (data.password.length < 8) {
        throw new AppError('رمز عبور باید حداقل ۸ کاراکتر باشد', 400);
      }
      data.passwordHash = await argon2.hash(data.password);
      delete data.password;
    }

    if (data.role) {
      const role = await Role.findById(data.role);
      if (!role || !['admin', 'super-admin'].includes(role.slug)) {
        throw new AppError('نقش نامعتبر است', 400);
      }
    }

    // Safety: prevent blocking super-admin
    if (data.status === 'blocked') {
      const currentAdmin = await User.findById(id).populate('role');
      if ((currentAdmin?.role as any)?.slug === 'super-admin') {
        throw new AppError('امکان مسدود کردن مدیر کل وجود ندارد', 403);
      }
    }

    const userToUpdate = await User.findByIdAndUpdate(id, data, { new: true }).populate('role', 'name slug').select('-passwordHash');
    if (!userToUpdate) throw new AppError('مدیر یافت نشد', 404);
    return userToUpdate;
  }

  static async updateAdminStatus(adminId: string, status: string) {
    const userToUpdate = await User.findById(adminId).populate('role');
    if (!userToUpdate) throw new AppError('Admin not found', 404);
    
    // Prevent blocking super-admin
    if ((userToUpdate.role as any)?.slug === 'super-admin' && status === 'blocked') {
      throw new AppError('Cannot block a super admin', 403);
    }
    
    userToUpdate.status = status as 'active' | 'blocked';
    await userToUpdate.save();
    return userToUpdate;
  }

  static async getRoles() {
    // Add user count to each role
    const roles = await Role.find().lean();
    const rolesWithCounts = await Promise.all(roles.map(async (role) => {
      const count = await User.countDocuments({ role: role._id });
      return { ...role, userCount: count };
    }));
    return rolesWithCounts.sort((a: any, b: any) => (a.createdAt > b.createdAt ? 1 : -1));
  }

  static async getRoleById(id: string) {
    const role = await Role.findById(id);
    if (!role) throw new AppError('Role not found', 404);
    return role;
  }

  static async createRole(data: any) {
    if (['super-admin', 'admin', 'instructor', 'student', 'support'].includes(data.slug)) {
       throw new AppError('Cannot create system reserved roles', 400);
    }
    
    if (data.permissions && data.permissions.includes('super_admin.access')) {
        throw new AppError('Cannot grant super_admin access to new roles', 403);
    }
    return await Role.create(data);
  }

  static async updateRole(id: string, data: any) {
    const role = await Role.findById(id);
    if (!role) throw new AppError('Role not found', 404);
    
    // Protection
    if (['super-admin', 'admin', 'instructor', 'student'].includes(role.slug)) {
       // Allow updating description and permissions (except super-admin which has all), but not slug/name
       if (role.slug === 'super-admin') {
           throw new AppError('Cannot modify super-admin role', 403);
       }
       delete data.slug; // prevent slug change
       delete data.name; // prevent name change
    }
    
    
    if (role.slug !== 'super-admin' && data.permissions && data.permissions.includes('super_admin.access')) {
        throw new AppError('Cannot grant super_admin access to non-super-admin roles', 403);
    }
    Object.assign(role, data);
    await role.save();
    return role;
  }

  static async deleteRole(id: string) {
    const role = await Role.findById(id);
    if (!role) throw new AppError('Role not found', 404);
    
    if (['super-admin', 'admin', 'instructor', 'student', 'support'].includes(role.slug)) {
       throw new AppError('Cannot delete system roles', 403);
    }
    
    const usersWithRole = await User.countDocuments({ role: id });
    if (usersWithRole > 0) {
       throw new AppError('Cannot delete role that is assigned to users', 400);
    }
    
    await role.deleteOne();
    return { success: true };
  }

  static async getCoupons() {
    const coupons = await Coupon.find().sort({ createdAt: -1 }).lean();
    const enrichedCoupons = await Promise.all(coupons.map(async (c: any) => {
      const orders = await Order.find({ couponId: c._id, status: 'paid' }).select('discountAmount').lean();
      const ordersCount = orders.length;
      const totalDiscountGiven = orders.reduce((acc, curr) => acc + (curr.discountAmount || 0), 0);
      const isExpired = c.endAt ? new Date(c.endAt) < new Date() : false;

      return {
        ...c,
        ordersCount,
        totalDiscountGiven,
        isExpired
      };
    }));
    return enrichedCoupons;
  }

  static async createCoupon(data: any) {
    if (!data.code || !data.code.trim()) {
      throw new AppError('کد تخفیف الزامی است', 400);
    }
    const code = data.code.trim().toUpperCase();

    const existing = await Coupon.findOne({ code });
    if (existing) {
      throw new AppError('کد تخفیف تکراری است', 400);
    }

    if (!['percentage', 'fixed'].includes(data.type)) {
      throw new AppError('نوع تخفیف نامعتبر است', 400);
    }

    const value = Number(data.value);
    if (isNaN(value) || value <= 0) {
      throw new AppError('مقدار تخفیف باید عددی مثبت باشد', 400);
    }

    if (data.type === 'percentage' && value > 100) {
      throw new AppError('درصد تخفیف نمی‌تواند بیشتر از ۱۰۰ باشد', 400);
    }

    const coupon = await Coupon.create({
      code,
      type: data.type,
      value,
      minOrderAmount: data.minOrderAmount ? Number(data.minOrderAmount) : undefined,
      maxDiscount: data.maxDiscount ? Number(data.maxDiscount) : undefined,
      usageLimit: data.usageLimit ? Number(data.usageLimit) : undefined,
      perUserLimit: data.perUserLimit ? Number(data.perUserLimit) : 1,
      startAt: data.startAt ? (parseDateSafely(data.startAt) || new Date()) : new Date(),
      endAt: data.endAt ? (parseDateSafely(data.endAt) || undefined) : undefined,
      applicableProducts: Array.isArray(data.applicableProducts) ? data.applicableProducts : [],
      isActive: data.isActive !== undefined ? Boolean(data.isActive) : true
    });

    return coupon;
  }

  static async updateCoupon(id: string, data: any) {
    const coupon = await Coupon.findById(id);
    if (!coupon) throw new AppError('کد تخفیف یافت نشد', 404);

    if (data.code) {
      const code = data.code.trim().toUpperCase();
      const existing = await Coupon.findOne({ code, _id: { $ne: id } });
      if (existing) {
        throw new AppError('کد تخفیف تکراری است', 400);
      }
      coupon.code = code;
    }

    if (data.type) {
      if (!['percentage', 'fixed'].includes(data.type)) {
        throw new AppError('نوع تخفیف نامعتبر است', 400);
      }
      coupon.type = data.type;
    }

    if (data.value !== undefined) {
      const value = Number(data.value);
      if (isNaN(value) || value <= 0) {
        throw new AppError('مقدار تخفیف باید عددی مثبت باشد', 400);
      }
      if (coupon.type === 'percentage' && value > 100) {
        throw new AppError('درصد تخفیف نمی‌تواند بیشتر از ۱۰۰ باشد', 400);
      }
      coupon.value = value;
    }

    if (data.minOrderAmount !== undefined) coupon.minOrderAmount = data.minOrderAmount ? Number(data.minOrderAmount) : undefined;
    if (data.maxDiscount !== undefined) coupon.maxDiscount = data.maxDiscount ? Number(data.maxDiscount) : undefined;
    if (data.usageLimit !== undefined) coupon.usageLimit = data.usageLimit ? Number(data.usageLimit) : undefined;
    if (data.perUserLimit !== undefined) coupon.perUserLimit = Number(data.perUserLimit) || 1;
    if (data.startAt !== undefined) coupon.startAt = data.startAt ? (parseDateSafely(data.startAt) || coupon.startAt) : coupon.startAt;
    if (data.endAt !== undefined) coupon.endAt = data.endAt ? (parseDateSafely(data.endAt) || undefined) : undefined;
    if (data.applicableProducts !== undefined) coupon.applicableProducts = data.applicableProducts;
    if (data.isActive !== undefined) coupon.isActive = Boolean(data.isActive);

    await coupon.save();
    return coupon;
  }

  static async toggleCouponStatus(id: string) {
    const coupon = await Coupon.findById(id);
    if (!coupon) throw new AppError('کد تخفیف یافت نشد', 404);

    coupon.isActive = !coupon.isActive;
    await coupon.save();
    return coupon;
  }

  static async deleteCoupon(id: string) {
    const coupon = await Coupon.findByIdAndDelete(id);
    if (!coupon) throw new AppError('کد تخفیف یافت نشد', 404);
    return { success: true };
  }

  // --- Audit Logs ---
  static async logAction(params: {
    userId: any;
    userEmail?: string;
    userName?: string;
    action: string;
    category?: 'auth' | 'course' | 'user' | 'order' | 'settings' | 'security' | 'settlement' | 'notification' | 'system';
    targetId?: string;
    targetType?: string;
    details?: any;
    ip?: string;
    userAgent?: string;
    status?: 'success' | 'failure' | 'warning';
  }) {
    try {
      await AuditLog.create(params);
    } catch (e) {
      console.error('AuditLog error:', e);
    }
  }

  static async getAuditLogs(query: any = {}) {
    return await AuditService.getLogs(query);
  }

  static async getAuditStats() {
    return await AuditService.getStats();
  }

  // --- Settlements & Instructor Payouts ---
  static async getSettlements(query: any = {}) {
    const filter: any = {};
    if (query.status && query.status !== 'all') filter.status = query.status;
    if (query.instructorId) filter.instructorId = query.instructorId;

    const settlements = await Settlement.find(filter)
      .sort({ createdAt: -1 })
      .populate('instructorId', 'firstName lastName email phone')
      .populate('processedBy', 'firstName lastName')
      .lean();

    // Summary statistics
    const [pendingCount, completedTotal, pendingTotal] = await Promise.all([
      Settlement.countDocuments({ status: 'pending' }),
      Settlement.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Settlement.aggregate([
        { $match: { status: 'pending' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    ]);

    return {
      settlements,
      stats: {
        pendingCount,
        totalPaidOut: completedTotal[0]?.total || 0,
        pendingAmount: pendingTotal[0]?.total || 0,
        totalSettlements: settlements.length
      }
    };
  }

  static async createSettlement(adminId: string, data: {
    instructorId: string;
    amount: number;
    shabaNumber: string;
    accountHolderName: string;
    bankName?: string;
    trackingCode?: string;
    notes?: string;
    status?: 'pending' | 'completed' | 'processing';
  }) {
    if (!data.instructorId || !data.amount || !data.shabaNumber || !data.accountHolderName) {
      throw new AppError('تمام فیلدهای الزامی تسویه‌حساب را تکمیل فرمایید', 400);
    }

    const instructor = await User.findById(data.instructorId);
    if (!instructor) throw new AppError('استاد مورد نظر یافت نشد', 404);

    const settlement = await Settlement.create({
      instructorId: data.instructorId,
      amount: Number(data.amount),
      shabaNumber: data.shabaNumber.trim(),
      accountHolderName: data.accountHolderName.trim(),
      bankName: data.bankName?.trim(),
      trackingCode: data.trackingCode?.trim(),
      notes: data.notes?.trim(),
      status: data.status || 'pending',
      processedBy: data.status === 'completed' ? adminId : undefined,
      processedAt: data.status === 'completed' ? new Date() : undefined
    });

    // Notify instructor
    await Notification.create({
      userId: instructor._id,
      title: 'درخواست تسویه‌حساب جدید',
      message: `یک درخواست تسویه حساب به مبلغ ${Number(data.amount).toLocaleString('fa-IR')} تومان ثبت شد. وضعیت: ${data.status === 'completed' ? 'پرداخت شده' : 'در حال بررسی'}`,
      type: 'financial'
    });

    return settlement;
  }

  static async updateSettlementStatus(
    adminId: string,
    settlementId: string,
    status: 'pending' | 'processing' | 'completed' | 'rejected',
    trackingCode?: string,
    rejectionReason?: string
  ) {
    const settlement = await Settlement.findById(settlementId).populate('instructorId', 'firstName lastName email');
    if (!settlement) throw new AppError('سند تسویه‌حساب یافت نشد', 404);

    settlement.status = status;
    if (trackingCode) settlement.trackingCode = trackingCode;
    if (rejectionReason) settlement.rejectionReason = rejectionReason;
    if (status === 'completed' || status === 'rejected') {
      settlement.processedAt = new Date();
      settlement.processedBy = adminId as any;
    }

    await settlement.save();

    // Send notification
    const msg = status === 'completed'
      ? `درخواست تسویه حساب شما به مبلغ ${settlement.amount.toLocaleString('fa-IR')} تومان واریز گردید. کد پیگیری: ${trackingCode || '-'}`
      : status === 'rejected'
      ? `درخواست تسویه حساب شما رد شد. علت: ${rejectionReason || 'عدم تطابق اطلاعات'}`
      : `وضعیت تسویه حساب شما به ${status} تغییر یافت.`;

    await Notification.create({
      userId: settlement.instructorId,
      title: 'بروزرسانی تسویه‌حساب',
      message: msg,
      type: 'financial'
    });

    return settlement;
  }

  // --- Comments & Reviews Moderation ---
  static async getCommentsAndReviews(query: any = {}) {
    const status = query.status || 'all';
    const type = query.type || 'all'; // 'all' | 'comment' | 'review' | 'lesson'

    const reviewFilter: any = {};
    const commentFilter: any = {};
    const generalCommentFilter: any = {};

    if (status !== 'all') {
      reviewFilter.status = status;
      commentFilter.status = status;
      generalCommentFilter.status = status;
    }

    let reviews: any[] = [];
    let lessonComments: any[] = [];
    let generalComments: any[] = [];

    if (type === 'all' || type === 'comment' || type === 'course' || type === 'class') {
      generalComments = await Comment.find(generalCommentFilter)
        .sort({ createdAt: -1 })
        .limit(100)
        .populate('userId', 'firstName lastName email avatar role')
        .populate('courseId', 'title slug')
        .populate('classId', 'title slug')
        .populate({
          path: 'parentId',
          select: 'content userId',
          populate: { path: 'userId', select: 'firstName lastName' }
        })
        .lean();
    }

    if (type === 'all' || type === 'review') {
      reviews = await CourseReview.find(reviewFilter)
        .sort({ createdAt: -1 })
        .limit(100)
        .populate('userId', 'firstName lastName email avatar')
        .populate('courseId', 'title slug')
        .lean();
    }

    if (type === 'all' || type === 'lesson') {
      lessonComments = await LessonComment.find(commentFilter)
        .sort({ createdAt: -1 })
        .limit(100)
        .populate('userId', 'firstName lastName email avatar')
        .populate('lessonId', 'title')
        .lean();
    }

    // Unify format
    const unifiedList = [
      ...generalComments.map(c => ({
        _id: c._id,
        itemType: 'comment',
        user: c.userId,
        targetTitle: c.courseId ? `دوره: ${(c.courseId as any).title}` : c.classId ? `کلاس: ${(c.classId as any).title}` : 'دوره / کلاس',
        targetLink: c.courseId?.slug ? `/courses/${c.courseId.slug}` : c.classId?.slug ? `/classes/${c.classId.slug}` : undefined,
        text: c.content || '',
        rating: c.rating,
        status: c.status,
        isTeacherReply: c.isTeacherReply,
        parentId: c.parentId,
        createdAt: c.createdAt
      })),
      ...reviews.map(r => ({
        _id: r._id,
        itemType: 'review',
        user: r.userId,
        targetTitle: r.courseId?.title || 'دوره آموزشی',
        targetLink: r.courseId?.slug ? `/courses/${r.courseId.slug}` : undefined,
        text: r.comment || '',
        rating: r.rating,
        status: r.status,
        createdAt: r.createdAt
      })),
      ...lessonComments.map(c => ({
        _id: c._id,
        itemType: 'lesson_comment',
        user: c.userId,
        targetTitle: c.lessonId?.title || 'درس آموزشی',
        text: c.text || '',
        status: c.status,
        createdAt: c.createdAt
      }))
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const stats = {
      total: unifiedList.length,
      pending: unifiedList.filter(i => i.status === 'pending').length,
      approved: unifiedList.filter(i => i.status === 'approved').length,
      rejected: unifiedList.filter(i => i.status === 'rejected').length
    };

    return { comments: unifiedList, stats };
  }

  static async moderateComment(id: string, itemType: string, status: 'approved' | 'rejected') {
    if (itemType === 'comment') {
      const comment = await Comment.findByIdAndUpdate(id, { status }, { new: true });
      if (!comment) throw new AppError('دیدگاه یافت نشد', 404);
      return comment;
    } else if (itemType === 'review') {
      const review = await CourseReview.findByIdAndUpdate(id, { status }, { new: true });
      if (!review) throw new AppError('دیدگاه دوره یافت نشد', 404);
      return review;
    } else {
      const comment = await LessonComment.findByIdAndUpdate(id, { status }, { new: true });
      if (!comment) throw new AppError('نظر درس یافت نشد', 404);
      return comment;
    }
  }

  static async deleteComment(id: string, itemType: string) {
    if (itemType === 'comment') {
      await Comment.deleteMany({ parentId: id });
      await Comment.findByIdAndDelete(id);
    } else if (itemType === 'review') {
      await CourseReview.findByIdAndDelete(id);
    } else {
      await LessonComment.findByIdAndDelete(id);
    }
    return { success: true };
  }

  // --- Broadcast Notifications / SMS Campaigns ---
  static async sendBroadcastNotification(adminId: string, data: {
    title: string;
    message: string;
    targetRole?: 'all' | 'student' | 'instructor' | 'admin' | string;
    type?: string;
    sendSms?: boolean;
    courseId?: string;
  }) {
    if (!data.title?.trim() || !data.message?.trim()) {
      throw new AppError('عنوان و پیام اعلان همگانی الزامی است', 400);
    }

    const filter: any = {};

    const targetRoleRaw = (data as any).targetRole || (data as any).role || (data as any).audience;
    const targetRole = typeof targetRoleRaw === 'string' ? targetRoleRaw.trim() : (Array.isArray(targetRoleRaw) ? String(targetRoleRaw[0] || 'all').trim() : 'all');

    // 1. Role Filtering
    if (targetRole && targetRole !== 'all') {
      if (targetRole === 'instructor' || targetRole === 'teacher' || targetRole === 'teachers') {
        const [matchedRoles, instructorProfiles] = await Promise.all([
          Role.find({
            $or: [
              { slug: { $in: ['instructor', 'teacher', 'instructors', 'teachers'] } },
              { name: /استاد/i },
              { name: /مدرس/i }
            ]
          }).select('_id').lean(),
          InstructorProfile.find().select('userId').lean()
        ]);
        const rIds = matchedRoles.map(r => r._id).filter(id => mongoose.Types.ObjectId.isValid(id)).map(id => new mongoose.Types.ObjectId(id));
        const uIds = instructorProfiles.map(p => p.userId).filter(Boolean).filter(id => mongoose.Types.ObjectId.isValid(id)).map(id => new mongoose.Types.ObjectId(id));

        const conditions: any[] = [];
        if (rIds.length > 0) conditions.push({ role: { $in: rIds } });
        if (uIds.length > 0) conditions.push({ _id: { $in: uIds } });

        if (conditions.length > 0) {
          filter.$or = conditions;
        } else {
          filter.role = { $in: [new mongoose.Types.ObjectId()] };
        }
      } else {
        let roleDocs: any[] = [];
        if (targetRole === 'admin') {
          roleDocs = await Role.find({ 
            slug: { $in: ['admin', 'super-admin', 'manager', 'support', 'content-manager'] } 
          }).select('_id');
        } else if (targetRole === 'student' || targetRole === 'students') {
          roleDocs = await Role.find({ 
            slug: { $in: ['student', 'students', 'learner'] } 
          }).select('_id');
          if (roleDocs.length === 0) {
            roleDocs = await Role.find({
              $or: [{ slug: /student/i }, { name: /دانشجو/i }]
            }).select('_id');
          }
        } else {
          if (mongoose.Types.ObjectId.isValid(targetRole)) {
            roleDocs = [{ _id: new mongoose.Types.ObjectId(targetRole) }];
          } else {
            roleDocs = await Role.find({ 
              $or: [
                { slug: targetRole }, 
                { name: targetRole },
                { slug: new RegExp(`^${targetRole}$`, 'i') }
              ] 
            }).select('_id');
          }
        }

        const roleIds: mongoose.Types.ObjectId[] = [];
        for (const r of roleDocs) {
          const idStr = r?._id ? r._id.toString() : String(r);
          if (mongoose.Types.ObjectId.isValid(idStr)) {
            roleIds.push(new mongoose.Types.ObjectId(idStr));
          }
        }

        if (roleIds.length > 0) {
          filter.role = { $in: roleIds };
        } else {
          filter.role = { $in: [new mongoose.Types.ObjectId()] };
        }
      }
    }

    // 2. Specific Course / Class audience filtering
    if (data.courseId && data.courseId !== 'all') {
      const targetUserIds: any[] = [];

      // If target is instructor or all, include instructors of that course or class
      if (!targetRole || targetRole === 'all' || targetRole === 'instructor') {
        const [courseItem, classItem] = await Promise.all([
          Course.findById(data.courseId).select('instructors createdBy').lean(),
          Class.findById(data.courseId).select('instructors createdBy').lean()
        ]);
        if (courseItem) {
          if (courseItem.instructors && Array.isArray(courseItem.instructors)) {
            targetUserIds.push(...courseItem.instructors);
          }
          if (courseItem.createdBy) targetUserIds.push(courseItem.createdBy);
        }
        if (classItem) {
          if (classItem.instructors && Array.isArray(classItem.instructors)) {
            targetUserIds.push(...classItem.instructors);
          }
          if (classItem.createdBy) targetUserIds.push(classItem.createdBy);
        }
      }

      // If target is student or all, include enrolled students of that course or class
      if (!targetRole || targetRole === 'all' || targetRole === 'student') {
        const [courseEnrollments, classEnrollments] = await Promise.all([
          Enrollment.find({ courseId: data.courseId }).select('userId').lean(),
          ClassEnrollment.find({ classId: data.courseId }).select('userId').lean()
        ]);
        targetUserIds.push(...courseEnrollments.map(e => e.userId));
        targetUserIds.push(...classEnrollments.map(c => c.userId));
      }

      const validIds = targetUserIds
        .filter(Boolean)
        .map(id => id.toString())
        .filter(id => mongoose.Types.ObjectId.isValid(id))
        .map(id => new mongoose.Types.ObjectId(id));
      filter._id = { $in: validIds };
    }

    const users = await User.find(filter).select('_id mobile email firstName lastName').lean();
    if (users.length === 0) {
      throw new AppError('هیچ کاربری با مشخصات و فیلترهای انتخابی یافت نشد', 404);
    }

    // Bulk insert notifications
    const notificationsToInsert = users.map(u => ({
      userId: u._id,
      title: data.title.trim(),
      message: data.message.trim(),
      type: data.type || 'system_announcement'
    }));

    if (notificationsToInsert.length > 0) {
      try {
        await Notification.insertMany(notificationsToInsert, { ordered: false });
      } catch (err: any) {
        // If some duplicates or non-fatal insert issues occurred
        console.warn('Notification insertMany partial notice:', err.message);
      }
    }

    // If sendSms was checked, simulate sending SMS via SMS provider configured in Settings
    let smsSent = false;
    if (data.sendSms) {
      // Log broadcast in AuditLog
      smsSent = true;
    }

    await AdminService.logAction({
      userId: adminId,
      action: 'ارسال اعلان همگانی',
      category: 'notification',
      details: {
        title: data.title,
        recipientCount: users.length,
        targetRole: data.targetRole,
        courseId: data.courseId,
        sendSms: data.sendSms
      },
      status: 'success'
    });

    return {
      recipientCount: users.length,
      smsSent,
      success: true
    };
  }

  // --- Security & Active Sessions / IP Blacklist ---
  static async getSecurityOverview() {
    const securitySettings = await Setting.findOne({ key: 'security_config' }).lean();
    const config = securitySettings?.value || {
      twoFactorRequiredForAdmins: false,
      maxLoginAttempts: 5,
      sessionTimeoutMinutes: 120,
      blockedIps: ['198.51.100.4', '203.0.113.19'],
      forceHttps: true
    };

    // Recent critical security logs
    const recentSecurityLogs = await AuditLog.find({ 
      category: { $in: ['auth', 'security'] } 
    }).sort({ createdAt: -1 }).limit(15).lean();

    // Query admin and super-admin role IDs
    const adminRoles = await Role.find({ slug: { $in: ['admin', 'super-admin'] } }).select('_id');
    const adminRoleIds = adminRoles.map(r => r._id);

    return {
      config,
      recentSecurityLogs,
      activeAdminsCount: await User.countDocuments({ role: { $in: adminRoleIds }, status: 'active' })
    };
  }

  static async updateSecurityConfig(data: any) {
    let setting = await Setting.findOne({ key: 'security_config' });
    if (!setting) {
      setting = await Setting.create({
        key: 'security_config',
        group: 'security',
        value: data
      });
    } else {
      setting.value = { ...setting.value, ...data };
      await setting.save();
    }
    return setting.value;
  }
}

