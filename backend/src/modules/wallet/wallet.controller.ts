import { Request, Response } from "express";
import { WalletService } from "./wallet.service.js";
import { sendSuccess } from "../../common/utils/response.js";
import { AppError } from "../../common/errors/AppError.js";

export class WalletController {
  // GET /wallet/overview
  static async getOverview(req: Request, res: Response) {
    const userId = (req as any).user?.id || (req as any).user?._id;
    const overview = await WalletService.getOverview(userId);
    return sendSuccess(res, overview, "اطلاعات کیف پول با موفقیت دریافت شد");
  }

  // GET /wallet/transactions
  static async getTransactions(req: Request, res: Response) {
    const userId = (req as any).user?.id || (req as any).user?._id;
    const { page, limit, type, direction, status, startDate, endDate } = req.query;

    const result = await WalletService.getTransactions(userId, {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      type: type as string,
      direction: direction as string,
      status: status as string,
      startDate: startDate as string,
      endDate: endDate as string,
    });

    return sendSuccess(res, result, "تراکنش‌های کیف پول با موفقیت دریافت شد");
  }

  // POST /wallet/charge
  static async chargeWallet(req: Request, res: Response) {
    const userId = (req as any).user?.id || (req as any).user?._id;
    const { amount } = req.body;

    if (!amount || typeof amount !== "number" || amount <= 0) {
      throw new AppError("مبلغ شارژ معتبر الزامی است", 400);
    }

    const result = await WalletService.chargeWallet(userId, Number(amount));
    return sendSuccess(res, result, "درخواست شارژ با موفقیت ثبت شد");
  }

  // POST /wallet/charge/verify
  static async verifyCharge(req: Request, res: Response) {
    const userId = (req as any).user?.id || (req as any).user?._id;
    const { authority, status } = req.body;

    if (!authority) {
      throw new AppError("شناسه پیگیری تراکنش الزامی است", 400);
    }

    const result = await WalletService.verifyCharge(userId, authority, status || "OK");
    return sendSuccess(res, result, "نتیجه شارژ بررسی گردید");
  }

  // POST /wallet/pay-order
  static async payOrderWithWallet(req: Request, res: Response) {
    const userId = (req as any).user?.id || (req as any).user?._id;
    const { orderId } = req.body;

    if (!orderId) {
      throw new AppError("شناسه سفارش الزامی است", 400);
    }

    const result = await WalletService.payOrderWithWallet(userId, orderId);
    return sendSuccess(res, result, "سفارش با موفقیت از طریق کیف پول پرداخت شد");
  }

  // POST /wallet/withdraw
  static async requestWithdrawal(req: Request, res: Response) {
    const userId = (req as any).user?.id || (req as any).user?._id;
    const { amount, shaba, accountHolder, bankName, cardNumber } = req.body;

    if (!amount || !shaba || !accountHolder) {
      throw new AppError("مبلغ، شماره شبا و نام صاحب حساب الزامی هستند", 400);
    }

    const result = await WalletService.requestWithdrawal(userId, {
      amount: Number(amount),
      shaba,
      accountHolder,
      bankName,
      cardNumber,
    });

    return sendSuccess(res, result, "درخواست تسویه با موفقیت ثبت شد");
  }

  // --- Admin Endpoints ---

  // GET /wallet/admin/stats
  static async adminGetStats(req: Request, res: Response) {
    const stats = await WalletService.adminGetStats();
    return sendSuccess(res, stats, "آمار مالی کیف پول‌ها دریافت شد");
  }

  // GET /wallet/admin/transactions
  static async adminGetAllTransactions(req: Request, res: Response) {
    const { page, limit, type, direction, status, search, userId } = req.query;

    const result = await WalletService.adminGetAllTransactions({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      type: type as string,
      direction: direction as string,
      status: status as string,
      search: search as string,
      userId: userId as string,
    });

    return sendSuccess(res, result, "فهرست تراکنش‌های کل کاربران دریافت شد");
  }

  // POST /wallet/admin/adjust
  static async adminAdjustBalance(req: Request, res: Response) {
    const adminId = (req as any).user?.id || (req as any).user?._id;
    const { targetUserId, amount, direction, reason } = req.body;

    if (!targetUserId || !amount || !direction || !reason) {
      throw new AppError("اطلاعات تنظیم موجودی ناقص است", 400);
    }

    const result = await WalletService.adminAdjustBalance(adminId, {
      targetUserId,
      amount: Number(amount),
      direction,
      reason,
    });

    return sendSuccess(res, result, "موجودی کاربر با موفقیت ویرایش گردید");
  }

  // PATCH /wallet/admin/withdrawals/:id/approve
  static async adminApproveWithdrawal(req: Request, res: Response) {
    const adminId = (req as any).user?.id || (req as any).user?._id;
    const id = String(req.params.id);
    const { trackingCode, adminNote } = req.body;

    const result = await WalletService.adminApproveWithdrawal(adminId, id, {
      trackingCode,
      adminNote,
    });

    return sendSuccess(res, result, "درخواست تسویه با موفقیت تایید و تکمیل شد");
  }

  // PATCH /wallet/admin/withdrawals/:id/reject
  static async adminRejectWithdrawal(req: Request, res: Response) {
    const adminId = (req as any).user?.id || (req as any).user?._id;
    const id = String(req.params.id);
    const { rejectionReason } = req.body;

    if (!rejectionReason) {
      throw new AppError("ذکر دلیل رد درخواست الزامی است", 400);
    }

    const result = await WalletService.adminRejectWithdrawal(adminId, id, rejectionReason);
    return sendSuccess(res, result, "درخواست تسویه رد شد و وجه به کیف پول بازگشت");
  }
}
