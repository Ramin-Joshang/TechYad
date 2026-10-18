import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';
import { AppError } from '../errors/AppError.js';
import { User } from '../../modules/auth/user.model.js';
import { IRole } from '../../modules/auth/role.model.js';

export interface AuthRequest extends Request {
  user?: any;
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    let token;
    if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('You are not logged in! Please log in to get access.', 401, 'AUTH_UNAUTHORIZED'));
    }

    const decoded = jwt.verify(token, env.JWT_SECRET) as { id: string; tokenVersion?: number; role?: string };
    const currentUser = await User.findById(decoded.id)
      .populate<{ role: IRole }>('role')
      .populate<{ roles: IRole[] }>('roles');

    if (!currentUser) {
      return next(new AppError('The user belonging to this token does no longer exist.', 401, 'AUTH_USER_NOT_FOUND'));
    }

    if (currentUser.status === 'blocked') {
      return next(new AppError('حساب کاربری شما مسدود شده است.', 403, 'AUTH_ACCOUNT_BLOCKED'));
    }

    // 1. Token revocation check: if tokenVersion was bumped, token is revoked
    if (typeof decoded.tokenVersion === 'number' && decoded.tokenVersion !== (currentUser.tokenVersion || 0)) {
      return next(new AppError('نشست شما منقضی یا باطل شده است. لطفاً مجدداً وارد شوید.', 401, 'AUTH_SESSION_REVOKED'));
    }

    // Multi-role extraction and union of roles
    const userRoles: IRole[] = [
      ...(currentUser.roles && currentUser.roles.length > 0 ? (currentUser.roles as any) : []),
      ...(currentUser.role ? [currentUser.role as any] : [])
    ].filter((r, idx, self) => r && self.findIndex(s => s?._id?.toString() === r?._id?.toString()) === idx);

    const roleSlugs = userRoles.map(r => r.slug).filter(Boolean);
    if (roleSlugs.length === 0) {
      roleSlugs.push('student');
    }

    const allPermissions = Array.from(new Set(userRoles.flatMap(r => r.permissions || [])));

    (currentUser as any).allRoles = userRoles;
    (currentUser as any).roleSlugs = roleSlugs;
    (currentUser as any).allPermissions = allPermissions;
    (currentUser as any).hasRole = (slug: string) => roleSlugs.includes(slug);

    const primaryRoleSlug = roleSlugs.includes('super-admin')
      ? 'super-admin'
      : (roleSlugs.includes('admin')
        ? 'admin'
        : (roleSlugs.includes('partner')
          ? 'partner'
          : (roleSlugs.includes('accountant')
            ? 'accountant'
            : (roleSlugs.includes('instructor') ? 'instructor' : 'student'))));

    // 2. Role-based inactivity timeout enforcement
    const isVerificationOrAuthEndpoint = req.originalUrl?.includes('/api/auth/me') ||
                                         req.originalUrl?.includes('/api/auth/logout') ||
                                         req.originalUrl?.includes('/api/auth/send-otp') ||
                                         req.originalUrl?.includes('/api/auth/verify-otp') ||
                                         req.originalUrl?.includes('/api/auth/refresh-token');

    const lastActive = currentUser.lastActiveAt ? new Date(currentUser.lastActiveAt).getTime() : Date.now();
    const inactiveMs = Date.now() - lastActive;

    if (roleSlugs.includes('super-admin') && inactiveMs > 15 * 60 * 1000 && !isVerificationOrAuthEndpoint) {
      return next(new AppError('نشست شما به دلیل عدم فعالیت بیش از ۱۵ دقیقه منقضی شد. لطفاً دوباره وارد شوید.', 401, 'AUTH_SESSION_INACTIVE_TIMEOUT'));
    }

    if (roleSlugs.includes('admin') && inactiveMs > 30 * 60 * 1000 && !isVerificationOrAuthEndpoint) {
      return next(new AppError('نشست شما به دلیل عدم فعالیت بیش از ۳۰ دقیقه منقضی شد. لطفاً دوباره وارد شوید.', 401, 'AUTH_SESSION_INACTIVE_TIMEOUT'));
    }

    // Update lastActiveAt throttled (every 30 seconds)
    if (inactiveMs > 30000) {
      User.updateOne({ _id: currentUser._id }, { $set: { lastActiveAt: new Date() } }).exec().catch(() => {});
    }

    // 3. Mobile phone verification check
    if (!currentUser.mobileVerified && !isVerificationOrAuthEndpoint) {
      return next(new AppError('شماره موبایل شما تایید نشده است. لطفاً ابتدا شماره همراه خود را از طریق کد پیامکی تایید نمایید.', 403, 'AUTH_PHONE_NOT_VERIFIED'));
    }

    req.user = currentUser;
    next();
  } catch (error: any) {
    if (error instanceof AppError) {
      return next(error);
    }
    next(new AppError('Invalid token or token has expired', 401, 'AUTH_INVALID_TOKEN'));
  }
};

export const authorize = (...permissions: (string | string[])[]) => {
  const flattened = permissions.flat();
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('You do not have permission to perform this action', 403, 'AUTH_FORBIDDEN'));
    }

    const roleSlugs: string[] = req.user.roleSlugs || (req.user.role?.slug ? [req.user.role.slug] : ['student']);
    const userPermissions: string[] = req.user.allPermissions || req.user.role?.permissions || [];
    
    // Super admin has full administrative authorization
    if (roleSlugs.includes('super-admin')) {
      return next();
    }

    const isTeachingPermissionCheck = flattened.some(p => 
      p === 'create_course' || 
      p === 'create_class' || 
      p.includes('create_course') || 
      p.includes('create_class') || 
      p.startsWith('instructor')
    );

    // Teaching capability checks
    if (isTeachingPermissionCheck) {
      if (roleSlugs.includes('instructor') || req.user.canTeach) {
        return next();
      }
      return next(new AppError('دسترسی مجاز نمی‌باشد. این حساب کاربری فاقد مجوز تدریس است.', 403, 'AUTH_TEACHING_FORBIDDEN'));
    }

    // Admin role authorization for administrative features
    if (roleSlugs.includes('admin')) {
      // Super admin specific routes check
      if (flattened.includes('super_admin.access')) {
        return next(new AppError('این عملیات تنها در صلاحیت مدیر ارشد (Super Admin) می‌باشد', 403, 'AUTH_SUPER_ADMIN_REQUIRED'));
      }
      return next();
    }

    // Partner and Accountant authorization for accounting endpoints
    if (flattened.includes('accounting.view')) {
      if (roleSlugs.includes('partner') || roleSlugs.includes('accountant')) {
        return next();
      }
    }

    // If checking instructor permission and user has instructor role
    if (roleSlugs.includes('instructor') && flattened.some(p => p.includes('course') || p.includes('class') || p.includes('instructor'))) {
      return next();
    }

    const hasPermission = flattened.length === 0 || flattened.some(perm => userPermissions.includes(perm));

    if (!hasPermission) {
      return next(new AppError('You do not have permission to perform this action', 403, 'AUTH_FORBIDDEN'));
    }

    next();
  };
};
