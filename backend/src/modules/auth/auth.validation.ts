import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    firstName: z.string().min(2, 'نام باید حداقل ۲ کاراکتر باشد'),
    lastName: z.string().min(2, 'نام خانوادگی باید حداقل ۲ کاراکتر باشد'),
    email: z.string().email('آدرس ایمیل نامعتبر است').optional().or(z.literal('')),
    mobile: z.string().optional().or(z.literal('')),
    identifier: z.string().optional(),
    password: z.string().min(6, 'رمز عبور باید حداقل ۶ کاراکتر باشد'),
    referralCode: z.string().optional(),
  }).refine((data) => {
    const hasEmail = Boolean(data.email && data.email.trim());
    const hasMobile = Boolean(data.mobile && data.mobile.trim());
    const hasIdent = Boolean(data.identifier && data.identifier.trim());
    return hasEmail || hasMobile || hasIdent;
  }, {
    message: 'وارد کردن ایمیل یا شماره موبایل الزامی است',
    path: ['mobile']
  }).refine((data) => {
    if (data.mobile && data.mobile.trim()) {
      const clean = data.mobile.replace(/[\s\-_]/g, '');
      return /^(\+98|0)?9\d{9}$/.test(clean);
    }
    return true;
  }, {
    message: 'شماره موبایل نامعتبر است. فرمت صحیح: 09123456789',
    path: ['mobile']
  })
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().optional(),
    mobile: z.string().optional(),
    identifier: z.string().optional(),
    password: z.string().min(1, 'Password is required'),
  }).refine((data) => !!(data.email || data.mobile || data.identifier), {
    message: 'ایمیل یا شماره موبایل الزامی است',
    path: ['identifier']
  })
});

export const updateProfileSchema = z.object({
  body: z.object({
    firstName: z.string().min(2).optional(),
    lastName: z.string().min(2).optional(),
    avatar: z.string().optional().nullable(),
    personnelPhoto: z.string().optional().nullable(),
    bio: z.string().max(1000).optional().nullable(),
    specialty: z.string().max(200).optional().nullable(),
  })
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
  })
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1, 'Token is required'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  })
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, 'رمز عبور فعلی الزامی است'),
    newPassword: z.string().min(8, 'رمز عبور جدید باید حداقل ۸ کاراکتر باشد'),
  })
});
