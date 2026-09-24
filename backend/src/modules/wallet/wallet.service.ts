import mongoose from "mongoose";
import { User } from "../auth/user.model.js";
import { Order } from "../commerce/order.model.js";
import { Payment } from "../commerce/payment.model.js";
import { Cart } from "../commerce/cart.model.js";
import { Coupon } from "../commerce/coupon.model.js";
import { Course } from "../courses/course.model.js";
import { Class } from "../classes/class.model.js";
import { Enrollment } from "../learning/enrollment.model.js";
import { ClassEnrollment } from "../classes/class-enrollment.model.js";
import { Notification } from "../notifications/notification.model.js";
import { AuditLog } from "../admin/audit-log.model.js";
import { AppError } from "../../common/errors/AppError.js";
import { ReferralService } from "../referral/referral.service.js";
import {
  WalletTransaction,
  IWalletTransaction,
  WalletTransactionType,
  WalletTransactionDirection,
} from "./wallet-transaction.model.js";

export class WalletService {
  /**
   * Helper: Log a completed or pending wallet transaction
   */
  static async recordTransaction(data: {
    userId: string | mongoose.Types.ObjectId;
    type: WalletTransactionType;
    direction: WalletTransactionDirection;
    amount: number;
    balanceAfter: number;
    title: string;
    description?: string;
    status?: "completed" | "pending" | "failed" | "rejected";
    referenceId?: string;
    orderId?: string | mongoose.Types.ObjectId;
    gateway?: string;
    bankInfo?: {
      shaba?: string;
      cardNumber?: string;
      accountHolder?: string;
      bankName?: string;
    };
    trackingCode?: string;
    adminNote?: string;
    processedBy?: string | mongoose.Types.ObjectId;
    session?: mongoose.ClientSession;
  }): Promise<IWalletTransaction> {
    const payload = {
      userId: data.userId,
      type: data.type,
      direction: data.direction,
      amount: data.amount,
      balanceAfter: data.balanceAfter,
      title: data.title,
      description: data.description,
      status: data.status || "completed",
      referenceId: data.referenceId,
      orderId: data.orderId,
      gateway: data.gateway,
      bankInfo: data.bankInfo,
      trackingCode: data.trackingCode,
      adminNote: data.adminNote,
      processedBy: data.processedBy,
    };

    if (data.session) {
      const [tx] = await WalletTransaction.create([payload], { session: data.session });
      return tx;
    }

    return await WalletTransaction.create(payload);
  }

  /**
   * Get user wallet overview: balance, summary stats, quick presets, recent transactions
   */
  static async getOverview(userId: string) {
    const user = await User.findById(userId).select("firstName lastName email role walletBalance referralEarnings");
    if (!user) throw new AppError("کاربر یافت نشد", 404);

    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Aggregate totals
    const [stats] = await WalletTransaction.aggregate([
      { $match: { userId: userObjectId, status: "completed" } },
      {
        $group: {
          _id: null,
          totalCredited: {
            $sum: {
              $cond: [{ $eq: ["$direction", "credit"] }, "$amount", 0],
            },
          },
          totalDebited: {
            $sum: {
              $cond: [{ $eq: ["$direction", "debit"] }, "$amount", 0],
            },
          },
          totalSpentOnOrders: {
            $sum: {
              $cond: [{ $eq: ["$type", "purchase"] }, "$amount", 0],
            },
          },
          totalReferralEarnings: {
            $sum: {
              $cond: [
                { $in: ["$type", ["referral_reward", "referral_welcome"]] },
                "$amount",
                0,
              ],
            },
          },
          totalDeposits: {
            $sum: {
              $cond: [{ $eq: ["$type", "deposit"] }, "$amount", 0],
            },
          },
        },
      },
    ]);

    // Pending withdrawals
    const [pendingWithdrawals] = await WalletTransaction.aggregate([
      { $match: { userId: userObjectId, type: "withdraw", status: "pending" } },
      {
        $group: {
          _id: null,
          pendingAmount: { $sum: "$amount" },
          pendingCount: { $sum: 1 },
        },
      },
    ]);

    // Recent transactions (last 8)
    const recentTransactions = await WalletTransaction.find({ userId: userObjectId })
      .sort({ createdAt: -1 })
      .limit(8);

    return {
      balance: user.walletBalance || 0,
      user: {
        id: user._id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        role: user.role,
      },
      stats: {
        totalCredited: stats?.totalCredited || 0,
        totalDebited: stats?.totalDebited || 0,
        totalDeposits: stats?.totalDeposits || 0,
        totalSpentOnOrders: stats?.totalSpentOnOrders || 0,
        totalReferralEarnings: stats?.totalReferralEarnings || user.referralEarnings || 0,
        pendingWithdrawalAmount: pendingWithdrawals?.pendingAmount || 0,
        pendingWithdrawalCount: pendingWithdrawals?.pendingCount || 0,
      },
      quickDepositPresets: [50000, 100000, 200000, 500000, 1000000, 2000000],
      recentTransactions,
    };
  }

  /**
   * Get paginated transactions with flexible filters
   */
  static async getTransactions(
    userId: string,
    filters: {
      page?: number;
      limit?: number;
      type?: string;
      direction?: string;
      status?: string;
      startDate?: string;
      endDate?: string;
    } = {}
  ) {
    const page = Math.max(1, Number(filters.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(filters.limit) || 15));
    const skip = (page - 1) * limit;

    const query: any = { userId: new mongoose.Types.ObjectId(userId) };

    if (filters.type && filters.type !== "all") {
      query.type = filters.type;
    }
    if (filters.direction && filters.direction !== "all") {
      query.direction = filters.direction;
    }
    if (filters.status && filters.status !== "all") {
      query.status = filters.status;
    }
    if (filters.startDate || filters.endDate) {
      query.createdAt = {};
      if (filters.startDate) query.createdAt.$gte = new Date(filters.startDate);
      if (filters.endDate) {
        const end = new Date(filters.endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    const [items, total] = await Promise.all([
      WalletTransaction.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      WalletTransaction.countDocuments(query),
    ]);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * Initiate online wallet charge via mock gateway
   */
  static async chargeWallet(userId: string, amount: number) {
    if (!amount || amount < 10000) {
      throw new AppError("حداقل مبلغ شارژ کیف پول ۱۰,۰۰۰ تومان می‌باشد", 400);
    }
    if (amount > 100000000) {
      throw new AppError("حداکثر مبلغ مجاز شارژ کیف پول ۱۰۰,۰۰۰,۰۰۰ تومان می‌باشد", 400);
    }

    const user = await User.findById(userId);
    if (!user) throw new AppError("کاربر یافت نشد", 404);

    const authority = `WALLET_${Date.now()}_${Math.floor(Math.random() * 100000)}`;

    const transaction = await WalletTransaction.create({
      userId: user._id,
      type: "deposit",
      direction: "credit",
      amount,
      balanceAfter: user.walletBalance || 0, // will update on success
      status: "pending",
      title: "افزایش اعتبار کیف پول (شتاب)",
      description: `درخواست شارژ آنلاین کیف پول به مبلغ ${amount.toLocaleString("fa-IR")} تومان`,
      referenceId: authority,
      gateway: "zarinpal_mock",
    });

    const paymentUrl = `/payment/mock-gateway?authority=${authority}&type=wallet&amount=${amount}`;

    return {
      transactionId: transaction._id,
      authority,
      amount,
      paymentUrl,
    };
  }

  /**
   * Verify online wallet charge callback from mock gateway
   */
  static async verifyCharge(userId: string, authority: string, status: "OK" | "NOK") {
    const transaction = await WalletTransaction.findOne({
      referenceId: authority,
      userId,
      type: "deposit",
    });

    if (!transaction) {
      throw new AppError("تراکنش شارژ کیف پول یافت نشد", 404);
    }

    if (transaction.status === "completed") {
      const user = await User.findById(userId);
      return {
        success: true,
        alreadyProcessed: true,
        balance: user?.walletBalance || 0,
        amount: transaction.amount,
        transaction,
      };
    }

    if (status !== "OK") {
      transaction.status = "failed";
      await transaction.save();
      return {
        success: false,
        message: "عملیات پرداخت یا شارژ لغو گردید",
      };
    }

    // Atomically increment user wallet balance
    const user = await User.findByIdAndUpdate(
      userId,
      { $inc: { walletBalance: transaction.amount } },
      { new: true }
    );

    if (!user) throw new AppError("کاربر یافت نشد", 404);

    const trackingCode = `TRK-WLT-${Date.now().toString().slice(-6)}`;
    transaction.status = "completed";
    transaction.balanceAfter = user.walletBalance || 0;
    transaction.trackingCode = trackingCode;
    await transaction.save();

    // Send in-app notification
    await Notification.create({
      userId: user._id,
      type: "system",
      title: "💳 کیف پول با موفقیت شارژ شد",
      message: `مبلغ ${transaction.amount.toLocaleString(
        "fa-IR"
      )} تومان با موفقیت به کیف پول شما افزوده شد. موجودی فعلی: ${(
        user.walletBalance || 0
      ).toLocaleString("fa-IR")} تومان. کد پیگیری: ${trackingCode}`,
      data: { transactionId: transaction._id, trackingCode },
    });

    return {
      success: true,
      amount: transaction.amount,
      balance: user.walletBalance || 0,
      trackingCode,
      transaction,
    };
  }

  /**
   * Pay for an Order entirely using Wallet Balance (1-Click Instant Payment)
   */
  static async payOrderWithWallet(userId: string, orderId: string) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const order = await Order.findOne({ _id: orderId, userId }).session(session);
      if (!order) throw new AppError("سفارش یافت نشد", 404);
      if (order.status !== "pending") {
        throw new AppError("این سفارش قبلاً پردازش یا پرداخت شده است", 400);
      }

      const user = await User.findById(userId).session(session);
      if (!user) throw new AppError("کاربر یافت نشد", 404);

      const requiredAmount = order.totalAmount;
      const currentBalance = user.walletBalance || 0;

      if (currentBalance < requiredAmount) {
        const shortage = requiredAmount - currentBalance;
        throw new AppError(
          `موجودی کیف پول شما کافی نیست. موجودی فعلی: ${currentBalance.toLocaleString(
            "fa-IR"
          )} تومان. نیاز به شارژ ${shortage.toLocaleString("fa-IR")} تومان دیگر دارید.`,
          400,
          "INSUFFICIENT_WALLET_BALANCE"
        );
      }

      // Check class capacities
      for (const item of order.items) {
        if (item.itemType === "class") {
          const classItem = await Class.findById(item.itemId).session(session);
          if (classItem && classItem.enrolledCount !== undefined && classItem.capacity !== undefined) {
            if (classItem.enrolledCount >= classItem.capacity) {
              throw new AppError(`ظرفیت کلاس «${classItem.title}» تکمیل است`, 400);
            }
          }
        }
      }

      // 1. Deduct wallet balance
      user.walletBalance = currentBalance - requiredAmount;
      await user.save({ session });

      // 2. Create debit transaction record
      const referenceId = `PAY-ORD-${order._id.toString().slice(-6)}`;
      const trackingCode = `WLT-TX-${Date.now().toString().slice(-6)}`;

      const [transaction] = await WalletTransaction.create(
        [
          {
            userId: user._id,
            type: "purchase",
            direction: "debit",
            amount: requiredAmount,
            balanceAfter: user.walletBalance,
            status: "completed",
            title: `پرداخت سفارش #${order._id.toString().slice(-6)}`,
            description: `پرداخت هزینه ${order.items.length} آیتم آموزشی با موجودی کیف پول`,
            referenceId,
            orderId: order._id,
            gateway: "wallet",
            trackingCode,
          },
        ],
        { session }
      );

      // 3. Create Payment document
      await Payment.create(
        [
          {
            orderId: order._id,
            userId: user._id,
            amount: requiredAmount,
            gateway: "wallet",
            authority: referenceId,
            referenceId: trackingCode,
            status: "paid",
            paidAt: new Date(),
          },
        ],
        { session }
      );

      // 4. Mark order as paid
      order.status = "paid";
      await order.save({ session });

      // 5. Enroll in courses & classes
      for (const item of order.items) {
        if (item.itemType === "course") {
          await Enrollment.create(
            [
              {
                userId,
                courseId: item.itemId,
                orderId: order._id,
                source: "purchase",
                status: "active",
                amount: item.finalPrice,
              },
            ],
            { session }
          );

          await Course.findByIdAndUpdate(
            item.itemId,
            { $inc: { studentCount: 1 } },
            { session }
          );
        } else if (item.itemType === "class") {
          await ClassEnrollment.create(
            [
              {
                userId,
                classId: item.itemId,
                orderId: order._id,
                status: "active",
                amount: item.finalPrice,
              },
            ],
            { session }
          );

          await Class.findByIdAndUpdate(
            item.itemId,
            { $inc: { enrolledCount: 1 } },
            { session }
          );
        }
      }

      // 6. Update coupon count if applicable
      if (order.couponId) {
        await Coupon.findByIdAndUpdate(order.couponId, { $inc: { usageCount: 1 } }, { session });
      }

      // 7. Clear purchased items from Cart
      const cart = await Cart.findOne({ userId }).session(session);
      if (cart) {
        const boughtItemIds = order.items.map((i) => i.itemId.toString());
        cart.items = cart.items.filter((i) => !boughtItemIds.includes(i.itemId.toString())) as any;
        await cart.save({ session });
      }

      // 8. Process Referral Commission for referrer
      try {
        await ReferralService.processOrderReferral(order, session);
      } catch (refErr) {
        console.error("Error processing referral on wallet payment:", refErr);
      }

      // 9. Send In-App Notification
      await Notification.create(
        [
          {
            userId: user._id,
            type: "system",
            title: "🎉 پرداخت موفق با کیف پول",
            message: `سفارش شما به مبلغ ${requiredAmount.toLocaleString(
              "fa-IR"
            )} تومان با موفقیت از طریق کیف پول پرداخت شد. دسترسی به دوره‌ها بلافاصله فعال گردید.`,
            data: { orderId: order._id, transactionId: transaction._id },
          },
        ],
        { session }
      );

      await session.commitTransaction();
      session.endSession();

      return {
        success: true,
        orderId: order._id,
        amount: requiredAmount,
        balanceAfter: user.walletBalance,
        trackingCode,
      };
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      throw err;
    }
  }

  /**
   * Request withdrawal (payout) to bank account (Shaba)
   */
  static async requestWithdrawal(
    userId: string,
    data: {
      amount: number;
      shaba: string;
      accountHolder: string;
      bankName?: string;
      cardNumber?: string;
    }
  ) {
    if (!data.amount || data.amount < 50000) {
      throw new AppError("حداقل مبلغ درخواست تسویه حساب ۵۰,۰۰۰ تومان است", 400);
    }
    if (!data.shaba || !data.accountHolder) {
      throw new AppError("شماره شبا و نام صاحب حساب الزامی است", 400);
    }

    const cleanShaba = data.shaba.trim().toUpperCase().replace(/[\s-]/g, "");
    if (!cleanShaba.startsWith("IR") || cleanShaba.length !== 26) {
      throw new AppError("شماره شبا باید با IR شروع شده و ۲۶ کاراکتر باشد", 400);
    }

    const user = await User.findById(userId);
    if (!user) throw new AppError("کاربر یافت نشد", 404);

    if ((user.walletBalance || 0) < data.amount) {
      throw new AppError(
        `موجودی کیف پول شما (${(user.walletBalance || 0).toLocaleString(
          "fa-IR"
        )} تومان) برای این درخواست کافی نیست.`,
        400
      );
    }

    // Atomically deduct the balance into held/pending status
    user.walletBalance = (user.walletBalance || 0) - data.amount;
    await user.save();

    const referenceId = `WTD-${Date.now().toString().slice(-6)}`;

    const transaction = await WalletTransaction.create({
      userId: user._id,
      type: "withdraw",
      direction: "debit",
      amount: data.amount,
      balanceAfter: user.walletBalance,
      status: "pending",
      title: "درخواست تسویه حساب به شماره شبا",
      description: `درخواست واریز به حساب ${data.accountHolder} - شبا: ${cleanShaba}`,
      referenceId,
      gateway: "settlement",
      bankInfo: {
        shaba: cleanShaba,
        accountHolder: data.accountHolder.trim(),
        bankName: data.bankName?.trim() || "بانک عضو شتاب",
        cardNumber: data.cardNumber?.trim(),
      },
    });

    // Notify user
    await Notification.create({
      userId: user._id,
      type: "system",
      title: "⏳ درخواست تسویه حساب ثبت شد",
      message: `درخواست تسویه مبلغ ${data.amount.toLocaleString(
        "fa-IR"
      )} تومان ثبت شد و طی ۱ تا ۲ روز کاری پس از بررسی پایا/ساتنا واریز خواهد شد.`,
      data: { transactionId: transaction._id, referenceId },
    });

    return transaction;
  }

  /**
   * Admin: Manual adjustment of user balance (charge or debit)
   */
  static async adminAdjustBalance(
    adminId: string,
    data: {
      targetUserId: string;
      amount: number;
      direction: "credit" | "debit";
      reason: string;
    }
  ) {
    if (!data.amount || data.amount <= 0) {
      throw new AppError("مبلغ باید بزرگتر از صفر باشد", 400);
    }
    if (!data.reason || data.reason.trim().length < 3) {
      throw new AppError("ثبت دلیل تغییر موجودی الزامی است", 400);
    }

    const targetUser = await User.findById(data.targetUserId);
    if (!targetUser) throw new AppError("کاربر مورد نظر یافت نشد", 404);

    const admin = await User.findById(adminId);

    if (data.direction === "debit") {
      if ((targetUser.walletBalance || 0) < data.amount) {
        throw new AppError(
          `موجودی کاربر (${(targetUser.walletBalance || 0).toLocaleString(
            "fa-IR"
          )} تومان) کمتر از مبلغ کسر درخواستی است`,
          400
        );
      }
      targetUser.walletBalance = (targetUser.walletBalance || 0) - data.amount;
    } else {
      targetUser.walletBalance = (targetUser.walletBalance || 0) + data.amount;
    }

    await targetUser.save();

    const trackingCode = `ADM-ADJ-${Date.now().toString().slice(-6)}`;
    const actionText = data.direction === "credit" ? "شارژ دستی توسط مدیریت" : "کسر موجودی توسط مدیریت";

    const transaction = await WalletTransaction.create({
      userId: targetUser._id,
      type: "admin_adjustment",
      direction: data.direction,
      amount: data.amount,
      balanceAfter: targetUser.walletBalance,
      status: "completed",
      title: actionText,
      description: data.reason.trim(),
      adminNote: `انجام شده توسط: ${admin ? admin.firstName + " " + admin.lastName : "مدیریت"}`,
      processedBy: admin?._id,
      trackingCode,
    });

    // Create Audit Log
    try {
      await AuditLog.create({
        userId: admin?._id,
        userEmail: admin?.email || "admin@tecyad.ir",
        userName: `${admin?.firstName || "مدیر"} ${admin?.lastName || "سیستم"}`.trim(),
        action: `تنظیم دستی موجودی کیف پول کاربر (${targetUser.email}): ${data.direction === "credit" ? "+" : "-"}${data.amount} تومان`,
        category: "settlement",
        status: "success",
        details: {
          targetUserId: targetUser._id,
          amount: data.amount,
          direction: data.direction,
          reason: data.reason,
          newBalance: targetUser.walletBalance,
        },
      });
    } catch (e) {}

    // Notify Target User
    await Notification.create({
      userId: targetUser._id,
      type: "system",
      title: data.direction === "credit" ? "🎁 افزایش موجودی کیف پول" : "ℹ️ تغییر در موجودی کیف پول",
      message: `مبلغ ${data.amount.toLocaleString("fa-IR")} تومان به دلیل «${data.reason}» ${
        data.direction === "credit" ? "به کیف پول شما افزوده شد" : "از کیف پول شما کسر گردید"
      }. موجودی فعلی: ${targetUser.walletBalance.toLocaleString("fa-IR")} تومان.`,
      data: { transactionId: transaction._id },
    });

    return {
      user: {
        id: targetUser._id,
        name: `${targetUser.firstName} ${targetUser.lastName}`,
        email: targetUser.email,
        walletBalance: targetUser.walletBalance,
      },
      transaction,
    };
  }

  /**
   * Admin: System-wide Wallet Statistics
   */
  static async adminGetStats() {
    // Total users and liabilities
    const [userBalanceAgg] = await User.aggregate([
      {
        $group: {
          _id: null,
          totalLiabilities: { $sum: { $ifNull: ["$walletBalance", 0] } },
          usersWithBalance: {
            $sum: {
              $cond: [{ $gt: ["$walletBalance", 0] }, 1, 0],
            },
          },
        },
      },
    ]);

    // Aggregate transactions by type
    const [txStats] = await WalletTransaction.aggregate([
      { $match: { status: "completed" } },
      {
        $group: {
          _id: null,
          totalDeposits: {
            $sum: { $cond: [{ $eq: ["$type", "deposit"] }, "$amount", 0] },
          },
          totalPurchases: {
            $sum: { $cond: [{ $eq: ["$type", "purchase"] }, "$amount", 0] },
          },
          totalWithdrawals: {
            $sum: { $cond: [{ $eq: ["$type", "withdraw"] }, "$amount", 0] },
          },
          totalReferralPaid: {
            $sum: {
              $cond: [
                { $in: ["$type", ["referral_reward", "referral_welcome"]] },
                "$amount",
                0,
              ],
            },
          },
        },
      },
    ]);

    // Pending withdrawals count & amount
    const [pendingWithdrawals] = await WalletTransaction.aggregate([
      { $match: { type: "withdraw", status: "pending" } },
      {
        $group: {
          _id: null,
          amount: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]);

    return {
      totalLiabilities: userBalanceAgg?.totalLiabilities || 0,
      usersWithBalance: userBalanceAgg?.usersWithBalance || 0,
      totalDeposits: txStats?.totalDeposits || 0,
      totalPurchases: txStats?.totalPurchases || 0,
      totalWithdrawals: txStats?.totalWithdrawals || 0,
      totalReferralPaid: txStats?.totalReferralPaid || 0,
      pendingWithdrawalsAmount: pendingWithdrawals?.amount || 0,
      pendingWithdrawalsCount: pendingWithdrawals?.count || 0,
    };
  }

  /**
   * Admin: Get all transactions across the entire platform
   */
  static async adminGetAllTransactions(filters: {
    page?: number;
    limit?: number;
    type?: string;
    direction?: string;
    status?: string;
    search?: string;
    userId?: string;
  } = {}) {
    const page = Math.max(1, Number(filters.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(filters.limit) || 20));
    const skip = (page - 1) * limit;

    const query: any = {};

    if (filters.userId) {
      query.userId = new mongoose.Types.ObjectId(filters.userId);
    }
    if (filters.type && filters.type !== "all") {
      query.type = filters.type;
    }
    if (filters.direction && filters.direction !== "all") {
      query.direction = filters.direction;
    }
    if (filters.status && filters.status !== "all") {
      query.status = filters.status;
    }

    // Search by tracking code or reference ID
    if (filters.search && filters.search.trim()) {
      const term = filters.search.trim();
      // First find matching users
      const matchedUsers = await User.find({
        $or: [
          { firstName: { $regex: term, $options: "i" } },
          { lastName: { $regex: term, $options: "i" } },
          { email: { $regex: term, $options: "i" } },
        ],
      }).select("_id");

      const userIds = matchedUsers.map((u) => u._id);

      query.$or = [
        { referenceId: { $regex: term, $options: "i" } },
        { trackingCode: { $regex: term, $options: "i" } },
        { title: { $regex: term, $options: "i" } },
        { userId: { $in: userIds } },
      ];
    }

    const [items, total] = await Promise.all([
      WalletTransaction.find(query)
        .populate("userId", "firstName lastName email avatar role")
        .populate("processedBy", "firstName lastName")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      WalletTransaction.countDocuments(query),
    ]);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * Admin: Approve a withdrawal request
   */
  static async adminApproveWithdrawal(
    adminId: string,
    transactionId: string,
    data: { trackingCode?: string; adminNote?: string }
  ) {
    const transaction = await WalletTransaction.findById(transactionId).populate("userId");
    if (!transaction) throw new AppError("تراکنش یافت نشد", 404);
    if (transaction.type !== "withdraw") throw new AppError("این تراکنش از نوع تسویه حساب نیست", 400);
    if (transaction.status !== "pending") {
      throw new AppError("این درخواست قبلاً تعیین وضعیت شده است", 400);
    }

    transaction.status = "completed";
    transaction.trackingCode = data.trackingCode || `PAYA-${Date.now().toString().slice(-6)}`;
    transaction.adminNote = data.adminNote;
    transaction.processedBy = new mongoose.Types.ObjectId(adminId);
    await transaction.save();

    // Send notification
    await Notification.create({
      userId: transaction.userId._id,
      type: "system",
      title: "✅ تسویه حساب با موفقیت واریز شد",
      message: `مبلغ ${transaction.amount.toLocaleString(
        "fa-IR"
      )} تومان با موفقیت به حساب شما واریز گردید. کد پیگیری بانکی (پایا/ساتنا): ${
        transaction.trackingCode
      }`,
      data: { transactionId: transaction._id, trackingCode: transaction.trackingCode },
    });

    return transaction;
  }

  /**
   * Admin: Reject a withdrawal request and refund wallet
   */
  static async adminRejectWithdrawal(
    adminId: string,
    transactionId: string,
    rejectionReason: string
  ) {
    if (!rejectionReason || rejectionReason.trim().length < 3) {
      throw new AppError("ذکر دلیل رد درخواست الزامی است", 400);
    }

    const transaction = await WalletTransaction.findById(transactionId);
    if (!transaction) throw new AppError("تراکنش یافت نشد", 404);
    if (transaction.type !== "withdraw") throw new AppError("این تراکنش از نوع تسویه حساب نیست", 400);
    if (transaction.status !== "pending") {
      throw new AppError("این درخواست قبلاً تعیین وضعیت شده است", 400);
    }

    // Refund the amount back to user's wallet
    const user = await User.findByIdAndUpdate(
      transaction.userId,
      { $inc: { walletBalance: transaction.amount } },
      { new: true }
    );

    transaction.status = "rejected";
    transaction.adminNote = rejectionReason.trim();
    transaction.processedBy = new mongoose.Types.ObjectId(adminId);
    await transaction.save();

    // Create a refund record for crystal clear audit trail
    await WalletTransaction.create({
      userId: transaction.userId,
      type: "refund",
      direction: "credit",
      amount: transaction.amount,
      balanceAfter: user?.walletBalance || 0,
      status: "completed",
      title: "بازگشت وجه تسویه حساب رد شده",
      description: `علت رد: ${rejectionReason.trim()}`,
      referenceId: transaction._id.toString(),
      adminNote: rejectionReason.trim(),
    });

    // Notify User
    await Notification.create({
      userId: transaction.userId,
      type: "system",
      title: "❌ درخواست تسویه حساب رد شد",
      message: `درخواست تسویه حساب به مبلغ ${transaction.amount.toLocaleString(
        "fa-IR"
      )} تومان رد شد و وجه به موجودی کیف پول شما بازگردانده شد. دلیل: ${rejectionReason.trim()}`,
      data: { transactionId: transaction._id, reason: rejectionReason.trim() },
    });

    return transaction;
  }
}
