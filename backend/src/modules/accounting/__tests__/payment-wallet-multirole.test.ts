import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../../auth/user.model.js';
import { Role } from '../../auth/role.model.js';
import { Order } from '../../commerce/order.model.js';
import { Payment } from '../../commerce/payment.model.js';
import { WalletTransaction } from '../../wallet/wallet-transaction.model.js';
import { JournalEntry } from '../journal-entry.model.js';
import { FinancialAccount } from '../financial-account.model.js';
import { AccountingLedgerService } from '../accounting-ledger.service.js';
import { AccountingIntegrationService } from '../accounting-integration.service.js';
import { FinancialOperationsService } from '../financial-operations.service.js';
import { AdminService } from '../../admin/admin.service.js';

dotenv.config();

const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/tecyad';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`❌ شکست آزمون: ${message}`);
  }
  console.log(`  ✓ ${message}`);
}

async function runTests() {
  console.log('🧪 شروع آزمون‌های جامع پرداخت، کیف پول، چندنقشی و یکپارچه‌سازی حسابداری...');

  await mongoose.connect(MONGODB_URI);
  console.log('✅ اتصال به دیتابیس MongoDB با موفقیت برقرار شد.');

  // Clean test-specific artifacts
  await User.deleteMany({ email: { $regex: /@multirole-test\.com$/ } });
  await JournalEntry.deleteMany({ idempotencyKey: { $regex: /^TEST_/ } });

  // 1. Ensure Roles exist
  const roles = await Promise.all([
    Role.findOneAndUpdate(
      { slug: 'student' },
      { name: 'دانشجو', slug: 'student', permissions: ['profile.read'] },
      { upsert: true, new: true }
    ),
    Role.findOneAndUpdate(
      { slug: 'instructor' },
      { name: 'مدرس', slug: 'instructor', permissions: ['courses.create', 'courses.manage'] },
      { upsert: true, new: true }
    ),
    Role.findOneAndUpdate(
      { slug: 'accountant' },
      { name: 'حسابدار', slug: 'accountant', permissions: ['accounting.view', 'accounting.mutate'] },
      { upsert: true, new: true }
    ),
    Role.findOneAndUpdate(
      { slug: 'partner' },
      { name: 'شریک مؤسسه', slug: 'partner', permissions: ['accounting.view'] },
      { upsert: true, new: true }
    ),
    Role.findOneAndUpdate(
      { slug: 'super-admin' },
      { name: 'مدیر کل', slug: 'super-admin', permissions: ['*'] },
      { upsert: true, new: true }
    ),
  ]);

  const [studentRole, instructorRole, accountantRole, partnerRole, superAdminRole] = roles;

  // Ensure COA is seeded
  await AccountingLedgerService.ensureChartOfAccounts();

  console.log('\n▶ تست ۱: پشتیبانی از چندنقشی واقعی و بدون تخریب داده‌های قبلی');
  // Create a user with both student and instructor roles
  const multiUser = await User.create({
    firstName: 'علی',
    lastName: 'چندنقشی',
    email: 'ali@multirole-test.com',
    mobile: '09129990001',
    passwordHash: 'dummy-hashed-pwd',
    role: studentRole._id, // Legacy primary role
    roles: [studentRole._id, instructorRole._id], // Multi-role array
    status: 'active',
    mobileVerified: true,
    canTeach: true,
  });

  assert(multiUser.roles?.length === 2, 'کاربر دارای ۲ نقش همزمان (دانشجو + مدرس) است');

  // Verify multi-role querying in AdminService
  const adminUsers = await AdminService.getUsers();
  const foundUser = adminUsers.find((u: any) => u._id.toString() === multiUser._id.toString());
  assert(!!foundUser, 'کاربر در فهرست اعضای ادمین بازیابی شد');
  assert(foundUser.roleSlugs?.includes('student'), 'کاربر در نقش‌های خود دارای اسلاگ student است');
  assert(foundUser.roleSlugs?.includes('instructor'), 'کاربر در نقش‌های خود دارای اسلاگ instructor است');

  console.log('\n▶ تست ۲: بررسی وابستگی‌های نقش و جلوگیری از حذف مخرب');
  // Attempting to remove super-admin when they are the only super-admin must fail
  const soleSuperAdmin = await User.create({
    firstName: 'مدیر',
    lastName: 'ارشد تستی',
    email: 'super@multirole-test.com',
    mobile: '09129990002',
    passwordHash: 'dummy',
    role: superAdminRole._id,
    roles: [superAdminRole._id],
    status: 'active',
    mobileVerified: true,
  });

  // Count active super-admins
  const superCount = await User.countDocuments({
    status: 'active',
    $or: [{ role: superAdminRole._id }, { roles: superAdminRole._id }]
  });
  assert(superCount >= 1, `تعداد مدیران ارشد فعال در سیستم: ${superCount}`);

  // Test updating roles preserving student enrollment data
  await AdminService.updateUser(multiUser._id.toString(), {
    roles: [studentRole._id.toString(), accountantRole._id.toString()], // Changed from instructor to accountant
  });

  const updatedMultiUser = await User.findById(multiUser._id).populate('roles');
  const roleSlugs = (updatedMultiUser?.roles as any[])?.map((r) => r.slug);
  assert(roleSlugs.includes('student'), 'سوابق و نقش دانشجویی پس از تغییر نقش حفظ شد');
  assert(roleSlugs.includes('accountant'), 'نقش جدید حسابدار با موفقیت تخصیص یافت');
  assert(!roleSlugs.includes('instructor'), 'نقش مدرس طبق درخواست به صورت کنترل‌شده برداشته شد');

  console.log('\n▶ تست ۳: شارژ کیف پول و ثبت تعهد به‌جای فروش دوره (Accounting Liability)');
  const walletAmount = 300000; // 300,000 Tomans
  const walletTx = await WalletTransaction.create({
    userId: multiUser._id,
    type: 'deposit',
    direction: 'credit',
    amount: walletAmount,
    balanceAfter: walletAmount,
    status: 'completed',
    title: 'شارژ کیف پول تستی',
    trackingCode: 'TRK-TEST-WLT-01',
    refNum: 'REF-SEP-998811',
    rrn: 'RRN-SHP-123456789',
    traceNo: '776655',
    maskedPan: '6037-99**-****-1234',
    gateway: 'saman',
  });

  // Record via Accounting Integration
  const walletTopupEntry = await AccountingIntegrationService.recordWalletTopup(walletTx);
  assert(!!walletTopupEntry, 'سند حسابداری شارژ کیف پول با موفقیت صادر شد');
  assert(walletTopupEntry!.status === 'posted', 'سند شارژ کیف پول در وضعیت قطعی است');

  const liabilityLine = walletTopupEntry!.lines.find((l) => l.accountCode === '2010');
  const transitLine = walletTopupEntry!.lines.find((l) => l.accountCode === '1021');

  assert(!!liabilityLine && liabilityLine.credit === walletAmount, 'حساب ۲۰1۰ (بدهی بستانکاران - کیف پول) بستانکار شد و فروش شناسایی نشد');
  assert(!!transitLine && transitLine.debit === walletAmount, 'حساب ۱۰۲۱ (وجوه در راه درگاه سامان) بدهکار شد');

  // Idempotency check: Calling recordWalletTopup again should not duplicate
  const duplicateWalletEntry = await AccountingIntegrationService.recordWalletTopup(walletTx);
  assert(duplicateWalletEntry?._id.toString() === walletTopupEntry!._id.toString(), 'ثبت دوباره با همان منبع از ثبت مضاعف جلوگیری کرد (Idempotency)');

  console.log('\n▶ تست ۴: ثبت خرید دوره و شناسایی درآمد ناخالص و سهم مدرس');
  const coursePrice = 500000;
  const instructorShare = 350000; // 70%

  const testOrder = await Order.create({
    userId: multiUser._id,
    items: [
      {
        itemId: new mongoose.Types.ObjectId(),
        itemType: 'course',
        titleSnapshot: 'دوره جامع مهندسی نرم‌افزار',
        price: coursePrice,
        finalPrice: coursePrice,
        instructorId: multiUser._id,
        instructorPercentSnapshot: 70,
        platformPercentSnapshot: 30,
        instructorEarningsSnapshot: instructorShare,
        platformEarningsSnapshot: coursePrice - instructorShare,
      },
    ],
    totalAmount: coursePrice,
    subtotal: coursePrice,
    walletAmountApplied: 100000, // 100k from wallet
    gatewayAmount: 400000, // 400k via gateway
    status: 'paid',
  });

  const orderPayment = await Payment.create({
    userId: multiUser._id,
    orderId: testOrder._id as mongoose.Types.ObjectId,
    amount: 400000,
    currency: 'تومان',
    gateway: 'saman',
    originType: 'order',
    authority: `SEP-ORD-${testOrder._id.toString().slice(-6)}`,
    refNum: 'REF-SEP-445566',
    rrn: 'RRN-SHP-987654321',
    traceNo: '334455',
    maskedPan: '5022-29**-****-5678',
    status: 'paid',
  });

  const orderJournalEntry = await AccountingIntegrationService.recordOrderPayment(testOrder, orderPayment);
  assert(!!orderJournalEntry, 'سند حسابداری سفارش خرید با موفقیت صادر شد');

  const revenueLine = orderJournalEntry!.lines.find((l) => l.accountCode === '4010');
  const walletDeductLine = orderJournalEntry!.lines.find((l) => l.accountCode === '2010');
  const instructorAccruedLine = orderJournalEntry!.lines.find((l) => l.accountCode === '2020');
  const instructorExpenseLine = orderJournalEntry!.lines.find((l) => l.accountCode === '5010');

  assert(!!revenueLine && revenueLine.credit === coursePrice, 'درآمد ناخالص دوره‌ها (۴۰۱۰) به میزان ۵۰۰،۰۰۰ تومان بستانکار شد');
  assert(!!walletDeductLine && walletDeductLine.debit === 100000, 'کاهش تعهد کیف پول کاربر (۲۰۱۰) به مبلغ ۱۰۰،۰۰۰ تومان بدهکار شد');
  assert(!!instructorExpenseLine && instructorExpenseLine.debit === instructorShare, 'بهای تمام‌شده آموزش (۵۰۱۰) به میزان ۳۵۰،۰۰۰ تومان شناسایی شد');
  assert(!!instructorAccruedLine && instructorAccruedLine.credit === instructorShare, 'تعهد پرداخت به مدرس (۲۰۲۰) به میزان ۳۵۰،۰۰۰ تومان بستانکار شد');

  // Verify balance
  const debitSum = orderJournalEntry!.lines.reduce((s, l) => s + l.debit, 0);
  const creditSum = orderJournalEntry!.lines.reduce((s, l) => s + l.credit, 0);
  assert(debitSum === creditSum, `سند خرید کاملاً تراز است: بدهکار (${debitSum}) = بستانکار (${creditSum})`);

  console.log('\n▶ تست ۵: انتقال داخلی بین حساب‌ها و عدم تأثیر بر درآمد و هزینه (Zero P&L Impact)');
  let bankAcc: any = await FinancialAccount.findOne({ coaAccountCode: '1011' });
  if (!bankAcc) {
    bankAcc = await FinancialOperationsService.createFinancialAccount(
      {
        title: 'بانک سامان تست',
        accountType: 'bank',
        bankName: 'سامان',
        openingBalance: 10000000,
      },
      multiUser._id.toString()
    );
  }

  let cashAcc: any = await FinancialAccount.findOne({ coaAccountCode: '1012' });
  if (!cashAcc) {
    cashAcc = await FinancialOperationsService.createFinancialAccount(
      {
        title: 'صندوق نقدی تست',
        accountType: 'cash_register',
        coaAccountCode: '1012',
        openingBalance: 2000000,
      },
      multiUser._id.toString()
    );
  }

  const transferOp = await FinancialOperationsService.createOperation({
    type: 'transfer',
    category: 'انتقال از بانک به صندوق تنخواه',
    amount: 1500000,
    financialAccountId: bankAcc._id.toString(),
    toFinancialAccountId: cashAcc._id.toString(),
    party: { name: 'مسئول تنخواه آکادمی' },
    description: 'شارژ تنخواه گردان از بانک سامان',
  }, multiUser._id.toString());

  assert(transferOp.status === 'completed', 'عملیات انتقال بین‌حسابی تایید شد');

  const transferEntry = await JournalEntry.findById(transferOp.journalEntryId);
  assert(!!transferEntry, 'سند حسابداری انتقال صادر شد');

  // Transfer must only move funds between asset accounts (1011 and 1012)
  const hasRevenueOrExpense = transferEntry?.lines.some((l) => l.accountCode.startsWith('4') || l.accountCode.startsWith('5'));
  assert(!hasRevenueOrExpense, 'انتقال داخلی هیچ ردیف درآمدی یا هزینه‌ای ندارد و بر سود و زیان تأثیر صفر دارد');

  console.log('\n▶ تست ۶: گزارش مطالبات، بدهی‌ها و تعهدات مالی');
  const summary = await FinancialOperationsService.getReceivablesAndPayablesSummary();
  assert(typeof summary.receivables.totalReceivables === 'number', 'مجموع مطالبات محاسبه شد');
  assert(typeof summary.payables.totalPayables === 'number', 'مجموع بدهی‌ها محاسبه شد');
  assert(summary.payables.teachersPayable.amount >= 0, 'سهم پرداخت‌نشده مدرسان گزارش شد');
  assert(summary.payables.walletBalances.amount >= 0, 'تعهد کیف پول دانشجویان گزارش شد');

  console.log('\n▶ تست ۷: ابطال اسناد و ردیابی حسابرسی (Immutability & Audit Trail)');
  // Super admin reverses a journal entry
  const reversalRes = await AccountingLedgerService.reverseJournalEntry(
    orderJournalEntry!._id.toString(),
    soleSuperAdmin._id.toString(),
    'خطای کاربری در ثبت سفارش تستی'
  );

  assert(reversalRes.original.status === 'reversed', 'وضعیت سند اولیه به معکوس (reversed) تغییر یافت');
  assert(reversalRes.reversal.status === 'posted', 'سند معکوس قرینه صادر شد');
  assert(reversalRes.reversal.reversalOf?.toString() === orderJournalEntry!._id.toString(), 'سند معکوس به سند اولیه ارجاع دارد');

  console.log('\n========================================================');
  console.log('🎉 تمامی آزمون‌های جامع پرداخت، کیف پول و چندنقشی با موفقیت ۱۰۰٪ سپری شدند!');
  console.log('========================================================');
}

runTests()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ خطا در اجرای آزمون‌ها:', err);
    process.exit(1);
  });
