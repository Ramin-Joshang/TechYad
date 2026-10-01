import { Request, Response, NextFunction } from 'express';

/**
 * Normalizes Persian and Arabic numbers in string inputs to ASCII English digits
 */
export function normalizeDigits(str: string): string {
  return str
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 1776))
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 1632));
}

/**
 * Recursively normalizes all strings inside objects, arrays, etc.
 */
export function deepNormalize(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'string') {
    return normalizeDigits(obj);
  }
  if (Array.isArray(obj)) {
    return obj.map(deepNormalize);
  }
  if (typeof obj === 'object' && !(obj instanceof Date) && !(obj instanceof RegExp)) {
    const copy: any = {};
    for (const key of Object.keys(obj)) {
      copy[key] = deepNormalize(obj[key]);
    }
    return copy;
  }
  return obj;
}

/**
 * Express middleware to automatically normalize Persian/Arabic digits across request body, query, and params
 */
export function persianNormalizeMiddleware(req: Request, res: Response, next: NextFunction) {
  if (req.body && typeof req.body === 'object') {
    try {
      req.body = deepNormalize(req.body);
    } catch {}
  }
  if (req.query && typeof req.query === 'object') {
    try {
      for (const key of Object.keys(req.query)) {
        req.query[key] = deepNormalize(req.query[key]);
      }
    } catch {}
  }
  if (req.params && typeof req.params === 'object') {
    try {
      for (const key of Object.keys(req.params)) {
        req.params[key] = deepNormalize(req.params[key]);
      }
    } catch {}
  }
  next();
}
