import { Request, Response } from "express";
import { asyncHandler } from "../../common/utils/asyncHandler.js";
import { sendSuccess } from "../../common/utils/response.js";
import { ReferralService } from "./referral.service.js";

export class ReferralController {
  // GET /api/v1/referrals/my-info
  static getMyInfo = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const protocol = req.protocol;
    const host = req.get("host") || "";
    const baseUrl = `${protocol}://${host}`;

    const info = await ReferralService.getUserDashboard(userId, baseUrl);
    sendSuccess(res, info, "اطلاعات سیستم معرفی با موفقیت دریافت شد");
  });

  // GET /api/v1/referrals/instructor-info
  static getInstructorInfo = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const protocol = req.protocol;
    const host = req.get("host") || "";
    const baseUrl = `${protocol}://${host}`;

    const info = await ReferralService.getInstructorDashboard(userId, baseUrl);
    sendSuccess(res, info, "اطلاعات رفرال مدرس با موفقیت دریافت شد");
  });

  // POST /api/v1/referrals/request-payout
  static requestPayout = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const payout = await ReferralService.requestPayout(userId, req.body);
    sendSuccess(res, payout, "درخواست تسویه با موفقیت ثبت شد و در صف بررسی قرار گرفت", 201);
  });

  // GET /api/v1/referrals/validate/:code
  static validateCode = asyncHandler(async (req: Request, res: Response) => {
    const code = String(req.params.code);
    const result = await ReferralService.validateReferralCode(code);
    sendSuccess(res, result, "کد معرف معتبر است");
  });

  // GET /api/v1/referrals/leaderboard
  static getLeaderboard = asyncHandler(async (req: Request, res: Response) => {
    const limit = Number(req.query.limit) || 10;
    const leaderboard = await ReferralService.getLeaderboard(limit);
    sendSuccess(res, leaderboard, "جدول برترین‌های معرف دریافت شد");
  });

  // --- Admin Endpoints ---

  // GET /api/v1/referrals/admin/overview
  static getAdminOverview = asyncHandler(async (req: Request, res: Response) => {
    const overview = await ReferralService.getAdminOverview();
    sendSuccess(res, overview, "آمار کلان رفرال دریافت شد");
  });

  // GET /api/v1/referrals/admin/list
  static getAdminReferrals = asyncHandler(async (req: Request, res: Response) => {
    const result = await ReferralService.getAdminReferrals(req.query);
    sendSuccess(res, result, "لیست معرف‌ها دریافت شد");
  });

  // GET /api/v1/referrals/admin/payouts
  static getAdminPayouts = asyncHandler(async (req: Request, res: Response) => {
    const result = await ReferralService.getAdminPayouts(req.query);
    sendSuccess(res, result, "لیست درخواست‌های تسویه دریافت شد");
  });

  // PATCH /api/v1/referrals/admin/payouts/:id
  static updatePayoutStatus = asyncHandler(async (req: Request, res: Response) => {
    const adminId = (req as any).user.id;
    const payoutId = String(req.params.id);
    const payout = await ReferralService.updatePayoutStatus(payoutId, adminId, req.body);
    sendSuccess(res, payout, "وضعیت درخواست تسویه با موفقیت به‌روزرسانی شد");
  });

  // GET /api/v1/referrals/admin/settings
  static getSettings = asyncHandler(async (req: Request, res: Response) => {
    const settings = await ReferralService.getSettings();
    sendSuccess(res, settings, "تنظیمات سیستم رفرال دریافت شد");
  });

  // PUT /api/v1/referrals/admin/settings
  static updateSettings = asyncHandler(async (req: Request, res: Response) => {
    const settings = await ReferralService.updateSettings(req.body);
    sendSuccess(res, settings, "تنظیمات با موفقیت ذخیره شدند");
  });

  // POST /api/v1/referrals/admin/manual-bonus
  static manualBonus = asyncHandler(async (req: Request, res: Response) => {
    const adminId = (req as any).user.id;
    const result = await ReferralService.manualCreditBonus(adminId, req.body);
    sendSuccess(res, result, "پاداش ویژه با موفقیت واریز شد");
  });
}
