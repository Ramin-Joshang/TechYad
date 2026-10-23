import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';
import { PlatformLocksService } from '../services/platform-locks.service.js';
import { AppError } from '../errors/AppError.js';

export const maintenanceLockMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const locks = PlatformLocksService.getLocksSync();
  if (!locks.lockMaintenance) {
    return next();
  }

  // Bypass routes: super-admin login, super-admin endpoints, public platform-locks, static uploads
  const path = req.path || '';
  if (
    path.startsWith('/api/super-admin') ||
    path.startsWith('/api/v1/super-admin') ||
    path.includes('/platform-locks') ||
    path.startsWith('/uploads') ||
    path.startsWith('/api/uploads') ||
    path === '/api/auth/login' ||
    path === '/api/v1/auth/login' ||
    path === '/api/auth/me' ||
    path === '/api/v1/auth/me' ||
    path === '/'
  ) {
    return next();
  }

  // Check if client is an authenticated Super Admin
  let token: string | undefined;
  if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded: any = jwt.verify(token, env.JWT_SECRET);
      if (decoded && (decoded.role === 'super-admin' || decoded.roleSlug === 'super-admin')) {
        return next();
      }
    } catch {
      // Token invalid or expired, continue to maintenance block
    }
  }

  return res.status(503).json({
    success: false,
    error: {
      code: 'PLATFORM_MAINTENANCE_MODE',
      message: locks.maintenanceMessage || 'سامانه در حال تعمیرات و ارتقای زیرساخت است.',
      estimatedReturn: locks.maintenanceEstimatedReturn || 'به زودی'
    }
  });
};
