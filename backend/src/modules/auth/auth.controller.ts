import { Request, Response } from 'express';
import { AuthService } from './auth.service.js';
import { sendSuccess } from '../../common/utils/response.js';
import { AuthRequest } from '../../common/middleware/auth.js';

const setAuthCookies = (res: Response, accessToken: string, refreshToken: string) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const sameSiteMode: 'none' | 'lax' = isProduction ? 'none' : 'lax';
  
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: sameSiteMode,
    maxAge: 15 * 60 * 1000, // 15 mins
  });
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: sameSiteMode,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });
};

export const register = async (req: Request, res: Response) => {
  const result = await AuthService.register(req.body);
  setAuthCookies(res, result.accessToken, result.refreshToken);
  sendSuccess(res, { user: result.user }, 'User registered successfully', 201);
};

export const login = async (req: Request, res: Response) => {
  const result = await AuthService.login(req.body);
  setAuthCookies(res, result.accessToken, result.refreshToken);
  sendSuccess(res, { user: result.user }, 'Login successful');
};

export const logout = async (req: Request, res: Response) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const sameSiteMode: 'none' | 'lax' = isProduction ? 'none' : 'lax';
  
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
    avatar: user.avatar,
    role: user.role?.slug,
    permissions: user.role?.permissions || []
  }, 'User profile retrieved successfully');
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  const result = await AuthService.updateProfile(req.user._id as string, req.body);
  sendSuccess(res, {
    id: result._id,
    firstName: result.firstName,
    lastName: result.lastName,
    email: result.email,
    avatar: result.avatar
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
  setAuthCookies(res, result.accessToken, result.refreshToken);
  sendSuccess(res, { user: result.user }, 'Token refreshed successfully');
};
