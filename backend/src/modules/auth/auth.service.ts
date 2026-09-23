import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import { User } from './user.model.js';
import { Role } from './role.model.js';
import { AppError } from '../../common/errors/AppError.js';
import { env } from '../../config/env.js';
import { AuditLog } from '../admin/audit-log.model.js';

const signToken = (id: string) => {
  return jwt.sign({ id }, env.JWT_SECRET, {
    expiresIn: '15m',
  });
};

const signRefreshToken = (id: string) => {
  return jwt.sign({ id }, env.JWT_REFRESH_SECRET, {
    expiresIn: '30d',
  });
};

export class AuthService {
  static async register(data: any) {
    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      throw new AppError('Email already in use', 400, 'AUTH_EMAIL_EXISTS');
    }

    // Assign 'student' role by default
    let studentRole = await Role.findOne({ slug: 'student' });
    if (!studentRole) {
      studentRole = await Role.create({
        name: 'Student',
        slug: 'student',
        permissions: [],
      });
    }

    const passwordHash = await argon2.hash(data.password);

    const newUser = await User.create({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      passwordHash,
      role: studentRole._id,
      status: 'active',
    });

    const accessToken = signToken(newUser._id.toString());
    const refreshToken = signRefreshToken(newUser._id.toString());

    return {
      user: {
        id: newUser._id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        avatar: newUser.avatar,
        role: studentRole.slug,
        permissions: studentRole.permissions || []
      },
      accessToken,
      refreshToken
    };
  }

  static parseClientInfo(userAgent: string) {
    let browser = 'مرورگر ناشناخته';
    let os = 'سیستم‌عامل ناشناخته';
    let device = 'دسکتاپ';

    const ua = userAgent.toLowerCase();
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
      device = 'موبایل';
    } else if (ua.includes('tablet') || ua.includes('ipad')) {
      device = 'تبلت';
    }

    if (ua.includes('chrome') && !ua.includes('edg')) browser = 'Google Chrome';
    else if (ua.includes('edg')) browser = 'Microsoft Edge';
    else if (ua.includes('firefox')) browser = 'Mozilla Firefox';
    else if (ua.includes('safari') && !ua.includes('chrome')) browser = 'Apple Safari';
    else if (ua.includes('opera') || ua.includes('opr')) browser = 'Opera';

    if (ua.includes('windows')) os = 'Windows';
    else if (ua.includes('macintosh') || ua.includes('mac os')) os = 'macOS';
    else if (ua.includes('linux')) os = 'Linux';
    else if (ua.includes('android')) os = 'Android';
    else if (ua.includes('iphone') || ua.includes('ipad')) os = 'iOS';

    return { browser, os, device };
  }

  static async login(data: any, clientInfo: { ip?: string; userAgent?: string } = {}) {
    const { browser, os, device } = this.parseClientInfo(clientInfo.userAgent || '');
    const user = await User.findOne({ email: data.email }).select('+passwordHash').populate('role');
    
    if (!user) {
      try {
        await AuditLog.create({
          userEmail: data.email,
          action: 'ورود ناموفق (کاربر یافت نشد)',
          category: 'auth',
          status: 'failure',
          ip: clientInfo.ip || '127.0.0.1',
          userAgent: clientInfo.userAgent,
          device,
          browser,
          os,
          details: { reason: 'User not found with provided email' }
        });
      } catch (e) {}
      throw new AppError('Invalid email or password', 401, 'AUTH_INVALID_CREDENTIALS');
    }

    const isPasswordCorrect = await argon2.verify(user.passwordHash, data.password);
    if (!isPasswordCorrect) {
      try {
        await AuditLog.create({
          userId: user._id,
          userEmail: user.email,
          userName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
          action: 'ورود ناموفق (رمز عبور اشتباه)',
          category: 'auth',
          status: 'failure',
          ip: clientInfo.ip || '127.0.0.1',
          userAgent: clientInfo.userAgent,
          device,
          browser,
          os,
          details: { reason: 'Incorrect password' }
        });
      } catch (e) {}
      throw new AppError('Invalid email or password', 401, 'AUTH_INVALID_CREDENTIALS');
    }

    if (user.status !== 'active') {
      try {
        await AuditLog.create({
          userId: user._id,
          userEmail: user.email,
          userName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
          action: 'ورود ناموفق (حساب کاربری غیرفعال یا مسدود)',
          category: 'auth',
          status: 'failure',
          ip: clientInfo.ip || '127.0.0.1',
          userAgent: clientInfo.userAgent,
          device,
          browser,
          os,
          details: { status: user.status }
        });
      } catch (e) {}
      throw new AppError('Your account is not active', 403, 'AUTH_ACCOUNT_INACTIVE');
    }

    const accessToken = signToken(user._id.toString());
    const refreshToken = signRefreshToken(user._id.toString());

    const role = user.role as any;

    // Log successful authentication event
    try {
      await AuditLog.create({
        userId: user._id,
        userEmail: user.email,
        userName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        action: 'ورود موفق به سیستم',
        category: 'auth',
        status: 'success',
        ip: clientInfo.ip || '127.0.0.1',
        userAgent: clientInfo.userAgent,
        device,
        browser,
        os
      });
    } catch (e) {
      // ignore logging error on login
    }

    return {
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        avatar: user.avatar,
        role: role?.slug,
        permissions: role?.permissions || []
      },
      accessToken,
      refreshToken
    };
  }

  static async updateProfile(userId: string, data: { firstName?: string, lastName?: string, avatar?: string }) {
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: data },
      { new: true, runValidators: true }
    ).populate('role');
    
    if (!user) throw new AppError('User not found', 404, 'NOT_FOUND');
    return user;
  }

  static async forgotPassword(email: string) {
    const user = await User.findOne({ email });
    if (!user) {
      // Return success even if user not found for security (prevent email enumeration)
      return { message: 'If this email is registered, a password reset link has been sent.' };
    }
    
    // In a real app, generate a token, save to DB, and send an email
    // For this mockup, we'll return a simulated token
    const mockResetToken = `reset_${user._id.toString()}_${Date.now()}`;
    return { 
      message: 'Password reset link sent to email',
      mockToken: mockResetToken // Only returning for testing purposes
    };
  }

  static async resetPassword(token: string, newPassword: string) {
    // In a real app, verify the token against DB
    if (!token.startsWith('reset_')) {
      throw new AppError('Invalid or expired password reset token', 400, 'INVALID_TOKEN');
    }
    
    const userId = token.split('_')[1];
    const passwordHash = await argon2.hash(newPassword);
    
    const user = await User.findByIdAndUpdate(userId, { passwordHash });
    if (!user) throw new AppError('Invalid token', 400, 'INVALID_TOKEN');
    
    return { message: 'Password has been reset successfully' };
  }

  static async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await User.findById(userId);
    if (!user) throw new AppError('کاربر یافت نشد', 404, 'NOT_FOUND');

    const isValidPassword = await argon2.verify(user.passwordHash, currentPassword);
    if (!isValidPassword) {
      throw new AppError('رمز عبور فعلی نادرست است', 400, 'INVALID_CURRENT_PASSWORD');
    }

    user.passwordHash = await argon2.hash(newPassword);
    await user.save();

    return { message: 'رمز عبور شما با موفقیت تغییر کرد' };
  }

  static async refreshToken(refreshToken: string) {
    if (!refreshToken) {
      throw new AppError('No refresh token provided', 401, 'AUTH_NO_REFRESH_TOKEN');
    }

    try {
      const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as { id: string };
      const user = await User.findById(decoded.id).populate('role');
      
      if (!user || user.status !== 'active') {
        throw new AppError('User no longer exists or is inactive', 401, 'AUTH_USER_NOT_FOUND');
      }

      const newAccessToken = signToken(user._id.toString());
      const newRefreshToken = signRefreshToken(user._id.toString());
      const role = user.role as any;

      return {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          avatar: user.avatar,
          role: role?.slug,
          permissions: role?.permissions || []
        },
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      };
    } catch (error) {
      throw new AppError('Invalid or expired refresh token', 401, 'AUTH_INVALID_REFRESH_TOKEN');
    }
  }
}
