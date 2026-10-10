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

    const decoded = jwt.verify(token, env.JWT_SECRET) as { id: string };
    const currentUser = await User.findById(decoded.id).populate<{ role: IRole }>('role');

    if (!currentUser) {
      return next(new AppError('The user belonging to this token does no longer exist.', 401, 'AUTH_USER_NOT_FOUND'));
    }

    req.user = currentUser;
    next();
  } catch (error) {
    next(new AppError('Invalid token or token has expired', 401, 'AUTH_INVALID_TOKEN'));
  }
};

export const authorize = (...permissions: (string | string[])[]) => {
  const flattened = permissions.flat();
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !req.user.role) {
      return next(new AppError('You do not have permission to perform this action', 403, 'AUTH_FORBIDDEN'));
    }

    const userPermissions: string[] = req.user.role.permissions || [];
    const roleSlug = req.user.role.slug;
    
    // Super admin has full administrative authorization
    if (roleSlug === 'super-admin') {
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
      if (roleSlug === 'instructor') {
        return next();
      }
      if (roleSlug === 'admin' && req.user.canTeach) {
        return next();
      }
      return next(new AppError('دسترسی مجاز نمی‌باشد. این حساب کاربری فاقد مجوز تدریس است.', 403, 'AUTH_TEACHING_FORBIDDEN'));
    }

    // Admin role authorization for administrative features
    if (roleSlug === 'admin') {
      // Super admin specific routes check
      if (flattened.includes('super_admin.access')) {
        return next(new AppError('این عملیات تنها در صلاحیت مدیر ارشد (Super Admin) می‌باشد', 403, 'AUTH_SUPER_ADMIN_REQUIRED'));
      }
      return next();
    }

    // If checking instructor permission and user is instructor
    if (roleSlug === 'instructor' && flattened.some(p => p.includes('course') || p.includes('class') || p.includes('instructor'))) {
      return next();
    }

    const hasPermission = flattened.length === 0 || flattened.some(perm => userPermissions.includes(perm));

    if (!hasPermission) {
      return next(new AppError('You do not have permission to perform this action', 403, 'AUTH_FORBIDDEN'));
    }

    next();
  };
};
