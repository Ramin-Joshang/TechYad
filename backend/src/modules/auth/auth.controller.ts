import { Request, Response } from 'express';
import { AuthService, ROLE_SESSION_CONFIG } from './auth.service.js';
import { sendSuccess } from '../../common/utils/response.js';
import { AuthRequest } from '../../common/middleware/auth.js';

const setAuthCookies = (res: Response, accessToken: string, refreshToken: string, roleSlug = 'student') => {
  const isProduction = process.env.NODE_ENV === 'production';
  const sameSiteMode: 'none' | 'lax' = isProduction ? 'none' : 'lax';
  const sessionConfig = ROLE_SESSION_CONFIG[roleSlug] || ROLE_SESSION_CONFIG['student'];
  
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: sameSiteMode,
    maxAge: sessionConfig.accessTokenMaxAgeMs,
  });
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: sameSiteMode,
    maxAge: sessionConfig.refreshTokenMaxAgeMs,
  });
};

export const register = async (req: Request, res: Response) => {
  const clientInfo = {
    ip: (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip || req.socket.remoteAddress || '127.0.0.1',
    userAgent: req.headers['user-agent'] || 'Unknown'
  };
  const result = await AuthService.register(req.body, clientInfo);
  // Do NOT set auth cookies if verification is required
  if (!(result as any).requireVerification && (result as any).accessToken && (result as any).refreshToken) {
    setAuthCookies(res, (result as any).accessToken, (result as any).refreshToken, result.user.role);
  }
  sendSuccess(res, { 
    user: result.user,
    requireVerification: (result as any).requireVerification,
    message: (result as any).message
  }, (result as any).message || 'User registered successfully', 201);
};

export const login = async (req: Request, res: Response) => {
  const clientInfo = {
    ip: (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip || req.socket.remoteAddress || '127.0.0.1',
    userAgent: req.headers['user-agent'] || 'Unknown'
  };
  const result = await AuthService.login(req.body, clientInfo);
  setAuthCookies(res, result.accessToken, result.refreshToken, (result as any).roleSlug);
  sendSuccess(res, { user: result.user }, 'Login successful');
};

export const logout = async (req: Request, res: Response) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const sameSiteMode: 'none' | 'lax' = isProduction ? 'none' : 'lax';
  
  // Invalidate server-side session token version if user is present
  const authReq = req as AuthRequest;
  if (authReq.user?._id) {
    await AuthService.logout(authReq.user._id.toString());
  }

  const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: sameSiteMode,
  };
  res.clearCookie('accessToken', cookieOptions);
  res.clearCookie('refreshToken', cookieOptions);
  sendSuccess(res, null, 'Logout successful');
};

export const getMe = async (req: AuthRequest, res: Response) => {
  const user = req.user;
  sendSuccess(res, {
    id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    mobile: user.mobile,
    mobileVerified: Boolean(user.mobileVerified),
    slug: user.slug,
    avatar: user.avatar,
    personnelPhoto: user.personnelPhoto,
    bio: user.bio,
    role: user.role?.slug,
    roles: user.roleSlugs || (user.roles?.map((r: any) => r.slug || r) || [user.role?.slug].filter(Boolean)),
    rolesDetail: (user.allRoles || user.roles || []).map((r: any) => ({
      _id: r._id,
      name: r.name,
      slug: r.slug
    })),
    permissions: user.allPermissions || user.role?.permissions || [],
    canTeach: (user.roleSlugs || []).includes('instructor') || (user.roleSlugs || []).includes('super-admin') || !!user.canTeach,
    hasExplicitTeachingGrant: !!user.canTeach,
    instructorCapabilityGrantedAt: user.instructorCapabilityGrantedAt,
    referralCode: user.referralCode,
    walletBalance: user.walletBalance || 0,
    referralEarnings: user.referralEarnings || 0,
    referralCount: user.referralCount || 0,
  }, 'User profile retrieved successfully');
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  const result = await AuthService.updateProfile(req.user._id as string, req.body);
  sendSuccess(res, {
    id: result._id,
    firstName: result.firstName,
    lastName: result.lastName,
    email: result.email,
    avatar: result.avatar,
    personnelPhoto: result.personnelPhoto,
    bio: result.bio,
    specialty: result.specialty
  }, 'Profile updated successfully');
};

export const forgotPassword = async (req: Request, res: Response) => {
  const result = await AuthService.forgotPassword(req.body.email);
  sendSuccess(res, result, 'Forgot password request processed');
};

export const resetPassword = async (req: Request, res: Response) => {
  const result = await AuthService.resetPassword(req.body.token, req.body.newPassword);
  sendSuccess(res, result, 'Password reset successfully');
};

export const changePassword = async (req: AuthRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  const result = await AuthService.changePassword(req.user._id as string, currentPassword, newPassword);
  sendSuccess(res, result, 'رمز عبور با موفقیت تغییر کرد');
};

export const refreshToken = async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken;
  const result = await AuthService.refreshToken(token);
  setAuthCookies(res, result.accessToken, result.refreshToken, (result as any).roleSlug);
  sendSuccess(res, { user: result.user }, 'Token refreshed successfully');
};

export const sendOtp = async (req: Request, res: Response) => {
  const result = await AuthService.sendOtp(req.body.mobile, req.body.purpose || 'auth');
  sendSuccess(res, result, result.message);
};

export const verifyOtp = async (req: Request, res: Response) => {
  const result = await AuthService.verifyOtp(req.body.mobile, req.body.code, req.body.purpose || 'auth');
  setAuthCookies(res, result.accessToken, result.refreshToken, (result as any).roleSlug);
  sendSuccess(res, result, 'ورود با موفقیت انجام شد');
};
