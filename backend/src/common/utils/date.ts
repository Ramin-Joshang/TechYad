// Comprehensive Persian/Jalali and Gregorian Date Utility for Backend

export function jalaliToGregorian(jy: number, jm: number, jd: number): [number, number, number] {
  jy = Number(jy);
  jm = Number(jm);
  jd = Number(jd);
  let gy: number;
  if (jy > 979) {
    gy = 1600;
    jy -= 979;
  } else {
    gy = 621;
  }
  const days =
    365 * jy +
    Math.floor(jy / 33) * 8 +
    Math.floor(((jy % 33) + 3) / 4) +
    78 +
    jd +
    (jm < 7 ? (jm - 1) * 31 : (jm - 7) * 30 + 186);
  gy += 400 * Math.floor(days / 146097);
  let remDays = days % 146097;
  if (remDays > 36524) {
    gy += 100 * Math.floor(--remDays / 36524);
    remDays %= 36524;
    if (remDays >= 365) remDays++;
  }
  gy += 4 * Math.floor(remDays / 1461);
  remDays %= 1461;
  if (remDays > 365) {
    gy += Math.floor((remDays - 1) / 365);
    remDays = (remDays - 1) % 365;
  }
  const gDaysInMonth = [
    31,
    (gy % 4 === 0 && gy % 100 !== 0) || gy % 400 === 0 ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ];
  let gm = 0;
  for (gm = 0; gm < 12; gm++) {
    if (remDays < gDaysInMonth[gm]) break;
    remDays -= gDaysInMonth[gm];
  }
  return [gy, gm + 1, remDays + 1];
}

/**
 * Safely parse any date value:
 * - Date object
 * - ISO 8601 string ("2026-10-01T15:30:00Z")
 * - Gregorian date string ("2026-10-01")
 * - Persian/Jalali date string ("1403/07/15", "1403-07-15", or with time "1403/07/15 14:30")
 * - Timestamp in milliseconds or seconds
 */
export function parseDateSafely(val: any): Date | null {
  if (val === null || val === undefined || val === '') return null;
  if (val instanceof Date) return isNaN(val.getTime()) ? null : val;

  // If number or numeric string (timestamp)
  if (typeof val === 'number' || (/^\d+$/.test(String(val).trim()) && String(val).trim().length >= 10)) {
    const num = Number(val);
    const ms = num < 10000000000 ? num * 1000 : num;
    const d = new Date(ms);
    return isNaN(d.getTime()) ? null : d;
  }

  let str = String(val).trim();
  // Normalize Persian and Arabic digits
  str = str
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 1776))
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 1632));

  // Check if it's a Jalali date: e.g. 1403/07/15, 1403-07-15, 1399/12/29
  const jalaliMatch = str.match(/^(1[34]\d{2})[-/](0?[1-9]|1[0-2])[-/](0?[1-9]|[12]\d|3[01])(?:\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/);
  if (jalaliMatch) {
    const jy = parseInt(jalaliMatch[1], 10);
    const jm = parseInt(jalaliMatch[2], 10);
    const jd = parseInt(jalaliMatch[3], 10);
    const hour = jalaliMatch[4] ? parseInt(jalaliMatch[4], 10) : 0;
    const minute = jalaliMatch[5] ? parseInt(jalaliMatch[5], 10) : 0;
    const second = jalaliMatch[6] ? parseInt(jalaliMatch[6], 10) : 0;

    const [gy, gm, gd] = jalaliToGregorian(jy, jm, jd);
    const date = new Date(gy, gm - 1, gd, hour, minute, second);
    return isNaN(date.getTime()) ? null : date;
  }

  // Standard Date parse (ISO or Gregorian)
  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
}
