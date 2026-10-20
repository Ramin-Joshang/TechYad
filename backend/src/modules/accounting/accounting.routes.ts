import { Router } from "express";
import { authenticate } from "../../common/middleware/auth.js";
import { asyncHandler } from "../../common/utils/asyncHandler.js";
import {
  requireAccountingView,
  requireAccountingMutate,
  requireAccountingAdmin,
} from "./accounting.middleware.js";
import { AccountingController } from "./accounting.controller.js";
import { FinancialOperationsController } from "./financial-operations.controller.js";

const router = Router();

// All accounting routes require authentication
router.use(authenticate);

/**
 * 1. Chart of Accounts (COA)
 */
// Super Admin only: Seed or ensure standard Chart of Accounts
router.post(
  "/seed-coa",
  requireAccountingAdmin,
  asyncHandler(AccountingController.seedCOA)
);

// Viewable by Super Admin, Accountant, and Partner
router.get(
  "/accounts",
  requireAccountingView,
  asyncHandler(AccountingController.getAccounts)
);

// Super Admin only: Create new custom accounts in the tree
router.post(
  "/accounts",
  requireAccountingAdmin,
  asyncHandler(AccountingController.createAccount)
);

/**
 * 2. Journal Entries (اسناد حسابداری)
 */
// Viewable by Super Admin, Accountant, and Partner
router.get(
  "/journal-entries",
  requireAccountingView,
  asyncHandler(AccountingController.getJournalEntries)
);

// Viewable by Super Admin, Accountant, and Partner
router.get(
  "/journal-entries/:id",
  requireAccountingView,
  asyncHandler(AccountingController.getJournalEntryById)
);

// Creatable by Super Admin and Accountant (Partner rejected with 403)
router.post(
  "/journal-entries",
  requireAccountingMutate,
  asyncHandler(AccountingController.createJournalEntry)
);

// Editable while in draft state by Super Admin and Accountant (Partner rejected with 403)
router.put(
  "/journal-entries/:id",
  requireAccountingMutate,
  asyncHandler(AccountingController.updateDraftJournalEntry)
);

// Deletable while in draft state by Super Admin and Accountant (Partner rejected with 403)
router.delete(
  "/journal-entries/:id",
  requireAccountingMutate,
  asyncHandler(AccountingController.deleteDraftJournalEntry)
);

// Postable by Super Admin and Accountant (Partner rejected with 403)
router.post(
  "/journal-entries/:id/post",
  requireAccountingMutate,
  asyncHandler(AccountingController.postJournalEntry)
);

// Reversal requires Super Admin approval
router.post(
  "/journal-entries/:id/reverse",
  requireAccountingAdmin,
  asyncHandler(AccountingController.reverseJournalEntry)
);

/**
 * 3. Ledger & Trial Balance (دفاتر و تراز آزمایشی)
 */
// Viewable by Super Admin, Accountant, and Partner
router.get(
  "/ledger/:accountCode",
  requireAccountingView,
  asyncHandler(AccountingController.getAccountLedger)
);

// Viewable by Super Admin, Accountant, and Partner
router.get(
  "/trial-balance",
  requireAccountingView,
  asyncHandler(AccountingController.getTrialBalance)
);

/**
 * 4. Fiscal Years (دوره‌های مالی)
 */
// Viewable by Super Admin, Accountant, and Partner
router.get(
  "/fiscal-years",
  requireAccountingView,
  asyncHandler(AccountingController.getFiscalYears)
);

// Super Admin only: Define new fiscal year
router.post(
  "/fiscal-years",
  requireAccountingAdmin,
  asyncHandler(AccountingController.createFiscalYear)
);

// Super Admin only: Close and lock fiscal year
router.post(
  "/fiscal-years/:year/close",
  requireAccountingAdmin,
  asyncHandler(AccountingController.closeFiscalYear)
);

/**
 * 5. Audit Log (سوابق و ردپای تغییرات مالی)
 */
// Viewable by Super Admin, Accountant, and Partner
router.get(
  "/audit-logs",
  requireAccountingView,
  asyncHandler(AccountingController.getAuditLogs)
);

/**
 * 6. Financial Accounts & Treasury (حساب‌های بانکی، کارت‌ها، صندوق و درگاه‌ها)
 */
// Viewable by Super Admin, Accountant, and Partner
router.get(
  "/financial-accounts",
  requireAccountingView,
  asyncHandler(FinancialOperationsController.getFinancialAccounts)
);

router.get(
  "/financial-accounts/:id",
  requireAccountingView,
  asyncHandler(FinancialOperationsController.getFinancialAccountById)
);

// Creatable & Editable by Super Admin and Accountant (Partner rejected with 403)
router.post(
  "/financial-accounts",
  requireAccountingMutate,
  asyncHandler(FinancialOperationsController.createFinancialAccount)
);

router.put(
  "/financial-accounts/:id",
  requireAccountingMutate,
  asyncHandler(FinancialOperationsController.updateFinancialAccount)
);

/**
 * 7. Financial Operations (درآمدها، هزینه‌ها، انتقال و سرمایه شرکا)
 */
// Viewable by Super Admin, Accountant, and Partner
router.get(
  "/operations",
  requireAccountingView,
  asyncHandler(FinancialOperationsController.getOperations)
);

router.get(
  "/operations/:id",
  requireAccountingView,
  asyncHandler(FinancialOperationsController.getOperationById)
);

// Creatable by Super Admin and Accountant (Partner rejected with 403)
router.post(
  "/operations",
  requireAccountingMutate,
  asyncHandler(FinancialOperationsController.createOperation)
);

// Cancellable only by Super Admin (creates mirror reversal entry)
router.post(
  "/operations/:id/cancel",
  requireAccountingAdmin,
  asyncHandler(FinancialOperationsController.cancelOperation)
);

/**
 * 8. Receivables & Payables Overview (مطالبات، بدهی‌ها، اساتید، کیف پول و تعهدات)
 */
// Viewable by Super Admin, Accountant, and Partner
router.get(
  "/receivables-payables-summary",
  requireAccountingView,
  asyncHandler(FinancialOperationsController.getReceivablesAndPayablesSummary)
);

export default router;
