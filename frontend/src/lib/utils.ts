import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Convert Persian and Arabic digits to ASCII English digits
export function toEnDigits(input: string | number | null | undefined): string {
  if (input === null || input === undefined) return '';
  const str = input.toString();
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

  let result = '';
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    const pIdx = persianDigits.indexOf(char);
    if (pIdx !== -1) {
      result += pIdx.toString();
      continue;
    }
    const aIdx = arabicDigits.indexOf(char);
    if (aIdx !== -1) {
      result += aIdx.toString();
      continue;
    }
    result += char;
  }
  return result;
}

// Convert English ASCII digits to Persian digits
export function toFaDigits(input: string | number | null | undefined): string {
  if (input === null || input === undefined) return '';
  const str = input.toString();
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return str.replace(/[0-9]/g, w => persianDigits[+w]);
}

// Robust numeric parser for forms and inputs (supports Persian/Arabic mobile keyboards)
export function parseNumericInput(val: string | number | null | undefined, fallback: number = 0): number {
  if (typeof val === 'number') return isNaN(val) ? fallback : val;
  if (!val) return fallback;
  const en = toEnDigits(val).replace(/,/g, '').replace(/،/g, '').trim();
  const num = Number(en);
  return isNaN(num) ? fallback : num;
}

// Format numbers with commas (e.g. 150000 -> "۱۵۰,۰۰۰")
export function formatCurrency(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined || amount === '') return '۰';
  const num = typeof amount === 'number' ? amount : parseNumericInput(amount);
  return toFaDigits(num.toLocaleString('en-US'));
}

// Iranian Mobile Number Validator (e.g. 0912..., 0935..., +989...)
export function isValidIranianMobile(mobile: string | null | undefined): boolean {
  if (!mobile) return false;
  const clean = toEnDigits(mobile).replace(/\s+/g, '').replace(/-/g, '');
  return /^(\+98|0)?9\d{9}$/.test(clean);
}

// Iranian National Code (کد ملی) Validator with official checksum algorithm
export function isValidIranianNationalCode(code: string | null | undefined): boolean {
  if (!code) return false;
  const clean = toEnDigits(code).trim();
  if (!/^\d{10}$/.test(clean)) return false;
  
  // Check for repeated identical digits like 1111111111
  if (/^(\d)\1{9}$/.test(clean)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(clean.charAt(i), 10) * (10 - i);
  }
  const remainder = sum % 11;
  const checkDigit = parseInt(clean.charAt(9), 10);

  return (remainder < 2 && checkDigit === remainder) || (remainder >= 2 && checkDigit === 11 - remainder);
}
