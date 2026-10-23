/**
 * Utility for scrubbing and sanitizing sensitive parameters before logging
 * Prevents leaks of passwords, OTP codes, tokens, credit cards, and private secrets.
 */

const SENSITIVE_KEY_PATTERNS = [
  /password/i,
  /passwd/i,
  /secret/i,
  /token/i,
  /apikey/i,
  /api_key/i,
  /authorization/i,
  /cookie/i,
  /otp/i,
  /cvv/i,
  /card_?number/i,
  /private_?key/i,
  /national_?code/i,
];

export function maskString(val: string): string {
  if (!val) return '***';
  if (val.length <= 4) return '***';
  return val.slice(0, 2) + '*'.repeat(Math.min(8, val.length - 4)) + val.slice(-2);
}

export function maskShaba(shaba: string): string {
  if (!shaba || shaba.length < 10) return 'IR********************';
  return `IR${shaba.slice(2, 6)}********${shaba.slice(-4)}`;
}

export function maskCard(card: string): string {
  const clean = card.replace(/\D/g, '');
  if (clean.length === 16) {
    return `${clean.slice(0, 6)}******${clean.slice(12)}`;
  }
  return maskString(card);
}

export function sanitizePayload(data: any, depth = 0): any {
  if (depth > 5) return '[NESTED_OBJECT_TRUNCATED]';
  if (data === null || data === undefined) return data;

  if (typeof data === 'string') {
    // Truncate giant base64 or upload strings
    if (data.startsWith('data:') && data.includes(';base64,')) {
      return `[BASE64_PAYLOAD_SIZE_${data.length}_BYTES]`;
    }
    if (data.length > 2000) {
      return `${data.slice(0, 500)}... [TRUNCATED_${data.length}_CHARS]`;
    }
    return data;
  }

  if (typeof data !== 'object') {
    return data;
  }

  if (Array.isArray(data)) {
    return data.slice(0, 50).map((item) => sanitizePayload(item, depth + 1));
  }

  const sanitized: Record<string, any> = {};

  for (const [key, value] of Object.entries(data)) {
    const isSensitiveKey = SENSITIVE_KEY_PATTERNS.some((pattern) => pattern.test(key));

    if (isSensitiveKey) {
      if (typeof value === 'string') {
        if (/card/i.test(key)) {
          sanitized[key] = maskCard(value);
        } else if (/shaba/i.test(key)) {
          sanitized[key] = maskShaba(value);
        } else {
          sanitized[key] = '[REDACTED_SENSITIVE_DATA]';
        }
      } else {
        sanitized[key] = '[REDACTED_SENSITIVE_DATA]';
      }
      continue;
    }

    sanitized[key] = sanitizePayload(value, depth + 1);
  }

  return sanitized;
}
