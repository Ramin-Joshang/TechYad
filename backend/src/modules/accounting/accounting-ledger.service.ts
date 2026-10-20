import mongoose, { Types } from "mongoose";
import { Account, IAccount } from "./account.model.js";
import { JournalEntry, IJournalEntry, IJournalEntryLine, JournalEntryStatus, JournalEntrySourceType } from "./journal-entry.model.js";
import { FiscalYear, IFiscalYear } from "./fiscal-year.model.js";
import { SYSTEM_CHART_OF_ACCOUNTS } from "./coa.constants.js";
import { AppError } from "../../common/errors/AppError.js";
import { AuditService } from "../../common/services/audit.service.js";
import { AuditLog } from "../admin/audit-log.model.js";

export interface CreateJournalEntryLineInput {
  accountId?: string;
  accountCode?: string;
  description?: string;
  debit: number;
  credit: number;
  entityType?: "user" | "instructor" | "course" | "class" | "bank";
  entityId?: string;
}

export interface CreateJournalEntryInput {
  date?: Date | string;
  fiscalYear?: number;
  description: string;
  status?: JournalEntryStatus;
  sourceType?: JournalEntrySourceType;
  sourceId?: string;
  idempotencyKey?: string;
  lines: CreateJournalEntryLineInput[];
  userId: string;
}

export class AccountingLedgerService {
  /**
   * Helper: Calculate current Persian fiscal year (e.g. 1403 or 1404)
   */
  static getFiscalYear(date: Date = new Date()): number {
    try {
      const formatter = new Intl.DateTimeFormat("en-US-u-ca-persian", { year: "numeric" });
      const yearStr = formatter.format(date);
      const parsed = parseInt(yearStr, 10);
      return !isNaN(parsed) && parsed > 1300 ? parsed : date.getFullYear();
    } catch {
      return date.getFullYear();
    }
  }

  /**
   * 1. Seed or ensure all system Chart of Accounts (COA) exist idempotently
   */
  static async ensureChartOfAccounts(): Promise<{ created: number; updated: number; total: number }> {
    let created = 0;
    let updated = 0;

    // Step 1: Ensure accounts without parentId first to satisfy references
    const accountMap = new Map<string, Types.ObjectId>();

    // Load existing
    const existing = await Account.find({}).lean();
    for (const acc of existing) {
      accountMap.set(acc.code, acc._id as Types.ObjectId);
    }

    for (const def of SYSTEM_CHART_OF_ACCOUNTS) {
      let parentId: Types.ObjectId | null = null;
      if (def.parentCode && accountMap.has(def.parentCode)) {
        parentId = accountMap.get(def.parentCode) || null;
      }

      const existingAccount = await Account.findOne({ code: def.code });
      if (!existingAccount) {
        const newAcc = await Account.create({
          code: def.code,
          title: def.title,
          type: def.type,
          nature: def.nature,
          level: def.level,
          parentId: parentId || undefined,
          description: def.description,
          isSystem: true,
          isActive: true,
        });
        accountMap.set(def.code, newAcc._id as Types.ObjectId);
        created++;
      } else {
        existingAccount.title = def.title;
        existingAccount.type = def.type;
        existingAccount.nature = def.nature;
        existingAccount.level = def.level;
        if (parentId) existingAccount.parentId = parentId;
        existingAccount.description = def.description;
        existingAccount.isSystem = true;
        await existingAccount.save();
        accountMap.set(def.code, existingAccount._id as Types.ObjectId);
        updated++;
      }
    }

    // Step 2: Second pass to ensure any deferred parentIds are linked
    for (const def of SYSTEM_CHART_OF_ACCOUNTS) {
      if (def.parentCode && accountMap.has(def.parentCode)) {
        const pId = accountMap.get(def.parentCode);
        await Account.updateOne({ code: def.code, parentId: { $ne: pId } }, { $set: { parentId: pId } });
      }
    }

    const total = await Account.countDocuments();
    return { created, updated, total };
  }

  /**
   * Helper: Get next sequential entry number for a fiscal year
   */
  static async getNextEntryNumber(fiscalYear: number, session?: mongoose.ClientSession): Promise<number> {
    const query = JournalEntry.findOne({ fiscalYear }).sort({ entryNumber: -1 }).select("entryNumber");
    if (session) query.session(session);
    const last = await query.lean();
    return (last?.entryNumber || 0) + 1;
  }

  /**
   * 2. Create Journal Entry (Strict Double-Entry Engine)
   */
  static async createJournalEntry(
    input: CreateJournalEntryInput,
    options: { session?: mongoose.ClientSession } = {}
  ): Promise<IJournalEntry> {
    const {
      description,
      lines,
      userId,
      sourceType = "manual",
      sourceId,
      idempotencyKey,
      status = "draft",
    } = input;

    // Idempotency check: prevent duplicate financial entries for the same event
    if (idempotencyKey) {
      const existingQuery = JournalEntry.findOne({ idempotencyKey });
      if (options.session) existingQuery.session(options.session);
      const existingEntry = await existingQuery;
      if (existingEntry) {
        return existingEntry;
      }
    }

    if (!lines || !Array.isArray(lines) || lines.length < 2) {
      throw new AppError(
        "هر سند حسابداری باید حداقل شامل دو ردیف (یک بدهکار و یک بستانکار) باشد.",
        400,
        "INVALID_JOURNAL_ENTRY_LINES"
      );
    }

    const entryDate = input.date ? new Date(input.date) : new Date();
    const fiscalYear = input.fiscalYear || this.getFiscalYear(entryDate);

    // Validate if fiscal period is closed
    const closedYear = await FiscalYear.findOne({ year: fiscalYear, isClosed: true });
    if (closedYear) {
      throw new AppError(
        `دوره مالی سال ${fiscalYear} بسته شده است و امکان ثبت سند جدید در آن وجود ندارد.`,
        400,
        "FISCAL_YEAR_CLOSED"
      );
    }

    // Resolve accounts and validate lines
    let totalDebit = 0;
    let totalCredit = 0;
    const processedLines: IJournalEntryLine[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const debit = Math.max(0, Math.round(Number(line.debit) || 0));
      const credit = Math.max(0, Math.round(Number(line.credit) || 0));

      if (debit === 0 && credit === 0) {
        throw new AppError(
          `ردیف ${i + 1} سند نامعتبر است: مبلغ بدهکار یا بستانکار باید بزرگتر از صفر باشد.`,
          400,
          "ZERO_AMOUNT_LINE"
        );
      }

      if (debit > 0 && credit > 0) {
        throw new AppError(
          `ردیف ${i + 1} سند نامعتبر است: یک ردیف نمی‌تواند همزمان دارای بدهکار و بستانکار باشد.`,
          400,
          "DUAL_AMOUNT_LINE"
        );
      }

      // Lookup account
      let account: IAccount | null = null;
      if (line.accountId) {
        account = await Account.findById(line.accountId);
      } else if (line.accountCode) {
        account = await Account.findOne({ code: line.accountCode });
      }

      if (!account) {
        throw new AppError(
          `حساب مورد نظر در ردیف ${i + 1} یافت نشد (کد یا شناسه نامعتبر).`,
          404,
          "ACCOUNT_NOT_FOUND"
        );
      }

      if (!account.isActive) {
        throw new AppError(
          `حساب «${account.title}» (${account.code}) غیرفعال است و امکان ثبت سند در آن وجود ندارد.`,
          400,
          "ACCOUNT_INACTIVE"
        );
      }

      totalDebit += debit;
      totalCredit += credit;

      processedLines.push({
        accountId: account._id as Types.ObjectId,
        accountCode: account.code,
        accountTitle: account.title,
        description: line.description || description,
        debit,
        credit,
        entityType: line.entityType,
        entityId: line.entityId ? new Types.ObjectId(line.entityId) : undefined,
      });
    }

    // STRICT BALANCE CHECK: If creating directly as 'posted', debits must strictly equal credits
    if (status === "posted" && totalDebit !== totalCredit) {
      throw new AppError(
        `سند حسابداری تراز نیست. جمع بدهکار (${totalDebit.toLocaleString(
          "fa-IR"
        )} تومان) با جمع بستانکار (${totalCredit.toLocaleString("fa-IR")} تومان) برابر نیست.`,
        400,
        "UNBALANCED_JOURNAL_ENTRY"
      );
    }

    const entryNumber = await this.getNextEntryNumber(fiscalYear, options.session);

    const newEntryPayload: Partial<IJournalEntry> = {
      entryNumber,
      date: entryDate,
      fiscalYear,
      description,
      status,
      sourceType,
      sourceId,
      idempotencyKey,
      lines: processedLines,
      totalDebit,
      totalCredit,
      createdBy: new Types.ObjectId(userId),
    };

    if (status === "posted") {
      newEntryPayload.postedBy = new Types.ObjectId(userId);
      newEntryPayload.postedAt = new Date();
    }

    let createdEntry: IJournalEntry;
    if (options.session) {
      const [saved] = await JournalEntry.create([newEntryPayload], { session: options.session });
      createdEntry = saved;
    } else {
      createdEntry = await JournalEntry.create(newEntryPayload);
    }

    AuditService.log({
      userId,
      action: "create_journal_entry",
      category: "accounting",
      title: `ثبت سند حسابداری شماره ${createdEntry.entryNumber} (${status === "posted" ? "قطعی" : "پیش‌نویس"})`,
      targetId: createdEntry._id.toString(),
      targetType: "journal_entry",
      details: {
        entryNumber: createdEntry.entryNumber,
        fiscalYear,
        totalDebit,
        totalCredit,
        status,
        sourceType,
      },
    });

    return createdEntry;
  }

  /**
   * 3. Confirm and post a draft journal entry (must be balanced)
   */
  static async postJournalEntry(entryId: string, userId: string): Promise<IJournalEntry> {
    const entry = await JournalEntry.findById(entryId);
    if (!entry) throw new AppError("سند حسابداری یافت نشد", 404, "ENTRY_NOT_FOUND");

    if (entry.status === "posted") {
      throw new AppError("این سند قبلاً قطعی و ثبت نهایی شده است", 400, "ENTRY_ALREADY_POSTED");
    }

    if (entry.status === "reversed") {
      throw new AppError("این سند باطل/معکوس شده است و امکان قطعی کردن آن وجود ندارد", 400, "ENTRY_REVERSED");
    }

    // Verify fiscal year is not closed
    const closedYear = await FiscalYear.findOne({ year: entry.fiscalYear, isClosed: true });
    if (closedYear) {
      throw new AppError(
        `دوره مالی سال ${entry.fiscalYear} بسته شده است و امکان قطعی‌سازی سند در آن وجود ندارد.`,
        400,
        "FISCAL_YEAR_CLOSED"
      );
    }

    // Strict balance check before posting
    if (entry.totalDebit !== entry.totalCredit) {
      throw new AppError(
        `سند پیش‌نویس تراز نیست (بدهکار: ${entry.totalDebit.toLocaleString(
          "fa-IR"
        )} تومان، بستانکار: ${entry.totalCredit.toLocaleString("fa-IR")} تومان) و نمی‌تواند قطعی شود.`,
        400,
        "UNBALANCED_JOURNAL_ENTRY"
      );
    }

    entry.status = "posted";
    entry.postedBy = new Types.ObjectId(userId);
    entry.postedAt = new Date();
    await entry.save();

    AuditService.log({
      userId,
      action: "post_journal_entry",
      category: "accounting",
      title: `قطعی‌سازی سند حسابداری شماره ${entry.entryNumber}`,
      targetId: entry._id.toString(),
      targetType: "journal_entry",
      details: { entryNumber: entry.entryNumber, totalAmount: entry.totalDebit },
    });

    return entry;
  }

  /**
   * 4. Reverse a posted journal entry with a non-destructive mirror entry
   */
  static async reverseJournalEntry(
    entryId: string,
    userId: string,
    reason: string
  ): Promise<{ original: IJournalEntry; reversal: IJournalEntry }> {
    if (!reason || !reason.trim()) {
      throw new AppError("وارد کردن علت ابطال یا معکوس‌سازی سند الزامی است.", 400, "REVERSAL_REASON_REQUIRED");
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const original = await JournalEntry.findById(entryId).session(session);
      if (!original) throw new AppError("سند حسابداری یافت نشد", 404, "ENTRY_NOT_FOUND");

      if (original.status !== "posted") {
        throw new AppError("تنها اسناد قطعی‌شده قابل ابطال و معکوس‌سازی هستند", 400, "CANNOT_REVERSE_DRAFT");
      }

      if (original.reversedInEntry) {
        throw new AppError("این سند قبلاً با یک سند معکوس اصلاح و باطل شده است", 400, "ALREADY_REVERSED");
      }

      const fiscalYear = this.getFiscalYear(new Date());
      const nextNumber = await this.getNextEntryNumber(fiscalYear, session);

      // Create exact inverse lines: swap debit and credit
      const reversedLines: IJournalEntryLine[] = original.lines.map((l) => ({
        accountId: l.accountId,
        accountCode: l.accountCode,
        accountTitle: l.accountTitle,
        description: `برگشت سند #${original.entryNumber} - ${l.description}`,
        debit: l.credit,
        credit: l.debit,
        entityType: l.entityType,
        entityId: l.entityId,
      }));

      const [reversalEntry] = await JournalEntry.create(
        [
          {
            entryNumber: nextNumber,
            date: new Date(),
            fiscalYear,
            description: `سند معکوس/اصلاحی سند شماره ${original.entryNumber} (${reason.trim()})`,
            status: "posted",
            sourceType: original.sourceType,
            sourceId: original.sourceId,
            idempotencyKey: `REVERSAL-${original._id}-${Date.now()}`,
            lines: reversedLines,
            totalDebit: original.totalCredit,
            totalCredit: original.totalDebit,
            createdBy: new Types.ObjectId(userId),
            postedBy: new Types.ObjectId(userId),
            postedAt: new Date(),
            reversalOf: original._id,
            reversalReason: reason.trim(),
          },
        ],
        { session }
      );

      // Mark original entry as reversed
      original.status = "reversed";
      original.reversedBy = new Types.ObjectId(userId);
      original.reversedAt = new Date();
      original.reversedInEntry = reversalEntry._id as Types.ObjectId;
      original.reversalReason = reason.trim();
      await original.save({ session });

      await session.commitTransaction();
      session.endSession();

      AuditService.log({
        userId,
        action: "reverse_journal_entry",
        category: "accounting",
        title: `صدور سند معکوس شماره ${reversalEntry.entryNumber} برای ابطال سند ${original.entryNumber}`,
        targetId: original._id.toString(),
        targetType: "journal_entry",
        details: {
          originalEntryNumber: original.entryNumber,
          reversalEntryNumber: reversalEntry.entryNumber,
          reason,
        },
      });

      return { original, reversal: reversalEntry };
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      throw err;
    }
  }

  /**
   * 5. Get list and hierarchy of Chart of Accounts
   */
  static async getAccounts(query: { type?: string; level?: string; search?: string } = {}) {
    const filter: any = {};
    if (query.type && query.type !== "all") filter.type = query.type;
    if (query.level && query.level !== "all") filter.level = query.level;
    if (query.search && query.search.trim()) {
      filter.$or = [
        { code: { $regex: query.search.trim(), $options: "i" } },
        { title: { $regex: query.search.trim(), $options: "i" } },
      ];
    }

    const accounts = await Account.find(filter).sort({ code: 1 }).populate("parentId", "code title").lean();
    return accounts;
  }

  /**
   * 6. List Journal Entries with pagination and filters
   */
  static async getJournalEntries(query: {
    page?: number;
    limit?: number;
    fiscalYear?: number;
    status?: string;
    sourceType?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
  } = {}) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const filter: any = {};

    if (query.fiscalYear) {
      filter.fiscalYear = Number(query.fiscalYear);
    }
    if (query.status && query.status !== "all") {
      filter.status = query.status;
    }
    if (query.sourceType && query.sourceType !== "all") {
      filter.sourceType = query.sourceType;
    }

    if (query.startDate || query.endDate) {
      filter.date = {};
      if (query.startDate) filter.date.$gte = new Date(query.startDate);
      if (query.endDate) filter.date.$lte = new Date(query.endDate);
    }

    if (query.search && query.search.trim()) {
      const s = query.search.trim();
      const num = Number(s);
      filter.$or = [
        { description: { $regex: s, $options: "i" } },
        { "lines.accountCode": { $regex: s, $options: "i" } },
        { "lines.accountTitle": { $regex: s, $options: "i" } },
        ...(!isNaN(num) ? [{ entryNumber: num }] : []),
      ];
    }

    const [entries, total] = await Promise.all([
      JournalEntry.find(filter)
        .populate("createdBy", "firstName lastName email")
        .populate("postedBy", "firstName lastName email")
        .sort({ entryNumber: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      JournalEntry.countDocuments(filter),
    ]);

    return {
      entries,
      total,
      page,
      pages: Math.ceil(total / limit),
      limit,
    };
  }

  /**
   * 7. Get single journal entry with detailed lines
   */
  static async getJournalEntryById(id: string) {
    const entry = await JournalEntry.findById(id)
      .populate("createdBy", "firstName lastName email")
      .populate("postedBy", "firstName lastName email")
      .populate("reversedBy", "firstName lastName email")
      .populate("reversalOf", "entryNumber description totalDebit")
      .populate("reversedInEntry", "entryNumber description totalDebit")
      .lean();

    if (!entry) throw new AppError("سند حسابداری یافت نشد", 404, "ENTRY_NOT_FOUND");
    return entry;
  }

  /**
   * 8. Account Ledger (دفتر معین / دفتر کل یک حساب)
   */
  static async getAccountLedger(
    accountCode: string,
    filters: { startDate?: string; endDate?: string } = {}
  ) {
    const account = await Account.findOne({ code: accountCode });
    if (!account) throw new AppError(`حساب با کد ${accountCode} یافت نشد`, 404, "ACCOUNT_NOT_FOUND");

    const matchFilter: any = {
      status: "posted",
      "lines.accountCode": account.code,
    };

    if (filters.startDate || filters.endDate) {
      matchFilter.date = {};
      if (filters.startDate) matchFilter.date.$gte = new Date(filters.startDate);
      if (filters.endDate) matchFilter.date.$lte = new Date(filters.endDate);
    }

    const entries = await JournalEntry.find(matchFilter).sort({ date: 1, entryNumber: 1 }).lean();

    let runningBalance = 0;
    const ledgerLines = [];

    for (const entry of entries) {
      const relevantLines = entry.lines.filter((l) => l.accountCode === account.code);
      for (const line of relevantLines) {
        if (account.nature === "debit") {
          runningBalance += line.debit - line.credit;
        } else {
          runningBalance += line.credit - line.debit;
        }

        ledgerLines.push({
          entryId: entry._id,
          entryNumber: entry.entryNumber,
          date: entry.date,
          description: line.description || entry.description,
          debit: line.debit,
          credit: line.credit,
          balance: runningBalance,
          balanceNature: runningBalance >= 0 ? account.nature : account.nature === "debit" ? "credit" : "debit",
        });
      }
    }

    return {
      account: {
        code: account.code,
        title: account.title,
        type: account.type,
        nature: account.nature,
      },
      finalBalance: runningBalance,
      lines: ledgerLines,
    };
  }

  /**
   * 9. Trial Balance (تراز آزمایشی ۲ ستونی و ۴ ستونی)
   */
  static async getTrialBalance(fiscalYear?: number) {
    const year = fiscalYear || this.getFiscalYear();

    const pipeline: any[] = [
      { $match: { status: "posted", fiscalYear: year } },
      { $unwind: "$lines" },
      {
        $group: {
          _id: "$lines.accountCode",
          accountTitle: { $first: "$lines.accountTitle" },
          totalDebit: { $sum: "$lines.debit" },
          totalCredit: { $sum: "$lines.credit" },
        },
      },
      { $sort: { _id: 1 } },
    ];

    const aggregated = await JournalEntry.aggregate(pipeline);

    let grandTotalDebit = 0;
    let grandTotalCredit = 0;
    let grandRemainingDebit = 0;
    let grandRemainingCredit = 0;

    const rows = [];
    for (const row of aggregated) {
      grandTotalDebit += row.totalDebit;
      grandTotalCredit += row.totalCredit;

      const diff = row.totalDebit - row.totalCredit;
      const remainingDebit = diff > 0 ? diff : 0;
      const remainingCredit = diff < 0 ? Math.abs(diff) : 0;

      grandRemainingDebit += remainingDebit;
      grandRemainingCredit += remainingCredit;

      rows.push({
        accountCode: row._id,
        accountTitle: row.accountTitle,
        totalDebit: row.totalDebit,
        totalCredit: row.totalCredit,
        remainingDebit,
        remainingCredit,
      });
    }

    const isBalanced = grandTotalDebit === grandTotalCredit && grandRemainingDebit === grandRemainingCredit;

    return {
      fiscalYear: year,
      isBalanced,
      grandTotals: {
        totalDebit: grandTotalDebit,
        totalCredit: grandTotalCredit,
        remainingDebit: grandRemainingDebit,
        remainingCredit: grandRemainingCredit,
      },
      rows,
    };
  }

  /**
   * 10. Update a DRAFT journal entry (strictly prohibited on posted or reversed entries)
   */
  static async updateDraftJournalEntry(
    entryId: string,
    input: {
      description?: string;
      lines?: CreateJournalEntryLineInput[];
      date?: Date | string;
    },
    userId: string
  ): Promise<IJournalEntry> {
    const entry = await JournalEntry.findById(entryId);
    if (!entry) throw new AppError("سند حسابداری یافت نشد", 404, "ENTRY_NOT_FOUND");

    if (entry.status !== "draft") {
      throw new AppError(
        "تنها اسناد در وضعیت پیش‌نویس (draft) قابل ویرایش هستند. اسناد قطعی یا باطل‌شده غیرقابل تغییرند و اصلاح آن‌ها منحصراً با سند معکوس امکان‌پذیر است.",
        400,
        "CANNOT_EDIT_POSTED_ENTRY"
      );
    }

    if (input.description && input.description.trim()) {
      entry.description = input.description.trim();
    }

    if (input.date) {
      entry.date = new Date(input.date);
      entry.fiscalYear = this.getFiscalYear(entry.date);
    }

    if (input.lines && Array.isArray(input.lines)) {
      if (input.lines.length < 2) {
        throw new AppError(
          "سند حسابداری باید حداقل شامل دو ردیف باشد.",
          400,
          "INVALID_JOURNAL_ENTRY_LINES"
        );
      }

      let totalDebit = 0;
      let totalCredit = 0;
      const processedLines: IJournalEntryLine[] = [];

      for (let i = 0; i < input.lines.length; i++) {
        const line = input.lines[i];
        const debit = Math.max(0, Math.round(Number(line.debit) || 0));
        const credit = Math.max(0, Math.round(Number(line.credit) || 0));

        if (debit === 0 && credit === 0) {
          throw new AppError(
            `ردیف ${i + 1} سند نامعتبر است: مبلغ بدهکار یا بستانکار باید بزرگتر از صفر باشد.`,
            400,
            "ZERO_AMOUNT_LINE"
          );
        }

        if (debit > 0 && credit > 0) {
          throw new AppError(
            `ردیف ${i + 1} سند نامعتبر است: یک ردیف نمی‌تواند همزمان بدهکار و بستانکار باشد.`,
            400,
            "DUAL_AMOUNT_LINE"
          );
        }

        let account: IAccount | null = null;
        if (line.accountId) {
          account = await Account.findById(line.accountId);
        } else if (line.accountCode) {
          account = await Account.findOne({ code: line.accountCode });
        }

        if (!account) {
          throw new AppError(`حساب در ردیف ${i + 1} یافت نشد.`, 404, "ACCOUNT_NOT_FOUND");
        }

        if (!account.isActive) {
          throw new AppError(`حساب «${account.title}» (${account.code}) غیرفعال است.`, 400, "ACCOUNT_INACTIVE");
        }

        totalDebit += debit;
        totalCredit += credit;

        processedLines.push({
          accountId: account._id as Types.ObjectId,
          accountCode: account.code,
          accountTitle: account.title,
          description: line.description || entry.description,
          debit,
          credit,
          entityType: line.entityType,
          entityId: line.entityId ? new Types.ObjectId(line.entityId) : undefined,
        });
      }

      entry.lines = processedLines as any;
      entry.totalDebit = totalDebit;
      entry.totalCredit = totalCredit;
    }

    await entry.save();

    AuditService.log({
      userId,
      action: "update_draft_journal_entry",
      category: "accounting",
      title: `ویرایش پیش‌نویس سند حسابداری شماره ${entry.entryNumber}`,
      targetId: entry._id.toString(),
      targetType: "journal_entry",
      details: {
        entryNumber: entry.entryNumber,
        totalDebit: entry.totalDebit,
        totalCredit: entry.totalCredit,
      },
    });

    return entry;
  }

  /**
   * 11. Delete a DRAFT journal entry (strictly prohibited on posted or reversed entries)
   */
  static async deleteDraftJournalEntry(
    entryId: string,
    userId: string
  ): Promise<{ success: boolean; message: string }> {
    const entry = await JournalEntry.findById(entryId);
    if (!entry) throw new AppError("سند حسابداری یافت نشد", 404, "ENTRY_NOT_FOUND");

    if (entry.status !== "draft") {
      throw new AppError(
        "امکان حذف اسناد قطعی یا باطل‌شده تحت هیچ شرایطی وجود ندارد. اصلاح اسناد قطعی صرفاً از طریق صدور سند معکوس مجاز است.",
        400,
        "CANNOT_DELETE_POSTED_ENTRY"
      );
    }

    await JournalEntry.findByIdAndDelete(entryId);

    AuditService.log({
      userId,
      action: "delete_draft_journal_entry",
      category: "accounting",
      title: `حذف پیش‌نویس سند حسابداری شماره ${entry.entryNumber}`,
      targetId: entry._id.toString(),
      targetType: "journal_entry",
      details: { entryNumber: entry.entryNumber },
    });

    return { success: true, message: `پیش‌نویس سند شماره ${entry.entryNumber} با موفقیت حذف گردید.` };
  }

  /**
   * 12. Fiscal Years Management
   */
  static async getFiscalYears() {
    const years = await FiscalYear.find({})
      .populate("closedBy", "firstName lastName email")
      .sort({ year: -1 })
      .lean();
    return years;
  }

  static async createFiscalYear(
    data: { year: number; title: string; startDate: Date | string; endDate: Date | string },
    userId: string
  ) {
    const existing = await FiscalYear.findOne({ year: data.year });
    if (existing) {
      throw new AppError(`دوره مالی سال ${data.year} قبلاً ایجاد شده است.`, 409, "FISCAL_YEAR_EXISTS");
    }

    const created = await FiscalYear.create({
      year: data.year,
      title: data.title.trim(),
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      isClosed: false,
    });

    AuditService.log({
      userId,
      action: "create_fiscal_year",
      category: "accounting",
      title: `ایجاد دوره مالی جدید سال ${created.year}`,
      targetId: created._id.toString(),
      targetType: "fiscal_year",
      details: { year: created.year, title: created.title },
    });

    return created;
  }

  /**
   * Close Fiscal Year (Super Admin only)
   * Validates that all drafts are resolved and trial balance is balanced.
   */
  static async closeFiscalYear(year: number, userId: string, closeNotes?: string) {
    let fiscalYearDoc = await FiscalYear.findOne({ year });
    if (!fiscalYearDoc) {
      // Auto-create record if closing for the first time
      fiscalYearDoc = await FiscalYear.create({
        year,
        title: `سال مالی ${year}`,
        startDate: new Date(`${year - 621}-03-21`),
        endDate: new Date(`${year - 620}-03-20`),
        isClosed: false,
      });
    }

    if (fiscalYearDoc.isClosed) {
      throw new AppError(`سال مالی ${year} قبلاً بسته و قفل شده است.`, 400, "ALREADY_CLOSED");
    }

    // Check for unresolved draft entries
    const unresolvedDrafts = await JournalEntry.countDocuments({ fiscalYear: year, status: "draft" });
    if (unresolvedDrafts > 0) {
      throw new AppError(
        `تعداد ${unresolvedDrafts} سند در وضعیت پیش‌نویس در سال مالی ${year} وجود دارد. جهت بستن سال مالی، کلیه اسناد باید قطعی یا حذف شوند.`,
        400,
        "UNRESOLVED_DRAFTS_EXIST"
      );
    }

    // Verify trial balance
    const trialBalance = await this.getTrialBalance(year);
    if (!trialBalance.isBalanced) {
      throw new AppError(
        `دفاتر سال مالی ${year} تراز نیستند و امکان بستن سال مالی وجود ندارد.`,
        400,
        "UNBALANCED_TRIAL_BALANCE"
      );
    }

    fiscalYearDoc.isClosed = true;
    fiscalYearDoc.closedAt = new Date();
    fiscalYearDoc.closedBy = new Types.ObjectId(userId);
    fiscalYearDoc.closeNotes = closeNotes ? closeNotes.trim() : undefined;
    await fiscalYearDoc.save();

    AuditService.log({
      userId,
      action: "close_fiscal_year",
      category: "accounting",
      title: `بستن و قفل قطعی سال مالی ${year}`,
      targetId: fiscalYearDoc._id.toString(),
      targetType: "fiscal_year",
      details: {
        year,
        closedAt: fiscalYearDoc.closedAt,
        notes: closeNotes,
      },
    });

    return fiscalYearDoc;
  }

  /**
   * 13. Get Accounting Audit Logs
   */
  static async getAuditLogs(query: { page?: number; limit?: number; search?: string } = {}) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const filter: any = { category: "accounting" };
    if (query.search && query.search.trim()) {
      filter.$or = [
        { title: { $regex: query.search.trim(), $options: "i" } },
        { action: { $regex: query.search.trim(), $options: "i" } },
      ];
    }

    const [logs, total] = await Promise.all([
      AuditLog.find(filter)
        .populate("userId", "firstName lastName email roleSlugs")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      AuditLog.countDocuments(filter),
    ]);

    return {
      logs,
      total,
      page,
      pages: Math.ceil(total / limit),
      limit,
    };
  }
}
