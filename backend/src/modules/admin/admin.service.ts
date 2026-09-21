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


export class AdminService {
  
  // --- Global Settings ---
  static async getSettings() {
    const settings = await Setting.find().lean();
    return settings.reduce((acc, curr) => {
       acc[curr.key] = curr.value;
       return acc;
    }, {} as Record<string, any>);
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
      startAt: data.startAt ? new Date(data.startAt) : new Date(),
      endAt: data.endAt ? new Date(data.endAt) : undefined,
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
    if (data.startAt !== undefined) coupon.startAt = data.startAt ? new Date(data.startAt) : coupon.startAt;
    if (data.endAt !== undefined) coupon.endAt = data.endAt ? new Date(data.endAt) : undefined;
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
}
