import mongoose, { Types } from "mongoose";
import { FinancialAccount, IFinancialAccount, FinancialAccountType } from "./financial-account.model.js";
import { FinancialOperation, IFinancialOperation, FinancialOperationType, PartyRole } from "./financial-operation.model.js";
import { Account } from "./account.model.js";
import { JournalEntry, IJournalEntry } from "./journal-entry.model.js";
import { AccountingLedgerService } from "./accounting-ledger.service.js";
import { AppError } from "../../common/errors/AppError.js";
import { AuditService } from "../../common/services/audit.service.js";

export interface CreateFinancialAccountInput {
  title: string;
  accountType: FinancialAccountType;
  bankName?: string;
  accountNumber?: string;
  cardLast4?: string;
  shebaNumber?: string;
  branchName?: string;
  accountHolder?: string;
  coaAccountCode?: string;
  openingBalance?: number;
  openingDate?: Date | string;
  description?: string;
  isDefault?: boolean;
}

export interface CreateFinancialOperationInput {
  type: FinancialOperationType;
  category: string;
  categoryTitle?: string;
  amount: number;
  date?: Date | string;
  description: string;
  financialAccountId?: string; // Source or active account
  toFinancialAccountId?: string; // Destination for transfers
  party: {
    name: string;
    phone?: string;
    role?: PartyRole;
    refUserId?: string;
  };
  trackingCode?: string;
  attachmentUrl?: string;
  idempotencyKey?: string;
  notes?: string;
}

export class FinancialOperationsService {
  /**
   * Helper: Generate human-friendly sequential operation number
   */
  private static async getNextOperationNumber(type: string): Promise<string> {
    const fiscalYear = AccountingLedgerService.getFiscalYear();
    const count = await FinancialOperation.countDocuments();
    const prefix = type === "expense" ? "EXP" : type === "revenue" ? "REV" : type === "transfer" ? "TRF" : "PRT";
    const padded = String(count + 1).padStart(5, "0");
    return `${prefix}-${fiscalYear}-${padded}`;
  }

  // =========================================================================
  // 1. FINANCIAL ACCOUNTS (حساب‌های بانکی، کارت‌ها، صندوق و درگاه‌ها)
  // =========================================================================

  /**
   * List all financial accounts with real-time double-entry balances
   */
  static async getFinancialAccounts(query: { isActive?: boolean; accountType?: string } = {}) {
    const filter: any = {};
    if (query.isActive !== undefined) filter.isActive = query.isActive;
    if (query.accountType && query.accountType !== "all") filter.accountType = query.accountType;

    const accounts = await FinancialAccount.find(filter)
      .populate("coaAccountId", "code title type nature")
      .populate("createdBy", "firstName lastName email")
      .sort({ isDefault: -1, createdAt: 1 })
      .lean();

    // Calculate real-time ledger metrics for each account based strictly on posted journal entries
    const result = await Promise.all(
      accounts.map(async (acc) => {
        // Aggregate posted journal entry lines for this account's COA code
        const pipeline = [
          { $match: { status: "posted", "lines.accountCode": acc.coaAccountCode } },
          { $unwind: "$lines" },
          { $match: { "lines.accountCode": acc.coaAccountCode } },
          {
            $group: {
              _id: null,
              totalDebit: { $sum: "$lines.debit" },
              totalCredit: { $sum: "$lines.credit" },
            },
          },
        ];

        const [agg] = await JournalEntry.aggregate(pipeline);
        const totalDebit = agg?.totalDebit || 0;
        const totalCredit = agg?.totalCredit || 0;

        // In asset accounts (cash, bank, clearing), Debit increases balance, Credit decreases balance.
        const currentBalance = totalDebit - totalCredit;

        // Count operations connected to this account
        const operationCount = await FinancialOperation.countDocuments({
          $or: [{ financialAccountId: acc._id }, { toFinancialAccountId: acc._id }],
          status: "completed",
        });

        return {
          ...acc,
          totalDebit, // Total inflow from accounting perspective
          totalCredit, // Total outflow from accounting perspective
          currentBalance,
          operationCount,
        };
      })
    );

    return result;
  }

  /**
   * Get single financial account details with recent operations
   */
  static async getFinancialAccountById(id: string) {
    const account = await FinancialAccount.findById(id)
      .populate("coaAccountId", "code title type nature")
      .populate("createdBy", "firstName lastName email")
      .lean();

    if (!account) throw new AppError("حساب مالی مورد نظر یافت نشد.", 404, "ACCOUNT_NOT_FOUND");

    // Get ledger lines from AccountingLedgerService
    const ledger = await AccountingLedgerService.getAccountLedger(account.coaAccountCode);

    // Get recent operations
    const recentOperations = await FinancialOperation.find({
      $or: [{ financialAccountId: account._id }, { toFinancialAccountId: account._id }],
    })
      .sort({ date: -1 })
      .limit(20)
      .lean();

    return {
      account,
      currentBalance: ledger.finalBalance,
      ledgerLines: ledger.lines.slice(-30),
      recentOperations,
    };
  }

  /**
   * Create new financial account (Bank, Card, Cash register, or Clearing)
   */
  static async createFinancialAccount(
    input: CreateFinancialAccountInput,
    userId: string
  ): Promise<IFinancialAccount> {
    const title = input.title || (input as any).name;
    const rawType = (input.accountType || (input as any).type || "bank") as string;
    const accountType = (rawType === "cash" ? "cash_register" : rawType) as FinancialAccountType;
    const bankName = input.bankName;
    const accountNumber = input.accountNumber;
    const cardLast4 = input.cardLast4;
    const shebaNumber = input.shebaNumber || (input as any).shaba;
    const branchName = input.branchName;
    const accountHolder = input.accountHolder || (input as any).accountHolderName;
    const coaAccountCode = input.coaAccountCode || (input as any).code;
    const openingBalance = input.openingBalance ?? (input as any).initialBalance ?? 0;
    const openingDate = input.openingDate;
    const description = input.description;
    const isDefault = input.isDefault;

    if (!title || !title.trim()) {
      throw new AppError("عنوان حساب مالی الزامی است.", 400, "TITLE_REQUIRED");
    }

    // Default COA code mapping if not explicitly provided
    let targetCoaCode = coaAccountCode;
    if (!targetCoaCode) {
      if (accountType === "cash_register") {
        targetCoaCode = "1012"; // صندوق و تنخواه‌گردان
      } else if (accountType === "gateway_clearing") {
        targetCoaCode = "1021"; // وجوه در راه درگاه سامان
      } else if (accountType === "card") {
        targetCoaCode = "1013"; // سایر حساب‌ها و کارت‌ها
      } else {
        targetCoaCode = "1011"; // حساب جاری بانک سامان
      }
    }

    const coaAccount = await Account.findOne({ code: targetCoaCode });
    if (!coaAccount) {
      throw new AppError(
        `حساب معین حسابداری متناظر با کد ${targetCoaCode} در کدینگ حساب‌ها یافت نشد.`,
        400,
        "COA_ACCOUNT_NOT_FOUND"
      );
    }

    // If cardLast4 provided, sanitize to exactly 4 digits max
    const sanitizedCardLast4 = cardLast4 ? cardLast4.replace(/\D/g, "").slice(-4) : undefined;

    // If setting as default, unset others of same type
    if (isDefault) {
      await FinancialAccount.updateMany({ accountType }, { $set: { isDefault: false } });
    }

    const account = await FinancialAccount.create({
      title: title.trim(),
      accountType,
      bankName: bankName?.trim(),
      accountNumber: accountNumber?.trim(),
      cardLast4: sanitizedCardLast4,
      shebaNumber: shebaNumber?.trim(),
      branchName: branchName?.trim(),
      accountHolder: accountHolder?.trim(),
      coaAccountId: coaAccount._id,
      coaAccountCode: coaAccount.code,
      openingBalance: Math.max(0, Math.round(openingBalance)),
      openingDate: openingDate ? new Date(openingDate) : new Date(),
      description: description?.trim(),
      isActive: true,
      isDefault: !!isDefault,
      createdBy: new Types.ObjectId(userId),
    });

    // If initial opening balance is > 0, generate an Opening Journal Entry (سند افتتاحیه متوازن)
    if (account.openingBalance > 0) {
      await AccountingLedgerService.createJournalEntry({
        description: `سند افتتاحیه موجودی اولیه «${account.title}»`,
        status: "posted",
        sourceType: "opening",
        sourceId: account._id.toString(),
        idempotencyKey: `OPENING_BAL_${account._id}`,
        lines: [
          {
            accountCode: account.coaAccountCode,
            description: `ثبت موجودی اولیه حساب ${account.title}`,
            debit: account.openingBalance,
            credit: 0,
            entityType: "bank",
            entityId: account._id.toString(),
          },
          {
            accountCode: "3010", // سرمایه اولیه و حقوق صاحبان سهام
            description: `سرمایه اولیه ثبت‌شده معادل موجودی افتتاحیه ${account.title}`,
            debit: 0,
            credit: account.openingBalance,
          },
        ],
        userId,
      });
    }

    AuditService.log({
      userId,
      action: "create_financial_account",
      category: "accounting",
      title: `تعریف حساب مالی جدید: ${account.title} (${account.accountType})`,
      targetId: account._id.toString(),
      targetType: "financial_account",
      details: {
        title: account.title,
        accountType: account.accountType,
        coaAccountCode: account.coaAccountCode,
        openingBalance: account.openingBalance,
      },
    });

    return account;
  }

  /**
   * Update financial account
   */
  static async updateFinancialAccount(
    id: string,
    data: Partial<CreateFinancialAccountInput>,
    userId: string
  ): Promise<IFinancialAccount> {
    const account = await FinancialAccount.findById(id);
    if (!account) throw new AppError("حساب مالی مورد نظر یافت نشد.", 404, "ACCOUNT_NOT_FOUND");

    if (data.title) account.title = data.title.trim();
    if (data.bankName !== undefined) account.bankName = data.bankName?.trim();
    if (data.accountNumber !== undefined) account.accountNumber = data.accountNumber?.trim();
    if (data.cardLast4 !== undefined) {
      account.cardLast4 = data.cardLast4 ? data.cardLast4.replace(/\D/g, "").slice(-4) : undefined;
    }
    if (data.shebaNumber !== undefined) account.shebaNumber = data.shebaNumber?.trim();
    if (data.branchName !== undefined) account.branchName = data.branchName?.trim();
    if (data.accountHolder !== undefined) account.accountHolder = data.accountHolder?.trim();
    if (data.description !== undefined) account.description = data.description?.trim();
    if (data.isDefault !== undefined) {
      if (data.isDefault) {
        await FinancialAccount.updateMany({ accountType: account.accountType }, { $set: { isDefault: false } });
      }
      account.isDefault = data.isDefault;
    }

    await account.save();

    AuditService.log({
      userId,
      action: "update_financial_account",
      category: "accounting",
      title: `به‌روزرسانی مشخصات حساب مالی: ${account.title}`,
      targetId: account._id.toString(),
      targetType: "financial_account",
    });

    return account;
  }

  // =========================================================================
  // 2. FINANCIAL OPERATIONS (درآمدها، هزینه‌ها، انتقال و عملیات شرکا)
  // =========================================================================

  /**
   * Helper: Map operational category to official standard COA account code
   */
  private static resolveExpenseCoaCode(category: string): { code: string; defaultTitle: string } {
    switch (category) {
      case "marketing":
      case "advertising":
        return { code: "5030", defaultTitle: "هزینه‌های بازاریابی و تبلیغات" };
      case "server_infrastructure":
      case "server":
      case "hosting":
      case "domain":
        return { code: "5040", defaultTitle: "هزینه سرور، هاست و زیرساخت فنی" };
      case "sms_service":
      case "sms":
        return { code: "5040", defaultTitle: "هزینه پنل و شارژ پیامک" };
      case "instructor_fee":
      case "teacher_share":
        return { code: "5010", defaultTitle: "بهای تمام‌شده آموزش - سهم مدرس" };
      case "salary":
      case "payroll":
        return { code: "5050", defaultTitle: "حقوق، دستمزد و امور اداری پرسنل" };
      case "equipment":
      case "hardware":
        return { code: "5060", defaultTitle: "هزینه تجهیزات و سخت‌افزار" };
      case "software":
      case "license":
        return { code: "5070", defaultTitle: "هزینه نرم‌افزار، لایسنس و ابزارهای ابری" };
      case "bank_fee":
      case "gateway_fee":
        return { code: "5020", defaultTitle: "هزینه کارمزد درگاه و خدمات بانکی" };
      default:
        return { code: "5050", defaultTitle: "هزینه‌های عمومی و اداری" };
    }
  }

  /**
   * Create and record a financial operation with automatic double-entry journal entry
   */
  static async createOperation(
    input: CreateFinancialOperationInput,
    userId: string
  ): Promise<IFinancialOperation> {
    const {
      type,
      category,
      categoryTitle,
      amount,
      description,
      financialAccountId,
      toFinancialAccountId,
      party,
      trackingCode,
      attachmentUrl,
      idempotencyKey,
      notes,
    } = input;

    const resolvedFinAccountId = financialAccountId || (input as any).fromAccountId;
    const resolvedToFinAccountId = toFinancialAccountId || (input as any).toAccountId;
    const resolvedParty = party?.name ? party : { name: (input as any).payerOrPayee || "طرف حساب عمومی" };

    // Idempotency check: prevent duplicate submissions
    if (idempotencyKey) {
      const existing = await FinancialOperation.findOne({ idempotencyKey });
      if (existing) return existing;
    }

    const numAmount = Math.round(Number(amount));
    if (isNaN(numAmount) || numAmount <= 0) {
      throw new AppError("مبلغ عملیات مالی باید بزرگتر از صفر باشد.", 400, "INVALID_AMOUNT");
    }

    if (!description || !description.trim()) {
      throw new AppError("شرح عملیات مالی الزامی است.", 400, "DESCRIPTION_REQUIRED");
    }

    if (!resolvedParty || !resolvedParty.name || !resolvedParty.name.trim()) {
      throw new AppError("مشخصات طرف حساب (نام پرداخت‌کننده یا دریافت‌کننده) الزامی است.", 400, "PARTY_REQUIRED");
    }

    // Resolve primary financial account
    let primaryAcc: IFinancialAccount | null = null;
    if (resolvedFinAccountId) {
      primaryAcc = await FinancialAccount.findById(resolvedFinAccountId);
      if (!primaryAcc) {
        throw new AppError("حساب مالی مبدأ / انتخاب‌شده یافت نشد.", 404, "FINANCIAL_ACCOUNT_NOT_FOUND");
      }
    } else {
      // Pick default account
      primaryAcc = (await FinancialAccount.findOne({ isDefault: true })) || (await FinancialAccount.findOne({ isActive: true }));
      if (!primaryAcc) {
        throw new AppError("هیچ حساب مالی فعالی در سیستم تعریف نشده است. ابتدا یک حساب مالی تعریف کنید.", 400, "NO_ACCOUNT");
      }
    }

    const opDate = input.date ? new Date(input.date) : new Date();
    const opNumber = await this.getNextOperationNumber(type);

    let journalEntry: IJournalEntry;

    // Build balanced double-entry lines based on transaction type
    switch (type) {
      // -------------------------------------------------------------------
      // A) EXPENSE (هزینه: بدهکار حساب هزینه، بستانکار حساب بانک/صندوق)
      // -------------------------------------------------------------------
      case "expense": {
        const { code: expCode, defaultTitle: expTitle } = this.resolveExpenseCoaCode(category);
        journalEntry = await AccountingLedgerService.createJournalEntry({
          date: opDate,
          description: `ثبت هزینه: ${description} (دریافت‌کننده: ${party.name})`,
          status: "posted",
          sourceType: "expense",
          sourceId: opNumber,
          idempotencyKey: idempotencyKey ? `JE_${idempotencyKey}` : undefined,
          lines: [
            {
              accountCode: expCode,
              description: `${expTitle} - ${description}`,
              debit: numAmount,
              credit: 0,
            },
            {
              accountCode: primaryAcc.coaAccountCode,
              description: `پرداخت از ${primaryAcc.title} به ${party.name}`,
              debit: 0,
              credit: numAmount,
              entityType: "bank",
              entityId: primaryAcc._id.toString(),
            },
          ],
          userId,
        });
        break;
      }

      // -------------------------------------------------------------------
      // B) DIRECT REVENUE (درآمد مستقیم: بدهکار بانک/صندوق، بستانکار درآمد)
      // -------------------------------------------------------------------
      case "revenue": {
        journalEntry = await AccountingLedgerService.createJournalEntry({
          date: opDate,
          description: `دریافت درآمد مستقیم: ${description} (از طرف: ${party.name})`,
          status: "posted",
          sourceType: "manual",
          sourceId: opNumber,
          idempotencyKey: idempotencyKey ? `JE_${idempotencyKey}` : undefined,
          lines: [
            {
              accountCode: primaryAcc.coaAccountCode,
              description: `واریز به ${primaryAcc.title} بابت ${description}`,
              debit: numAmount,
              credit: 0,
              entityType: "bank",
              entityId: primaryAcc._id.toString(),
            },
            {
              accountCode: "4090", // سایر درآمدهای عملیاتی
              description: `شناسایی درآمد - ${description}`,
              debit: 0,
              credit: numAmount,
            },
          ],
          userId,
        });
        break;
      }

      // -------------------------------------------------------------------
      // C) TRANSFER (انتقال بین حساب‌ها: بدهکار مقصد، بستانکار مبدأ | اثر صفر در سود/زیان)
      // -------------------------------------------------------------------
      case "transfer": {
        const destId = resolvedToFinAccountId;
        if (!destId) {
          throw new AppError("حساب مالی مقصد جهت انتقال وجه الزامی است.", 400, "DESTINATION_ACCOUNT_REQUIRED");
        }
        if (destId === primaryAcc._id.toString()) {
          throw new AppError("حساب مبدأ و مقصد در انتقال وجه نمی‌توانند یکسان باشند.", 400, "SAME_ACCOUNT_TRANSFER");
        }

        const destAcc = await FinancialAccount.findById(destId);
        if (!destAcc) {
          throw new AppError("حساب مالی مقصد یافت نشد.", 404, "DESTINATION_ACCOUNT_NOT_FOUND");
        }

        journalEntry = await AccountingLedgerService.createJournalEntry({
          date: opDate,
          description: `انتقال داخلی وجه از «${primaryAcc.title}» به «${destAcc.title}» (${description})`,
          status: "posted",
          sourceType: "manual",
          sourceId: opNumber,
          idempotencyKey: idempotencyKey ? `JE_${idempotencyKey}` : undefined,
          lines: [
            {
              accountCode: destAcc.coaAccountCode,
              description: `ورود وجه به ${destAcc.title} از ${primaryAcc.title}`,
              debit: numAmount,
              credit: 0,
              entityType: "bank",
              entityId: destAcc._id.toString(),
            },
            {
              accountCode: primaryAcc.coaAccountCode,
              description: `خروج وجه از ${primaryAcc.title} جهت انتقال به ${destAcc.title}`,
              debit: 0,
              credit: numAmount,
              entityType: "bank",
              entityId: primaryAcc._id.toString(),
            },
          ],
          userId,
        });
        break;
      }

      // -------------------------------------------------------------------
      // D) PARTNER CAPITAL (آورده سرمایه شریک: بدهکار بانک، بستانکار سرمایه شرکا ۳۰۱۰)
      // -------------------------------------------------------------------
      case "partner_capital": {
        journalEntry = await AccountingLedgerService.createJournalEntry({
          date: opDate,
          description: `افزایش سرمایه و آورده نقدی شریک: ${party.name} (${description})`,
          status: "posted",
          sourceType: "manual",
          sourceId: opNumber,
          idempotencyKey: idempotencyKey ? `JE_${idempotencyKey}` : undefined,
          lines: [
            {
              accountCode: primaryAcc.coaAccountCode,
              description: `واریز آورده سرمایه ${party.name} به حساب ${primaryAcc.title}`,
              debit: numAmount,
              credit: 0,
              entityType: "bank",
              entityId: primaryAcc._id.toString(),
            },
            {
              accountCode: "3010", // سرمایه اولیه و حقوق صاحبان سهام
              description: `افزایش سرمایه ثبت‌شده شرکا - سهم ${party.name}`,
              debit: 0,
              credit: numAmount,
              entityType: "user",
              entityId: party.refUserId ? party.refUserId.toString() : undefined,
            },
          ],
          userId,
        });
        break;
      }

      // -------------------------------------------------------------------
      // E) PARTNER LOAN (وام شریک به مجموعه: بدهکار بانک، بستانکار بدهی به شریک ۲۰۶۰)
      // -------------------------------------------------------------------
      case "partner_loan": {
        journalEntry = await AccountingLedgerService.createJournalEntry({
          date: opDate,
          description: `دریافت وام/قرض‌الحسنه از شریک: ${party.name} (${description})`,
          status: "posted",
          sourceType: "manual",
          sourceId: opNumber,
          idempotencyKey: idempotencyKey ? `JE_${idempotencyKey}` : undefined,
          lines: [
            {
              accountCode: primaryAcc.coaAccountCode,
              description: `واریز وام دریافتی از ${party.name} به ${primaryAcc.title}`,
              debit: numAmount,
              credit: 0,
              entityType: "bank",
              entityId: primaryAcc._id.toString(),
            },
            {
              accountCode: "2060", // تسهیلات و وام‌های دریافتی از شرکا (بدهی جاری)
              description: `بدهی جاری مؤسسه به شریک ${party.name} بابت وام`,
              debit: 0,
              credit: numAmount,
              entityType: "user",
              entityId: party.refUserId ? party.refUserId.toString() : undefined,
            },
          ],
          userId,
        });
        break;
      }

      // -------------------------------------------------------------------
      // F) PARTNER LOAN REPAYMENT (بازپرداخت وام شریک: بدهکار ۲۰۶۰، بستانکار بانک)
      // -------------------------------------------------------------------
      case "partner_loan_repayment": {
        journalEntry = await AccountingLedgerService.createJournalEntry({
          date: opDate,
          description: `بازپرداخت اصل وام شریک: ${party.name} (${description})`,
          status: "posted",
          sourceType: "manual",
          sourceId: opNumber,
          idempotencyKey: idempotencyKey ? `JE_${idempotencyKey}` : undefined,
          lines: [
            {
              accountCode: "2060", // تسویه بدهی به شریک
              description: `تسویه بدهی وام شریک ${party.name}`,
              debit: numAmount,
              credit: 0,
              entityType: "user",
              entityId: party.refUserId ? party.refUserId.toString() : undefined,
            },
            {
              accountCode: primaryAcc.coaAccountCode,
              description: `پرداخت از ${primaryAcc.title} بابت بازپرداخت وام ${party.name}`,
              debit: 0,
              credit: numAmount,
              entityType: "bank",
              entityId: primaryAcc._id.toString(),
            },
          ],
          userId,
        });
        break;
      }

      // -------------------------------------------------------------------
      // G) PARTNER WITHDRAWAL (برداشت شریک: بدهکار ۳۰۳۰ برداشت شرکا، بستانکار بانک)
      // -------------------------------------------------------------------
      case "partner_withdrawal": {
        journalEntry = await AccountingLedgerService.createJournalEntry({
          date: opDate,
          description: `برداشت سود/جاری توسط شریک: ${party.name} (${description})`,
          status: "posted",
          sourceType: "manual",
          sourceId: opNumber,
          idempotencyKey: idempotencyKey ? `JE_${idempotencyKey}` : undefined,
          lines: [
            {
              accountCode: "3030", // برداشت و جاری شرکا (کاهنده سرمایه)
              description: `برداشت نقدی شریک ${party.name}`,
              debit: numAmount,
              credit: 0,
              entityType: "user",
              entityId: party.refUserId ? party.refUserId.toString() : undefined,
            },
            {
              accountCode: primaryAcc.coaAccountCode,
              description: `خروج وجه از ${primaryAcc.title} بابت برداشت ${party.name}`,
              debit: 0,
              credit: numAmount,
              entityType: "bank",
              entityId: primaryAcc._id.toString(),
            },
          ],
          userId,
        });
        break;
      }

      // -------------------------------------------------------------------
      // H) PARTNER DIVIDEND (سود سهام مصوب: بدهکار ۳۰۲۰ سود انباشته، بستانکار ۲۰۷۰ سود پرداختنی)
      // -------------------------------------------------------------------
      case "partner_dividend": {
        journalEntry = await AccountingLedgerService.createJournalEntry({
          date: opDate,
          description: `تصویب سود سهام دوره برای شریک: ${party.name} (${description})`,
          status: "posted",
          sourceType: "manual",
          sourceId: opNumber,
          idempotencyKey: idempotencyKey ? `JE_${idempotencyKey}` : undefined,
          lines: [
            {
              accountCode: "3020", // سود انباشته
              description: `تخصیص از سود انباشته بابت سهم سود ${party.name}`,
              debit: numAmount,
              credit: 0,
            },
            {
              accountCode: "2070", // سود سهام مصوب پرداختنی به شرکا
              description: `تعهد سود پرداختنی به شریک ${party.name}`,
              debit: 0,
              credit: numAmount,
              entityType: "user",
              entityId: party.refUserId ? party.refUserId.toString() : undefined,
            },
          ],
          userId,
        });
        break;
      }

      default:
        throw new AppError("نوع عملیات مالی نامعتبر است.", 400, "INVALID_OPERATION_TYPE");
    }

    // Save operation record
    const operation = await FinancialOperation.create({
      operationNumber: opNumber,
      type,
      category,
      categoryTitle: categoryTitle || category,
      amount: numAmount,
      date: opDate,
      description: description.trim(),
      financialAccountId: primaryAcc._id,
      toFinancialAccountId: toFinancialAccountId ? new Types.ObjectId(toFinancialAccountId) : undefined,
      party: {
        name: party.name.trim(),
        phone: party.phone?.trim(),
        role: party.role || "other",
        refUserId: party.refUserId ? new Types.ObjectId(party.refUserId) : undefined,
      },
      trackingCode: trackingCode?.trim(),
      attachmentUrl: attachmentUrl?.trim(),
      journalEntryId: journalEntry._id,
      status: "completed",
      idempotencyKey,
      notes: notes?.trim(),
      createdBy: new Types.ObjectId(userId),
    });

    AuditService.log({
      userId,
      action: "create_financial_operation",
      category: "accounting",
      title: `ثبت عملیات مالی ${operation.operationNumber} (${operation.type}) به مبلغ ${operation.amount.toLocaleString("fa-IR")} تومان`,
      targetId: operation._id.toString(),
      targetType: "financial_operation",
      details: {
        operationNumber: operation.operationNumber,
        type: operation.type,
        amount: operation.amount,
        journalEntryId: journalEntry._id.toString(),
      },
    });

    return operation;
  }

  /**
   * List financial operations with rich filtering
   */
  static async getOperations(query: {
    page?: number;
    limit?: number;
    type?: string;
    category?: string;
    financialAccountId?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
  } = {}) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (query.type && query.type !== "all") filter.type = query.type;
    if (query.category && query.category !== "all") filter.category = query.category;
    if (query.financialAccountId) {
      filter.$or = [
        { financialAccountId: query.financialAccountId },
        { toFinancialAccountId: query.financialAccountId },
      ];
    }

    if (query.startDate || query.endDate) {
      filter.date = {};
      if (query.startDate) filter.date.$gte = new Date(query.startDate);
      if (query.endDate) filter.date.$lte = new Date(query.endDate);
    }

    if (query.search && query.search.trim()) {
      const s = query.search.trim();
      filter.$or = [
        { description: { $regex: s, $options: "i" } },
        { "party.name": { $regex: s, $options: "i" } },
        { trackingCode: { $regex: s, $options: "i" } },
        { operationNumber: { $regex: s, $options: "i" } },
      ];
    }

    const [operations, total] = await Promise.all([
      FinancialOperation.find(filter)
        .populate("financialAccountId", "title accountType bankName cardLast4")
        .populate("toFinancialAccountId", "title accountType bankName cardLast4")
        .populate("journalEntryId", "entryNumber status totalDebit totalCredit")
        .populate("createdBy", "firstName lastName email")
        .sort({ date: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      FinancialOperation.countDocuments(filter),
    ]);

    return {
      operations,
      total,
      page,
      pages: Math.ceil(total / limit),
      limit,
    };
  }

  /**
   * Get single financial operation details
   */
  static async getOperationById(id: string) {
    const operation = await FinancialOperation.findById(id)
      .populate("financialAccountId")
      .populate("toFinancialAccountId")
      .populate("journalEntryId")
      .populate("createdBy", "firstName lastName email")
      .lean();

    if (!operation) throw new AppError("عملیات مالی مورد نظر یافت نشد.", 404, "OPERATION_NOT_FOUND");
    return operation;
  }

  /**
   * Cancel financial operation non-destructively via mirror reversal entry
   */
  static async cancelOperation(id: string, reason: string, userId: string) {
    const operation = await FinancialOperation.findById(id);
    if (!operation) throw new AppError("عملیات مالی یافت نشد.", 404, "OPERATION_NOT_FOUND");

    if (operation.status === "cancelled") {
      throw new AppError("این عملیات مالی قبلاً لغو و باطل شده است.", 400, "ALREADY_CANCELLED");
    }

    // Reverse the underlying posted journal entry
    const reversal = await AccountingLedgerService.reverseJournalEntry(
      operation.journalEntryId.toString(),
      userId,
      `ابطال عملیات مالی ${operation.operationNumber}: ${reason}`
    );

    operation.status = "cancelled";
    operation.notes = `${operation.notes || ""}\nعلت ابطال: ${reason} (توسط کاربر)`;
    await operation.save();

    AuditService.log({
      userId,
      action: "cancel_financial_operation",
      category: "accounting",
      title: `ابطال عملیات مالی ${operation.operationNumber} و صدور سند معکوس`,
      targetId: operation._id.toString(),
      targetType: "financial_operation",
      details: {
        operationNumber: operation.operationNumber,
        originalJournalEntryId: operation.journalEntryId.toString(),
        reversalJournalEntryId: reversal.reversal._id.toString(),
        reason,
      },
    });

    return { operation, reversal };
  }

  // =========================================================================
  // 3. RECEIVABLES & PAYABLES SUMMARY (مطالبات و بدهی‌ها)
  // =========================================================================

  /**
   * Get comprehensive overview of platform receivables, payables, commitments, and partner equity
   */
  static async getReceivablesAndPayablesSummary() {
    // 1. بدهی به اساتید (کد 2020: سهم پرداخت‌نشده مدرسان)
    const teacherPayablesLedger = await AccountingLedgerService.getAccountLedger("2020");

    // 2. اعتبار کیف پول کاربران (کد 2010: بستانکاران تجاری - ودیعه و اعتبار دانشجویان)
    const walletLiabilityLedger = await AccountingLedgerService.getAccountLedger("2010");

    // 3. درآمد تحقق‌نیافته کلاس‌های چندجلسه‌ای (کد 2030: پیش‌دریافت دوره‌ها و کلاس‌ها)
    const unearnedRevenueLedger = await AccountingLedgerService.getAccountLedger("2030");

    // 4. مطالبات از درگاه‌های پرداخت اینترنتی (کد 1021 سامان و 1022 اسنپ‌پی)
    const samanClearingLedger = await AccountingLedgerService.getAccountLedger("1021");
    const snappPayClearingLedger = await AccountingLedgerService.getAccountLedger("1022");

    // 5. بدهی به شرکا بابت تسهیلات/وام (کد 2060)
    const partnerLoanLedger = await AccountingLedgerService.getAccountLedger("2060");

    // 6. سرمایه اولیه ثبت‌شده شرکا (کد 3010)
    const partnerEquityLedger = await AccountingLedgerService.getAccountLedger("3010");

    // 7. برداشت و جاری شرکا (کد 3030)
    const partnerWithdrawalLedger = await AccountingLedgerService.getAccountLedger("3030");

    // 8. موجودی نقد و بانک مجموع (کد 1010)
    const cashAndBankLedger = await AccountingLedgerService.getAccountLedger("1010");

    const totalPayables =
      Math.max(0, teacherPayablesLedger.finalBalance) +
      Math.max(0, walletLiabilityLedger.finalBalance) +
      Math.max(0, unearnedRevenueLedger.finalBalance) +
      Math.max(0, partnerLoanLedger.finalBalance);

    const totalReceivables =
      Math.max(0, samanClearingLedger.finalBalance) +
      Math.max(0, snappPayClearingLedger.finalBalance);

    const partnerCapital = Math.max(0, partnerEquityLedger.finalBalance);
    const partnerWithdrawals = Math.max(0, partnerWithdrawalLedger.finalBalance);

    return {
      payables: {
        // بدهی به مدرسان
        teachersPayable: {
          accountCode: "2020",
          title: "سهم پرداخت‌نشده مدرسان (تعهدات تسویه)",
          amount: Math.max(0, teacherPayablesLedger.finalBalance),
        },
        // تعهدات اعتبار کیف پول دانشجویان
        walletBalances: {
          accountCode: "2010",
          title: "بستانکاری و اعتبار کیف پول دانشجویان",
          amount: Math.max(0, walletLiabilityLedger.finalBalance),
        },
        // پیش‌دریافت کلاس‌های آینده
        unearnedRevenue: {
          accountCode: "2030",
          title: "پیش‌دریافت کلاس‌ها (درآمد تحقق‌نیافته جلسات آینده)",
          amount: Math.max(0, unearnedRevenueLedger.finalBalance),
        },
        // بدهی به شرکا بابت وام
        partnerLoans: {
          accountCode: "2060",
          title: "تسهیلات و بدهی جاری به شرکا (وام)",
          amount: Math.max(0, partnerLoanLedger.finalBalance),
        },
        totalPayables,
        total: totalPayables,
        instructorsPendingSettlement: Math.max(0, teacherPayablesLedger.finalBalance),
        studentWalletLiabilities: Math.max(0, walletLiabilityLedger.finalBalance),
      },
      receivables: {
        // وجوه در راه درگاه سامان
        samanGatewayInTransit: {
          accountCode: "1021",
          title: "وجوه در راه تسویه شاپرک درگاه سامان (SEP)",
          amount: Math.max(0, samanClearingLedger.finalBalance),
        },
        // وجوه در راه اسنپ‌پی
        snappPayInTransit: {
          accountCode: "1022",
          title: "وجوه در راه تسویه اقساطی اسنپ‌پی",
          amount: Math.max(0, snappPayClearingLedger.finalBalance),
        },
        totalReceivables,
        total: totalReceivables,
        gatewayTransit: Math.max(0, samanClearingLedger.finalBalance),
        studentInstallments: Math.max(0, snappPayClearingLedger.finalBalance),
      },
      partnerSummary: {
        capitalRegistered: {
          accountCode: "3010",
          title: "سرمایه اولیه و آورده سهامداران/شرکا",
          amount: partnerCapital,
        },
        withdrawals: {
          accountCode: "3030",
          title: "مجموع برداشت سود و جاری شرکا",
          amount: partnerWithdrawals,
        },
        loansReceived: {
          accountCode: "2060",
          title: "مانده وام‌ها و استقراض از شرکا",
          amount: Math.max(0, partnerLoanLedger.finalBalance),
        },
      },
      equityAndReserves: {
        partnerCapital,
        partnerWithdrawals,
        retainedEarnings: 0,
      },
      treasurySummary: {
        totalCashAndBank: Math.max(0, cashAndBankLedger.finalBalance),
      },
    };
  }
}
