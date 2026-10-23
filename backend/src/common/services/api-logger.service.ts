import { Types } from "mongoose";
import { ApiRequestLog, IApiRequestLog } from "../../modules/admin/api-request-log.model.js";
import { sanitizePayload } from "../utils/sensitive-sanitizer.js";

export interface RecordApiLogParams {
  requestId: string;
  method: string;
  path: string;
  route?: string;
  statusCode: number;
  durationMs: number;
  status: "success" | "failure" | "warning";
  isError: boolean;
  is5xx: boolean;
  userId?: any;
  userRole?: string;
  userEmail?: string;
  clientIp: string;
  userAgent?: string;
  device?: string;
  browser?: string;
  os?: string;
  query?: any;
  body?: any;
  responseSnippet?: string;
  error?: {
    code: string;
    message: string;
    name?: string;
    stack?: string;
    fieldErrors?: Record<string, string>;
    isOperational?: boolean;
  };
}

export class ApiLoggerService {
  /**
   * Asynchronously record an API request in a non-blocking background task
   */
  static record(params: RecordApiLogParams): void {
    setImmediate(async () => {
      try {
        const sanitizedQuery = sanitizePayload(params.query);
        const sanitizedBody = sanitizePayload(params.body);

        let sanitizedError = params.error;
        if (sanitizedError) {
          sanitizedError = {
            ...sanitizedError,
            fieldErrors: sanitizePayload(sanitizedError.fieldErrors),
          };
        }

        await ApiRequestLog.findOneAndUpdate(
          { requestId: params.requestId },
          {
            $set: {
              requestId: params.requestId,
              method: params.method.toUpperCase(),
              path: params.path,
              route: params.route,
              statusCode: params.statusCode,
              durationMs: params.durationMs,
              status: params.status,
              isError: params.isError,
              is5xx: params.is5xx,
              userId: params.userId && Types.ObjectId.isValid(params.userId) ? new Types.ObjectId(params.userId) : undefined,
              userRole: params.userRole,
              userEmail: params.userEmail,
              clientIp: params.clientIp,
              userAgent: params.userAgent || "",
              device: params.device || "دسکتاپ",
              browser: params.browser || "مرورگر وب",
              os: params.os || "سیستم‌عامل",
              query: sanitizedQuery,
              body: sanitizedBody,
              responseSnippet: params.responseSnippet,
              error: sanitizedError,
            },
          },
          { upsert: true, new: true }
        );
      } catch (err: any) {
        // Safe console output, never crash the server on log persistence issue
        console.warn(`[ApiLoggerService] Failed to record request ${params.requestId}:`, err.message);
      }
    });
  }

  /**
   * Update or attach technical error information to a request log
   */
  static attachError(requestId: string, errorData: RecordApiLogParams["error"], statusCode: number): void {
    setImmediate(async () => {
      try {
        await ApiRequestLog.updateOne(
          { requestId },
          {
            $set: {
              statusCode,
              status: "failure",
              isError: true,
              is5xx: statusCode >= 500,
              error: errorData,
            },
          }
        );
      } catch (err: any) {
        console.warn(`[ApiLoggerService] Failed to attach error to ${requestId}:`, err.message);
      }
    });
  }

  /**
   * Query API logs with comprehensive filters, search, and pagination
   */
  static async getLogs(query: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    method?: string;
    statusCode?: number;
    startDate?: string;
    endDate?: string;
    userId?: string;
    is5xxOnly?: boolean;
  } = {}) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 25));
    const skip = (page - 1) * limit;

    const filter: any = {};

    if (query.status && query.status !== "all") {
      if (query.status === "success") {
        filter.isError = false;
        filter.statusCode = { $lt: 400 };
      } else if (query.status === "error_4xx") {
        filter.statusCode = { $gte: 400, $lt: 500 };
      } else if (query.status === "error_5xx") {
        filter.is5xx = true;
      } else if (query.status === "all_errors") {
        filter.isError = true;
      }
    }

    if (query.is5xxOnly) {
      filter.is5xx = true;
    }

    if (query.method && query.method !== "all") {
      filter.method = query.method.toUpperCase();
    }

    if (query.statusCode) {
      filter.statusCode = Number(query.statusCode);
    }

    if (query.userId && Types.ObjectId.isValid(query.userId)) {
      filter.userId = new Types.ObjectId(query.userId);
    }

    if (query.startDate || query.endDate) {
      filter.createdAt = {};
      if (query.startDate) filter.createdAt.$gte = new Date(query.startDate);
      if (query.endDate) filter.createdAt.$lte = new Date(query.endDate);
    }

    if (query.search && query.search.trim()) {
      const s = query.search.trim();
      filter.$or = [
        { requestId: { $regex: s, $options: "i" } },
        { path: { $regex: s, $options: "i" } },
        { userEmail: { $regex: s, $options: "i" } },
        { clientIp: { $regex: s, $options: "i" } },
        { "error.message": { $regex: s, $options: "i" } },
        { "error.code": { $regex: s, $options: "i" } },
      ];
    }

    const [logs, total] = await Promise.all([
      ApiRequestLog.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("userId", "firstName lastName email role mobile")
        .lean(),
      ApiRequestLog.countDocuments(filter),
    ]);

    return {
      logs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get analytical overview metrics for errors and traffic
   */
  static async getStats() {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      total24h,
      success24h,
      errors4xx24h,
      errors5xx24h,
      latencyAgg,
      topFailingEndpoints,
      recentCriticalErrors,
    ] = await Promise.all([
      ApiRequestLog.countDocuments({ createdAt: { $gte: last24h } }),
      ApiRequestLog.countDocuments({ createdAt: { $gte: last24h }, statusCode: { $lt: 400 } }),
      ApiRequestLog.countDocuments({ createdAt: { $gte: last24h }, statusCode: { $gte: 400, $lt: 500 } }),
      ApiRequestLog.countDocuments({ createdAt: { $gte: last24h }, statusCode: { $gte: 500 } }),
      ApiRequestLog.aggregate([
        { $match: { createdAt: { $gte: last24h } } },
        {
          $group: {
            _id: null,
            avgDuration: { $avg: "$durationMs" },
            maxDuration: { $max: "$durationMs" },
          },
        },
      ]),
      ApiRequestLog.aggregate([
        { $match: { createdAt: { $gte: last7d }, isError: true } },
        {
          $group: {
            _id: { method: "$method", path: "$path" },
            errorCount: { $sum: 1 },
            latestStatusCode: { $last: "$statusCode" },
            latestError: { $last: "$error.message" },
          },
        },
        { $sort: { errorCount: -1 } },
        { $limit: 7 },
      ]),
      ApiRequestLog.find({ is5xx: true })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("userId", "firstName lastName email")
        .lean(),
    ]);

    const totalErrors24h = errors4xx24h + errors5xx24h;
    const errorRate = total24h > 0 ? Number(((totalErrors24h / total24h) * 100).toFixed(1)) : 0;
    const avgLatency = latencyAgg[0]?.avgDuration ? Math.round(latencyAgg[0].avgDuration) : 0;
    const maxLatency = latencyAgg[0]?.maxDuration ? Math.round(latencyAgg[0].maxDuration) : 0;

    return {
      total24h,
      success24h,
      totalErrors24h,
      errors4xx24h,
      errors5xx24h,
      errorRate,
      avgLatency,
      maxLatency,
      topFailingEndpoints: topFailingEndpoints.map((e: any) => ({
        method: e._id.method,
        path: e._id.path,
        errorCount: e.errorCount,
        latestStatusCode: e.latestStatusCode,
        latestError: e.latestError,
      })),
      recentCriticalErrors,
    };
  }

  /**
   * Fetch single log by Request ID or MongoDB ID with full detail
   */
  static async getLogById(idOrRequestId: string) {
    let query: any = { requestId: idOrRequestId };
    if (Types.ObjectId.isValid(idOrRequestId)) {
      query = { $or: [{ _id: new Types.ObjectId(idOrRequestId) }, { requestId: idOrRequestId }] };
    }

    return ApiRequestLog.findOne(query)
      .populate("userId", "firstName lastName email mobile role avatar")
      .lean();
  }

  /**
   * Delete logs older than X days
   */
  static async cleanup(days: number = 30) {
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const result = await ApiRequestLog.deleteMany({ createdAt: { $lt: cutoff } });
    return { deletedCount: result.deletedCount, cutoff };
  }
}
