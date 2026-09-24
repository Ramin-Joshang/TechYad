import { Router } from "express";
import { ReferralController } from "./referral.controller.js";
import { authenticate } from "../../common/middleware/auth.js";
import { asyncHandler } from "../../common/utils/asyncHandler.js";

const router = Router();
const requireAuth = asyncHandler(authenticate);

// Middleware for Admin / Super Admin
const requireAdmin = (req: any, res: any, next: any) => {
  const roleSlug = req.user?.role?.slug;
  const permissions: string[] = req.user?.role?.permissions || [];
  if (
    roleSlug === "super-admin" ||
    roleSlug === "admin" ||
    permissions.includes("admin.access") ||
    permissions.includes("super_admin.access")
  ) {
    return next();
  }
  return res.status(403).json({ success: false, message: "دسترسی به بخش مدیریت رفرال امکان‌پذیر نیست" });
};

// Public
router.get("/referrals/validate/:code", ReferralController.validateCode);
router.get("/referrals/leaderboard", ReferralController.getLeaderboard);

// Authenticated (Student / Instructor)
router.get("/referrals/my-info", requireAuth, ReferralController.getMyInfo);
router.get("/referrals/instructor-info", requireAuth, ReferralController.getInstructorInfo);
router.post("/referrals/request-payout", requireAuth, ReferralController.requestPayout);

// Admin & Super Admin
router.get("/referrals/admin/overview", requireAuth, requireAdmin, ReferralController.getAdminOverview);
router.get("/referrals/admin/list", requireAuth, requireAdmin, ReferralController.getAdminReferrals);
router.get("/referrals/admin/payouts", requireAuth, requireAdmin, ReferralController.getAdminPayouts);
router.patch("/referrals/admin/payouts/:id", requireAuth, requireAdmin, ReferralController.updatePayoutStatus);
router.get("/referrals/admin/settings", requireAuth, requireAdmin, ReferralController.getSettings);
router.put("/referrals/admin/settings", requireAuth, requireAdmin, ReferralController.updateSettings);
router.post("/referrals/admin/manual-bonus", requireAuth, requireAdmin, ReferralController.manualBonus);

export default router;
