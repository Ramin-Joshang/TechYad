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

export type FallbackImageType = 'avatar' | 'course' | 'class' | 'blog' | 'general';

/**
 * Generate a clean, self-contained SVG fallback image
 */
export function getDefaultFallbackImage(type: FallbackImageType = 'general', titleOrName?: string): string {
  const safeText = (titleOrName || '').slice(0, 30).replace(/["<>]/g, '');

  if (type === 'avatar') {
    const initials = safeText
      ? safeText.split(' ').slice(0, 2).map(w => w[0]).join('')
      : 'U';
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
      <defs>
        <linearGradient id="avGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#2563eb" />
          <stop offset="100%" stop-color="#1d4ed8" />
        </linearGradient>
      </defs>
      <rect width="200" height="200" rx="100" fill="url(#avGrad)" />
      ${initials ? `<text x="50%" y="54%" font-family="system-ui, sans-serif" font-weight="bold" font-size="70" fill="#ffffff" text-anchor="middle" dominant-baseline="middle">${initials}</text>` : `
      <circle cx="100" cy="75" r="35" fill="#ffffff" opacity="0.9" />
      <path d="M40 170 C40 130, 65 115, 100 115 C135 115, 160 130, 160 170 Z" fill="#ffffff" opacity="0.9" />
      `}
    </svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }

  if (type === 'course') {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450">
      <defs>
        <linearGradient id="crsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0f172a" />
          <stop offset="50%" stop-color="#1e293b" />
          <stop offset="100%" stop-color="#0f172a" />
        </linearGradient>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#334155" stroke-width="0.5" opacity="0.4" />
        </pattern>
      </defs>
      <rect width="800" height="450" fill="url(#crsGrad)" />
      <rect width="800" height="450" fill="url(#grid)" />
      <circle cx="700" cy="80" r="140" fill="#2563eb" opacity="0.15" filter="blur(30px)" />
      <circle cx="100" cy="380" r="160" fill="#06b6d4" opacity="0.12" filter="blur(40px)" />
      
      <!-- Icon & Tech Badge -->
      <g transform="translate(60, 60)">
        <rect width="56" height="56" rx="16" fill="#2563eb" fill-opacity="0.2" stroke="#3b82f6" stroke-width="1.5" />
        <path d="M18 28 L28 18 L38 28 M28 20 L28 38" stroke="#60a5fa" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
      </g>
      
      <!-- Branding & Title -->
      <text x="60" y="320" font-family="system-ui, sans-serif" font-weight="900" font-size="32" fill="#ffffff">${safeText || 'دوره آموزشی تخصصی'}</text>
      <text x="60" y="365" font-family="system-ui, sans-serif" font-weight="600" font-size="18" fill="#94a3b8">آکادمی آموزش آنلاین تک‌یاد • TechYad</text>
      <rect x="60" y="390" width="120" height="6" rx="3" fill="#2563eb" />
    </svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }

  if (type === 'class') {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450">
      <defs>
        <linearGradient id="clsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#090d16" />
          <stop offset="50%" stop-color="#1e1b4b" />
          <stop offset="100%" stop-color="#0f172a" />
        </linearGradient>
      </defs>
      <rect width="800" height="450" fill="url(#clsGrad)" />
      <circle cx="680" cy="100" r="150" fill="#4f46e5" opacity="0.2" filter="blur(40px)" />
      
      <!-- Live Badge -->
      <g transform="translate(60, 60)">
        <rect width="130" height="36" rx="18" fill="#ef4444" fill-opacity="0.2" stroke="#ef4444" stroke-width="1" />
        <circle cx="24" cy="18" r="5" fill="#ef4444" />
        <text x="40" y="24" font-family="system-ui, sans-serif" font-weight="bold" font-size="14" fill="#fca5a5">کارگاه زنده و آنلاین</text>
      </g>
      
      <!-- Title -->
      <text x="60" y="320" font-family="system-ui, sans-serif" font-weight="900" font-size="32" fill="#ffffff">${safeText || 'کلاس آنلاین و کارگاه تعاملی'}</text>
      <text x="60" y="365" font-family="system-ui, sans-serif" font-weight="600" font-size="18" fill="#a5b4fc">پلتفرم آموزش زنده تک‌یاد • TechYad</text>
      <rect x="60" y="390" width="120" height="6" rx="3" fill="#4f46e5" />
    </svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }

  if (type === 'blog') {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450">
      <defs>
        <linearGradient id="blgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0f172a" />
          <stop offset="100%" stop-color="#1e293b" />
        </linearGradient>
      </defs>
      <rect width="800" height="450" fill="url(#blgGrad)" />
      <text x="60" y="330" font-family="system-ui, sans-serif" font-weight="bold" font-size="30" fill="#ffffff">${safeText || 'مقاله تخصصی تک‌یاد'}</text>
      <text x="60" y="375" font-family="system-ui, sans-serif" font-weight="500" font-size="16" fill="#94a3b8">مجله علمی و تخصصی آموزشگاه آنلاین تک‌یاد</text>
    </svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
    <rect width="600" height="400" fill="#1e293b" />
    <text x="50%" y="50%" font-family="system-ui, sans-serif" font-weight="bold" font-size="20" fill="#94a3b8" text-anchor="middle" dominant-baseline="middle">تک‌یاد | TechYad</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Universal Image URL normalizer.
 * Cleans Windows paths, local domains, strips mock URLs, and provides reliable fallbacks.
 */
export function getImageUrl(
  rawUrl: string | null | undefined,
  fallbackType: FallbackImageType = 'general',
  titleOrName?: string
): string {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return getDefaultFallbackImage(fallbackType, titleOrName);
  }

  let clean = rawUrl.trim();

  // Strip only truly invalid strings
  if (
    clean === '' ||
    clean === 'null' ||
    clean === 'undefined' ||
    clean.startsWith('blob:') ||
    clean.startsWith('file://')
  ) {
    return getDefaultFallbackImage(fallbackType, titleOrName);
  }

  // Windows backslash normalization
  clean = clean.replace(/\\/g, '/');

  // If path contains /uploads/ (even in Windows or internal paths), extract it safely
  if (clean.includes('/uploads/')) {
    clean = '/uploads/' + clean.split('/uploads/')[1];
  } else if (clean.startsWith('uploads/')) {
    clean = '/' + clean;
  }

  // Strip absolute localhost / internal IP prefixes pointing to backend uploads
  clean = clean.replace(/^https?:\/\/(localhost|127\.0\.0\.1|62\.220\.123\.21):5000\//i, '/');
  clean = clean.replace(/^https?:\/\/(localhost|127\.0\.0\.1|62\.220\.123\.21):3000\//i, '/');
  clean = clean.replace(/^https?:\/\/tecyad\.ir\//i, '/');

  if (clean.startsWith('/api/v1/uploads/')) {
    clean = clean.replace('/api/v1/uploads/', '/uploads/');
  }
  if (clean.startsWith('/api/uploads/')) {
    clean = clean.replace('/api/uploads/', '/uploads/');
  }

  // If it's a Windows drive letter path without /uploads/, return fallback
  if (/^[a-zA-Z]:\//.test(clean)) {
    return getDefaultFallbackImage(fallbackType, titleOrName);
  }

  return clean;
}

/**
 * Standard onError handler for <img> elements
 */
export function handleImageError(
  e: React.SyntheticEvent<HTMLImageElement, Event>,
  fallbackType: FallbackImageType = 'general',
  titleOrName?: string
) {
  const target = e.currentTarget;
  target.onerror = null; // Prevent infinite error loops
  const fallback = getDefaultFallbackImage(fallbackType, titleOrName);
  if (target.src !== fallback) {
    target.src = fallback;
  }
}
