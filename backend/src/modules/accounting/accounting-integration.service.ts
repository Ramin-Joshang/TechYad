import mongoose, { Types } from "mongoose";
import { Order, IOrder } from "../commerce/order.model.js";
import { Payment, IPayment } from "../commerce/payment.model.js";
import { IWalletTransaction } from "../wallet/wallet-transaction.model.js";
import { Settlement, ISettlement } from "../commerce/settlement.model.js";
import { JournalEntry, IJournalEntry } from "./journal-entry.model.js";
import { AccountingLedgerService } from "./accounting-ledger.service.js";
import { FinancialAccount } from "./financial-account.model.js";
import { AppError } from "../../common/errors/AppError.js";
import { AuditService } from "../../common/services/audit.service.js";

export class AccountingIntegrationService {
  /**
   * 1. Record an Order Payment in Double-Entry Accounting
   * Triggered only after successful payment verification.
   *
   * Accounting Policy:
   * - If gateway paid: Debit '1021' (وجوه در راه درگاه سامان)
   * - If wallet applied: Debit '2010' (بستانکاران تجاری - اعتبار کیف پول کاربران)
   * - If coupon discount: Debit '4015' (تخفیف‌های اعطایی - کاهنده درآمد)
   * - Credit: '4010' (درآمد ناخالص حاصل از فروش دوره‌ها و کلاس‌ها)
   * - Accrued instructor share: Debit '5010' (بهای تمام‌شده آموزش) / Credit '2020' (سهم پرداخت‌نشده مدرسان)
   */
  static async recordOrderPayment(
    order: IOrder,
    payment?: IPayment,
    options: { session?: mongoose.ClientSession } = {}
  ): Promise<IJournalEntry | null> {
    if (order.status !== "paid") {
      return null;
    }

    const idempotencyKey = `ACC_ORD_PAY_${order._id}`;

    // Idempotency check: Ensure order is only recorded once in accounting
    const existingEntry = await JournalEntry.findOne({ idempotencyKey });
    if (existingEntry) {
      return existingEntry;
    }

    const totalAmount = Math.round(Number(order.totalAmount) || 0);
    const subtotal = Math.round(Number(order.subtotal) || totalAmount);
    const discountAmount = Math.max(0, subtotal - totalAmount);
    const walletApplied = Math.round(Number(order.walletAmountApplied) || 0);
    const gatewayAmount = Math.max(0, totalAmount - walletApplied);

    const lines: any[] = [];

    // Line 1: Gateway funds in transit (if paid via gateway)
    if (gatewayAmount > 0) {
      lines.push({
        accountCode: "1021", // وجوه در راه درگاه سامان (شاپرک)
        description: `دریافت وجه از درگاه سامان شاپرک (سفارش #${order._id.toString().slice(-6)})`,
        debit: gatewayAmount,
        credit: 0,
        entityType: "bank",
      });
    }

    // Line 2: Wallet balance consumption (if paid via wallet or hybrid)
    if (walletApplied > 0) {
      lines.push({
        accountCode: "2010", // بستانکاران تجاری - اعتبار کیف پول کاربران
        description: `مصرف موجودی کیف پول کاربر برای سفارش #${order._id.toString().slice(-6)}`,
        debit: walletApplied,
        credit: 0,
        entityType: "user",
        entityId: order.userId.toString(),
      });
    }

    // Line 3: Discount deduction (if coupon was used)
    if (discountAmount > 0) {
      lines.push({
        accountCode: "4015", // تخفیف‌های اعطایی به خریداران (کاهنده درآمد)
        description: `تخفیف اعمال‌شده در سفارش #${order._id.toString().slice(-6)}`,
        debit: discountAmount,
        credit: 0,
      });
    }

    // Line 4: Gross Sales Revenue (sum of receipts + discounts = subtotal)
    const grossRevenue = gatewayAmount + walletApplied + discountAmount;
    lines.push({
      accountCode: "4010", // درآمد ناخالص حاصل از فروش دوره‌ها و کلاس‌ها
      description: `فروش قطعی اقلام سفارش #${order._id.toString().slice(-6)}`,
      debit: 0,
      credit: grossRevenue,
    });

    // Compute total instructor share accrued from items
    let totalInstructorShare = 0;
    for (const item of order.items) {
      const share = item.instructorEarningsSnapshot !== undefined && item.instructorEarningsSnapshot !== null
        ? Number(item.instructorEarningsSnapshot)
        : Math.round((Number(item.finalPrice) || 0) * 0.7);
      totalInstructorShare += Math.max(0, share);
    }

    // Lines 5 & 6: Accrued Instructor Share (تعهد پرداخت سهم مدرس)
    if (totalInstructorShare > 0) {
      lines.push({
        accountCode: "5010", // بهای تمام‌شده آموزش - سهم حق‌التدریس مدرسان
        description: `شناسایی بهای تمام‌شده و سهم اساتید سفارش #${order._id.toString().slice(-6)}`,
        debit: totalInstructorShare,
        credit: 0,
      });
      lines.push({
        accountCode: "2020", // سهم پرداخت‌نشده اساتید و مدرسان (تعهدات تسویه)
        description: `تعهد تسویه سهم مدرسان از سفارش #${order._id.toString().slice(-6)}`,
        debit: 0,
        credit: totalInstructorShare,
      });
    }

    const journalEntry = await AccountingLedgerService.createJournalEntry(
      {
        date: order.createdAt || new Date(),
        description: `ثبت مالی خرید سفارش #${order._id.toString().slice(-6)} (${order.items.length} آیتم)`,
        status: "posted",
        sourceType: "order",
        sourceId: order._id.toString(),
        idempotencyKey,
        lines,
        userId: order.userId.toString(),
      },
      options
    );

    AuditService.log({
      userId: order.userId.toString(),
      action: "accounting_order_recorded",
      category: "accounting",
      title: `ثبت خودکار سند حسابداری شماره ${journalEntry.entryNumber} برای سفارش #${order._id.toString().slice(-6)}`,
      targetId: journalEntry._id.toString(),
      targetType: "journal_entry",
      details: {
        orderId: order._id.toString(),
        totalAmount,
        gatewayAmount,
        walletApplied,
        totalInstructorShare,
        entryNumber: journalEntry.entryNumber,
      },
    });

    return journalEntry;
  }

  /**
   * 2. Record Customer Wallet Top-Up in Double-Entry Accounting
   *
   * Crucial Accounting Policy:
   * Customer wallet deposit is NOT sales revenue.
   * It is recorded as a liability to the customer:
   * - Debit: '1021' (وجوه در راه درگاه سامان) or '1011' (بانک)
   * - Credit: '2010' (بستانکاران تجاری - اعتبار کیف پول کاربران)
   */
  static async recordWalletTopup(
    transaction: IWalletTransaction,
    options: { session?: mongoose.ClientSession } = {}
  ): Promise<IJournalEntry | null> {
    if (transaction.status !== "completed" || transaction.type !== "deposit") {
      return null;
    }

    const idempotencyKey = `ACC_WLT_TOPUP_${transaction._id}`;

    const existingEntry = await JournalEntry.findOne({ idempotencyKey });
    if (existingEntry) {
      return existingEntry;
    }

    const amount = Math.round(Number(transaction.amount) || 0);
    if (amount <= 0) return null;

    const journalEntry = await AccountingLedgerService.createJournalEntry(
      {
        date: transaction.createdAt || new Date(),
        description: `شارژ آنلاین کیف پول کاربر (${transaction.title || "افزایش اعتبار"})`,
        status: "posted",
        sourceType: "wallet_topup",
        sourceId: transaction._id.toString(),
        idempotencyKey,
        lines: [
          {
            accountCode: "1021", // وجوه در راه درگاه سامان
            description: `دریافت وجه شارژ کیف پول از درگاه شاپرک (${transaction.trackingCode || ""})`,
            debit: amount,
            credit: 0,
            entityType: "bank",
          },
          {
            accountCode: "2010", // بستانکاران تجاری - اعتبار کیف پول کاربران
            description: `افزایش بدهی پلتفرم بابت شارژ کیف پول دانشجو`,
            debit: 0,
            credit: amount,
            entityType: "user",
            entityId: transaction.userId.toString(),
          },
        ],
        userId: transaction.userId.toString(),
      },
      options
    );

    AuditService.log({
      userId: transaction.userId.toString(),
      action: "accounting_wallet_topup_recorded",
      category: "accounting",
      title: `ثبت سند شارژ کیف پول شماره ${journalEntry.entryNumber} به مبلغ ${amount.toLocaleString("fa-IR")} تومان`,
      targetId: journalEntry._id.toString(),
      targetType: "journal_entry",
      details: {
        transactionId: transaction._id.toString(),
        amount,
        entryNumber: journalEntry.entryNumber,
      },
    });

    return journalEntry;
  }

  /**
   * 3. Record Instructor Settlement Payout (تسویه حساب و واریز پایا به شبا مدرس)
   *
   * Accounting Policy:
   * - Debit: '2020' (سهم پرداخت‌نشده مدرسان - کاهش بدهی پلتفرم)
   * - Credit: '1011' (حساب جاری بانک سامان - خروج وجه از بانک)
   */
  static async recordSettlementPayout(
    settlement: ISettlement,
    adminUserId: string,
    options: { session?: mongoose.ClientSession } = {}
  ): Promise<IJournalEntry | null> {
    const idempotencyKey = `ACC_SETTLE_PAYOUT_${settlement._id}`;

    const existingEntry = await JournalEntry.findOne({ idempotencyKey });
    if (existingEntry) {
      return existingEntry;
    }

    const amount = Math.round(Number(settlement.amount) || 0);
    if (amount <= 0) return null;

    const journalEntry = await AccountingLedgerService.createJournalEntry(
      {
        date: new Date(),
        description: `تسویه حساب و واریز حق‌التدریس مدرس (${settlement.accountHolderName || "مدرس"}) - شبا: ${settlement.shabaNumber || ""}`,
        status: "posted",
        sourceType: "settlement",
        sourceId: settlement._id.toString(),
        idempotencyKey,
        lines: [
          {
            accountCode: "2020", // سهم پرداخت‌نشده مدرسان (کاهش بدهی)
            description: `تسویه مطالبات مدرس ${settlement.accountHolderName || ""}`,
            debit: amount,
            credit: 0,
            entityType: "instructor",
            entityId: settlement.instructorId.toString(),
          },
          {
            accountCode: "1011", // حساب جاری بانک سامان
            description: `واریز پایا از بانک سامان به شبا ${settlement.shabaNumber || ""}`,
            debit: 0,
            credit: amount,
            entityType: "bank",
          },
        ],
        userId: adminUserId,
      },
      options
    );

    AuditService.log({
      userId: adminUserId,
      action: "accounting_settlement_recorded",
      category: "accounting",
      title: `ثبت سند تسویه مدرس شماره ${journalEntry.entryNumber} به مبلغ ${amount.toLocaleString("fa-IR")} تومان`,
      targetId: journalEntry._id.toString(),
      targetType: "journal_entry",
      details: {
        settlementId: settlement._id.toString(),
        instructorId: settlement.instructorId.toString(),
        amount,
        entryNumber: journalEntry.entryNumber,
      },
    });

    return journalEntry;
  }

  /**
   * 4. Record Gateway Daily Reconciliation to Bank (انتقال وجوه در راه شاپرک به بانک)
   *
   * When Shaparak executes Paya clearing cycle into Saman bank account:
   * - Debit: '1011' (حساب جاری بانک سامان)
   * - Credit: '1021' (وجوه در راه درگاه سامان)
   */
  static async recordGatewayReconciliation(
    amount: number,
    adminUserId: string,
    trackingRef?: string,
    options: { session?: mongoose.ClientSession } = {}
  ): Promise<IJournalEntry> {
    const numAmount = Math.round(Number(amount));
    if (numAmount <= 0) {
      throw new AppError("مبلغ تسویه شاپرک باید بزرگتر از صفر باشد.", 400);
    }

    const idempotencyKey = trackingRef ? `ACC_RECON_${trackingRef}` : `ACC_RECON_${Date.now()}`;

    const journalEntry = await AccountingLedgerService.createJournalEntry(
      {
        date: new Date(),
        description: `تسویه سیکل پایا شاپرک و نشست وجه درگاه در حساب جاری بانک سامان (${trackingRef || "تسویه روزانه"})`,
        status: "posted",
        sourceType: "gateway_reconciliation",
        sourceId: trackingRef,
        idempotencyKey,
        lines: [
          {
            accountCode: "1011", // حساب جاری بانک سامان
            description: `واریز سیکل شاپرک به حساب بانک سامان`,
            debit: numAmount,
            credit: 0,
            entityType: "bank",
          },
          {
            accountCode: "1021", // وجوه در راه درگاه سامان
            description: `تسویه مطالبات در راه از شاپرک سپ`,
            debit: 0,
            credit: numAmount,
          },
        ],
        userId: adminUserId,
      },
      options
    );

    AuditService.log({
      userId: adminUserId,
      action: "accounting_reconciliation_recorded",
      category: "accounting",
      title: `ثبت سند تسویه شاپرک به بانک شماره ${journalEntry.entryNumber} به مبلغ ${numAmount.toLocaleString("fa-IR")} تومان`,
      targetId: journalEntry._id.toString(),
      targetType: "journal_entry",
      details: {
        amount: numAmount,
        trackingRef,
        entryNumber: journalEntry.entryNumber,
      },
    });

    return journalEntry;
  }

  /**
   * 5. Record Order Refund (استرداد وجه سفارش)
   * Non-destructive reversal or credit adjustment
   */
  static async recordOrderRefund(
    order: IOrder,
    refundAmount: number,
    reason: string,
    adminUserId: string,
    options: { session?: mongoose.ClientSession } = {}
  ): Promise<IJournalEntry> {
    const numAmount = Math.round(Number(refundAmount));
    if (numAmount <= 0) {
      throw new AppError("مبلغ بازپرداخت باید بزرگتر از صفر باشد.", 400);
    }

    const idempotencyKey = `ACC_REFUND_ORD_${order._id}_${Date.now()}`;

    const journalEntry = await AccountingLedgerService.createJournalEntry(
      {
        date: new Date(),
        description: `استرداد و بازپرداخت سفارش #${order._id.toString().slice(-6)}: ${reason}`,
        status: "posted",
        sourceType: "refund",
        sourceId: order._id.toString(),
        idempotencyKey,
        lines: [
          {
            accountCode: "4010", // کاهش درآمد ناخالص
            description: `برگشت درآمد ناشی از انصراف سفارش #${order._id.toString().slice(-6)}`,
            debit: numAmount,
            credit: 0,
          },
          {
            accountCode: "2010", // بازگشت وجه به صورت بستانکاری کیف پول کاربر
            description: `شارژ بستانکاری کیف پول دانشجو بابت استرداد وجه`,
            debit: 0,
            credit: numAmount,
            entityType: "user",
            entityId: order.userId.toString(),
          },
        ],
        userId: adminUserId,
      },
      options
    );

    return journalEntry;
  }
}
