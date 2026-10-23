import { Request, Response, NextFunction } from "express";
import { ApiLoggerService } from "../services/api-logger.service.js";
import { AuditService } from "../services/audit.service.js";

// Extend Express Request interface with requestId and custom metadata
declare global {
  namespace Express {
    interface Request {
      requestId?: string;
      startTime?: [number, number];
    }
  }
}

/**
 * Generate a clean, unique, collision-resistant tracking Request ID
 * Format: REQ-YYYYMMDD-XXXXX
 */
export function generateRequestId(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomPart = Math.random().toString(36).substring(2, 7).toUpperCase();
  const timePart = Date.now().toString(36).slice(-3).toUpperCase();
  return `REQ-${dateStr}-${randomPart}${timePart}`;
}

export const requestLoggerMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // 1. Resolve or generate Request ID
  let requestId = req.headers["x-request-id"] as string;
  if (!requestId || typeof requestId !== "string" || !/^[\w-]{4,64}$/.test(requestId)) {
    requestId = generateRequestId();
  }

  req.requestId = requestId;
  req.startTime = process.hrtime();

  // Set X-Request-Id header in response so client can trace it
  res.setHeader("X-Request-Id", requestId);

  // 2. Capture response completion
  res.on("finish", () => {
    // Skip recording raw static asset requests to avoid noise
    if (req.path.startsWith("/uploads/") && res.statusCode < 400) {
      return;
    }

    const diff = process.hrtime(req.startTime);
    const durationMs = Math.round((diff[0] * 1e9 + diff[1]) / 1e6);

    const clientIp = AuditService.getClientIp(req);
    const userAgent = req.headers["user-agent"] || "";
    const { device, browser, os } = AuditService.parseUserAgent(userAgent, req);

    const statusCode = res.statusCode;
    const isError = statusCode >= 400;
    const is5xx = statusCode >= 500;
    const status = is5xx ? "failure" : isError ? "warning" : "success";

    const user = (req as any).user;
    const userId = user?._id || user?.id;
    const userRole = user?.role;
    const userEmail = user?.email;

    ApiLoggerService.record({
      requestId,
      method: req.method,
      path: req.originalUrl || req.url,
      route: req.route?.path,
      statusCode,
      durationMs,
      status,
      isError,
      is5xx,
      userId,
      userRole,
      userEmail,
      clientIp,
      userAgent,
      device,
      browser,
      os,
      query: req.query,
      body: req.body,
    });
  });

  next();
};
