import { Request, Response } from "express";
import { AuthRequest } from "../../common/middleware/auth.js";
import { AccountingLedgerService } from "./accounting-ledger.service.js";
import { Account } from "./account.model.js";
import { sendSuccess } from "../../common/utils/response.js";
import { AppError } from "../../common/errors/AppError.js";

export class AccountingController {
  /**
   * Seed Chart of Accounts
   */
  static seedCOA = async (req: AuthRequest, res: Response) => {
    const result = await AccountingLedgerService.ensureChartOfAccounts();
    sendSuccess(res, result, "کدینگ پایه حسابداری با موفقیت بررسی و مستقر شد.");
  };

  /**
   * Get Chart of Accounts list
   */
  static getAccounts = async (req: Request, res: Response) => {
    const accounts = await AccountingLedgerService.getAccounts(req.query as any);
    sendSuccess(res, accounts, "فهرست حساب‌ها دریافت شد.");
  };

  /**
   * Create custom account (Super Admin only)
   */
  static createAccount = async (req: AuthRequest, res: Response) => {
    const { code, title, type, nature, level, parentId, description } = req.body;

    if (!code || !title || !type || !nature) {
      throw new AppError("کد، عنوان، نوع حساب و ماهیت حساب الزامی است", 400);
    }

    const existing = await Account.findOne({ code: code.trim() });
    if (existing) {
      throw new AppError(`حسابی با کد ${code} قبلاً ثبت شده است`, 409);
    }

    const account = await Account.create({
      code: code.trim(),
      title: title.trim(),
      type,
      nature,
      level: level || "subsidiary",
      parentId: parentId || undefined,
      description,
      isSystem: false,
      isActive: true,
    });

    sendSuccess(res, account, "حساب جدید با موفقیت در کدینگ تعریف شد.", 201);
  };

  /**
   * Get paginated journal entries
   */
  static getJournalEntries = async (req: Request, res: Response) => {
    const result = await AccountingLedgerService.getJournalEntries(req.query as any);
    sendSuccess(res, result, "اسناد حسابداری دریافت شدند.");
  };

  /**
   * Get single journal entry
   */
  static getJournalEntryById = async (req: Request, res: Response) => {
    const entryId = String(req.params.id);
    const entry = await AccountingLedgerService.getJournalEntryById(entryId);
    sendSuccess(res, entry, "اطلاعات سند حسابداری دریافت شد.");
  };

  /**
   * Create journal entry (Draft or Posted)
   */
  static createJournalEntry = async (req: AuthRequest, res: Response) => {
    const { description, lines, date, fiscalYear, status, sourceType, sourceId, idempotencyKey } = req.body;

    if (!description || !lines || !Array.isArray(lines)) {
      throw new AppError("شرح سند و ردیف‌های بدهکار و بستانکار الزامی است.", 400);
    }

    const entry = await AccountingLedgerService.createJournalEntry({
      description,
      lines,
      date,
      fiscalYear,
      status: status || "draft",
      sourceType: sourceType || "manual",
      sourceId,
      idempotencyKey,
      userId: req.user._id.toString(),
    });

    sendSuccess(res, entry, "سند حسابداری با موفقیت ایجاد گردید.", 201);
  };

  /**
   * Post a draft journal entry
   */
  static postJournalEntry = async (req: AuthRequest, res: Response) => {
    const entryId = String(req.params.id);
    const entry = await AccountingLedgerService.postJournalEntry(entryId, req.user._id.toString());
    sendSuccess(res, entry, "سند حسابداری با موفقیت قطعی و در دفاتر ثبت شد.");
  };

  /**
   * Reverse a posted journal entry
   */
  static reverseJournalEntry = async (req: AuthRequest, res: Response) => {
    const { reason } = req.body;
    if (!reason || !reason.trim()) {
      throw new AppError("وارد کردن علت ابطال یا صدور سند اصلاحی الزامی است.", 400);
    }

    const entryId = String(req.params.id);
    const result = await AccountingLedgerService.reverseJournalEntry(
      entryId,
      req.user._id.toString(),
      reason
    );

    sendSuccess(res, result, "سند معکوس/اصلاحی با موفقیت صادر و سند قبلی باطل گردید.");
  };

  /**
   * Get ledger lines of an account
   */
  static getAccountLedger = async (req: Request, res: Response) => {
    const accountCode = String(req.params.accountCode);
    const result = await AccountingLedgerService.getAccountLedger(accountCode, req.query as any);
    sendSuccess(res, result, `دفتر حساب ${accountCode} دریافت شد.`);
  };

  /**
   * Get Trial Balance (تراز آزمایشی)
   */
  static getTrialBalance = async (req: Request, res: Response) => {
    const fiscalYear = req.query.fiscalYear ? Number(req.query.fiscalYear) : undefined;
    const result = await AccountingLedgerService.getTrialBalance(fiscalYear);
    sendSuccess(res, result, "تراز آزمایشی دریافت شد.");
  };

  /**
   * Update draft journal entry (Mutate permission)
   */
  static updateDraftJournalEntry = async (req: AuthRequest, res: Response) => {
    const entryId = String(req.params.id);
    const { description, lines, date } = req.body;
    const entry = await AccountingLedgerService.updateDraftJournalEntry(
      entryId,
      { description, lines, date },
      req.user._id.toString()
    );
    sendSuccess(res, entry, "پیش‌نویس سند حسابداری با موفقیت به‌روزرسانی شد.");
  };

  /**
   * Delete draft journal entry (Mutate permission)
   */
  static deleteDraftJournalEntry = async (req: AuthRequest, res: Response) => {
    const entryId = String(req.params.id);
    const result = await AccountingLedgerService.deleteDraftJournalEntry(
      entryId,
      req.user._id.toString()
    );
    sendSuccess(res, result, result.message);
  };

  /**
   * Get fiscal years (Super Admin, Accountant, Partner)
   */
  static getFiscalYears = async (req: Request, res: Response) => {
    const years = await AccountingLedgerService.getFiscalYears();
    sendSuccess(res, years, "دوره‌های مالی دریافت شدند.");
  };

  /**
   * Create fiscal year (Super Admin only)
   */
  static createFiscalYear = async (req: AuthRequest, res: Response) => {
    const { year, title, startDate, endDate } = req.body;
    if (!year || !title || !startDate || !endDate) {
      throw new AppError("سال، عنوان، تاریخ شروع و تاریخ پایان الزامی است.", 400);
    }
    const created = await AccountingLedgerService.createFiscalYear(
      { year: Number(year), title, startDate, endDate },
      req.user._id.toString()
    );
    sendSuccess(res, created, "دوره مالی جدید با موفقیت ایجاد گردید.", 201);
  };

  /**
   * Close fiscal year (Super Admin only)
   */
  static closeFiscalYear = async (req: AuthRequest, res: Response) => {
    const year = Number(req.params.year);
    const { closeNotes } = req.body;
    if (!year || isNaN(year)) {
      throw new AppError("سال مالی معتبر الزامی است.", 400);
    }
    const closed = await AccountingLedgerService.closeFiscalYear(
      year,
      req.user._id.toString(),
      closeNotes
    );
    sendSuccess(res, closed, `سال مالی ${year} با موفقیت بسته و قفل قطعی گردید.`);
  };

  /**
   * Get accounting audit logs (Super Admin, Accountant, Partner)
   */
  static getAuditLogs = async (req: Request, res: Response) => {
    const result = await AccountingLedgerService.getAuditLogs(req.query as any);
    sendSuccess(res, result, "گزارش سوابق و وقایع حسابداری دریافت شد.");
  };
}
