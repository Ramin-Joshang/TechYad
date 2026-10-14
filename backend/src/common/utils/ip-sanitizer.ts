import net from 'net';
import { Request, Response, NextFunction } from 'express';

/**
 * Extracts and validates a clean IP address from a raw string,
 * correctly stripping port numbers from IPv4 and bracketed IPv6,
 * while safely preserving standard IPv6 addresses.
 */
export function extractCleanIp(raw?: string | string[]): string {
  if (!raw) return '127.0.0.1';

  let candidate = Array.isArray(raw) ? raw[0] : raw;
  candidate = candidate.trim();

  // If there are multiple proxies in X-Forwarded-For (client, proxy1, proxy2)
  if (candidate.includes(',')) {
    const parts = candidate.split(',').map((p) => p.trim());
    candidate = parts[0] || '127.0.0.1';
  }

  // Check for IPv6 with bracket notation and optional port: [2001:db8::1]:52194 or [2001:db8::1]
  const ipv6BracketMatch = candidate.match(/^\[([a-fA-F0-9:]+)\](?::\d+)?$/);
  if (ipv6BracketMatch) {
    const cleanV6 = ipv6BracketMatch[1];
    if (net.isIPv6(cleanV6)) {
      return cleanV6;
    }
  }

  // Check for standard IPv6 without port
  if (net.isIPv6(candidate)) {
    return candidate;
  }

  // Check for IPv4 with port: 94.101.183.3:52194
  const ipv4PortMatch = candidate.match(/^(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})(?::\d+)?$/);
  if (ipv4PortMatch) {
    const cleanV4 = ipv4PortMatch[1];
    if (net.isIPv4(cleanV4)) {
      return cleanV4;
    }
  }

  // Check for standard IPv4
  if (net.isIPv4(candidate)) {
    return candidate;
  }

  // Fallback to loopback if unrecognized
  return '127.0.0.1';
}

/**
 * Early Express middleware to sanitize X-Forwarded-For and X-Real-IP headers
 * before express-rate-limit and Express internal ip-resolution runs.
 * Solves IIS ARR / reverse proxy ERR_ERL_INVALID_IP_ADDRESS where IP contains client port.
 */
export function sanitizeProxyHeadersMiddleware(req: Request, _res: Response, next: NextFunction) {
  const xForwardedFor = req.headers['x-forwarded-for'];
  if (typeof xForwardedFor === 'string' && xForwardedFor.trim()) {
    const entries = xForwardedFor.split(',').map((item) => extractCleanIp(item.trim()));
    req.headers['x-forwarded-for'] = entries.join(', ');
  }

  const xRealIp = req.headers['x-real-ip'];
  if (typeof xRealIp === 'string' && xRealIp.trim()) {
    req.headers['x-real-ip'] = extractCleanIp(xRealIp.trim());
  }

  next();
}

/**
 * Standard key generator for express-rate-limit that extracts a clean IP
 */
export function rateLimitKeyGenerator(req: Request): string {
  const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
  return extractCleanIp(ip);
}
