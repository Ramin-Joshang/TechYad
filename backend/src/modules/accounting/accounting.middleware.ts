import { Response, NextFunction } from "express";
import { AuthRequest } from "../../common/middleware/auth.js";
import { AppError } from "../../common/errors/AppError.js";

/**
 * Middleware: Allow viewing accounting reports and records
 * Authorized roles: super-admin, accountant, partner
 */
export const requireAccountingView = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return next(new AppError("لطفاً ابتدا وارد حساب کاربری خود شوید", 401, "AUTH_REQUIRED"));
  }

  const roleSlugs: string[] = req.user.roleSlugs || [];

  if (
    roleSlugs.includes("super-admin") ||
    roleSlugs.includes("admin") ||
    roleSlugs.includes("accountant") ||
    roleSlugs.includes("partner")
  ) {
    return next();
  }

  return next(
    new AppError("دسترسی به ماژول حسابداری مجاز نمی‌باشد", 403, "ACCOUNTING_ACCESS_DENIED")
  );
};

/**
 * Middleware: Allow mutating accounting data (creating/editing draft entries, expenses, etc.)
 * Authorized roles: super-admin, accountant
 * Explicit rejection for: partner (Read-Only) and others
 */
export const requireAccountingMutate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return next(new AppError("لطفاً ابتدا وارد حساب کاربری خود شوید", 401, "AUTH_REQUIRED"));
  }

  const roleSlugs: string[] = req.user.roleSlugs || [];

  if (roleSlugs.includes("super-admin") || roleSlugs.includes("accountant")) {
    return next();
  }

  if (roleSlugs.includes("partner")) {
    return next(
      new AppError(
        "شریک مؤسسه تنها دارای دسترسی مشاهده گزارش‌ها می‌باشد و امکان ثبت یا ویرایش اطلاعات مالی را ندارد.",
        403,
        "ACCOUNTING_PARTNER_READONLY"
      )
    );
  }

  return next(
    new AppError("دسترسی مجاز نمی‌باشد. مجوز حسابداری مورد نیاز است.", 403, "ACCOUNTING_ACCESS_DENIED")
  );
};

/**
 * Middleware: Allow critical accounting actions (COA management, lock/approve entries, fiscal year close)
 * Authorized roles: ONLY super-admin
 */
export const requireAccountingAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return next(new AppError("لطفاً ابتدا وارد حساب کاربری خود شوید", 401, "AUTH_REQUIRED"));
  }

  const roleSlugs: string[] = req.user.roleSlugs || [];

  if (roleSlugs.includes("super-admin")) {
    return next();
  }

  return next(
    new AppError(
      "این عملیات حیاتی حسابداری منحصراً در صلاحیت مدیر ارشد (Super Admin) می‌باشد.",
      403,
      "ACCOUNTING_SUPERADMIN_REQUIRED"
    )
  );
};
