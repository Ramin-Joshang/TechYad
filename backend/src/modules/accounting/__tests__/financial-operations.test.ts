import mongoose from "mongoose";
import dotenv from "dotenv";
import { Account } from "../account.model.js";
import { JournalEntry } from "../journal-entry.model.js";
import { FinancialAccount } from "../financial-account.model.js";
import { FinancialOperation } from "../financial-operation.model.js";
import { AccountingLedgerService } from "../accounting-ledger.service.js";
import { FinancialOperationsService } from "../financial-operations.service.js";
import {
  requireAccountingView,
  requireAccountingMutate,
  requireAccountingAdmin,
} from "../accounting.middleware.js";
import { AppError } from "../../../common/errors/AppError.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/tekyad";

async function runTests() {
  console.log("\n🧪 شروع اجرای آزمون‌های جامع مدیریت حساب‌ها و عملیات مالی تک‌یاد (فاز سوم)...\n");

  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGO_URI);
    console.log("✅ اتصال به دیتابیس MongoDB با موفقیت برقرار شد.");
  }

  let passedTests = 0;
  let failedTests = 0;

  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(`  ✓ ${message}`);
      passedTests++;
    } else {
      console.error(`  ✗ شکست: ${message}`);
      failedTests++;
      throw new Error(`Assertion failed: ${message}`);
    }
  }

  const dummyUserId = new mongoose.Types.ObjectId().toString();
  const dummyPartnerId = new mongoose.Types.ObjectId().toString();

  try {
    // ------------------------------------------------------------------------
    // TEST 1: Ensure COA contains new Phase 3 accounts
    // ------------------------------------------------------------------------
    console.log("\n▶ تست ۱: بررسی و استقرار حساب‌های کدینگ جدید فاز سوم");
    await AccountingLedgerService.ensureChartOfAccounts();

    const partnerLoanAcc = await Account.findOne({ code: "2060" });
    assert(
      !!partnerLoanAcc && partnerLoanAcc.type === "liability" && partnerLoanAcc.nature === "credit",
      "حساب ۲-۰۶۰ (تسهیلات و بدهی جاری به شرکا) به عنوان بدهی جاری با ماهیت بستانکار در کدینگ ثبت شد"
    );

    const partnerWithdrawalAcc = await Account.findOne({ code: "3030" });
    assert(
      !!partnerWithdrawalAcc && partnerWithdrawalAcc.type === "equity" && partnerWithdrawalAcc.nature === "debit",
      "حساب ۳-۰۳۰ (برداشت و جاری شرکا) به عنوان کاهنده سرمایه با ماهیت بدهکار در کدینگ ثبت شد"
    );

    const hardwareExpenseAcc = await Account.findOne({ code: "5060" });
    assert(
      !!hardwareExpenseAcc && hardwareExpenseAcc.type === "expense" && hardwareExpenseAcc.nature === "debit",
      "حساب ۵-۰۶۰ (هزینه تجهیزات و سخت‌افزار) به عنوان هزینه با ماهیت بدهکار در کدینگ ثبت شد"
    );

    // ------------------------------------------------------------------------
    // TEST 2: Create Financial Accounts (Bank, Cash Register, Card)
    // ------------------------------------------------------------------------
    console.log("\n▶ تست ۲: تعریف و مدیریت حساب‌های بانکی، کارت‌ها و صندوق نقدی");
    // Clean previous test financial accounts and operations
    await FinancialAccount.deleteMany({});
    await FinancialOperation.deleteMany({});
    await JournalEntry.deleteMany({
      $or: [
        { description: { $regex: "تستی|تنخواه|سامان|آزمایشی|انتقال|افتتاحیه" } },
        { "lines.accountCode": { $in: ["1011", "1012", "2060", "3030", "5040", "5060", "4090"] } },
      ],
    });

    // a) Create Saman Bank Account with opening balance of 10,000,000 Toman
    const samanBank = await FinancialOperationsService.createFinancialAccount(
      {
        title: "حساب جاری بانک سامان تستی",
        accountType: "bank",
        bankName: "سامان",
        accountNumber: "849-810-998877-1",
        shebaNumber: "IR120560084981000099887701",
        accountHolder: "آکادمی تک‌یاد",
        openingBalance: 10000000,
        isDefault: true,
      },
      dummyUserId
    );

    assert(samanBank.coaAccountCode === "1011", "حساب بانک سامان به کد معین ۱۰۱۱ متصل شد");
    assert(samanBank.openingBalance === 10000000, "موجودی افتتاحیه ۱۰ میلیون تومان ثبت شد");

    // Check opening journal entry
    const openingEntry = await JournalEntry.findOne({ sourceId: samanBank._id.toString() });
    assert(
      !!openingEntry &&
        openingEntry.status === "posted" &&
        openingEntry.totalDebit === 10000000 &&
        openingEntry.totalCredit === 10000000,
      "سند افتتاحیه متوازن ثبت شد (بدهکار: بانک ۱۰۱۱ | بستانکار: سرمایه اولیه ۳۰۱۰)"
    );

    // b) Create Cash Register Account
    const cashRegister = await FinancialOperationsService.createFinancialAccount(
      {
        title: "صندوق تنخواه مرکزی تستی",
        accountType: "cash_register",
        coaAccountCode: "1012",
        openingBalance: 2000000,
      },
      dummyUserId
    );
    assert(cashRegister.coaAccountCode === "1012", "صندوق نقدی به کد معین ۱۰۱۲ متصل شد");

    // c) Create Card Account with last 4 digits
    const creditCard = await FinancialOperationsService.createFinancialAccount(
      {
        title: "کارت تنخواه ملت تستی",
        accountType: "card",
        bankName: "ملت",
        cardLast4: "6104337899001234", // Should be sanitized to 1234
        coaAccountCode: "1013",
        openingBalance: 0,
      },
      dummyUserId
    );
    assert(creditCard.cardLast4 === "1234", "شماره کارت با استاندارد امنیتی به ۴ رقم آخر محدود گردید (PCI Compliance)");

    // ------------------------------------------------------------------------
    // TEST 3: Record Expense Operations (تبلیغات، سرور، پیامک، تجهیزات)
    // ------------------------------------------------------------------------
    console.log("\n▶ تست ۳: ثبت و تفکیک هزینه‌های عملیاتی (سرور، تبلیغات، تجهیزات)");
    const serverExpense = await FinancialOperationsService.createOperation(
      {
        type: "expense",
        category: "server_infrastructure",
        categoryTitle: "هزینه سرور و زیرساخت ابری",
        amount: 1500000,
        description: "تمدید سرورهای اصلی آکادمی تک‌یاد",
        financialAccountId: samanBank._id.toString(),
        party: {
          name: "شرکت پارس آنلاین",
          role: "vendor",
        },
        trackingCode: "TRK-SRV-9081",
        idempotencyKey: `EXP_SRV_${Date.now()}`,
      },
      dummyUserId
    );

    assert(serverExpense.type === "expense", "عملیات هزینه با موفقیت ایجاد شد");
    assert(serverExpense.operationNumber.startsWith("EXP-"), "شماره عملیات هزینه با فرمت صحیح تولید شد");

    // Verify underlying Journal Entry
    const serverJe = await JournalEntry.findById(serverExpense.journalEntryId);
    assert(
      !!serverJe && serverJe.status === "posted" && serverJe.totalDebit === 1500000,
      "سند حسابداری هزینه به صورت قطعی (posted) و متوازن صادر شد"
    );
    const expLine = serverJe?.lines.find((l) => l.accountCode === "5040");
    const bankLine = serverJe?.lines.find((l) => l.accountCode === "1011");
    assert(
      expLine?.debit === 1500000 && bankLine?.credit === 1500000,
      "تراز هزینه تأیید شد: بدهکار (۵۰۴۰ سرور) و بستانکار (۱۰۱۱ بانک سامان)"
    );

    // ------------------------------------------------------------------------
    // TEST 4: Record Direct Revenue Operation
    // ------------------------------------------------------------------------
    console.log("\n▶ تست ۴: ثبت درآمد مستقیم عملیاتی");
    const directRevenue = await FinancialOperationsService.createOperation(
      {
        type: "revenue",
        category: "direct_sales",
        categoryTitle: "مشاوره اختصاصی سازمان",
        amount: 4000000,
        description: "ارائه خدمات مشاوره آموزشی به شرکت دانش‌بنیان",
        financialAccountId: samanBank._id.toString(),
        party: {
          name: "شرکت فناوری نوین",
          role: "customer",
        },
        idempotencyKey: `REV_DIR_${Date.now()}`,
      },
      dummyUserId
    );

    const revJe = await JournalEntry.findById(directRevenue.journalEntryId);
    const revBankLine = revJe?.lines.find((l) => l.accountCode === "1011");
    const revIncomeLine = revJe?.lines.find((l) => l.accountCode === "4090");
    assert(
      revBankLine?.debit === 4000000 && revIncomeLine?.credit === 4000000,
      "سند درآمد مستقیم تأیید شد: بدهکار (۱۰۱۱ بانک) و بستانکار (۴۰۹۰ درآمدهای متفرقه)"
    );

    // ------------------------------------------------------------------------
    // TEST 5: Internal Transfer (انتقال بین حساب‌ها بدون ثبت درآمد یا هزینه)
    // ------------------------------------------------------------------------
    console.log("\n▶ تست ۵: انتقال بین حساب‌ها و صندوق (Zero P&L Impact)");
    const transferOp = await FinancialOperationsService.createOperation(
      {
        type: "transfer",
        category: "internal_transfer",
        categoryTitle: "شارژ صندوق از حساب جاری",
        amount: 1000000,
        description: "انتقال وجه از حساب سامان جهت افزایش موجودی صندوق تنخواه",
        financialAccountId: samanBank._id.toString(),
        toFinancialAccountId: cashRegister._id.toString(),
        party: {
          name: "مسئول تنخواه شرکت",
          role: "employee",
        },
        idempotencyKey: `TRF_CASH_${Date.now()}`,
      },
      dummyUserId
    );

    const transferJe = await JournalEntry.findById(transferOp.journalEntryId);
    assert(
      !!transferJe && transferJe.status === "posted" && transferJe.totalDebit === 1000000,
      "سند انتقال داخلی بین حساب‌ها ثبت شد"
    );

    const destLine = transferJe?.lines.find((l) => l.accountCode === "1012");
    const srcLine = transferJe?.lines.find((l) => l.accountCode === "1011");
    assert(
      destLine?.debit === 1000000 && srcLine?.credit === 1000000,
      "انتقال داخلی تأیید شد: بدهکار (۱۰۱۲ صندوق) و بستانکار (۱۰۱۱ بانک سامان)"
    );

    // Verify ZERO expense and ZERO revenue accounts are involved
    const hasPnlImpact = transferJe?.lines.some(
      (l) => l.accountCode.startsWith("4") || l.accountCode.startsWith("5")
    );
    assert(!hasPnlImpact, "انتقال داخلی خالص دارایی است و هیچ اثری روی درآمد یا هزینه ثبت نکرد");

    // Prevent transfer to same account
    let sameAccountBlocked = false;
    try {
      await FinancialOperationsService.createOperation(
        {
          type: "transfer",
          category: "internal_transfer",
          amount: 500000,
          description: "انتقال نامعتبر به خود",
          financialAccountId: samanBank._id.toString(),
          toFinancialAccountId: samanBank._id.toString(),
          party: { name: "تست" },
        },
        dummyUserId
      );
    } catch (err: any) {
      sameAccountBlocked = err instanceof AppError && err.code === "SAME_ACCOUNT_TRANSFER";
    }
    assert(sameAccountBlocked, "انتقال وجه با حساب مبدأ و مقصد یکسان مسدود شد");

    // ------------------------------------------------------------------------
    // TEST 6: Partner Capital, Loan, Repayment & Withdrawal
    // ------------------------------------------------------------------------
    console.log("\n▶ تست ۶: عملیات سرمایه، وام، بازپرداخت و برداشت شرکا");

    // a) Partner Capital Injection (آورده سرمایه شریک)
    const capitalOp = await FinancialOperationsService.createOperation(
      {
        type: "partner_capital",
        category: "capital_injection",
        categoryTitle: "آورده نقدی شریک",
        amount: 25000000,
        description: "افزایش سرمایه نقدی توسط شریک الف",
        financialAccountId: samanBank._id.toString(),
        party: {
          name: "شریک الف",
          role: "partner",
          refUserId: dummyPartnerId,
        },
        idempotencyKey: `CAP_${Date.now()}`,
      },
      dummyUserId
    );

    const capJe = await JournalEntry.findById(capitalOp.journalEntryId);
    const capBank = capJe?.lines.find((l) => l.accountCode === "1011");
    const capEquity = capJe?.lines.find((l) => l.accountCode === "3010");
    assert(
      capBank?.debit === 25000000 && capEquity?.credit === 25000000,
      "آورده سرمایه شریک در حساب سرمایه سهامداران ۳۰۱۰ ثبت شد و درآمد تلقی نشد"
    );

    // b) Partner Loan (وام به مجموعه)
    const loanOp = await FinancialOperationsService.createOperation(
      {
        type: "partner_loan",
        category: "partner_loan",
        categoryTitle: "وام قرض‌الحسنه شریک",
        amount: 15000000,
        description: "واریز وام کوتاه‌مدت شریک جهت توسعه زیرساخت",
        financialAccountId: samanBank._id.toString(),
        party: {
          name: "شریک ب",
          role: "partner",
          refUserId: dummyPartnerId,
        },
        idempotencyKey: `LOAN_${Date.now()}`,
      },
      dummyUserId
    );

    const loanJe = await JournalEntry.findById(loanOp.journalEntryId);
    const loanBank = loanJe?.lines.find((l) => l.accountCode === "1011");
    const loanLiability = loanJe?.lines.find((l) => l.accountCode === "2060");
    assert(
      loanBank?.debit === 15000000 && loanLiability?.credit === 15000000,
      "وام شریک به عنوان بدهی جاری (۲۰۶۰) ثبت شد و از سرمایه و درآمد کاملاً تفکیک گردید"
    );

    // c) Partner Loan Repayment (بازپرداخت وام)
    const repayOp = await FinancialOperationsService.createOperation(
      {
        type: "partner_loan_repayment",
        category: "loan_repayment",
        categoryTitle: "تسویه اصل وام شریک",
        amount: 5000000,
        description: "بازپرداخت قسط اول وام شریک ب",
        financialAccountId: samanBank._id.toString(),
        party: {
          name: "شریک ب",
          role: "partner",
          refUserId: dummyPartnerId,
        },
        idempotencyKey: `REPAY_${Date.now()}`,
      },
      dummyUserId
    );

    const repayJe = await JournalEntry.findById(repayOp.journalEntryId);
    const repayDebt = repayJe?.lines.find((l) => l.accountCode === "2060");
    const repayBank = repayJe?.lines.find((l) => l.accountCode === "1011");
    assert(
      repayDebt?.debit === 5000000 && repayBank?.credit === 5000000,
      "بازپرداخت وام شریک ثبت شد: بدهکار (۲۰۶۰ تسویه بدهی) و بستانکار (۱۰۱۱ خروج از بانک)"
    );

    // d) Partner Withdrawal (برداشت جاری/سود شریک)
    const withdrawalOp = await FinancialOperationsService.createOperation(
      {
        type: "partner_withdrawal",
        category: "partner_withdrawal",
        categoryTitle: "برداشت سود علی‌الحساب",
        amount: 3000000,
        description: "برداشت علی‌الحساب شریک الف از محل سهم سود",
        financialAccountId: samanBank._id.toString(),
        party: {
          name: "شریک الف",
          role: "partner",
          refUserId: dummyPartnerId,
        },
        idempotencyKey: `WTH_${Date.now()}`,
      },
      dummyUserId
    );

    const wthJe = await JournalEntry.findById(withdrawalOp.journalEntryId);
    const wthDebit = wthJe?.lines.find((l) => l.accountCode === "3030");
    const wthBank = wthJe?.lines.find((l) => l.accountCode === "1011");
    assert(
      wthDebit?.debit === 3000000 && wthBank?.credit === 3000000,
      "برداشت شریک در حساب ۳۰۳۰ (برداشت و جاری شرکا) منعکس شد و به عنوان هزینه محسوب نشد"
    );

    // ------------------------------------------------------------------------
    // TEST 7: Real-Time Balance Verification via Ledger Aggregation
    // ------------------------------------------------------------------------
    console.log("\n▶ تست ۷: اعتبارسنجی مانده لحظه‌ای و گردش دفاتر حسابداری");
    const accountsOverview = await FinancialOperationsService.getFinancialAccounts();
    const samanUpdated = accountsOverview.find((a) => a._id.toString() === samanBank._id.toString());
    assert(!!samanUpdated, "حساب سامان در فهرست حساب‌ها موجود است");
    assert(samanUpdated!.currentBalance > 0, `مانده حساب بر اساس اسناد قطعی استخراج شد: ${samanUpdated!.currentBalance.toLocaleString("fa-IR")} تومان`);

    const cashUpdated = accountsOverview.find((a) => a._id.toString() === cashRegister._id.toString());
    assert(
      cashUpdated!.currentBalance === 3000000, // 2,000,000 opening + 1,000,000 transfer in
      `مانده صندوق تنخواه دقیقاً برابر با موجودی اولیه + انتقال ورودی شد (۳،۰۰۰،۰۰۰ تومان)`
    );

    // ------------------------------------------------------------------------
    // TEST 8: Receivables and Payables Overview
    // ------------------------------------------------------------------------
    console.log("\n▶ تست ۸: گزارش جامع مطالبات، بدهی‌ها و تعهدات پلتفرم");
    const summary = await FinancialOperationsService.getReceivablesAndPayablesSummary();
    assert(summary.payables.partnerLoans.amount === 10000000, "مانده وام پرداخت‌نشده به شریک برابر ۱۰،۰۰۰،۰۰۰ تومان (۱۵ میلیون - ۵ میلیون بازپرداخت) است");
    assert(summary.partnerSummary.capitalRegistered.amount >= 25000000, "سرمایه ثبت‌شده شرکا شامل آورده‌های جدید است");
    assert(summary.partnerSummary.withdrawals.amount >= 3000000, "برداشت شرکا به درستی در گزارش منعکس گردید");

    // ------------------------------------------------------------------------
    // TEST 9: Non-destructive Cancellation & Mirror Reversal
    // ------------------------------------------------------------------------
    console.log("\n▶ تست ۹: ابطال عملیات مالی بدون حذف فیزیکی از طریق صدور سند معکوس");
    const cancelResult = await FinancialOperationsService.cancelOperation(
      serverExpense._id.toString(),
      "خطای کاربری در ثبت فاکتور تکراری سرور",
      dummyUserId
    );

    assert(cancelResult.operation.status === "cancelled", "وضعیت عملیات به cancelled تغییر کرد");
    assert(cancelResult.reversal.original.status === "reversed", "سند حسابداری اولیه به وضعیت reversed تغییر یافت");
    assert(
      cancelResult.reversal.reversal.entryNumber > 0,
      `سند معکوس قرینه با شماره جدید #${cancelResult.reversal.reversal.entryNumber} صادر شد`
    );

    // ------------------------------------------------------------------------
    // TEST 10: Security & RBAC Checks on Financial Operations
    // ------------------------------------------------------------------------
    console.log("\n▶ تست ۱۰: کنترل دسترسی لایه بک‌اند روی عملیات مالی (شریک، حسابدار، مدیر)");

    // a) Partner: Must be blocked from mutate requests
    let partnerMutateBlocked = false;
    const mockPartnerReq: any = { user: { roleSlugs: ["partner"] } };
    requireAccountingMutate(mockPartnerReq, {} as any, (err?: any) => {
      partnerMutateBlocked = err instanceof AppError && err.statusCode === 403;
    });
    assert(partnerMutateBlocked, "درخواست ثبت یا ویرایش عملیات مالی توسط شریک مؤسسه با خطای 403 مسدود شد");

    // b) Accountant: Can mutate, but CANNOT cancel operations (requires super-admin)
    let accountantCancelBlocked = false;
    const mockAccountantReq: any = { user: { roleSlugs: ["accountant"] } };
    requireAccountingAdmin(mockAccountantReq, {} as any, (err?: any) => {
      accountantCancelBlocked = err instanceof AppError && err.statusCode === 403;
    });
    assert(accountantCancelBlocked, "ابطال عملیات مالی منحصراً در صلاحیت سوپرادمین است و برای حسابدار با ۴۰۳ مسدود شد");

    // Clean up test data
    await FinancialAccount.deleteMany({ title: { $regex: "تستی" } });
    await FinancialOperation.deleteMany({});
    await JournalEntry.deleteMany({
      $or: [
        { description: { $regex: "تستی" } },
        { "lines.accountCode": { $in: ["2060", "3030", "5040", "5060", "4090"] } },
      ],
    });

    console.log(`\n========================================================`);
    console.log(`🎉 تمامی آزمون‌های جامع فاز سوم با موفقیت ۱۰۰٪ سپری شدند!`);
    console.log(`   تعداد آزمون‌های موفق: ${passedTests}`);
    console.log(`   تعداد شکست: ${failedTests}`);
    console.log(`========================================================\n`);
  } catch (error) {
    console.error("❌ خطا در اجرای آزمون‌ها:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

runTests();
