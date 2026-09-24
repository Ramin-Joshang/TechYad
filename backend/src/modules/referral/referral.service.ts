import mongoose from "mongoose";
import { User, IUser } from "../auth/user.model.js";
import { Referral, IReferral } from "./referral.model.js";
import { ReferralPayout, IReferralPayout } from "./referral-payout.model.js";
import { ReferralSetting, IReferralSetting } from "./referral-setting.model.js";
import { Course } from "../courses/course.model.js";
import { Order } from "../commerce/order.model.js";
import { Notification } from "../notifications/notification.model.js";
import { AppError } from "../../common/errors/AppError.js";
import { WalletTransaction } from "../wallet/wallet-transaction.model.js";

// Helper to generate a random readable 6-7 char referral code
function generateRandomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export class ReferralService {
  // Ensure default settings exist
  static async getSettings(): Promise<IReferralSetting> {
    let settings = await ReferralSetting.findOne();
    if (!settings) {
      settings = await ReferralSetting.create({
        isActive: true,
        rewardMode: "percentage",
        defaultCommissionPercent: 15,
        fixedRewardAmount: 50000,
        refereeDiscountPercent: 10,
        refereeWelcomeCredit: 20000,
        instructorCommissionPercent: 20,
        minWithdrawalAmount: 100000,
        qualificationCondition: "first_purchase",
        autoCreditWallet: true,
        termsAndConditions: "پاداش معرفی پس از انجام اولین خرید موفق کاربر دعوت‌شده به کیف پول واریز خواهد شد.",
      });
    }
    return settings;
  }

  static async updateSettings(data: Partial<IReferralSetting>): Promise<IReferralSetting> {
    let settings = await ReferralSetting.findOne();
    if (!settings) {
      settings = await ReferralSetting.create(data);
    } else {
      Object.assign(settings, data);
      await settings.save();
    }
    return settings;
  }

  // Ensure user has a referral code
  static async ensureUserReferralCode(user: IUser): Promise<string> {
    if (user.referralCode && user.referralCode.trim() !== "") {
      return user.referralCode;
    }

    let code = "";
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 10) {
      code = generateRandomCode();
      const existing = await User.findOne({ referralCode: code });
      if (!existing) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      code = `USR${Date.now().toString().slice(-4)}`;
    }

    user.referralCode = code;
    await user.save();
    return code;
  }

  // Calculate user tier based on invited counts
  static calculateTier(referralCount: number) {
    if (referralCount >= 30) {
      return {
        level: "diamond",
        name: "الماس (Diamond)",
        color: "indigo",
        bonusRate: 8, // +8% extra commission
        minInvites: 30,
        nextTier: null,
        invitesNeededForNext: 0,
        badgeText: "بالاترین سطح همکاری",
      };
    } else if (referralCount >= 15) {
      return {
        level: "gold",
        name: "طلایی (Gold)",
        color: "amber",
        bonusRate: 5, // +5% extra
        minInvites: 15,
        nextTier: "الماس",
        invitesNeededForNext: 30 - referralCount,
        badgeText: "عضو طلایی باشگاه",
      };
    } else if (referralCount >= 5) {
      return {
        level: "silver",
        name: "نقره‌ای (Silver)",
        color: "slate",
        bonusRate: 2, // +2% extra
        minInvites: 5,
        nextTier: "طلایی",
        invitesNeededForNext: 15 - referralCount,
        badgeText: "عضو نقره‌ای باشگاه",
      };
    } else {
      return {
        level: "bronze",
        name: "برنزی (Bronze)",
        color: "amber-800",
        bonusRate: 0,
        minInvites: 0,
        nextTier: "نقره‌ای",
        invitesNeededForNext: 5 - referralCount,
        badgeText: "سطح مقدماتی",
      };
    }
  }

  // Validate referral code (used before registration or during checkout)
  static async validateReferralCode(code: string) {
    if (!code) throw new AppError("کد معرف الزامی است", 400);
    const normalized = code.trim().toUpperCase();
    const referrer = await User.findOne({ referralCode: normalized }).select("firstName lastName avatar role");
    if (!referrer) {
      throw new AppError("کد معرف نامعتبر است", 404, "INVALID_REFERRAL_CODE");
    }
    const settings = await this.getSettings();
    return {
      valid: true,
      referrerName: `${referrer.firstName} ${referrer.lastName}`,
      discountPercent: settings.refereeDiscountPercent,
      welcomeCredit: settings.refereeWelcomeCredit,
    };
  }

  // Record referral during registration
  static async recordReferralOnRegister(
    refereeId: string,
    rawCode?: string,
    clientInfo: { ip?: string; userAgent?: string } = {}
  ) {
    if (!rawCode) return null;
    const settings = await this.getSettings();
    if (!settings.isActive) return null;

    const referralCode = rawCode.trim().toUpperCase();
    const referrer = await User.findOne({ referralCode });
    if (!referrer) return null;

    // Prevent self-referral
    if (referrer._id.toString() === refereeId.toString()) return null;

    // Check if referee already has referral
    const existingReferral = await Referral.findOne({ refereeId });
    if (existingReferral) return null;

    const referee = await User.findById(refereeId);
    if (!referee) return null;

    // Link user
    referee.referredBy = referrer._id as any;

    let welcomeCredit = 0;
    if (settings.refereeWelcomeCredit && settings.refereeWelcomeCredit > 0) {
      welcomeCredit = settings.refereeWelcomeCredit;
      referee.walletBalance = (referee.walletBalance || 0) + welcomeCredit;
    }
    await referee.save();

    if (welcomeCredit > 0) {
      try {
        await WalletTransaction.create({
          userId: referee._id,
          type: "referral_welcome",
          direction: "credit",
          amount: welcomeCredit,
          balanceAfter: referee.walletBalance || 0,
          status: "completed",
          title: "هدیه خوش‌آمدگویی کد معرف",
          description: `اعتبار هدیه ثبت‌نام با کد معرف ${referralCode}`,
          referenceId: `REF-WEL-${referee._id.toString().slice(-6)}`,
        });
      } catch (wErr) {
        console.error("Error creating welcome wallet transaction:", wErr);
      }
    }

    // Increment referrer's count
    referrer.referralCount = (referrer.referralCount || 0) + 1;
    await referrer.save();

    // Check qualification condition
    const isImmediate = settings.qualificationCondition === "registration_only";
    let rewardAmount = 0;
    if (isImmediate) {
      rewardAmount = settings.fixedRewardAmount || 25000;
      referrer.walletBalance = (referrer.walletBalance || 0) + rewardAmount;
      referrer.referralEarnings = (referrer.referralEarnings || 0) + rewardAmount;
      await referrer.save();

      try {
        await WalletTransaction.create({
          userId: referrer._id,
          type: "referral_reward",
          direction: "credit",
          amount: rewardAmount,
          balanceAfter: referrer.walletBalance || 0,
          status: "completed",
          title: "پاداش عضویت دوست دعوت‌شده",
          description: `پاداش ثبت‌نام کاربر ${referee.firstName} ${referee.lastName}`,
          referenceId: `REF-REG-${referrer._id.toString().slice(-6)}`,
        });
      } catch (wErr) {
        console.error("Error creating immediate referral wallet transaction:", wErr);
      }
    }

    const referral = await Referral.create({
      referrerId: referrer._id,
      refereeId: referee._id,
      referralCode,
      status: isImmediate ? "rewarded" : "pending",
      rewardAmount,
      refereeRewardAmount: welcomeCredit,
      rewardType: "wallet_credit",
      qualificationDate: isImmediate ? new Date() : undefined,
      rewardSettledAt: isImmediate ? new Date() : undefined,
      deviceIp: clientInfo.ip,
      userAgent: clientInfo.userAgent,
    });

    // Send notifications
    await Notification.create({
      userId: referrer._id,
      type: "referral_joined",
      title: "🎉 کاربر جدید با کد معرفی شما ثبت‌نام کرد!",
      message: `کاربر ${referee.firstName} ${referee.lastName.charAt(0)}... با استفاده از لینک یا کد شما به تک‌یاد پیوست.${
        isImmediate ? ` پاداش نقدی ${rewardAmount.toLocaleString("fa-IR")} تومان به کیف پول شما افزوده شد.` : ""
      }`,
      data: { referralId: referral._id },
    });

    if (welcomeCredit > 0) {
      await Notification.create({
        userId: referee._id,
        type: "referral_welcome",
        title: "🎁 هدیه خوش‌آمدگویی کد معرف فعال شد",
        message: `مبلغ ${welcomeCredit.toLocaleString("fa-IR")} تومان اعتبار اولیه هدیه به کیف پول شما افزوده شد!`,
        data: { referralId: referral._id },
      });
    }

    return referral;
  }

  // Process referral reward when an order is paid
  static async processOrderReferral(order: any, session?: mongoose.ClientSession) {
    try {
      const settings = await this.getSettings();
      if (!settings.isActive) return;

      const referee = await User.findById(order.userId).session(session || null);
      if (!referee || !referee.referredBy) return;

      // Find referral record
      const referral = await Referral.findOne({
        refereeId: referee._id,
        referrerId: referee.referredBy,
      }).session(session || null);

      if (!referral) return;

      // If condition is first_purchase, ensure not already rewarded
      if (settings.qualificationCondition === "first_purchase" && referral.status === "rewarded") {
        return;
      }

      const referrer = await User.findById(referee.referredBy).populate("role").session(session || null);
      if (!referrer) return;

      const orderTotal = order.totalAmount || 0;
      if (orderTotal <= 0) return;

      // Calculate reward
      const isInstructor = (referrer.role as any)?.slug === "instructor";
      const basePercent = isInstructor
        ? settings.instructorCommissionPercent || 20
        : settings.defaultCommissionPercent || 15;

      const tier = this.calculateTier(referrer.referralCount || 0);
      const effectivePercent = basePercent + tier.bonusRate;

      let rewardAmount = 0;
      if (settings.rewardMode === "fixed") {
        rewardAmount = settings.fixedRewardAmount;
      } else {
        rewardAmount = Math.round((orderTotal * effectivePercent) / 100);
      }

      // Update referral doc
      referral.status = "rewarded";
      referral.orderId = order._id;
      referral.orderAmount = orderTotal;
      referral.rewardAmount = (referral.rewardAmount || 0) + rewardAmount;
      referral.commissionPercentage = effectivePercent;
      referral.qualificationDate = new Date();
      referral.rewardSettledAt = new Date();
      await referral.save({ session });

      // Update referrer wallet and stats
      referrer.walletBalance = (referrer.walletBalance || 0) + rewardAmount;
      referrer.referralEarnings = (referrer.referralEarnings || 0) + rewardAmount;
      await referrer.save({ session });

      try {
        await WalletTransaction.create(
          [
            {
              userId: referrer._id,
              type: "referral_reward",
              direction: "credit",
              amount: rewardAmount,
              balanceAfter: referrer.walletBalance || 0,
              status: "completed",
              title: "پاداش همکاری در فروش (معرفی کاربر)",
              description: `کمیسیون ${effectivePercent}٪ از خرید دوست در سفارش #${order._id.toString().slice(-6)}`,
              referenceId: `REF-ORD-${order._id.toString().slice(-6)}`,
              orderId: order._id,
            },
          ],
          { session }
        );
      } catch (wErr) {
        console.error("Error creating referral reward wallet transaction:", wErr);
      }

      // In-app Notification to referrer
      await Notification.create(
        [
          {
            userId: referrer._id,
            type: "referral_reward",
            title: "💰 پاداش معرفی جدید واریز شد!",
            message: `دوست شما با موفقیت خرید خود را ثبت کرد. مبلغ ${rewardAmount.toLocaleString(
              "fa-IR"
            )} تومان پاداش همکاری (با نرخ ${effectivePercent}٪) به کیف پول شما واریز شد.`,
            data: { orderId: order._id, referralId: referral._id },
          },
        ],
        { session }
      );
    } catch (err) {
      console.error("Error in processOrderReferral:", err);
    }
  }

  // Dashboard for current user (student or instructor)
  static async getUserDashboard(userId: string, hostUrl: string = "") {
    const user = await User.findById(userId).populate("role");
    if (!user) throw new AppError("کاربر یافت نشد", 404);

    const referralCode = await this.ensureUserReferralCode(user);
    const settings = await this.getSettings();

    const baseUrl = hostUrl || "https://tekyad.ir";
    const referralLink = `${baseUrl}/register?ref=${referralCode}`;

    // Share messages
    const shareMessage = `سلام! به وبسایت آموزشی تک‌یاد بپیوند و با کد معرف من (${referralCode}) از تخفیف‌های ویژه دوره‌ها بهره‌مند شو:\n${referralLink}`;
    const encodedMsg = encodeURIComponent(shareMessage);
    const encodedUrl = encodeURIComponent(referralLink);

    const shareLinks = {
      directLink: referralLink,
      telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedMsg}`,
      whatsapp: `https://api.whatsapp.com/send?text=${encodedMsg}`,
      eitaa: `https://eitaa.com/share/url?url=${encodedUrl}&text=${encodedMsg}`,
      bale: `https://ble.ir/share/url?url=${encodedUrl}&text=${encodedMsg}`,
      sms: `sms:?body=${encodedMsg}`,
    };

    const referrals = await Referral.find({ referrerId: user._id })
      .populate("refereeId", "firstName lastName email createdAt avatar")
      .populate("orderId", "totalAmount createdAt")
      .sort({ createdAt: -1 });

    const totalInvited = referrals.length;
    const completedReferrals = referrals.filter((r) => r.status === "rewarded" || r.status === "completed");
    const totalConversions = completedReferrals.length;
    const totalEarned = user.referralEarnings || 0;
    const walletBalance = user.walletBalance || 0;
    const conversionRate = totalInvited > 0 ? Math.round((totalConversions / totalInvited) * 100) : 0;

    const tier = this.calculateTier(totalInvited);

    // Mask privacy for friends list
    const maskedReferrals = referrals.map((r: any) => {
      const referee = r.refereeId;
      const firstName = referee?.firstName || "کاربر";
      const lastName = referee?.lastName ? referee.lastName.charAt(0) + "***" : "";
      const email = referee?.email
        ? referee.email.substring(0, 3) + "***@" + referee.email.split("@")[1]
        : "";

      return {
        _id: r._id,
        name: `${firstName} ${lastName}`,
        email,
        avatar: referee?.avatar,
        registeredAt: r.createdAt,
        status: r.status,
        rewardAmount: r.rewardAmount || 0,
        orderAmount: r.orderAmount || 0,
        qualificationDate: r.qualificationDate,
      };
    });

    // Recent payouts
    const payouts = await ReferralPayout.find({ userId: user._id }).sort({ createdAt: -1 }).limit(10);

    return {
      referralCode,
      shareLinks,
      stats: {
        totalInvited,
        totalConversions,
        conversionRate,
        totalEarned,
        walletBalance,
        minWithdrawalAmount: settings.minWithdrawalAmount,
        commissionPercent:
          (user.role as any)?.slug === "instructor"
            ? settings.instructorCommissionPercent + tier.bonusRate
            : settings.defaultCommissionPercent + tier.bonusRate,
        refereeDiscountPercent: settings.refereeDiscountPercent,
      },
      tier,
      referrals: maskedReferrals,
      payouts,
      settings: {
        termsAndConditions: settings.termsAndConditions,
        isActive: settings.isActive,
      },
    };
  }

  // Instructor specific dashboard with course-specific affiliate links
  static async getInstructorDashboard(instructorId: string, hostUrl: string = "") {
    const baseDashboard = await this.getUserDashboard(instructorId, hostUrl);
    const code = baseDashboard.referralCode;
    const baseUrl = hostUrl || "https://tekyad.ir";

    // Fetch instructor's courses
    const courses = await Course.find({
      instructors: instructorId,
      status: "published",
    }).select("title slug price discountPrice thumbnail studentCount");

    const courseAffiliateLinks = courses.map((course: any) => {
      const courseSlugOrId = course.slug || course._id;
      const url = `${baseUrl}/courses/${courseSlugOrId}?ref=${code}`;
      return {
        courseId: course._id,
        title: course.title,
        price: course.discountPrice || course.price,
        thumbnail: course.thumbnail,
        affiliateUrl: url,
        telegramShareUrl: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(
          `دوره ویژه «${course.title}» در آکادمی تک‌یاد با تخفیف اختصاصی:\n${url}`
        )}`,
      };
    });

    return {
      ...baseDashboard,
      instructorCourses: courseAffiliateLinks,
    };
  }

  // Request payout
  static async requestPayout(
    userId: string,
    data: {
      amount: number;
      method: "bank_transfer" | "wallet_credit";
      bankInfo?: {
        shaba?: string;
        cardNumber?: string;
        bankName?: string;
        accountHolder?: string;
      };
    }
  ) {
    const user = await User.findById(userId);
    if (!user) throw new AppError("کاربر یافت نشد", 404);

    const settings = await this.getSettings();
    if (data.amount < settings.minWithdrawalAmount) {
      throw new AppError(
        `حداقل مبلغ درخواست تسویه ${settings.minWithdrawalAmount.toLocaleString("fa-IR")} تومان است.`,
        400
      );
    }

    if ((user.walletBalance || 0) < data.amount) {
      throw new AppError("موجودی کیف پول شما برای این مبلغ کافی نیست.", 400);
    }

    // Deduct from wallet balance immediately
    user.walletBalance = (user.walletBalance || 0) - data.amount;
    await user.save();

    const payout = await ReferralPayout.create({
      userId: user._id,
      amount: data.amount,
      method: data.method || "bank_transfer",
      bankInfo: data.bankInfo,
      status: "pending",
      requestedAt: new Date(),
    });

    try {
      await WalletTransaction.create({
        userId: user._id,
        type: "withdraw",
        direction: "debit",
        amount: data.amount,
        balanceAfter: user.walletBalance || 0,
        status: "pending",
        title: "درخواست تسویه درآمد رفرال",
        description: `درخواست واریز به حساب بانکی به مبلغ ${data.amount.toLocaleString("fa-IR")} تومان`,
        referenceId: payout._id.toString(),
        gateway: "settlement",
        bankInfo: data.bankInfo,
      });
    } catch (wErr) {
      console.error("Error creating payout wallet transaction:", wErr);
    }

    return payout;
  }

  // Admin: Get overall statistics
  static async getAdminOverview() {
    const totalReferrals = await Referral.countDocuments();
    const rewardedReferrals = await Referral.countDocuments({ status: "rewarded" });
    const pendingReferrals = await Referral.countDocuments({ status: "pending" });

    // Sum total reward amount paid
    const rewardSumResult = await Referral.aggregate([
      { $match: { status: "rewarded" } },
      { $group: { _id: null, totalReward: { $sum: "$rewardAmount" }, totalRevenue: { $sum: "$orderAmount" } } },
    ]);

    const totalRewardPaid = rewardSumResult[0]?.totalReward || 0;
    const totalRevenueGenerated = rewardSumResult[0]?.totalRevenue || 0;

    // Distinct referrers count
    const distinctReferrers = await Referral.distinct("referrerId");
    const totalReferrersCount = distinctReferrers.length;

    // Pending payouts
    const pendingPayoutsCount = await ReferralPayout.countDocuments({ status: "pending" });
    const pendingPayoutsSumResult = await ReferralPayout.aggregate([
      { $match: { status: "pending" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const pendingPayoutsAmount = pendingPayoutsSumResult[0]?.total || 0;

    // Conversion rate
    const conversionRate = totalReferrals > 0 ? Math.round((rewardedReferrals / totalReferrals) * 100) : 0;

    return {
      totalReferrals,
      rewardedReferrals,
      pendingReferrals,
      totalReferrersCount,
      totalRewardPaid,
      totalRevenueGenerated,
      conversionRate,
      pendingPayoutsCount,
      pendingPayoutsAmount,
    };
  }

  // Admin: List referrals with filters & pagination
  static async getAdminReferrals(query: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (query.status && query.status !== "all") {
      filter.status = query.status;
    }

    if (query.search) {
      const searchUsers = await User.find({
        $or: [
          { firstName: { $regex: query.search, $options: "i" } },
          { lastName: { $regex: query.search, $options: "i" } },
          { email: { $regex: query.search, $options: "i" } },
          { referralCode: { $regex: query.search, $options: "i" } },
        ],
      }).select("_id");

      const userIds = searchUsers.map((u) => u._id);
      filter.$or = [
        { referrerId: { $in: userIds } },
        { refereeId: { $in: userIds } },
        { referralCode: { $regex: query.search, $options: "i" } },
      ];
    }

    const total = await Referral.countDocuments(filter);
    const referrals = await Referral.find(filter)
      .populate("referrerId", "firstName lastName email avatar role referralCode")
      .populate("refereeId", "firstName lastName email avatar createdAt")
      .populate("orderId", "totalAmount items status createdAt")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return {
      referrals,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  // Admin: Get payouts list
  static async getAdminPayouts(query: { page?: number; limit?: number; status?: string }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (query.status && query.status !== "all") {
      filter.status = query.status;
    }

    const total = await ReferralPayout.countDocuments(filter);
    const payouts = await ReferralPayout.find(filter)
      .populate("userId", "firstName lastName email avatar mobile walletBalance")
      .populate("processedBy", "firstName lastName")
      .sort({ requestedAt: -1 })
      .skip(skip)
      .limit(limit);

    return {
      payouts,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  // Admin: Update payout status (approve / pay / reject)
  static async updatePayoutStatus(
    payoutId: string,
    adminId: string,
    data: {
      status: "approved" | "paid" | "rejected";
      adminNote?: string;
      transactionReference?: string;
    }
  ) {
    const payout = await ReferralPayout.findById(payoutId).populate("userId");
    if (!payout) throw new AppError("درخواست تسویه یافت نشد", 404);

    const oldStatus = payout.status;
    payout.status = data.status;
    payout.processedAt = new Date();
    payout.processedBy = adminId as any;
    if (data.adminNote !== undefined) payout.adminNote = data.adminNote;
    if (data.transactionReference !== undefined) payout.transactionReference = data.transactionReference;

    // If rejected, refund the user's walletBalance
    if (data.status === "rejected" && oldStatus !== "rejected") {
      const user = await User.findById(payout.userId._id || payout.userId);
      if (user) {
        user.walletBalance = (user.walletBalance || 0) + payout.amount;
        await user.save();
      }
    }

    await payout.save();

    // Send notification to user
    const statusText =
      data.status === "paid" ? "واریز شد" : data.status === "approved" ? "تایید شد" : "رد شد";

    await Notification.create({
      userId: payout.userId._id || payout.userId,
      type: "payout_status_updated",
      title: `وضعیت درخواست تسویه حساب: ${statusText}`,
      message: `درخواست تسویه مبلغ ${payout.amount.toLocaleString("fa-IR")} تومان شما ${statusText}.${
        data.adminNote ? ` توضیحات مدیر: ${data.adminNote}` : ""
      }${data.transactionReference ? ` شماره پیگیری: ${data.transactionReference}` : ""}`,
      data: { payoutId: payout._id, status: data.status },
    });

    return payout;
  }

  // Admin: Manual bonus credit
  static async manualCreditBonus(
    adminId: string,
    data: { userId: string; amount: number; reason: string }
  ) {
    const user = await User.findById(data.userId);
    if (!user) throw new AppError("کاربر یافت نشد", 404);

    user.walletBalance = (user.walletBalance || 0) + data.amount;
    user.referralEarnings = (user.referralEarnings || 0) + data.amount;
    await user.save();

    try {
      await WalletTransaction.create({
        userId: user._id,
        type: "referral_reward",
        direction: "credit",
        amount: data.amount,
        balanceAfter: user.walletBalance || 0,
        status: "completed",
        title: "پاداش ویژه معرفی (مدیریت)",
        description: data.reason,
        processedBy: adminId as any,
      });
    } catch (wErr) {
      console.error("Error creating manual credit wallet transaction:", wErr);
    }

    await Notification.create({
      userId: user._id,
      type: "manual_bonus_credited",
      title: "🎁 پاداش ویژه به کیف پول شما افزوده شد!",
      message: `مدیر سیستم مبلغ ${data.amount.toLocaleString(
        "fa-IR"
      )} تومان پاداش ویژه به حساب شما واریز کرد. بابت: ${data.reason}`,
      data: { amount: data.amount, adminId },
    });

    return {
      success: true,
      walletBalance: user.walletBalance,
      referralEarnings: user.referralEarnings,
    };
  }

  // Leaderboard of top referrers
  static async getLeaderboard(limit: number = 10) {
    const topUsers = await User.find({ referralCount: { $gt: 0 } })
      .populate("role", "name slug")
      .select("firstName lastName avatar referralCount referralEarnings role")
      .sort({ referralEarnings: -1, referralCount: -1 })
      .limit(limit);

    return topUsers.map((u: any, index: number) => ({
      rank: index + 1,
      userId: u._id,
      name: `${u.firstName} ${u.lastName}`,
      avatar: u.avatar,
      role: u.role?.name || "دانشجو",
      referralCount: u.referralCount || 0,
      referralEarnings: u.referralEarnings || 0,
      tier: this.calculateTier(u.referralCount || 0).name,
    }));
  }
}
