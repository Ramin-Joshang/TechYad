import { Request, Response } from "express";
import { AuthRequest } from "../../common/middleware/auth.js";
import { FinancialOperationsService } from "./financial-operations.service.js";
import { sendSuccess } from "../../common/utils/response.js";
import { AppError } from "../../common/errors/AppError.js";

export class FinancialOperationsController {
  // =========================================================================
  // FINANCIAL ACCOUNTS
  // =========================================================================

  static getFinancialAccounts = async (req: Request, res: Response) => {
    const isActive = req.query.isActive !== undefined ? req.query.isActive === "true" : undefined;
    const accountType = req.query.accountType as string | undefined;
    const accounts = await FinancialOperationsService.getFinancialAccounts({ isActive, accountType });
    sendSuccess(res, accounts, "فهرست حساب‌های مالی و بانکی مؤسسه با موفقیت دریافت شد.");
  };

  static getFinancialAccountById = async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const result = await FinancialOperationsService.getFinancialAccountById(id);
    sendSuccess(res, result, "اطلاعات حساب مالی دریافت شد.");
  };

  static createFinancialAccount = async (req: AuthRequest, res: Response) => {
    const account = await FinancialOperationsService.createFinancialAccount(
      req.body,
      req.user._id.toString()
    );
    sendSuccess(res, account, "حساب مالی جدید با موفقیت ایجاد گردید.", 201);
  };

  static updateFinancialAccount = async (req: AuthRequest, res: Response) => {
    const id = String(req.params.id);
    const account = await FinancialOperationsService.updateFinancialAccount(
      id,
      req.body,
      req.user._id.toString()
    );
    sendSuccess(res, account, "مشخصات حساب مالی به‌روزرسانی شد.");
  };

  // =========================================================================
  // FINANCIAL OPERATIONS (Revenues, Expenses, Transfers, Partners)
  // =========================================================================

  static getOperations = async (req: Request, res: Response) => {
    const result = await FinancialOperationsService.getOperations(req.query as any);
    sendSuccess(res, result, "فهرست عملیات مالی دریافت شد.");
  };

  static getOperationById = async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const operation = await FinancialOperationsService.getOperationById(id);
    sendSuccess(res, operation, "اطلاعات عملیات مالی دریافت شد.");
  };

  static createOperation = async (req: AuthRequest, res: Response) => {
    const operation = await FinancialOperationsService.createOperation(
      req.body,
      req.user._id.toString()
    );
    sendSuccess(res, operation, "عملیات مالی با موفقیت ثبت و سند حسابداری مربوطه صادر شد.", 201);
  };

  static cancelOperation = async (req: AuthRequest, res: Response) => {
    const id = String(req.params.id);
    const { reason } = req.body;
    if (!reason || !reason.trim()) {
      throw new AppError("علت ابطال عملیات مالی الزامی است.", 400);
    }
    const result = await FinancialOperationsService.cancelOperation(
      id,
      reason,
      req.user._id.toString()
    );
    sendSuccess(res, result, "عملیات مالی با موفقیت ابطال و سند معکوس صادر شد.");
  };

  // =========================================================================
  // RECEIVABLES & PAYABLES SUMMARY
  // =========================================================================

  static getReceivablesAndPayablesSummary = async (req: Request, res: Response) => {
    const summary = await FinancialOperationsService.getReceivablesAndPayablesSummary();
    sendSuccess(res, summary, "خلاصه وضعیت مطالبات، بدهی‌ها و سرمایه شرکا دریافت شد.");
  };
}
