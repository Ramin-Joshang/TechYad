/**
 * سیاست مرکزی واحد پول و مقادیر مالی آکادمی تک‌یاد
 *
 * قوانین راهبردی معماری:
 * ۱. تمام مبالغ در سطح دیتابیس (سفارش‌ها، کیف پول، دوره‌ها، کلاس‌ها، تسویه‌ها و اسناد حسابداری) منحصراً برحسب «تومان» (TOMAN) ذخیره می‌شوند.
 * ۲. تبدیل واحد به «ریال» (RIAL) صرفاً در مرزهای خروجی سیستم نظیر درگاه پرداخت الکترونیک سامان (شاپرک) صورت می‌پذیرد (مبلغ به ریال = مبلغ به تومان × ۱۰).
 * ۳. هیچ‌گونه تبدیل خودسرانه یا تغییر مقیاس بدون مستندات نباید در محاسبات داخلی و دفاتر حسابداری انجام گیرد.
 */

export const SYSTEM_CURRENCY = 'TOMAN' as const;
export const GATEWAY_CURRENCY = 'RIAL' as const;

export type SystemCurrency = typeof SYSTEM_CURRENCY;
export type GatewayCurrency = typeof GATEWAY_CURRENCY;

/**
 * ضریب تبدیل تومان به ریال در مرز پرداخت بانکی شاپرک
 */
export const TOMAN_TO_RIAL_RATE = 10;

/**
 * تبدیل تومان به ریال جهت ارسال به درگاه‌های بانکی شاپرک (سامان و ...)
 */
export function tomanToRial(amountInToman: number): number {
  if (typeof amountInToman !== 'number' || isNaN(amountInToman)) {
    return 0;
  }
  return Math.round(amountInToman * TOMAN_TO_RIAL_RATE);
}

/**
 * تبدیل ریال بازگشتی از درگاه شاپرک به تومان جهت ثبت در سیستم داخلی
 */
export function rialToToman(amountInRial: number): number {
  if (typeof amountInRial !== 'number' || isNaN(amountInRial)) {
    return 0;
  }
  return Math.floor(amountInRial / TOMAN_TO_RIAL_RATE);
}

/**
 * قالب‌بندی مبلغ به تومان با جداکننده ارقام فارسی
 */
export function formatToman(amount: number): string {
  const num = Math.round(Number(amount) || 0);
  return `${num.toLocaleString('fa-IR')} تومان`;
}

/**
 * قالب‌بندی مبلغ به ریال با جداکننده ارقام فارسی
 */
export function formatRial(amount: number): string {
  const num = Math.round(Number(amount) || 0);
  return `${num.toLocaleString('fa-IR')} ریال`;
}

/**
 * اعتبارسنجی صحت مبلغ عددی (بزرگتر یا مساوی صفر و متناهی)
 */
export function isValidMoneyAmount(amount: any): boolean {
  return typeof amount === 'number' && !isNaN(amount) && isFinite(amount) && amount >= 0;
}
