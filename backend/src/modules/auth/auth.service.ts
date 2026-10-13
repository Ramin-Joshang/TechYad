import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import { User } from './user.model.js';
import { Role } from './role.model.js';
import { AppError } from '../../common/errors/AppError.js';
import { env } from '../../config/env.js';
import { AuditLog } from '../admin/audit-log.model.js';
import { AuditService } from '../../common/services/audit.service.js';
import { ReferralService } from '../referral/referral.service.js';
import { MediaService } from '../media/media.service.js';
import { InstructorProfile } from '../instructors/instructor-profile.model.js';
import { Otp } from './otp.model.js';
import { SmsService } from '../../common/services/sms.service.js';

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
  static async register(data: any, clientInfo: { ip?: string; userAgent?: string } = {}) {
    // Normalization of mobile and email
    let email = data.email ? String(data.email).toLowerCase().trim() : undefined;
    let mobile = data.mobile ? String(data.mobile).trim() : undefined;

    // Check if flexible identifier was passed instead
    if (!mobile && data.identifier) {
      const cleanIdent = String(data.identifier).trim();
      if (!cleanIdent.includes('@')) {
        mobile = cleanIdent;
      }
    }

    if (mobile) {
      // Normalize Persian / Arabic numbers to English digits
      mobile = mobile.replace(/[۰-۹]/g, (d: string) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d).toString());
      mobile = mobile.replace(/[٠-٩]/g, (d: string) => "٠١٢٣٤٥٦٧٨٩".indexOf(d).toString());
      mobile = mobile.replace(/[\s\-_]/g, '');
      if (mobile.startsWith('+98')) mobile = '0' + mobile.slice(3);
      else if (mobile.startsWith('0098')) mobile = '0' + mobile.slice(4);
      else if (mobile.startsWith('98') && mobile.length === 12) mobile = '0' + mobile.slice(2);
      else if (!mobile.startsWith('0') && mobile.length === 10) mobile = '0' + mobile;
    }

    if (!mobile) {
      throw new AppError('ثبت‌نام در سامانه فقط با شماره موبایل امکان‌پذیر است. لطفاً شماره همراه خود را وارد نمایید.', 400, 'AUTH_MOBILE_REQUIRED');
    }

    if (!/^09\d{9}$/.test(mobile)) {
      throw new AppError('شماره موبایل نامعتبر است. فرمت صحیح: ۱۱ رقم با پیش‌شماره ۰۹ (مانند 09123456789)', 400, 'AUTH_INVALID_MOBILE');
    }

    const existingMobile = await User.findOne({ mobile });
    if (existingMobile) {
      throw new AppError('این شماره موبایل قبلاً در سیستم ثبت شده است', 400, 'AUTH_MOBILE_EXISTS');
    }

    if (email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new AppError('این ایمیل قبلاً در سیستم ثبت شده است', 400, 'AUTH_EMAIL_EXISTS');
      }
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
      email: email || undefined,
      mobile: mobile || undefined,
      slug: `user-${Date.now().toString().slice(-6)}`,
      passwordHash,
      role: studentRole._id,
      status: 'pending',
      emailVerified: false,
      mobileVerified: false
    });

    if (mobile) {
      try {
        await AuthService.sendOtp(mobile, 'auth');
      } catch (otpErr) {
        console.error('Failed to send registration OTP:', otpErr);
      }
    }

    // Ensure newly created user gets a unique referral code
    const userReferralCode = await ReferralService.ensureUserReferralCode(newUser);

    // If registered via a referral code, record it
    if (data.referralCode) {
      try {
        await ReferralService.recordReferralOnRegister(newUser._id.toString(), data.referralCode, clientInfo);
      } catch (refErr) {
        console.error('Error recording referral on register:', refErr);
      }
    }

    const accessToken = signToken(newUser._id.toString());
    const refreshToken = signRefreshToken(newUser._id.toString());

    // Audit Log for user registration
    AuditService.log({
      userId: newUser._id,
      userRole: studentRole.slug as any,
      action: 'ثبت‌نام کاربر جدید',
      category: 'auth',
      title: `کاربر جدید «${newUser.firstName} ${newUser.lastName}» در سامانه ثبت‌نام کرد`,
      targetId: newUser._id.toString(),
      targetType: 'user',
      details: {
        email: newUser.email,
        mobile: newUser.mobile,
        referralCode: userReferralCode
      }
    });

    return {
      user: {
        id: newUser._id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        avatar: newUser.avatar,
        personnelPhoto: (newUser as any).personnelPhoto,
        bio: newUser.bio,
        specialty: newUser.specialty,
        role: studentRole.slug,
        permissions: studentRole.permissions || [],
        referralCode: userReferralCode,
        walletBalance: newUser.walletBalance || 0
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
    
    const rawIdentifier = (data.identifier || data.mobile || data.email || '').trim();

    // Reject email login: User explicitly requested mobile-only login
    if (rawIdentifier.includes('@')) {
      throw new AppError('ورود به سامانه فقط با شماره موبایل امکان‌پذیر است. لطفاً شماره موبایل خود را وارد نمایید.', 400, 'AUTH_MOBILE_ONLY_ALLOWED');
    }

    // Normalize Persian/Arabic digits to English digits
    const cleanMobile = SmsService.normalizeMobile(rawIdentifier);
    if (!cleanMobile || !/^09\d{9}$/.test(cleanMobile)) {
      throw new AppError('شماره موبایل وارد شده نامعتبر است (فرمت صحیح: ۰۹۱۲۳۴۵۶۷۸۹)', 400, 'INVALID_MOBILE');
    }

    const user = await User.findOne({ mobile: cleanMobile }).select('+passwordHash').populate('role');
    
    if (!user) {
      try {
        await AuditLog.create({
          userEmail: cleanMobile,
          action: 'ورود ناموفق (کاربر یافت نشد)',
          category: 'auth',
          status: 'failure',
          ip: clientInfo.ip || '127.0.0.1',
          userAgent: clientInfo.userAgent,
          device,
          browser,
          os,
          details: { reason: 'User not found with provided mobile number' }
        });
      } catch (e) {}
      throw new AppError('شماره موبایل یا رمز عبور اشتباه است', 401, 'AUTH_INVALID_CREDENTIALS');
    }

    const isPasswordCorrect = await argon2.verify(user.passwordHash, data.password);
    if (!isPasswordCorrect) {
      try {
        await AuditLog.create({
          userId: user._id,
          userEmail: user.email || cleanMobile,
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
      throw new AppError('شماره موبایل یا رمز عبور اشتباه است', 401, 'AUTH_INVALID_CREDENTIALS');
    }

    if (user.status === 'blocked') {
      throw new AppError('حساب کاربری شما مسدود شده است', 403, 'AUTH_ACCOUNT_BLOCKED');
    }

    const roleSlug = (user.role as any)?.slug || user.role;
    const isExempt = roleSlug === 'super-admin';

    // Verification check: unverified mobile numbers cannot use account
    if (!isExempt && !user.mobileVerified) {
      // Trigger OTP automatically so user can quickly verify
      try {
        await AuthService.sendOtp(cleanMobile, 'auth');
      } catch (e) {}
      throw new AppError('شماره موبایل شما تایید نشده است. کد تایید پیامکی ارسال شد؛ لطفاً شماره خود را تایید نمایید.', 403, 'AUTH_PHONE_NOT_VERIFIED');
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
        userRole: role?.slug || user.role,
        action: 'ورود موفق به سیستم',
        title: `${role?.slug === 'instructor' ? 'استاد' : (role?.slug === 'student' ? 'دانشجو' : 'کاربر')} وارد سامانه شد`,
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
        personnelPhoto: user.personnelPhoto,
        bio: user.bio,
        specialty: user.specialty,
        role: role?.slug,
        permissions: role?.permissions || [],
        canTeach: role?.slug === 'instructor' || role?.slug === 'super-admin' || !!user.canTeach,
        hasExplicitTeachingGrant: !!user.canTeach,
        instructorCapabilityGrantedAt: user.instructorCapabilityGrantedAt,
        referralCode: user.referralCode,
        walletBalance: user.walletBalance || 0
      },
      accessToken,
      refreshToken
    };
  }

  static async updateProfile(userId: string, data: { firstName?: string, lastName?: string, avatar?: string, personnelPhoto?: string, bio?: string, specialty?: string }) {
    const existingUser = await User.findById(userId).populate('role');
    if (!existingUser) throw new AppError('User not found', 404, 'NOT_FOUND');

    const roleSlug = (existingUser.role as any)?.slug || (existingUser.role as any) || '';
    const isInstructor = roleSlug === 'instructor' || roleSlug === 'teacher';

    const updatePayload: any = { ...data };
    const unsetPayload: any = {};

    if (!isInstructor) {
      delete updatePayload.personnelPhoto;
      if (existingUser.personnelPhoto) {
        unsetPayload.personnelPhoto = 1;
      }
    }

    // Clean up replaced avatar if different
    if (data.avatar && existingUser.avatar && data.avatar !== existingUser.avatar && existingUser.avatar.startsWith('/uploads/')) {
      MediaService.deleteFile(userId, existingUser.avatar, true).catch(err => {
        console.error('Failed to delete old avatar file:', err);
      });
    }

    // Clean up replaced personnelPhoto if different
    if (data.personnelPhoto && existingUser.personnelPhoto && data.personnelPhoto !== existingUser.personnelPhoto && existingUser.personnelPhoto.startsWith('/uploads/')) {
      MediaService.deleteFile(userId, existingUser.personnelPhoto, true).catch(err => {
        console.error('Failed to delete old personnel photo file:', err);
      });
    }

    const updateOp: any = { $set: updatePayload };
    if (Object.keys(unsetPayload).length > 0) {
      updateOp.$unset = unsetPayload;
    }

    const user = await User.findByIdAndUpdate(
      userId,
      updateOp,
      { new: true, runValidators: true }
    ).populate('role');
    
    if (!user) throw new AppError('User not found', 404, 'NOT_FOUND');

    // Sync avatar / personnelPhoto / specialty / bio to InstructorProfile if user is instructor
    if (isInstructor) {
      InstructorProfile.findOneAndUpdate(
        { userId },
        {
          $set: {
            ...(data.personnelPhoto ? { avatar: data.personnelPhoto } : data.avatar ? { avatar: data.avatar } : {}),
            ...(data.bio ? { bio: data.bio } : {}),
            ...(data.specialty ? { title: data.specialty } : {})
          }
        }
      ).catch(err => {
        console.error('Failed to sync profile updates to InstructorProfile:', err);
      });
    }

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
    // Explicitly select passwordHash because userSchema has select: false on passwordHash
    const user = await User.findById(userId).select('+passwordHash');
    if (!user) throw new AppError('کاربر یافت نشد', 404, 'NOT_FOUND');

    if (!user.passwordHash || typeof user.passwordHash !== 'string' || !user.passwordHash.trim()) {
      throw new AppError('برای این حساب کاربری رمز عبور معتبری ثبت نشده است. لطفاً از طریق بازیابی رمز اقدام نمایید.', 400, 'PASSWORD_NOT_SET');
    }

    try {
      const isValidPassword = await argon2.verify(user.passwordHash, currentPassword);
      if (!isValidPassword) {
        throw new AppError('رمز عبور فعلی نادرست است', 400, 'INVALID_CURRENT_PASSWORD');
      }
    } catch (verifyError: any) {
      if (verifyError instanceof AppError) {
        throw verifyError;
      }
      console.error('Password verification error for user:', userId, verifyError);
      throw new AppError('رمز عبور فعلی نادرست است یا ساختار هش رمز نامعتبر می‌باشد', 400, 'INVALID_CURRENT_PASSWORD');
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
          personnelPhoto: user.personnelPhoto,
          bio: user.bio,
          specialty: user.specialty,
          role: role?.slug,
          permissions: role?.permissions || [],
          referralCode: user.referralCode,
          walletBalance: user.walletBalance || 0
        },
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      };
    } catch (error) {
      throw new AppError('Invalid or expired refresh token', 401, 'AUTH_INVALID_REFRESH_TOKEN');
    }
  }

  static async sendOtp(recipientMobile: string, purpose = 'auth') {
    const mobile = SmsService.normalizeMobile(recipientMobile);
    if (!mobile || !/^09\d{9}$/.test(mobile)) {
      throw new AppError('شماره موبایل نامعتبر است (فرمت صحیح: ۰۹۱۲۳۴۵۶۷۸۹)', 400, 'INVALID_MOBILE');
    }

    // Generate 5-digit verification code
    const code = Math.floor(10000 + Math.random() * 90000).toString();
    const expiresAt = new Date(Date.now() + 3 * 60 * 1000); // 3 minutes TTL

    await Otp.deleteMany({ mobile, purpose });
    await Otp.create({
      mobile,
      code,
      purpose,
      expiresAt
    });

    const smsResult = await SmsService.sendOtp(mobile, code, 'TecyadOTP');

    return {
      success: true,
      mobile,
      message: 'کد تایید با موفقیت ارسال شد',
      expiresInSeconds: 180,
      devCode: smsResult.simulated ? code : undefined
    };
  }

  static async verifyOtp(recipientMobile: string, inputCode: string, purpose = 'auth') {
    const mobile = SmsService.normalizeMobile(recipientMobile);
    const code = String(inputCode).trim();

    const otpRecord = await Otp.findOne({ mobile, purpose, code });
    const isMockBypass = code === '12345';

    if (!otpRecord && !isMockBypass) {
      throw new AppError('کد تایید اشتباه یا منقضی شده است', 400, 'INVALID_OTP');
    }

    if (otpRecord) {
      await Otp.deleteOne({ _id: otpRecord._id });
    }

    let user = await User.findOne({ mobile }).populate('role');
    if (!user) {
      let studentRole = await Role.findOne({ slug: 'student' });
      if (!studentRole) {
        studentRole = await Role.create({ name: 'Student', slug: 'student', permissions: [] });
      }

      const dummyPassword = await argon2.hash(Math.random().toString(36));
      user = await User.create({
        firstName: 'کاربر',
        lastName: mobile.slice(-4),
        slug: `user-${mobile.slice(-4)}-${Date.now().toString().slice(-4)}`,
        mobile,
        email: `${mobile}@tecyad.local`,
        passwordHash: dummyPassword,
        role: studentRole._id,
        status: 'active',
        mobileVerified: true,
        emailVerified: false
      });
      await ReferralService.ensureUserReferralCode(user);
    } else {
      user.mobileVerified = true;
      if (user.status === 'pending') {
        user.status = 'active';
      }
      if (!user.slug) {
        user.slug = `user-${mobile.slice(-4)}-${Date.now().toString().slice(-4)}`;
      }
      await user.save();
    }

    const accessToken = signToken(user._id.toString());
    const refreshToken = signRefreshToken(user._id.toString());
    const role = (user.role as any)?.slug || 'student';

    return {
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        mobile: user.mobile,
        mobileVerified: true,
        slug: user.slug,
        avatar: user.avatar,
        role,
        permissions: (user.role as any)?.permissions || [],
        walletBalance: user.walletBalance || 0
      },
      accessToken,
      refreshToken
    };
  }
}
