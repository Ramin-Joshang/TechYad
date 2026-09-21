import { Router } from 'express';
import { register, login, logout, getMe, updateProfile, forgotPassword, resetPassword, refreshToken, changePassword } from './auth.controller.js';
import { validate } from '../../common/middleware/validate.js';
import { registerSchema, loginSchema, updateProfileSchema, forgotPasswordSchema, resetPasswordSchema, changePasswordSchema } from './auth.validation.js';
import { authenticate } from '../../common/middleware/auth.js';
import { asyncHandler } from '../../common/utils/asyncHandler.js';

const router = Router();

router.post('/register', validate(registerSchema), asyncHandler(register));
router.post('/login', validate(loginSchema), asyncHandler(login));
router.post('/logout', asyncHandler(logout));
router.post('/refresh', asyncHandler(refreshToken));
router.get('/me', asyncHandler(authenticate), asyncHandler(getMe));
router.patch('/me', asyncHandler(authenticate), validate(updateProfileSchema), asyncHandler(updateProfile));
router.post('/change-password', asyncHandler(authenticate), validate(changePasswordSchema), asyncHandler(changePassword));
router.post('/forgot-password', validate(forgotPasswordSchema), asyncHandler(forgotPassword));
router.post('/reset-password', validate(resetPasswordSchema), asyncHandler(resetPassword));

export default router;
