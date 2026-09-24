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

    const sales = orders.map(order => {
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

        return {
          itemId: item.itemId,
          itemType: item.itemType,
          title,
          price: item.price,
          finalPrice: price
        };
      });

      const orderTotal = relevantItems.reduce((acc: number, curr: any) => acc + (curr.finalPrice || 0), 0);
      const instructorShare = Math.round(orderTotal * 0.7); // 70% instructor share
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

    const netInstructorEarnings = Math.round(totalSales * 0.7);

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
      if (item.itemType === 'course') {
        const course = await Course.findById(item.itemId).populate('instructors', 'firstName lastName');
        if (!course || course.status !== 'published') {
          itemsChanged = true;
          continue;
        }
        validRawItems.push(item);
        const originalPrice = course.price ?? 0;
        const finalPrice = (course.discountPrice !== undefined && course.discountPrice !== null && course.discountPrice < originalPrice)
          ? course.discountPrice 
          : originalPrice;
        const discount = originalPrice - finalPrice;
        subtotal += finalPrice;

        const instructor = (course.instructors && course.instructors.length > 0)
          ? `${(course.instructors[0] as any).firstName} ${(course.instructors[0] as any).lastName}`
          : 'استاد تک‌یاد';

        enrichedItems.push({
          itemType: 'course',
          itemId: course._id.toString(),
          title: course.title,
          titleSnapshot: course.title,
          thumbnail: course.thumbnail || '',
          instructorName: instructor,
          price: originalPrice,
          discount,
          finalPrice,
        });
      } else if (item.itemType === 'class') {
        const classItem = await Class.findById(item.itemId).populate('instructors', 'firstName lastName');
        if (!classItem || classItem.status !== 'published') {
          itemsChanged = true;
          continue;
        }
        validRawItems.push(item);
        const originalPrice = classItem.price ?? 0;
        const finalPrice = originalPrice;
        subtotal += finalPrice;

        const instructor = (classItem.instructors && classItem.instructors.length > 0)
          ? `${(classItem.instructors[0] as any).firstName} ${(classItem.instructors[0] as any).lastName}`
          : 'استاد تک‌یاد';

        enrichedItems.push({
          itemType: 'class',
          itemId: classItem._id.toString(),
          title: classItem.title,
          titleSnapshot: classItem.title,
          thumbnail: classItem.thumbnail || '',
          instructorName: instructor,
          price: originalPrice,
          discount: 0,
          finalPrice,
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

  static async addToCart(userId: string, data: { itemType: 'course' | 'class'; itemId: string }) {
    const cart = await this.getCartDoc(userId);
    
    // Check if already in cart
    const exists = cart.items.find(i => i.itemId.toString() === data.itemId && i.itemType === data.itemType);
    if (exists) throw new AppError('Item already in cart', 400, 'ALREADY_IN_CART');

    if (data.itemType === 'course') {
      const course = await Course.findById(data.itemId);
      if (!course) throw new AppError('Course not found', 404, 'NOT_FOUND');
      if (course.status !== 'published') throw new AppError('Course is not available', 400, 'UNAVAILABLE');
      if (course.price === 0) throw new AppError('This is a free course. Enroll directly.', 400, 'IS_FREE');

      const enrollment = await Enrollment.findOne({ userId, courseId: course._id, status: 'active' });
      if (enrollment) throw new AppError('You are already enrolled in this course', 409, 'COURSE_ALREADY_ENROLLED');
    } else if (data.itemType === 'class') {
      const classItem = await Class.findById(data.itemId);
      if (!classItem) throw new AppError('Class not found', 404, 'NOT_FOUND');
      if (classItem.status !== 'published') throw new AppError('Class is not available', 400, 'UNAVAILABLE');
      if (classItem.enrolledCount !== undefined && classItem.capacity !== undefined && classItem.enrolledCount >= classItem.capacity) {
        throw new AppError('Class is full', 400, 'CLASS_FULL');
      }

      const enrollment = await ClassEnrollment.findOne({ userId, classId: classItem._id, status: 'active' });
      if (enrollment) throw new AppError('You are already enrolled in this class', 409, 'CLASS_ALREADY_ENROLLED');
    }

    cart.items.push({ itemType: data.itemType, itemId: data.itemId as any });
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

    return {
      items: enriched.items,
      subtotal,
      discountAmount,
      totalAmount,
      walletBalance,
      canPayWithWallet: walletBalance >= totalAmount,
      couponId: couponRecord?._id,
      couponCode: couponRecord?.code
    };
  }

  static async createOrder(userId: string, couponCode?: string) {
    const preview = await this.checkoutPreview(userId, couponCode);
    if (preview.items.length === 0) throw new AppError('Cart is empty', 400, 'CART_EMPTY');
    
    // NOTE: We don't increase coupon usageCount here, only on successful payment!
    
    const order = await Order.create({
      userId,
      items: preview.items,
      subtotal: preview.subtotal,
      discountAmount: preview.discountAmount,
      totalAmount: preview.totalAmount,
      couponId: preview.couponId || undefined,
      status: 'pending'
    });

    return order;
  }

  static async getMyOrders(userId: string) {
    return await Order.find({ userId }).sort({ createdAt: -1 });
  }

  static async getOrderById(userId: string, orderId: string) {
    const order = await Order.findOne({ _id: orderId, userId });
    if (!order) throw new AppError('Order not found', 404, 'NOT_FOUND');
    return order;
  }

  // --- Payment Mock / Flow ---
  static async createPaymentMock(userId: string, orderId: string) {
    const order = await this.getOrderById(userId, orderId);
    if (order.status !== 'pending') throw new AppError('Order is already processed', 400, 'ORDER_PROCESSED');
    
    // Create a pending payment
    const payment = await Payment.create({
      orderId,
      userId,
      amount: order.totalAmount,
      gateway: 'zarinpal_mock',
      authority: `AUTH_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      status: 'pending'
    });

    return { payment, paymentUrl: `/payment/mock-gateway?authority=${payment.authority}` };
  }

  static async verifyPaymentMock(userId: string, authority: string, status: 'OK' | 'NOK') {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const payment = await Payment.findOne({ authority, userId }).session(session);
      if (!payment) throw new AppError('Payment not found', 404, 'NOT_FOUND');
      if (payment.status !== 'pending') throw new AppError('Payment already processed', 400, 'PAYMENT_PROCESSED');

      const order = await Order.findById(payment.orderId).session(session);
      if (!order) throw new AppError('Order not found', 404, 'NOT_FOUND');

      if (status !== 'OK') {
        payment.status = 'failed';
        await payment.save({ session });
        order.status = 'failed';
        await order.save({ session });
        await session.commitTransaction();
        session.endSession();
        return { success: false, message: 'Payment failed' };
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

      // 2. Mark Payment as success
      payment.status = 'paid';
      await payment.save({ session });

      // 3. Mark Order as paid
      order.status = 'paid';
      await order.save({ session });

      // 4. Create Enrollments and update counts
      for (const item of order.items) {
        if (item.itemType === 'course') {
          await Enrollment.create([{
            userId,
            courseId: item.itemId,
            orderId: order._id,
            source: 'purchase',
            status: 'active',
            amount: item.finalPrice
          }], { session });

          await Course.findByIdAndUpdate(item.itemId, { $inc: { studentCount: 1 } }, { session });
        } else if (item.itemType === 'class') {
          await ClassEnrollment.create([{
            userId,
            classId: item.itemId,
            orderId: order._id,
            status: 'active',
            amount: item.finalPrice
          }], { session });

          await Class.findByIdAndUpdate(item.itemId, { $inc: { enrolledCount: 1 } }, { session });
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

      await session.commitTransaction();
      session.endSession();
      return { success: true, orderId: order._id };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }
}
