import { Types } from 'mongoose';
import { AuditLog, IAuditLog } from '../../modules/admin/audit-log.model.js';
import { User } from '../../modules/auth/user.model.js';

export interface LogAuditParams {
  req?: any;
  userId?: any;
  userEmail?: string;
  userName?: string;
  userRole?: 'student' | 'instructor' | 'admin' | 'super-admin' | 'guest';
  action: string;
  title?: string;
  category: 
    | 'auth' | 'course' | 'class' | 'assignment' | 'quiz' 
    | 'wallet' | 'order' | 'referral' | 'support' | 'security' 
    | 'profile' | 'settings' | 'settlement' | 'notification' 
    | 'system' | 'sms' | 'payment' | 'user';
  targetId?: string;
  targetType?: string;
  targetTitle?: string;
  details?: any;
  status?: 'success' | 'failure' | 'warning';
  severity?: 'info' | 'warning' | 'critical';
  ip?: string;
  userAgent?: string;
}

export class AuditService {
  /**
   * Helper to parse user agent
   */
  static parseUserAgent(ua?: string) {
    if (!ua) return { device: 'دسکتاپ', browser: 'مرورگر وب', os: 'سیستم‌عامل' };
    
    let device = 'دسکتاپ';
    if (/tablet|ipad/i.test(ua)) device = 'تبلت';
    else if (/mobile|iphone|android/i.test(ua)) device = 'موبایل';

    let browser = 'مرورگر وب';
    if (/edg/i.test(ua)) browser = 'Microsoft Edge';
    else if (/chrome|crios/i.test(ua)) browser = 'Chrome';
    else if (/firefox|fxios/i.test(ua)) browser = 'Firefox';
    else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = 'Safari';
    else if (/opera|opr/i.test(ua)) browser = 'Opera';

    let os = 'سیستم‌عامل';
    if (/windows/i.test(ua)) os = 'Windows';
    else if (/android/i.test(ua)) os = 'Android';
    else if (/iphone|ipad|ipod/i.test(ua)) os = 'iOS';
    else if (/macintosh|mac os x/i.test(ua)) os = 'macOS';
    else if (/linux/i.test(ua)) os = 'Linux';

    return { device, browser, os };
  }

  /**
   * Extract client IP address
   */
  static getClientIp(req?: any): string {
    if (!req) return '127.0.0.1';
    const forwarded = req.headers?.['x-forwarded-for'];
    if (typeof forwarded === 'string') {
      return forwarded.split(',')[0].trim();
    }
    return req.socket?.remoteAddress || req.ip || '127.0.0.1';
  }

  /**
   * Log an event across student, instructor, or admin workflows
   */
  static async log(params: LogAuditParams): Promise<void> {
    try {
      const { req } = params;
      let userId = params.userId || req?.user?._id || req?.user?.id;
      let userEmail = params.userEmail || req?.user?.email;
      let userName = params.userName;
      let userRole = params.userRole || req?.user?.role;

      // Extract details from req if available
      const ip = params.ip || this.getClientIp(req);
      const userAgent = params.userAgent || req?.headers?.['user-agent'] || '';
      const { device, browser, os } = this.parseUserAgent(userAgent);

      // If user details are still missing, try to resolve from database
      if (userId && (!userEmail || !userName || !userRole)) {
        try {
          const userDoc = await User.findById(userId).select('firstName lastName email role').lean();
          if (userDoc) {
            userEmail = userEmail || userDoc.email;
            userName = userName || `${userDoc.firstName || ''} ${userDoc.lastName || ''}`.trim() || userDoc.email;
            userRole = (userRole || userDoc.role) as any;
          }
        } catch {
          // ignore lookup error to not disrupt operation
        }
      }

      await AuditLog.create({
        userId: userId ? new Types.ObjectId(userId) : undefined,
        userEmail,
        userName,
        userRole: userRole || 'guest',
        action: params.action,
        title: params.title || params.action,
        category: params.category,
        targetId: params.targetId,
        targetType: params.targetType,
        targetTitle: params.targetTitle,
        details: params.details,
        ip,
        userAgent,
        device,
        browser,
        os,
        status: params.status || 'success',
        severity: params.severity || 'info',
      });
    } catch (err) {
      console.error('AuditService log error:', err);
    }
  }

  /**
   * Fetch audit logs with extensive filtering (Role, Category, Status, Severity, Dates, Search)
   */
  static async getLogs(query: any = {}) {
    const filter: any = {};

    if (query.role && query.role !== 'all') {
      filter.userRole = query.role;
    }

    if (query.category && query.category !== 'all') {
      filter.category = query.category;
    }

    if (query.status && query.status !== 'all') {
      filter.status = query.status;
    }

    if (query.severity && query.severity !== 'all') {
      filter.severity = query.severity;
    }

    if (query.userId) {
      filter.userId = query.userId;
    }

    if (query.startDate || query.endDate) {
      filter.createdAt = {};
      if (query.startDate) filter.createdAt.$gte = new Date(query.startDate);
      if (query.endDate) filter.createdAt.$lte = new Date(query.endDate);
    }

    if (query.search) {
      const s = String(query.search).trim();
      filter.$or = [
        { action: { $regex: s, $options: 'i' } },
        { title: { $regex: s, $options: 'i' } },
        { userEmail: { $regex: s, $options: 'i' } },
        { userName: { $regex: s, $options: 'i' } },
        { targetTitle: { $regex: s, $options: 'i' } },
        { ip: { $regex: s, $options: 'i' } },
      ];
    }

    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 25));
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      AuditLog.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'firstName lastName email role avatar')
        .lean(),
      AuditLog.countDocuments(filter),
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
   * Get comprehensive stats regarding student & instructor actions
   */
  static async getStats() {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalLogs,
      logs24h,
      studentActions24h,
      instructorActions24h,
      securityWarnings24h,
      failures24h,
      categoryBreakdown,
      recentImportantLogs
    ] = await Promise.all([
      AuditLog.countDocuments(),
      AuditLog.countDocuments({ createdAt: { $gte: last24h } }),
      AuditLog.countDocuments({ userRole: 'student', createdAt: { $gte: last24h } }),
      AuditLog.countDocuments({ userRole: 'instructor', createdAt: { $gte: last24h } }),
      AuditLog.countDocuments({ severity: { $in: ['warning', 'critical'] }, createdAt: { $gte: last24h } }),
      AuditLog.countDocuments({ status: 'failure', createdAt: { $gte: last24h } }),
      AuditLog.aggregate([
        { $match: { createdAt: { $gte: last7d } } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      AuditLog.find({ severity: { $in: ['warning', 'critical'] } })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean()
    ]);

    return {
      totalLogs,
      logs24h,
      studentActions24h,
      instructorActions24h,
      securityWarnings24h,
      failures24h,
      categoryBreakdown,
      recentImportantLogs
    };
  }
}
