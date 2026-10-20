import mongoose from "mongoose";
import dotenv from "dotenv";
import { Account } from "../account.model.js";
import { JournalEntry } from "../journal-entry.model.js";
import { FiscalYear } from "../fiscal-year.model.js";
import { AccountingLedgerService } from "../accounting-ledger.service.js";
import {
  requireAccountingView,
  requireAccountingMutate,
  requireAccountingAdmin,
} from "../accounting.middleware.js";
import { tomanToRial, rialToToman, formatToman, SYSTEM_CURRENCY, GATEWAY_CURRENCY } from "../../../common/utils/currency.js";
import { AppError } from "../../../common/errors/AppError.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/tekyad";

async function runTests() {
  console.log("\n🧪 شروع اجرای آزمون‌های جامع هسته حسابداری و دفتر کل تک‌یاد (فاز دوم)...\n");

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

  try {
    // ------------------------------------------------------------------------
    // TEST 1: Seeding Chart of Accounts (COA) and Idempotency
    // ------------------------------------------------------------------------
    console.log("\n▶ تست ۱: ایجاد و استقرار تکرارپذیر کدینگ حساب‌ها (Chart of Accounts)");
    const seedResult1 = await AccountingLedgerService.ensureChartOfAccounts();
    assert(seedResult1.total >= 20, `حداقل ۲۰ حساب پایه در کدینگ مستقر شده است (تعداد: ${seedResult1.total})`);

    const walletAccount = await Account.findOne({ code: "2010" });
    assert(!!walletAccount && walletAccount.type === "liability" && walletAccount.nature === "credit",
      "حساب ۲-۰۱۰ (بستانکاران - اعتبار کیف پول کاربران) به عنوان بدهی جاری با ماهیت بستانکار ثبت شده است");

    const grossRevenueAccount = await Account.findOne({ code: "4010" });
    assert(!!grossRevenueAccount && grossRevenueAccount.type === "revenue" && grossRevenueAccount.nature === "credit",
      "حساب ۴-۰۱۰ (درآمد ناخالص دوره‌ها) به عنوان درآمد با ماهیت بستانکار ثبت شده است");

    const discountAccount = await Account.findOne({ code: "4015" });
    assert(!!discountAccount && discountAccount.nature === "debit",
      "حساب ۴-۰۱۵ (تخفیف‌های اعطایی) به عنوان کاهنده درآمد با ماهیت بدهکار مدل شده است");

    const teacherShareAccount = await Account.findOne({ code: "5010" });
    assert(!!teacherShareAccount && teacherShareAccount.type === "expense" && teacherShareAccount.nature === "debit",
      "حساب ۵-۰۱۰ (بهای تمام‌شده آموزش - سهم مدرس) به عنوان هزینه با ماهیت بدهکار ثبت شده است");

    // Idempotency: Re-run seed
    const seedResult2 = await AccountingLedgerService.ensureChartOfAccounts();
    assert(seedResult2.created === 0 && seedResult2.total === seedResult1.total,
      "اجرای مجدد سید حساب‌ها تکرارپذیر است و هیچ حساب تکراری یا تغییر مخرب ایجاد نکرد");

    // ------------------------------------------------------------------------
    // TEST 2: Balanced Journal Entry Creation & Balance Rule
    // ------------------------------------------------------------------------
    console.log("\n▶ تست ۲: ثبت موفق سند متوازن (Double-Entry Balance Verification)");
    const balancedEntry = await AccountingLedgerService.createJournalEntry({
      description: "سند تستی شارژ کیف پول کاربر آزمایشی از درگاه سامان",
      status: "posted",
      sourceType: "wallet_topup",
      sourceId: "TEST_TX_1001",
      idempotencyKey: `TEST_KEY_BALANCED_${Date.now()}`,
      lines: [
        {
          accountCode: "1021", // وجوه در راه درگاه سامان
          description: "دریافت وجه از درگاه سامان شاپرک",
          debit: 500000,
          credit: 0,
        },
        {
          accountCode: "2010", // بستانکاران - اعتبار کیف پول کاربران
          description: "افزایش بستانکاری کیف پول دانشجو",
          debit: 0,
          credit: 500000,
        },
      ],
      userId: dummyUserId,
    });

    assert(balancedEntry.status === "posted", "سند متوازن با موفقیت در وضعیت قطعی (posted) ثبت شد");
    assert(balancedEntry.totalDebit === 500000 && balancedEntry.totalCredit === 500000,
      `توازن دقیق سند تأیید شد: بدهکار (${balancedEntry.totalDebit}) = بستانکار (${balancedEntry.totalCredit})`);
    assert(balancedEntry.entryNumber > 0, `شماره سند ترتیبی معتبر اختصاص داده شد (شماره: ${balancedEntry.entryNumber})`);

    // ------------------------------------------------------------------------
    // TEST 3: Strict Rejection of Unbalanced Journal Entry
    // ------------------------------------------------------------------------
    console.log("\n▶ تست ۳: جلوگیری قطعی از ثبت سند نامتوازن (Reject Unbalanced Entry)");
    let unbalancedCaught = false;
    try {
      await AccountingLedgerService.createJournalEntry({
        description: "سند تستی نامتوازن (باید رد شود)",
        status: "posted",
        sourceType: "manual",
        lines: [
          {
            accountCode: "1021",
            debit: 1000000,
            credit: 0,
          },
          {
            accountCode: "2010",
            debit: 0,
            credit: 800000, // Discrepancy of 200,000!
          },
        ],
        userId: dummyUserId,
      });
    } catch (err: any) {
      unbalancedCaught = true;
      assert(err instanceof AppError && err.code === "UNBALANCED_JOURNAL_ENTRY",
        `سند نامتوازن به درستی توسط هسته حسابداری رد شد: ${err.message}`);
    }
    assert(unbalancedCaught, "هسته حسابداری مانع از ثبت سند غیرمتوازن شد");

    // ------------------------------------------------------------------------
    // TEST 4: Idempotency Key (Prevent Duplicate Financial Entries)
    // ------------------------------------------------------------------------
    console.log("\n▶ تست ۴: سازوکار جلوگیری از ثبت دوباره اسناد (Idempotency Key)");
    const uniqueKey = `UNIQUE_ORDER_EVENT_${Date.now()}`;
    const firstEntry = await AccountingLedgerService.createJournalEntry({
      description: "ثبت سند خرید دوره پایتون",
      status: "posted",
      sourceType: "order",
      sourceId: "ORD-9999",
      idempotencyKey: uniqueKey,
      lines: [
        { accountCode: "1021", debit: 1000000, credit: 0 },
        { accountCode: "4010", debit: 0, credit: 1000000 },
      ],
      userId: dummyUserId,
    });

    const duplicateAttempt = await AccountingLedgerService.createJournalEntry({
      description: "تلاش برای ثبت مجدد همان خرید",
      status: "posted",
      sourceType: "order",
      sourceId: "ORD-9999",
      idempotencyKey: uniqueKey,
      lines: [
        { accountCode: "1021", debit: 1000000, credit: 0 },
        { accountCode: "4010", debit: 0, credit: 1000000 },
      ],
      userId: dummyUserId,
    });

    assert(duplicateAttempt._id.toString() === firstEntry._id.toString(),
      "درخواست تکراری با همان کلید، سند قبلی را بدون ایجاد رکورد مضاعف بازگرداند");

    // ------------------------------------------------------------------------
    // TEST 5: Immutability & Reversal with Mirror Entry (معکوس‌سازی سند)
    // ------------------------------------------------------------------------
    console.log("\n▶ تست ۵: ابطال و اصلاح اسناد قطعی از طریق سند معکوس (Audit Trail & Reversal)");
    const reversalResult = await AccountingLedgerService.reverseJournalEntry(
      firstEntry._id.toString(),
      dummyUserId,
      "انصراف مشتری از دوره و درخواست بازگشت وجه"
    );

    assert(reversalResult.original.status === "reversed",
      "وضعیت سند اولیه به 'reversed' تغییر یافت");
    assert(reversalResult.original.reversedInEntry?.toString() === reversalResult.reversal._id.toString(),
      "سند اولیه به سند معکوس صادرشده لینک شد");

    // Check that reversal entry lines have swapped debit and credit
    const revDebit = reversalResult.reversal.lines.find((l) => l.accountCode === "4010")?.debit;
    const revCredit = reversalResult.reversal.lines.find((l) => l.accountCode === "1021")?.credit;
    assert(revDebit === 1000000 && revCredit === 1000000,
      "سند معکوس ردیف‌های بدهکار و بستانکار را به صورت قرینه و دقیق جابه‌جا کرد");

    // ------------------------------------------------------------------------
    // TEST 6: Role-Based Access Control (RBAC Server-side Middleware)
    // ------------------------------------------------------------------------
    console.log("\n▶ تست ۶: کنترل دسترسی لایه بک‌اند (سوپرادمین، حسابدار، شریک، دانشجو)");

    // Test a) Super-admin: has full access to all three levels
    let superAdminAllowed = 0;
    const mockSuperAdminReq: any = { user: { roleSlugs: ["super-admin"] } };
    requireAccountingView(mockSuperAdminReq, {} as any, (err?: any) => { if (!err) superAdminAllowed++; });
    requireAccountingMutate(mockSuperAdminReq, {} as any, (err?: any) => { if (!err) superAdminAllowed++; });
    requireAccountingAdmin(mockSuperAdminReq, {} as any, (err?: any) => { if (!err) superAdminAllowed++; });
    assert(superAdminAllowed === 3, "سوپرادمین به تمام سطوح (مشاهده، ویرایش و مدیریت کل) دسترسی کامل دارد");

    // Test b) Accountant: has view and mutate, but NOT admin
    let accountantView = false, accountantMutate = false, accountantAdminBlocked = false;
    const mockAccountantReq: any = { user: { roleSlugs: ["accountant"] } };
    requireAccountingView(mockAccountantReq, {} as any, (err?: any) => { accountantView = !err; });
    requireAccountingMutate(mockAccountantReq, {} as any, (err?: any) => { accountantMutate = !err; });
    requireAccountingAdmin(mockAccountantReq, {} as any, (err?: any) => {
      accountantAdminBlocked = err instanceof AppError && err.statusCode === 403;
    });
    assert(accountantView && accountantMutate && accountantAdminBlocked,
      "حسابدار مجوز ثبت و مشاهده دارد اما دسترسی‌های حیاتی مدیریت کدینگ/بستن دوره برای او با ۴۰۳ مسدود شد");

    // Test c) Partner: has View ONLY. Mutate and Admin MUST return 403!
    let partnerView = false, partnerMutateBlocked = false, partnerAdminBlocked = false;
    const mockPartnerReq: any = { user: { roleSlugs: ["partner"] } };
    requireAccountingView(mockPartnerReq, {} as any, (err?: any) => { partnerView = !err; });
    requireAccountingMutate(mockPartnerReq, {} as any, (err?: any) => {
      partnerMutateBlocked = err instanceof AppError && err.statusCode === 403 && err.code === "ACCOUNTING_PARTNER_READONLY";
    });
    requireAccountingAdmin(mockPartnerReq, {} as any, (err?: any) => {
      partnerAdminBlocked = err instanceof AppError && err.statusCode === 403;
    });
    assert(partnerView && partnerMutateBlocked && partnerAdminBlocked,
      "شریک مؤسسه فقط‌خواندنی است و هرگونه درخواست ثبت/تغییر در بک‌اند صراحتاً با خطای 403 ACCOUNTING_PARTNER_READONLY رد شد");

    // Test d) Student / Others: Completely blocked from accounting with 403
    let studentBlocked = false;
    const mockStudentReq: any = { user: { roleSlugs: ["student"] } };
    requireAccountingView(mockStudentReq, {} as any, (err?: any) => {
      studentBlocked = err instanceof AppError && err.statusCode === 403;
    });
    assert(studentBlocked, "دانشجو و سایر کاربران هیچ‌گونه دسترسی به ماژول حسابداری ندارند (۴۰۳)");

    // ------------------------------------------------------------------------
    // TEST 7: Trial Balance (تراز آزمایشی دفاتر)
    // ------------------------------------------------------------------------
    console.log("\n▶ تست ۷: استخراج و اعتبارسنجی تراز آزمایشی دفاتر (Trial Balance)");
    const trialBalance = await AccountingLedgerService.getTrialBalance();
    assert(trialBalance.isBalanced === true,
      `تراز آزمایشی دفاتر کاملاً متوازن است (مجموع بدهکار: ${trialBalance.grandTotals.totalDebit} = مجموع بستانکار: ${trialBalance.grandTotals.totalCredit})`);

    // ------------------------------------------------------------------------
    // TEST 8: Draft Lifecycle & Immutability Rules
    // ------------------------------------------------------------------------
    console.log("\n▶ تست ۸: چرخه حیات اسناد پیش‌نویس و قوانین تغییرناپذیری (Immutability)");
    // a) Create draft entry
    const draftEntry = await AccountingLedgerService.createJournalEntry({
      description: "سند پیش‌نویس تستی اولیه",
      status: "draft",
      sourceType: "manual",
      lines: [
        { accountCode: "1011", debit: 300000, credit: 0 },
        { accountCode: "3010", debit: 0, credit: 300000 },
      ],
      userId: dummyUserId,
    });
    assert(draftEntry.status === "draft", "سند پیش‌نویس با موفقیت ثبت شد");

    // b) Update draft entry
    const updatedDraft = await AccountingLedgerService.updateDraftJournalEntry(
      draftEntry._id.toString(),
      {
        description: "سند پیش‌نویس تستی اصلاح‌شده با مبلغ بیشتر",
        lines: [
          { accountCode: "1011", debit: 450000, credit: 0 },
          { accountCode: "3010", debit: 0, credit: 450000 },
        ],
      },
      dummyUserId
    );
    assert(updatedDraft.totalDebit === 450000 && updatedDraft.description.includes("اصلاح‌شده"),
      "ویرایش سند پیش‌نویس با موفقیت انجام شد و مبالغ مجدداً محاسبه شدند");

    // c) Delete draft entry
    const deleteDraftResult = await AccountingLedgerService.deleteDraftJournalEntry(
      draftEntry._id.toString(),
      dummyUserId
    );
    assert(deleteDraftResult.success === true, "سند پیش‌نویس با موفقیت حذف گردید");

    // d) Attempt to edit or delete a posted entry (MUST BE REJECTED)
    let postedEditBlocked = false;
    try {
      await AccountingLedgerService.updateDraftJournalEntry(
        balancedEntry._id.toString(),
        { description: "تلاش برای ویرایش سند قطعی" },
        dummyUserId
      );
    } catch (err: any) {
      postedEditBlocked = err instanceof AppError && err.code === "CANNOT_EDIT_POSTED_ENTRY";
    }
    assert(postedEditBlocked, "ویرایش سند قطعی در لایه هسته حسابداری مسدود شد (CANNOT_EDIT_POSTED_ENTRY)");

    let postedDeleteBlocked = false;
    try {
      await AccountingLedgerService.deleteDraftJournalEntry(
        balancedEntry._id.toString(),
        dummyUserId
      );
    } catch (err: any) {
      postedDeleteBlocked = err instanceof AppError && err.code === "CANNOT_DELETE_POSTED_ENTRY";
    }
    assert(postedDeleteBlocked, "حذف سند قطعی در لایه هسته حسابداری مسدود شد (CANNOT_DELETE_POSTED_ENTRY)");

    // ------------------------------------------------------------------------
    // TEST 9: Fiscal Year Locking & Closed Period Protection
    // ------------------------------------------------------------------------
    console.log("\n▶ تست ۹: مدیریت دوره مالی و قفل دفاتر بسته‌شده (Fiscal Period Protection)");
    const testFiscalYear = 1399; // Mock past fiscal year
    await FiscalYear.deleteMany({ year: testFiscalYear });
    await AccountingLedgerService.createFiscalYear(
      {
        year: testFiscalYear,
        title: `سال مالی تستی ${testFiscalYear}`,
        startDate: new Date("2020-03-20"),
        endDate: new Date("2021-03-20"),
      },
      dummyUserId
    );

    // Close this test fiscal year
    await AccountingLedgerService.closeFiscalYear(testFiscalYear, dummyUserId, "بستن حساب‌های سال ۱۳۹۹");
    const closedYearDoc = await FiscalYear.findOne({ year: testFiscalYear });
    assert(closedYearDoc?.isClosed === true, "سال مالی آزمایشی با موفقیت بسته و قفل شد");

    // Attempt to create entry in closed year
    let closedYearBlocked = false;
    try {
      await AccountingLedgerService.createJournalEntry({
        description: "سند در سال بسته شده (باید رد شود)",
        status: "draft",
        fiscalYear: testFiscalYear,
        lines: [
          { accountCode: "1011", debit: 100000, credit: 0 },
          { accountCode: "3010", debit: 0, credit: 100000 },
        ],
        userId: dummyUserId,
      });
    } catch (err: any) {
      closedYearBlocked = err instanceof AppError && err.code === "FISCAL_YEAR_CLOSED";
    }
    assert(closedYearBlocked, "ثبت سند در سال مالی بسته‌شده با خطای FISCAL_YEAR_CLOSED رد شد");

    // Clean up test fiscal year
    await FiscalYear.deleteMany({ year: testFiscalYear });

    // ------------------------------------------------------------------------
    // TEST 10: Central Currency Policy & Gateway Border Conversion
    // ------------------------------------------------------------------------
    console.log("\n▶ تست ۱۰: سیاست مرکزی واحد پول و تبدیل مرزی درگاه شاپرک");
    assert(SYSTEM_CURRENCY === "TOMAN", "واحد پول رسمی و پایه‌ای دیتابیس تک‌یاد تومان (TOMAN) است");
    assert(GATEWAY_CURRENCY === "RIAL", "واحد پول ارسال به شاپرک ریال (RIAL) است");

    const sampleToman = 150000;
    const convertedRial = tomanToRial(sampleToman);
    assert(convertedRial === 1500000, "تبدیل تومان به ریال با ضریب ۱۰ با دقت بالا انجام شد (۱۵۰،۰۰۰ تومان = ۱،۵۰۰،۰۰۰ ریال)");

    const reverseToman = rialToToman(convertedRial);
    assert(reverseToman === sampleToman, "تبدیل ریال بازگشتی شاپرک به تومان بدون انحراف انجام شد");

    const formatted = formatToman(sampleToman);
    assert(formatted.includes("تومان"), "قالب‌بندی مبالغ تومان با فرمت رسمی فارسی تأیید شد");

    // Clean up test journal entries
    await JournalEntry.deleteMany({
      sourceType: { $in: ["order", "wallet_topup", "manual"] },
      description: { $regex: "سند تستی" },
    });

    console.log(`\n========================================================`);
    console.log(`🎉 تمامی آزمون‌های جامع فاز دوم با موفقیت ۱۰۰٪ سپری شدند!`);
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
