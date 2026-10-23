import { Course } from '../courses/course.model.js';
import mongoose from 'mongoose';
import { Cart, ICartItem } from './cart.model.js';
import { Order } from './order.model.js';
import { Payment } from './payment.model.js';
import { Coupon } from './coupon.model.js';
import { Class } from '../classes/class.model.js';
import { Enrollment } from '../learning/enrollment.model.js';
import { ClassEnrollment } from '../classes/class-enrollment.model.js';
import { User } from '../auth/user.model.js';
import { AppError } from '../../common/errors/AppError.js';
import { ReferralService } from '../referral/referral.service.js';
import { WalletTransaction } from '../wallet/wallet-transaction.model.js';
import { Notification } from '../notifications/notification.model.js';
import { AuditService } from '../../common/services/audit.service.js';
import { FinancialRevenueService } from './financial-revenue.service.js';
import { SamanGatewayService } from './saman-gateway.service.js';
import { AccountingIntegrationService } from '../accounting/accounting-integration.service.js';
import { PlatformLocksService } from '../../common/services/platform-locks.service.js';

export class CommerceService {
  static async getInstructorSales(instructorId: string, month?: number, year?: number) {
    const courses = await Course.find({ instructors: instructorId });
    const courseIds = courses.map((c: any) => c._id.toString());
    const courseMap = new Map(courses.map((c: any) => [c._id.toString(), c.title]));

    const classes = await Class.find({ instructors: instructorId });
    const classIds = classes.map((c: any) => c._id.toString());
    const classMap = new Map(classes.map((c: any) => [c._id.toString(), c.title]));

    const allInstructorItemIds = [...courseIds, ...classIds];

    let dateFilter: any = {};
    if (month && year) {
      const m = Number(month);
      const y = Number(year);
      const startDate = new Date(y, m - 1, 1, 0, 0, 0, 0);
      const endDate = new Date(y, m, 0, 23, 59, 59, 999);
      dateFilter = { createdAt: { $gte: startDate, $lte: endDate } };
    } else if (year) {
      const y = Number(year);
      const startDate = new Date(y, 0, 1, 0, 0, 0, 0);
      const endDate = new Date(y, 11, 31, 23, 59, 59, 999);
      dateFilter = { createdAt: { $gte: startDate, $lte: endDate } };
    }

    const orders = await Order.find({
      status: 'paid',
      'items.itemId': { $in: allInstructorItemIds },
      ...dateFilter
    }).populate('userId', 'firstName lastName email avatar').sort({ createdAt: -1 });

    let totalSales = 0;
    let coursesRevenue = 0;
    let classesRevenue = 0;
    const courseStats: Record<string, { title: string, count: number, revenue: number }> = {};

    const sales: any[] = orders.map(order => {
      const relevantItems = order.items.filter(item => {
        const itemIdStr = item.itemId?.toString();
        return allInstructorItemIds.includes(itemIdStr);
      }).map((item: any) => {
        const itemIdStr = item.itemId?.toString();
        const title = item.itemType === 'course'
          ? (courseMap.get(itemIdStr) || item.title || 'دوره آموزشی')
          : (classMap.get(itemIdStr) || item.title || 'کلاس آنلاین');

        const price = item.finalPrice ?? item.price ?? 0;
        if (item.itemType === 'course') coursesRevenue += price;
        else classesRevenue += price;

        if (!courseStats[itemIdStr]) {
          courseStats[itemIdStr] = { title, count: 0, revenue: 0 };
        }
        courseStats[itemIdStr].count += 1;
        courseStats[itemIdStr].revenue += price;

        const itemInstShare = item.instructorEarningsSnapshot !== undefined && item.instructorEarningsSnapshot !== null
          ? item.instructorEarningsSnapshot
          : Math.round(price * 0.7);

        return {
          itemId: item.itemId,
          itemType: item.itemType,
          title,
          price: item.price,
          finalPrice: price,
          instructorShare: itemInstShare,
          instructorPercent: item.instructorPercentSnapshot || 70,
        };
      });

      const orderTotal = relevantItems.reduce((acc: number, curr: any) => acc + (curr.finalPrice || 0), 0);
      const instructorShare = relevantItems.reduce((acc: number, curr: any) => acc + (curr.instructorShare || 0), 0);
      totalSales += orderTotal;

      return {
        _id: order._id,
        userId: order.userId,
        items: relevantItems,
        total: orderTotal,
        instructorShare,
        createdAt: (order as any).createdAt
      };
    });

    // Query direct class enrollments (wallet enrollments & deposits)
    const classEnrollments = await ClassEnrollment.find({
      classId: { $in: classIds },
      status: { $in: ['active', 'completed'] },
      amount: { $gt: 0 },
      ...dateFilter
    }).populate('userId', 'firstName lastName email avatar').lean();

    for (const ce of classEnrollments) {
      const classIdStr = ce.classId?.toString();
      const title = classMap.get(classIdStr) || 'کلاس آموزشی';
      const price = ce.amount || 0;
      const instructorShare = (ce as any).instructorEarnings !== undefined && (ce as any).instructorEarnings !== null
        ? (ce as any).instructorEarnings
        : Math.round(price * 0.7);

      classesRevenue += price;
      totalSales += price;

      if (!courseStats[classIdStr]) {
        courseStats[classIdStr] = { title, count: 0, revenue: 0 };
      }
      courseStats[classIdStr].count += 1;
      courseStats[classIdStr].revenue += price;

      sales.push({
        _id: ce._id,
        userId: ce.userId,
        items: [{
          itemId: ce.classId,
          itemType: 'class',
          title,
          price,
          finalPrice: price,
          instructorShare,
          instructorPercent: (ce as any).instructorSharePercent || 70,
          paymentType: ce.paymentType
        }],
        total: price,
        instructorShare,
        createdAt: ce.enrolledAt || (ce as any).createdAt || new Date()
      });
    }

    // Sort all sales descending by date
    sales.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const netInstructorEarnings = sales.reduce((sum: number, s: any) => sum + (s.instructorShare || 0), 0);

    // Calculate last 6 months trend from sales array
    const monthlyTrend: { month: string, year: number, revenue: number, salesCount: number }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mNum = d.getMonth() + 1;
      const yNum = d.getFullYear();
      const mStart = new Date(yNum, mNum - 1, 1, 0, 0, 0, 0);
      const mEnd = new Date(yNum, mNum, 0, 23, 59, 59, 999);

      const mSales = sales.filter(s => {
        const sDate = new Date(s.createdAt);
        return sDate >= mStart && sDate <= mEnd;
      });
      const mRev = mSales.reduce((sum, s) => sum + s.instructorShare, 0);

      monthlyTrend.push({
        month: d.toLocaleDateString('fa-IR', { month: 'short' }),
        year: yNum,
        revenue: mRev,
        salesCount: mSales.length
      });
    }

    return {
      sales,
      totalSales,
      netInstructorEarnings,
      instructorShare: netInstructorEarnings,
      totalOrders: sales.length,
      coursesRevenue,
      classesRevenue,
      courseStats: Object.values(courseStats),
      monthlyTrend
    };
  }

  // --- Cart ---
  static async getCartDoc(userId: string) {
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = await Cart.create({ userId, items: [] });
    }
    return cart;
  }

  static async enrichCartItems(cart: any) {
    const enrichedItems: any[] = [];
    let subtotal = 0;
    let itemsChanged = false;
    const validRawItems: any[] = [];

    for (const item of cart.items) {
      const plan: 'cash' | 'installment' = item.paymentPlan === 'installment' ? 'installment' : 'cash';

      if (item.itemType === 'course') {
        const course = await Course.findById(item.itemId).populate('instructors', 'firstName lastName');
        if (!course || course.status !== 'published') {
          itemsChanged = true;
          continue;
        }
        validRawItems.push(item);

        const isFree = Boolean(course.isFree && (course.price === 0 || !course.price));
        let originalPrice = course.price ?? 0;
        let finalPrice = originalPrice;
        let discount = 0;
        let downPayment = 0;
        let monthlyInstallment = 0;

        if (isFree) {
          originalPrice = 0;
          finalPrice = 0;
          discount = 0;
        } else if (plan === 'installment') {
          // 4-month installment pricing (SnappPay 0% interest)
          const instPrice = (course.installmentPrice && course.installmentPrice > 0)
            ? course.installmentPrice
            : ((course.cashPrice || course.price || 0) * 2);
          originalPrice = instPrice;
          finalPrice = instPrice;
          discount = 0;
          downPayment = Math.round(instPrice / 4);
          monthlyInstallment = Math.round(instPrice / 4);
        } else {
          // Cash pricing with discount check
          const cashVal = (course.cashPrice && course.cashPrice > 0) ? course.cashPrice : (course.price || 0);
          const nominalFull = (course.installmentPrice && course.installmentPrice > 0) ? course.installmentPrice : (cashVal * 2);
          const validDiscount = (course.discountPrice && course.discountPrice > 0 && course.discountPrice < cashVal)
            ? course.discountPrice
            : undefined;

          finalPrice = validDiscount !== undefined ? validDiscount : cashVal;
          originalPrice = nominalFull;
          discount = Math.max(0, originalPrice - finalPrice);
        }

        subtotal += finalPrice;

        const instructor = (course.instructors && course.instructors.length > 0)
          ? `${(course.instructors[0] as any).firstName} ${(course.instructors[0] as any).lastName}`
          : 'استاد تک یاد';

        const commission = await FinancialRevenueService.resolveItemCommission('course', course._id.toString());
        const shares = FinancialRevenueService.calculateShares(finalPrice, commission.instructorSharePercent);

        enrichedItems.push({
          itemType: 'course',
          itemId: course._id.toString(),
          title: course.title,
          titleSnapshot: course.title,
          thumbnail: course.thumbnail || '',
          instructorName: instructor,
          paymentPlan: plan,
          price: originalPrice,
          discount,
          finalPrice,
          downPayment,
          monthlyInstallment,
          isFree,
          instructorId: commission.primaryInstructorId ? new mongoose.Types.ObjectId(commission.primaryInstructorId) : undefined,
          instructorPercentSnapshot: shares.instructorSharePercent,
          platformPercentSnapshot: shares.platformSharePercent,
          instructorEarningsSnapshot: shares.instructorEarnings,
          platformEarningsSnapshot: shares.platformEarnings,
        });
      } else if (item.itemType === 'class') {
        const classItem = await Class.findById(item.itemId).populate('instructors', 'firstName lastName');
        if (!classItem || classItem.status !== 'published') {
          itemsChanged = true;
          continue;
        }
        validRawItems.push(item);

        const isFree = Boolean(classItem.isFree && (classItem.price === 0 || !classItem.price));
        let originalPrice = classItem.price ?? 0;
        let finalPrice = originalPrice;
        let discount = 0;
        let downPayment = 0;
        let monthlyInstallment = 0;

        if (isFree) {
          originalPrice = 0;
          finalPrice = 0;
          discount = 0;
        } else if (plan === 'installment') {
          // 4-month installment pricing (SnappPay 0% interest)
          originalPrice = (classItem.installmentPrice && classItem.installmentPrice > 0)
            ? classItem.installmentPrice
            : (classItem.price > 0 ? classItem.price : 0);
          finalPrice = originalPrice;
          discount = 0;
          downPayment = Math.round(finalPrice * 0.25);
          monthlyInstallment = Math.round((finalPrice - downPayment) / 3);
        } else {
          // Cash pricing with discount check
          const validDiscount = (classItem.discountPrice !== undefined && classItem.discountPrice !== null && classItem.discountPrice > 0 && classItem.discountPrice < originalPrice)
            ? classItem.discountPrice
            : undefined;
          const validCash = (classItem.cashPrice !== undefined && classItem.cashPrice !== null && classItem.cashPrice > 0 && classItem.cashPrice <= originalPrice)
            ? classItem.cashPrice
            : undefined;

          finalPrice = validDiscount !== undefined ? validDiscount : (validCash !== undefined ? validCash : originalPrice);
          discount = Math.max(0, originalPrice - finalPrice);
        }

        subtotal += finalPrice;

        const instructor = (classItem.instructors && classItem.instructors.length > 0)
          ? `${(classItem.instructors[0] as any).firstName} ${(classItem.instructors[0] as any).lastName}`
          : 'استاد تک یاد';

        const commission = await FinancialRevenueService.resolveItemCommission('class', classItem._id.toString());
        const shares = FinancialRevenueService.calculateShares(finalPrice, commission.instructorSharePercent);

        enrichedItems.push({
          itemType: 'class',
          itemId: classItem._id.toString(),
          title: classItem.title,
          titleSnapshot: classItem.title,
          thumbnail: classItem.thumbnail || '',
          instructorName: instructor,
          paymentPlan: plan,
          price: originalPrice,
          discount,
          finalPrice,
          downPayment,
          monthlyInstallment,
          isFree,
          instructorId: commission.primaryInstructorId ? new mongoose.Types.ObjectId(commission.primaryInstructorId) : undefined,
          instructorPercentSnapshot: shares.instructorSharePercent,
          platformPercentSnapshot: shares.platformSharePercent,
          instructorEarningsSnapshot: shares.instructorEarnings,
          platformEarningsSnapshot: shares.platformEarnings,
        });
      }
    }

    if (itemsChanged) {
      cart.items = validRawItems;
      await cart.save();
    }

    return {
      _id: cart._id,
      userId: cart.userId,
      items: enrichedItems,
      subtotal,
      discountAmount: 0,
      totalAmount: subtotal,
    };
  }

  static async getCart(userId: string) {
    const cart = await this.getCartDoc(userId);
    return await this.enrichCartItems(cart);
  }

  static async addToCart(userId: string, data: { itemType: 'course' | 'class'; itemId: string; paymentPlan?: 'cash' | 'installment' }) {
    const cart = await this.getCartDoc(userId);
    const plan = data.paymentPlan === 'installment' ? 'installment' : 'cash';

    // Check if already in cart
    const existingIndex = cart.items.findIndex(i => i.itemId.toString() === data.itemId && i.itemType === data.itemType);
    if (existingIndex > -1) {
      if (data.paymentPlan && cart.items[existingIndex].paymentPlan !== plan) {
        cart.items[existingIndex].paymentPlan = plan;
        await cart.save();
        return await this.getCart(userId);
      }
      throw new AppError('این مورد قبلاً به سبد خرید اضافه شده است', 400, 'ALREADY_IN_CART');
    }

    if (data.itemType === 'course') {
      const course = await Course.findById(data.itemId);
      if (!course) throw new AppError('دوره مورد نظر یافت نشد', 404, 'NOT_FOUND');

      // Check if user is instructor or creator of this course
      const isInstructor = course.createdBy?.toString() === userId.toString() ||
        course.instructors?.some((instId: any) => (instId?._id || instId)?.toString() === userId.toString());
      if (isInstructor) {
        throw new AppError('شما مدرس این دوره هستید و دسترسی رایگان و کامل به تمام محتوای آن دارید.', 400, 'INSTRUCTOR_OWNER_ACCESS');
      }

      if (course.status !== 'published') throw new AppError('این دوره در دسترس نیست', 400, 'UNAVAILABLE');
      if (course.isRegistrationOpen === false) {
        throw new AppError('ثبت‌نام این دوره در حال حاضر بسته شده است.', 400, 'COURSE_REGISTRATION_CLOSED');
      }

      const existingEnrollment = await Enrollment.findOne({ userId, courseId: course._id, status: 'active' });
      if (existingEnrollment) throw new AppError('شما قبلاً در این دوره ثبت‌نام کرده‌اید', 409, 'COURSE_ALREADY_ENROLLED');
    } else if (data.itemType === 'class') {
      const classItem = await Class.findById(data.itemId);
      if (!classItem) throw new AppError('کلاس مورد نظر یافت نشد', 404, 'NOT_FOUND');

      // Check if user is instructor or creator of this class
      const isInstructor = classItem.createdBy?.toString() === userId.toString() ||
        classItem.instructors?.some((instId: any) => (instId?._id || instId)?.toString() === userId.toString());
      if (isInstructor) {
        throw new AppError('شما مدرس این کلاس هستید و دسترسی رایگان و کامل به تمام جلسات آن دارید.', 400, 'INSTRUCTOR_OWNER_ACCESS');
      }

      if (classItem.status !== 'published') throw new AppError('این کلاس در دسترس نیست یا هنوز تایید نشده است', 400, 'UNAVAILABLE');

      const now = new Date();
      const hasStarted = now >= new Date(classItem.startDate);
      const isRegOpen = classItem.registrationOpen === true || (classItem.registrationOpen !== false && !hasStarted);
      if (!isRegOpen) {
        throw new AppError(
          hasStarted ? 'کلاس آغاز شده و مهلت ثبت‌نام به پایان رسیده است' : 'ثبت‌نام این کلاس در حال حاضر توسط مدیریت بسته شده است',
          400,
          'CLASS_REGISTRATION_CLOSED'
        );
      }

      if (classItem.enrolledCount !== undefined && classItem.capacity !== undefined && classItem.enrolledCount >= classItem.capacity) {
        throw new AppError('ظرفیت کلاس تکمیل شده است', 400, 'CLASS_FULL');
      }

      const enrollment = await ClassEnrollment.findOne({ userId, classId: classItem._id, status: 'active' });
      if (enrollment) throw new AppError('شما قبلاً در این کلاس ثبت‌نام کرده‌اید', 409, 'CLASS_ALREADY_ENROLLED');
    }

    cart.items.push({ itemType: data.itemType, itemId: data.itemId as any, paymentPlan: plan });
    await cart.save();
    return await this.getCart(userId);
  }

  static async updateCartItemPlan(userId: string, itemId: string, paymentPlan: 'cash' | 'installment') {
    const cart = await this.getCartDoc(userId);
    const item = cart.items.find(i => i.itemId.toString() === itemId);
    if (!item) throw new AppError('کالای مورد نظر در سبد خرید یافت نشد', 404, 'NOT_FOUND');
    item.paymentPlan = paymentPlan === 'installment' ? 'installment' : 'cash';
    await cart.save();
    return await this.getCart(userId);
  }

  static async removeFromCart(userId: string, itemId: string) {
    const cart = await this.getCartDoc(userId);
    cart.items = cart.items.filter(i => i.itemId.toString() !== itemId) as any;
    await cart.save();
    return await this.getCart(userId);
  }

  static async clearCart(userId: string) {
    const cart = await this.getCartDoc(userId);
    cart.items = [];
    await cart.save();
    return await this.getCart(userId);
  }

  // --- Checkout & Orders ---
  static async checkoutPreview(userId: string, couponCode?: string) {
    const enriched = await this.getCart(userId);
    // If cart is empty, return empty preview instead of throwing error so Cart page doesn't break
    if (enriched.items.length === 0) {
      return { items: [], subtotal: 0, discountAmount: 0, totalAmount: 0, couponId: null };
    }

    let subtotal = enriched.subtotal;
    let discountAmount = 0;
    let couponRecord = null;

    if (couponCode) {
      const locks = PlatformLocksService.getLocksSync();
      if (locks.lockCoupons) {
        throw new AppError(
          locks.lockCouponsMessage || 'امکان استفاده از کدهای تخفیف در حال حاضر غیرفعال است.',
          400,
          'COUPONS_LOCKED'
        );
      }

      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
      if (!coupon) throw new AppError('Invalid or expired coupon', 400, 'INVALID_COUPON');

      // Basic validation
      if (coupon.startAt && new Date() < coupon.startAt) throw new AppError('Coupon is not active yet', 400, 'INVALID_COUPON');
      if (coupon.endAt && new Date() > coupon.endAt) throw new AppError('Coupon is expired', 400, 'EXPIRED_COUPON');
      if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) throw new AppError('Coupon usage limit reached', 400, 'COUPON_LIMIT');
      if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) throw new AppError(`Minimum order amount for this coupon is ${coupon.minOrderAmount}`, 400, 'COUPON_MIN_AMOUNT');

      if (coupon.type === 'percentage') {
        discountAmount = (subtotal * coupon.value) / 100;
        if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
          discountAmount = coupon.maxDiscount;
        }
      } else if (coupon.type === 'fixed') {
        discountAmount = coupon.value;
      }

      if (discountAmount > subtotal) discountAmount = subtotal;
      couponRecord = coupon;
    }

    const totalAmount = subtotal - discountAmount;
    const user = await User.findById(userId).select('walletBalance');
    const walletBalance = user?.walletBalance || 0;
    const walletAmountApplicable = Math.min(walletBalance, totalAmount);
    const remainingGatewayAmount = Math.max(0, totalAmount - walletBalance);

    return {
      items: enriched.items,
      subtotal,
      discountAmount,
      totalAmount,
      walletBalance,
      walletAmountApplicable,
      remainingGatewayAmount,
      canPayWithWallet: walletBalance >= totalAmount,
      couponId: couponRecord?._id,
      couponCode: couponRecord?.code
    };
  }

  static async createOrder(userId: string, couponCode?: string, useWallet: boolean = false) {
    const locks = PlatformLocksService.getLocksSync();
    if (locks.lockPurchases) {
      throw new AppError(
        locks.lockPurchasesMessage || 'ثبت سفارش و پرداخت اینترنتی موقتاً به دلیل به‌روزرسانی سیستم‌های مالی غیرفعال است.',
        403,
        'PURCHASES_LOCKED'
      );
    }

    const preview = await this.checkoutPreview(userId, couponCode);
    if (preview.items.length === 0) throw new AppError('Cart is empty', 400, 'CART_EMPTY');

    let walletAmountApplied = 0;
    let gatewayAmount = preview.totalAmount;
    let paymentMethod: 'gateway' | 'wallet' | 'hybrid' = 'gateway';

    if (useWallet) {
      const user = await User.findById(userId).select('walletBalance');
      const walletBalance = user?.walletBalance || 0;
      walletAmountApplied = Math.min(walletBalance, preview.totalAmount);
      gatewayAmount = preview.totalAmount - walletAmountApplied;

      if (gatewayAmount === 0 && walletAmountApplied > 0) {
        paymentMethod = 'wallet';
      } else if (walletAmountApplied > 0) {
        paymentMethod = 'hybrid';
      }
    }

    const order = await Order.create({
      userId,
      items: preview.items,
      subtotal: preview.subtotal,
      discountAmount: preview.discountAmount,
      totalAmount: preview.totalAmount,
      walletAmountApplied,
      gatewayAmount,
      paymentMethod,
      couponId: preview.couponId || undefined,
      status: 'pending'
    });

    return order;
  }

  static async getMyOrders(userId: string) {
    const orders = await Order.find({ userId }).sort({ createdAt: -1 });
    const orderIds = orders.map(o => o._id);
    const payments = await Payment.find({ orderId: { $in: orderIds }, userId });
    const paymentMap = new Map(payments.filter(p => p.orderId).map(p => [p.orderId!.toString(), p]));

    return orders.map(order => {
      const payment = paymentMap.get(order._id.toString());
      return {
        ...order.toObject(),
        paymentDetails: payment ? {
          _id: payment._id,
          resNum: payment.resNum || payment.referenceId,
          refNum: payment.refNum,
          rrn: payment.rrn,
          traceNo: payment.traceNo,
          terminalId: payment.terminalId,
          maskedPan: payment.maskedPan,
          authority: payment.authority,
          gateway: payment.gateway,
          amount: payment.amount,
          currency: payment.currency || 'تومان',
          originType: payment.originType,
          status: payment.status,
          paidAt: (payment as any).paidAt || payment.updatedAt,
          verifiedAt: payment.verifiedAt,
          returnAt: payment.returnAt,
          gatewayErrorCode: payment.gatewayErrorCode,
          gatewayErrorMessage: payment.gatewayErrorMessage,
        } : undefined
      };
    });
  }

  static async getOrderById(userId: string, orderId: string) {
    const order = await Order.findOne({ _id: orderId, userId }).populate('couponId', 'code value type');
    if (!order) throw new AppError('Order not found', 404, 'NOT_FOUND');

    const payment = await Payment.findOne({ orderId: order._id, userId });
    const user = await User.findById(userId).select('firstName lastName email mobile');

    return {
      ...order.toObject(),
      user,
      paymentDetails: payment ? {
        _id: payment._id,
        resNum: payment.resNum || payment.referenceId,
        refNum: payment.refNum,
        rrn: payment.rrn,
        traceNo: payment.traceNo,
        terminalId: payment.terminalId,
        maskedPan: payment.maskedPan,
        authority: payment.authority,
        gateway: payment.gateway,
        amount: payment.amount,
        currency: payment.currency || 'تومان',
        originType: payment.originType,
        status: payment.status,
        paidAt: (payment as any).paidAt || payment.updatedAt,
        verifiedAt: payment.verifiedAt,
        returnAt: payment.returnAt,
        gatewayErrorCode: payment.gatewayErrorCode,
        gatewayErrorMessage: payment.gatewayErrorMessage,
      } : undefined
    };
  }

  // --- Payment Gateway Flow (SEP / Saman Bank Terminal 15859910 & Hybrid Wallet) ---
  static async createPaymentMock(userId: string, orderId: string) {
    const locks = PlatformLocksService.getLocksSync();
    if (locks.lockPurchases) {
      throw new AppError(
        locks.lockPurchasesMessage || 'درگاه پرداخت و انجام تراکنش موقتاً مسدود شده است.',
        403,
        'PURCHASES_LOCKED'
      );
    }

    const order = await this.getOrderById(userId, orderId);
    if (order.status !== 'pending') throw new AppError('Order is already processed', 400, 'ORDER_PROCESSED');

    // In hybrid payment, only the remaining gatewayAmount is sent to the bank gateway
    const payableAmount = order.gatewayAmount !== undefined ? order.gatewayAmount : order.totalAmount;

    if (payableAmount === 0 && (order.walletAmountApplied || 0) > 0) {
      throw new AppError('این سفارش باید از طریق کیف پول پرداخت شود', 400);
    }

    const user = await User.findById(userId);
    const isSamanEnabled = await SamanGatewayService.isEnabled();
    const terminalId = await SamanGatewayService.getTerminalId();
    const callbackUrl = await SamanGatewayService.getCallbackUrl();

    const resNum = `ORD${order._id.toString().slice(-8)}${Date.now().toString().slice(-4)}`;
    let authority = resNum;
    let paymentUrl = '';
    let gatewayName = 'saman';
    let token: string | undefined = undefined;
    let postActionUrl: string | undefined = undefined;

    if (isSamanEnabled) {
      const sepResult = await SamanGatewayService.requestToken({
        amountToman: payableAmount,
        resNum,
        redirectUrl: callbackUrl,
        cellNumber: user?.mobile || '',
      });
      authority = sepResult.token || resNum;
      paymentUrl = sepResult.paymentUrl;
      token = sepResult.token;
      postActionUrl = sepResult.postActionUrl;

      if (order.walletAmountApplied && order.walletAmountApplied > 0) {
        gatewayName = 'hybrid_saman';
      }
    } else {
      throw new AppError('درگاه پرداخت سامان در حال حاضر غیرفعال است. لطفاً از پنل مدیریت وضعیت درگاه را بررسی نمایید.', 400);
    }

    const hasOnlyCourses = order.items.every((i: any) => i.itemType === 'course');
    const hasOnlyClasses = order.items.every((i: any) => i.itemType === 'class');
    const originType = hasOnlyCourses ? 'course_checkout' : (hasOnlyClasses ? 'class_checkout' : 'order');

    // Create a pending payment with structured tracking fields
    const payment = await Payment.create({
      orderId,
      userId,
      amount: payableAmount,
      currency: 'تومان',
      gateway: gatewayName,
      originType,
      authority,
      resNum,
      referenceId: resNum,
      terminalId: String(terminalId || ''),
      status: 'pending',
      initialStatus: 'pending',
      rawResponse: { resNum },
    });

    return {
      payment,
      paymentUrl,
      postActionUrl,
      token,
      gateway: gatewayName,
      orderId: order._id
    };

  }

  static async verifyPaymentMock(
    userId: string,
    authority: string,
    status: 'OK' | 'NOK',
    verifyData?: {
      refNum?: string;
      rrn?: string;
      traceNo?: string;
      maskedPan?: string;
      terminalId?: string;
      rawParams?: Record<string, unknown>;
    }
  ) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const payment = await Payment.findOne({
        $or: [
          { authority },
          { resNum: authority },
          { referenceId: authority }
        ],
        userId
      }).session(session);
      if (!payment) throw new AppError('Payment not found', 404, 'NOT_FOUND');
      if (payment.status !== 'pending' && payment.status !== 'under_review') {
        throw new AppError('Payment already processed', 400, 'PAYMENT_PROCESSED');
      }

      const now = new Date();
      const targetRefNum = verifyData?.refNum || payment.refNum;
      const targetTraceNo = verifyData?.traceNo || payment.traceNo;
      const targetRrn = verifyData?.rrn || payment.rrn;
      const targetMaskedPan = verifyData?.maskedPan || payment.maskedPan;
      const targetTerminalId = verifyData?.terminalId || payment.terminalId;

      // Double-spending prevention: ensure RefNum hasn't been approved for another payment
      if (targetRefNum) {
        const existingPaid = await Payment.findOne({
          refNum: targetRefNum,
          status: 'paid',
          _id: { $ne: payment._id }
        }).session(session);
        if (existingPaid) {
          throw new AppError('این رسید پرداخت قبلاً برای سفارش دیگری مصرف شده است', 400, 'DOUBLE_SPENDING');
        }
      }

      const order = await Order.findById(payment.orderId).session(session);
      if (!order) throw new AppError('Order not found', 404, 'NOT_FOUND');

      if (status !== 'OK') {
        payment.status = 'failed';
        payment.callbackState = status;
        payment.returnAt = now;
        payment.gatewayErrorMessage = 'پرداخت توسط کاربر لغو شد یا از سوی درگاه تایید نگردید';
        await payment.save({ session });
        order.status = 'failed';
        await order.save({ session });
        await session.commitTransaction();
        session.endSession();
        return { success: false, message: 'Payment cancelled or failed' };
      }

      // If Saman SEP gateway, run verification check with Bank (SEP v3.6)
      if (payment.gateway && payment.gateway.includes('saman') && targetRefNum) {
        const expectedRials = (payment.amount || 0) * 10;
        const verifyRes = await SamanGatewayService.verifyTransaction(targetRefNum, expectedRials);
        if (!verifyRes.success) {
          const isIndeterminate = verifyRes.resultCode === -1 || String(verifyRes.resultDescription || '').includes('پاسخی از سرور');
          const nextStatus = isIndeterminate ? 'under_review' : 'failed';

          payment.status = nextStatus;
          payment.callbackState = status;
          payment.verifyResultCode = verifyRes.resultCode;
          payment.gatewayErrorMessage = verifyRes.resultDescription;
          payment.refNum = targetRefNum;
          if (targetTraceNo || verifyRes.traceNo) payment.traceNo = targetTraceNo || verifyRes.traceNo;
          if (targetRrn || verifyRes.rrn) payment.rrn = targetRrn || verifyRes.rrn;
          if (targetMaskedPan || verifyRes.maskedPan) payment.maskedPan = targetMaskedPan || verifyRes.maskedPan;
          payment.returnAt = now;
          await payment.save({ session });

          order.status = nextStatus === 'under_review' ? 'pending' : 'failed';
          await order.save({ session });

          await session.commitTransaction();
          session.endSession();
          return {
            success: false,
            underReview: isIndeterminate,
            message: verifyRes.resultDescription
          };
        }
        if (verifyRes.rrn) payment.rrn = verifyRes.rrn;
        if (verifyRes.traceNo) payment.traceNo = verifyRes.traceNo;
        if (verifyRes.maskedPan) payment.maskedPan = verifyRes.maskedPan;
        payment.refNum = targetRefNum;
      } else if (verifyData) {
        if (verifyData.refNum) payment.refNum = verifyData.refNum;
        if (verifyData.rrn) payment.rrn = verifyData.rrn;
        if (verifyData.traceNo) payment.traceNo = verifyData.traceNo;
        if (verifyData.maskedPan) payment.maskedPan = verifyData.maskedPan;
      }

      if (targetTerminalId) payment.terminalId = targetTerminalId;

      // If hybrid payment, deduct wallet balance atomically inside this transaction
      if (order.walletAmountApplied && order.walletAmountApplied > 0) {
        const user = await User.findById(userId).session(session);
        if (!user) throw new AppError('کاربر یافت نشد', 404);

        if ((user.walletBalance || 0) < order.walletAmountApplied) {
          throw new AppError(
            `موجودی کیف پول شما برای تکمیل پرداخت کافی نیست`,
            400,
            'INSUFFICIENT_WALLET_BALANCE'
          );
        }

        user.walletBalance = (user.walletBalance || 0) - order.walletAmountApplied;
        await user.save({ session });

        await WalletTransaction.create([
          {
            userId: user._id,
            type: 'purchase',
            direction: 'debit',
            amount: order.walletAmountApplied,
            balanceAfter: user.walletBalance,
            status: 'completed',
            title: `پرداخت سفارش #${order._id.toString().slice(-6)} (کسر از کیف پول)`,
            description: `کسر ${order.walletAmountApplied.toLocaleString('fa-IR')} تومان از کیف پول + پرداخت ${payment.amount.toLocaleString('fa-IR')} تومان از درگاه شتاب`,
            referenceId: `HYB-ORD-${order._id.toString().slice(-6)}`,
            orderId: order._id,
            gateway: 'hybrid',
            trackingCode: payment.authority,
          }
        ], { session });

        await Notification.create([
          {
            userId: user._id,
            type: 'system',
            title: '🎉 پرداخت موفق سفارش (ترکیبی)',
            message: `سفارش شما با موفقیت ثبت شد. مبلغ ${order.walletAmountApplied.toLocaleString('fa-IR')} تومان از کیف پول شما کسر و مبلغ ${payment.amount.toLocaleString('fa-IR')} تومان از طریق درگاه پرداخت گردید.`,
            data: { orderId: order._id }
          }
        ], { session });
      }

      // 1. Verify capacity for classes again!
      for (const item of order.items) {
        if (item.itemType === 'class') {
          const classItem = await Class.findById(item.itemId).session(session);
          if (classItem && classItem.enrolledCount !== undefined && classItem.capacity !== undefined) {
            if (classItem.enrolledCount >= classItem.capacity) {
              throw new AppError(`Class ${classItem.title} is full`, 400, 'CLASS_FULL_REJECT');
            }
          }
        }
      }

      // 2. Mark Payment as success with all tracking fields
      payment.status = 'paid';
      payment.callbackState = 'OK';
      payment.verifyResultCode = 0;
      payment.returnAt = now;
      payment.paidAt = now;
      payment.verifiedAt = now;
      await payment.save({ session });

      // 3. Mark Order as paid
      order.status = 'paid';
      await order.save({ session });

      // 4. Create Enrollments and update counts + Record Instructor Revenue
      for (const item of order.items) {
        if (item.itemType === 'course') {
          // Resolve instructor revenue details if not snapshotted
          let instructorId = item.instructorId;
          let instPercent = item.instructorPercentSnapshot;
          let platPercent = item.platformPercentSnapshot;
          let instEarnings = item.instructorEarningsSnapshot;
          let platEarnings = item.platformEarningsSnapshot;

          if (instPercent === undefined || instEarnings === undefined || !instructorId) {
            const comm = await FinancialRevenueService.resolveItemCommission('course', item.itemId.toString());
            const shares = FinancialRevenueService.calculateShares(item.finalPrice, comm.instructorSharePercent);
            instPercent = shares.instructorSharePercent;
            platPercent = shares.platformSharePercent;
            instEarnings = shares.instructorEarnings;
            platEarnings = shares.platformEarnings;
            if (comm.primaryInstructorId) {
              instructorId = new mongoose.Types.ObjectId(comm.primaryInstructorId);
            }
          }

          await Enrollment.create([{
            userId,
            courseId: item.itemId,
            orderId: order._id,
            source: 'purchase',
            status: 'active',
            amount: item.finalPrice,
            instructorId,
            instructorSharePercent: instPercent,
            platformSharePercent: platPercent,
            instructorEarnings: instEarnings,
            platformEarnings: platEarnings,
            revenueSettlementStatus: 'eligible', // Self-paced course: instantly eligible for withdrawal
            revenueEligibleAt: new Date(),
          }], { session });

          await Course.findByIdAndUpdate(item.itemId, { $inc: { studentCount: 1 } }, { session });

          // Credit Instructor Wallet atomically if earnings > 0
          if (instructorId && instEarnings && instEarnings > 0) {
            const instructorUser = await User.findById(instructorId).session(session);
            if (instructorUser) {
              instructorUser.walletBalance = (instructorUser.walletBalance || 0) + instEarnings;
              await instructorUser.save({ session });

              await WalletTransaction.create([{
                userId: instructorId,
                type: 'instructor_share',
                direction: 'credit',
                amount: instEarnings,
                balanceAfter: instructorUser.walletBalance,
                status: 'completed',
                title: `سهم فروش دوره «${item.titleSnapshot}»`,
                description: `سهم ${instPercent}٪ مدرس از فروش دوره به مبلغ ${item.finalPrice.toLocaleString('fa-IR')} تومان (سفارش #${order._id.toString().slice(-6)})`,
                referenceId: order._id.toString(),
                orderId: order._id,
                gateway: 'wallet',
                trackingCode: `INS-CRS-${Date.now().toString().slice(-6)}`,
              }], { session });

              // Send in-app notification to instructor
              await Notification.create([{
                userId: instructorId,
                type: 'sale',
                title: '🎉 فروش جدید و واریز سهم مدرس',
                message: `دوره «${item.titleSnapshot}» توسط دانشجو خریداری شد. مبلغ ${instEarnings.toLocaleString('fa-IR')} تومان (${instPercent}٪) به کیف پول شما اضافه گردید.`,
                data: { orderId: order._id, courseId: item.itemId }
              }], { session });
            }
          }
        } else if (item.itemType === 'class') {
          let instructorId = item.instructorId;
          let instPercent = item.instructorPercentSnapshot;
          let platPercent = item.platformPercentSnapshot;
          let instEarnings = item.instructorEarningsSnapshot;
          let platEarnings = item.platformEarningsSnapshot;

          if (instPercent === undefined || instEarnings === undefined || !instructorId) {
            const comm = await FinancialRevenueService.resolveItemCommission('class', item.itemId.toString());
            const shares = FinancialRevenueService.calculateShares(item.finalPrice, comm.instructorSharePercent);
            instPercent = shares.instructorSharePercent;
            platPercent = shares.platformSharePercent;
            instEarnings = shares.instructorEarnings;
            platEarnings = shares.platformEarnings;
            if (comm.primaryInstructorId) {
              instructorId = new mongoose.Types.ObjectId(comm.primaryInstructorId);
            }
          }

          // Classes are held over multiple sessions: pending_completion until held, or eligible immediately for single sessions
          await ClassEnrollment.create([{
            userId,
            classId: item.itemId,
            orderId: order._id,
            status: 'active',
            amount: item.finalPrice,
            instructorId,
            instructorSharePercent: instPercent,
            platformSharePercent: platPercent,
            instructorEarnings: instEarnings,
            platformEarnings: platEarnings,
            revenueSettlementStatus: 'eligible',
            revenueEligibleAt: new Date(),
          }], { session });

          await Class.findByIdAndUpdate(item.itemId, { $inc: { enrolledCount: 1 } }, { session });

          // Credit instructor wallet for class purchase
          if (instructorId && instEarnings && instEarnings > 0) {
            const instructorUser = await User.findById(instructorId).session(session);
            if (instructorUser) {
              instructorUser.walletBalance = (instructorUser.walletBalance || 0) + instEarnings;
              await instructorUser.save({ session });

              await WalletTransaction.create([{
                userId: instructorId,
                type: 'instructor_share',
                direction: 'credit',
                amount: instEarnings,
                balanceAfter: instructorUser.walletBalance,
                status: 'completed',
                title: `سهم ثبت‌نام کلاس «${item.titleSnapshot}»`,
                description: `سهم ${instPercent}٪ مدرس از ثبت‌نام کلاس به مبلغ ${item.finalPrice.toLocaleString('fa-IR')} تومان (سفارش #${order._id.toString().slice(-6)})`,
                referenceId: order._id.toString(),
                orderId: order._id,
                gateway: 'wallet',
                trackingCode: `INS-CLS-${Date.now().toString().slice(-6)}`,
              }], { session });

              await Notification.create([{
                userId: instructorId,
                type: 'sale',
                title: '🎉 ثبت‌نام جدید در کلاس و واریز سهم مدرس',
                message: `دانشجو در کلاس «${item.titleSnapshot}» ثبت‌نام کرد. مبلغ ${instEarnings.toLocaleString('fa-IR')} تومان (${instPercent}٪) به کیف پول شما اضافه شد.`,
                data: { orderId: order._id, classId: item.itemId }
              }], { session });
            }
          }
        }
      }

      // 5. Update Coupon Usage
      if (order.couponId) {
        await Coupon.findByIdAndUpdate(order.couponId, { $inc: { usageCount: 1 } }, { session });
      }

      // 6. Clear Cart
      const cart = await Cart.findOne({ userId }).session(session);
      if (cart) {
        // Only clear items that were successfully bought
        const boughtItemIds = order.items.map(i => i.itemId.toString());
        cart.items = cart.items.filter(i => !boughtItemIds.includes(i.itemId.toString())) as any;
        await cart.save({ session });
      }

      // 7. Process Referral Reward
      try {
        await ReferralService.processOrderReferral(order, session);
      } catch (refErr) {
        console.error('Error processing referral reward:', refErr);
      }

      // Audit Log for student purchase
      AuditService.log({
        userId,
        userRole: 'student',
        action: 'order_paid',
        category: 'order',
        title: `دانشجو سفارش خرید به مبلغ ${order.totalAmount.toLocaleString('fa-IR')} تومان را پرداخت کرد`,
        targetId: order._id.toString(),
        targetType: 'order',
        targetTitle: `سفارش #${order._id.toString().slice(-6)}`,
        details: {
          itemsCount: order.items.length,
          totalAmount: order.totalAmount,
          items: order.items.map(i => ({ type: i.itemType, id: i.itemId })),
          couponId: (order as any).couponCode || order.couponId
        }
      });

      await session.commitTransaction();
      session.endSession();

      // Record in double-entry accounting ledger (idempotent, single-source of truth)
      try {
        await AccountingIntegrationService.recordOrderPayment(order, payment);
      } catch (accErr) {
        console.error('Accounting order payment recording error:', accErr);
      }

      return { success: true, orderId: order._id };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  static async getAccountingOverview(query: { startDate?: string; endDate?: string } = {}) {
    const filter: any = {};
    if (query.startDate || query.endDate) {
      filter.createdAt = {};
      if (query.startDate) filter.createdAt.$gte = new Date(query.startDate);
      if (query.endDate) filter.createdAt.$lte = new Date(query.endDate);
    }

    const [
      totalOrders,
      paidOrders,
      totalPayments,
      paidPayments,
      pendingPayments,
      failedPayments,
      refundedPayments,
      completedWalletDeposits
    ] = await Promise.all([
      Order.countDocuments(filter),
      Order.find({ ...filter, status: 'paid' }).lean(),
      Payment.countDocuments(filter),
      Payment.find({ ...filter, status: 'paid' }).lean(),
      Payment.countDocuments({ ...filter, status: 'pending' }),
      Payment.countDocuments({ ...filter, status: 'failed' }),
      Payment.find({ ...filter, status: 'refunded' }).lean(),
      WalletTransaction.find({ ...filter, type: 'deposit', status: 'completed' }).lean()
    ]);

    // Financial Metrics
    const grossPaymentRevenue = paidPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const totalOrderRevenue = paidOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const totalDiscounts = paidOrders.reduce((sum, o) => sum + (o.discountAmount || 0), 0);
    const totalRefundedAmount = refundedPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const totalWalletDeposits = completedWalletDeposits.reduce((sum, w) => sum + (w.amount || 0), 0);

    // Course vs Class sales breakdown
    let courseSalesCount = 0;
    let classSalesCount = 0;
    let courseRevenue = 0;
    let classRevenue = 0;

    for (const order of paidOrders) {
      for (const item of (order as any).items || []) {
        if (item.itemType === 'course') {
          courseSalesCount++;
          courseRevenue += item.finalPrice || item.price || 0;
        } else if (item.itemType === 'class') {
          classSalesCount++;
          classRevenue += item.finalPrice || item.price || 0;
        }
      }
    }

    // Net Revenue: Actual collected funds from paid orders minus refunds
    const netRevenue = Math.max(0, totalOrderRevenue - totalRefundedAmount);

    return {
      ordersCount: totalOrders,
      paidOrdersCount: paidOrders.length,
      totalPayments,
      paymentsSummary: {
        paidCount: paidPayments.length,
        pendingCount: pendingPayments,
        failedCount: failedPayments,
        refundedCount: refundedPayments.length,
      },
      financials: {
        grossRevenue: grossPaymentRevenue,
        orderRevenue: totalOrderRevenue,
        totalDiscounts,
        totalRefunds: totalRefundedAmount,
        netRevenue,
        currency: 'تومان'
      },
      salesBreakdown: {
        courses: { count: courseSalesCount, revenue: courseRevenue },
        classes: { count: classSalesCount, revenue: classRevenue }
      },
      walletSummary: {
        depositCount: completedWalletDeposits.length,
        totalDepositAmount: totalWalletDeposits
      }
    };
  }

  static async getAccountingTransactions(params: {
    page?: number;
    limit?: number;
    status?: string;
    type?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(params.limit) || 15));
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (params.status && params.status !== 'all') {
      filter.status = params.status;
    }
    if (params.type && params.type !== 'all') {
      filter.originType = params.type;
    }
    if (params.startDate || params.endDate) {
      filter.createdAt = {};
      if (params.startDate) filter.createdAt.$gte = new Date(params.startDate);
      if (params.endDate) filter.createdAt.$lte = new Date(params.endDate);
    }

    if (params.search && params.search.trim()) {
      const term = params.search.trim();
      filter.$or = [
        { resNum: { $regex: term, $options: 'i' } },
        { refNum: { $regex: term, $options: 'i' } },
        { traceNo: { $regex: term, $options: 'i' } },
        { rrn: { $regex: term, $options: 'i' } },
        { referenceId: { $regex: term, $options: 'i' } },
        { authority: { $regex: term, $options: 'i' } }
      ];
    }

    const [total, payments] = await Promise.all([
      Payment.countDocuments(filter),
      Payment.find(filter)
        .populate('userId', 'firstName lastName email mobile')
        .populate({
          path: 'orderId',
          select: 'items totalAmount discountAmount status paymentMethod'
        })
        .populate('walletTransactionId', 'title description amount status')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
    ]);

    const sanitizedPayments = payments.map((p: any) => ({
      _id: p._id,
      amount: p.amount,
      currency: p.currency || 'تومان',
      gateway: p.gateway,
      originType: p.originType || (p.walletTransactionId ? 'wallet_topup' : 'order'),
      status: p.status,
      resNum: p.resNum || p.referenceId,
      refNum: p.refNum,
      rrn: p.rrn,
      traceNo: p.traceNo,
      terminalId: p.terminalId,
      maskedPan: p.maskedPan,
      gatewayErrorCode: p.gatewayErrorCode,
      gatewayErrorMessage: p.gatewayErrorMessage,
      createdAt: p.createdAt,
      returnAt: p.returnAt,
      verifiedAt: p.verifiedAt || p.paidAt,
      user: p.userId ? {
        id: p.userId._id,
        name: `${p.userId.firstName || ''} ${p.userId.lastName || ''}`.trim(),
        mobile: p.userId.mobile,
        email: p.userId.email
      } : null,
      order: p.orderId ? {
        id: p.orderId._id,
        itemsCount: p.orderId.items?.length || 0,
        items: p.orderId.items?.map((it: any) => it.titleSnapshot) || [],
        totalAmount: p.orderId.totalAmount
      } : null,
      walletTx: p.walletTransactionId ? {
        id: p.walletTransactionId._id,
        title: p.walletTransactionId.title,
        status: p.walletTransactionId.status
      } : null
    }));

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      transactions: sanitizedPayments
    };
  }

  static async getAccountingTransactionById(id: string) {
    const payment = await Payment.findById(id)
      .populate('userId', 'firstName lastName email mobile status')
      .populate({
        path: 'orderId',
        select: 'items totalAmount discountAmount walletAmountApplied gatewayAmount status paymentMethod createdAt'
      })
      .populate('walletTransactionId')
      .lean();

    if (!payment) {
      throw new AppError('تراکنش مالی یافت نشد', 404);
    }

    return {
      _id: payment._id,
      amount: payment.amount,
      currency: payment.currency || 'تومان',
      gateway: payment.gateway,
      originType: payment.originType || (payment.walletTransactionId ? 'wallet_topup' : 'order'),
      status: payment.status,
      resNum: payment.resNum || payment.referenceId,
      refNum: payment.refNum,
      rrn: payment.rrn,
      traceNo: payment.traceNo,
      terminalId: payment.terminalId,
      maskedPan: payment.maskedPan,
      gatewayErrorCode: payment.gatewayErrorCode,
      gatewayErrorMessage: payment.gatewayErrorMessage,
      createdAt: payment.createdAt,
      returnAt: payment.returnAt,
      verifiedAt: payment.verifiedAt || payment.paidAt,
      user: payment.userId,
      order: payment.orderId,
      walletTransaction: payment.walletTransactionId
    };
  }
}
