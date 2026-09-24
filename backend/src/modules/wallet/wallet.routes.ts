import { Router } from "express";
import { WalletController } from "./wallet.controller.js";
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
  return res.status(403).json({ success: false, message: "دسترسی مدیریت به این بخش امکان‌پذیر نیست" });
};

// Authenticated User Endpoints (Student, Instructor, Admin)
router.get("/wallet/overview", requireAuth, asyncHandler(WalletController.getOverview));
router.get("/wallet/transactions", requireAuth, asyncHandler(WalletController.getTransactions));
router.post("/wallet/charge", requireAuth, asyncHandler(WalletController.chargeWallet));
router.post("/wallet/charge/verify", requireAuth, asyncHandler(WalletController.verifyCharge));
router.post("/wallet/pay-order", requireAuth, asyncHandler(WalletController.payOrderWithWallet));
router.post("/wallet/withdraw", requireAuth, asyncHandler(WalletController.requestWithdrawal));

// Admin Endpoints
router.get("/wallet/admin/stats", requireAuth, requireAdmin, asyncHandler(WalletController.adminGetStats));
router.get("/wallet/admin/transactions", requireAuth, requireAdmin, asyncHandler(WalletController.adminGetAllTransactions));
router.post("/wallet/admin/adjust", requireAuth, requireAdmin, asyncHandler(WalletController.adminAdjustBalance));
router.patch("/wallet/admin/withdrawals/:id/approve", requireAuth, requireAdmin, asyncHandler(WalletController.adminApproveWithdrawal));
router.patch("/wallet/admin/withdrawals/:id/reject", requireAuth, requireAdmin, asyncHandler(WalletController.adminRejectWithdrawal));

export default router;
