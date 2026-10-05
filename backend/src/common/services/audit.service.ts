import { Types } from 'mongoose';
import { AuditLog, IAuditLog } from '../../modules/admin/audit-log.model.js';
import { User } from '../../modules/auth/user.model.js';

export interface LogAuditParams {
  req?: any;
  userId?: any;
  userEmail?: string;
  userPhone?: string;
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
  targetResource?: string;
  details?: any;
  status?: 'success' | 'failure' | 'warning';
  severity?: 'info' | 'warning' | 'critical';
  ip?: string;
  userAgent?: string;
}

export class AuditService {
  /**
   * Helper to parse user agent and client headers into rich device information
   */
  static parseUserAgent(ua: string = '', req?: any) {
    if (!ua && !req) {
      return { 
        device: 'دسکتاپ', 
        browser: 'مرورگر نامشخص', 
        os: 'سیستم‌عامل نامشخص',
        deviceDetails: {
          deviceType: 'دسکتاپ',
          brand: 'نامشخص',
          model: 'دسکتاپ / رایانه',
          osName: 'نامشخص',
          browserName: 'مرورگر وب',
          isDesktop: true
        }
      };
    }
    
    const userAgent = ua || req?.headers?.['user-agent'] || '';
    const chPlatform = req?.headers?.['sec-ch-ua-platform']?.replace(/["']/g, '');
    const chMobile = req?.headers?.['sec-ch-ua-mobile'];
    const chModel = req?.headers?.['sec-ch-ua-model']?.replace(/["']/g, '');
    const chArch = req?.headers?.['sec-ch-ua-arch']?.replace(/["']/g, '');
    const acceptLang = req?.headers?.['accept-language'] || '';

    // 1. Device Type & Brand & Model
    let isBot = /bot|crawler|spider|crawling|curl|wget|postman/i.test(userAgent);
    let isTablet = /tablet|ipad|playbook|silk|(android(?!.*mobile))/i.test(userAgent);
    let isMobile = (!isTablet && (/mobile|iphone|ipod|android|blackberry|iemobile|opera mini/i.test(userAgent) || chMobile === '?1'));
    let isDesktop = !isMobile && !isTablet && !isBot;

    let deviceType = isBot ? 'ربات / خزشگر' : isTablet ? 'تبلت' : isMobile ? 'موبایل' : 'دسکتاپ';
    let brand = 'سایر / عمومی';
    let model = 'رایانه رومیزی / لپ‌تاپ';

    if (/iphone/i.test(userAgent)) {
      brand = 'Apple';
      model = 'iPhone';
      const match = userAgent.match(/iphone\s?os\s?(\d+)[._]?(\d+)?/i);
      if (match) model = `Apple iPhone (iOS ${match[1] || ''})`;
    } else if (/ipad/i.test(userAgent)) {
      brand = 'Apple';
      model = 'iPad Tablet';
    } else if (/macintosh|mac os x/i.test(userAgent)) {
      brand = 'Apple';
      model = 'Mac / MacBook';
    } else if (/samsung/i.test(userAgent) || /sm-[a-z0-9]+/i.test(userAgent)) {
      brand = 'Samsung';
      const smMatch = userAgent.match(/sm-[a-z0-9]+/i);
      model = smMatch ? `Samsung Galaxy (${smMatch[0].toUpperCase()})` : 'Samsung Galaxy';
    } else if (/xiaomi|redmi|poco/i.test(userAgent)) {
      brand = 'Xiaomi';
      model = 'Xiaomi / Redmi';
    } else if (/huawei|honor/i.test(userAgent)) {
      brand = 'Huawei';
      model = 'Huawei';
    } else if (/pixel/i.test(userAgent)) {
      brand = 'Google';
      model = 'Google Pixel';
    } else if (/windows/i.test(userAgent)) {
      brand = 'Microsoft Windows';
      model = 'Windows PC / Laptop';
    }

    if (chModel) {
      model = chModel;
    }

    // 2. OS & Version
    let osName = 'سیستم‌عامل نامشخص';
    let osVersion = '';
    if (/windows nt 10\.0/i.test(userAgent)) {
      osName = 'Windows';
      osVersion = '10 / 11';
    } else if (/windows nt 6\.3/i.test(userAgent)) {
      osName = 'Windows';
      osVersion = '8.1';
    } else if (/windows nt 6\.1/i.test(userAgent)) {
      osName = 'Windows';
      osVersion = '7';
    } else if (/windows/i.test(userAgent)) {
      osName = 'Windows';
      osVersion = 'Legacy';
    } else if (/android/i.test(userAgent)) {
      osName = 'Android';
      const match = userAgent.match(/android\s([0-9.]+)/i);
      if (match) osVersion = match[1];
    } else if (/iphone|ipad|ipod/i.test(userAgent)) {
      osName = 'iOS';
      const match = userAgent.match(/os\s([0-9_]+)/i);
      if (match) osVersion = match[1].replace(/_/g, '.');
    } else if (/macintosh|mac os x/i.test(userAgent)) {
      osName = 'macOS';
      const match = userAgent.match(/mac os x\s([0-9_]+)/i);
      if (match) osVersion = match[1].replace(/_/g, '.');
    } else if (/ubuntu/i.test(userAgent)) {
      osName = 'Ubuntu Linux';
    } else if (/linux/i.test(userAgent)) {
      osName = 'Linux';
    }

    if (chPlatform) {
      osName = chPlatform;
    }

    // 3. Browser & Version & Engine
    let browserName = 'مرورگر وب';
    let browserVersion = '';
    let engine = 'نامشخص';

    if (/edg\/([0-9.]+)/i.test(userAgent)) {
      browserName = 'Microsoft Edge';
      browserVersion = userAgent.match(/edg\/([0-9.]+)/i)?.[1] || '';
      engine = 'Blink';
    } else if (/samsungbrowser\/([0-9.]+)/i.test(userAgent)) {
      browserName = 'Samsung Internet';
      browserVersion = userAgent.match(/samsungbrowser\/([0-9.]+)/i)?.[1] || '';
      engine = 'Blink';
    } else if (/opr\/([0-9.]+)|opera/i.test(userAgent)) {
      browserName = 'Opera';
      browserVersion = userAgent.match(/opr\/([0-9.]+)/i)?.[1] || '';
      engine = 'Blink';
    } else if (/chrome\/([0-9.]+)|crios\/([0-9.]+)/i.test(userAgent)) {
      browserName = 'Google Chrome';
      browserVersion = (userAgent.match(/chrome\/([0-9.]+)/i) || userAgent.match(/crios\/([0-9.]+)/i))?.[1] || '';
      engine = 'Blink';
    } else if (/firefox\/([0-9.]+)|fxios\/([0-9.]+)/i.test(userAgent)) {
      browserName = 'Mozilla Firefox';
      browserVersion = (userAgent.match(/firefox\/([0-9.]+)/i) || userAgent.match(/fxios\/([0-9.]+)/i))?.[1] || '';
      engine = 'Gecko';
    } else if (/version\/([0-9.]+).*safari/i.test(userAgent) || (/safari/i.test(userAgent) && !/chrome/i.test(userAgent))) {
      browserName = 'Apple Safari';
      browserVersion = userAgent.match(/version\/([0-9.]+)/i)?.[1] || '';
      engine = 'WebKit';
    }

    // 4. CPU Architecture
    let cpuArch = 'x86_64 (64-bit)';
    if (/arm64|aarch64/i.test(userAgent) || /apple/i.test(brand) && (osName === 'iOS' || osName === 'macOS')) {
      cpuArch = 'ARM64 (Apple Silicon / ARM)';
    } else if (/armv7|arm/i.test(userAgent)) {
      cpuArch = 'ARM (32-bit)';
    } else if (/wow64|win64|x64|x86_64/i.test(userAgent)) {
      cpuArch = 'x86_64 (64-bit)';
    } else if (/i686|i386|x86/i.test(userAgent)) {
      cpuArch = 'x86 (32-bit)';
    }
    if (chArch) {
      cpuArch = chArch;
    }

    // 5. Geolocation / Region inference from headers
    const cfCountry = req?.headers?.['cf-ipcountry'];
    const xCountry = req?.headers?.['x-country-code'] || req?.headers?.['x-client-country'];
    const detectedLocation = cfCountry ? `کشور: ${cfCountry}` : xCountry ? `کشور: ${xCountry}` : (acceptLang.includes('fa') ? 'ایران (IR)' : 'موقعیت شبکه / کلاینت');

    // Friendly summaries for concise columns
    const cleanOs = osVersion ? `${osName} ${osVersion}` : osName;
    const cleanBrowser = browserVersion ? `${browserName} ${browserVersion.split('.')[0]}` : browserName;
    const cleanDevice = `${deviceType} (${brand})`;

    const deviceDetails = {
      deviceType,
      brand,
      model,
      osName,
      osVersion,
      browserName,
      browserVersion,
      engine,
      cpuArch,
      platform: chPlatform || osName,
      language: acceptLang ? acceptLang.split(',')[0] : 'fa-IR',
      location: detectedLocation,
      isMobile,
      isTablet,
      isDesktop,
      isBot,
      protocol: req?.protocol ? String(req.protocol).toUpperCase() : (req?.secure ? 'HTTPS' : 'HTTP'),
      screenResolution: req?.body?.screenResolution || req?.headers?.['sec-ch-viewport-width'] ? `${req.headers['sec-ch-viewport-width']}px` : undefined
    };

    return {
      device: cleanDevice,
      browser: cleanBrowser,
      os: cleanOs,
      deviceDetails
    };
  }

  /**
   * Extract client IP address accurately with proxy and header support
   */
  static getClientIp(req?: any): string {
    if (!req) return '127.0.0.1';
    const forwarded = req.headers?.['x-forwarded-for'];
    if (typeof forwarded === 'string') {
      return forwarded.split(',')[0].trim();
    }
    const realIp = req.headers?.['x-real-ip'];
    if (typeof realIp === 'string') {
      return realIp.trim();
    }
    return req.socket?.remoteAddress || req.ip || '127.0.0.1';
  }

  /**
   * Log an event across student, instructor, or admin workflows with complete device metadata
   */
  static async log(params: LogAuditParams): Promise<void> {
    try {
      const { req } = params;
      let userId = params.userId || req?.user?._id || req?.user?.id;
      let userEmail = params.userEmail || req?.user?.email;
      let userPhone = params.userPhone || req?.user?.mobile;
      let userName = params.userName;
      let userRole = params.userRole || req?.user?.role;

      // Extract details from req if available
      const ip = params.ip || this.getClientIp(req);
      const userAgent = params.userAgent || req?.headers?.['user-agent'] || '';
      const { device, browser, os, deviceDetails } = this.parseUserAgent(userAgent, req);

      // If user details are still missing, try to resolve from database
      if (userId && (!userEmail || !userName || !userRole || !userPhone)) {
        try {
          const userDoc = await User.findById(userId).select('firstName lastName email mobile role').lean();
          if (userDoc) {
            userEmail = userEmail || userDoc.email;
            userPhone = userPhone || userDoc.mobile;
            userName = userName || `${userDoc.firstName || ''} ${userDoc.lastName || ''}`.trim() || userDoc.email || userDoc.mobile;
            userRole = (userRole || userDoc.role) as any;
          }
        } catch {
          // ignore lookup error to not disrupt operation
        }
      }

      await AuditLog.create({
        userId: userId ? new Types.ObjectId(userId) : undefined,
        userEmail,
        userPhone,
        userName,
        userRole: userRole || 'guest',
        action: params.action,
        title: params.title || params.action,
        category: params.category,
        targetId: params.targetId,
        targetType: params.targetType,
        targetTitle: params.targetTitle,
        targetResource: params.targetResource || params.targetType || params.targetTitle || params.category,
        details: params.details,
        ip,
        userAgent,
        device,
        browser,
        os,
        deviceDetails: {
          ...deviceDetails,
          clientIp: ip,
          forwardedFor: req?.headers?.['x-forwarded-for'] || undefined
        },
        status: params.status || 'success',
        severity: params.severity || 'info'
      });
    } catch (e: any) {
      console.warn('AuditService log warning:', e.message);
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
        { userPhone: { $regex: s, $options: 'i' } },
        { userName: { $regex: s, $options: 'i' } },
        { targetTitle: { $regex: s, $options: 'i' } },
        { targetResource: { $regex: s, $options: 'i' } },
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
        .populate('userId', 'firstName lastName email mobile role avatar')
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
