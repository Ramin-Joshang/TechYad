import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    firstName: z.string().min(2, 'نام باید حداقل ۲ کاراکتر باشد'),
    lastName: z.string().min(2, 'نام خانوادگی باید حداقل ۲ کاراکتر باشد'),
    mobile: z.string().min(1, 'وارد کردن شماره موبایل الزامی است'),
    email: z.string().email('آدرس ایمیل نامعتبر است').optional().or(z.literal('')),
    identifier: z.string().optional(),
    password: z.string().min(6, 'رمز عبور باید حداقل ۶ کاراکتر باشد'),
    referralCode: z.string().optional(),
  }).refine((data) => {
    const rawMobile = (data.mobile || data.identifier || '').trim();
    if (!rawMobile) return false;
    const clean = rawMobile.replace(/[۰-۹]/g, (d: string) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d).toString()).replace(/[\s\-_]/g, '');
    return /^(\+98|0098|98|0)?9\d{9}$/.test(clean);
  }, {
    message: 'ثبت‌نام فقط با شماره موبایل امکان‌پذیر است. فرمت صحیح: ۰۹۱۲۳۴۵۶۷۸۹',
    path: ['mobile']
  })
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().optional(),
    mobile: z.string().optional(),
    identifier: z.string().optional(),
    password: z.string().min(1, 'وارد کردن رمز عبور الزامی است'),
  }).refine((data) => {
    const ident = (data.identifier || data.mobile || data.email || '').trim();
    return !ident.includes('@');
  }, {
    message: 'ورود به سامانه فقط با شماره موبایل امکان‌پذیر است. لطفاً شماره موبایل خود را وارد نمایید.',
    path: ['mobile']
  }).refine((data) => {
    const ident = (data.identifier || data.mobile || '').trim();
    if (!ident) return false;
    const clean = ident.replace(/[۰-۹]/g, (d: string) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d).toString()).replace(/[\s\-_]/g, '');
    return /^(\+98|0098|98|0)?9\d{9}$/.test(clean);
  }, {
    message: 'شماره موبایل نامعتبر است (فرمت صحیح: ۰۹۱۲۳۴۵۶۷۸۹)',
    path: ['mobile']
  })
});

export const updateProfileSchema = z.object({
  body: z.object({
    firstName: z.string().min(2).optional(),
    lastName: z.string().min(2).optional(),
    avatar: z.string().optional().nullable(),
    personnelPhoto: z.string().optional().nullable(),
    bio: z.string().max(10000).optional().nullable(),
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

export const sendOtpSchema = z.object({
  body: z.object({
    mobile: z.string().min(10, 'شماره موبایل الزامی است'),
    purpose: z.string().optional()
  })
});

export const verifyOtpSchema = z.object({
  body: z.object({
    mobile: z.string().min(10, 'شماره موبایل الزامی است'),
    code: z.string().min(4, 'کد اعتبارسنجی الزامی است'),
    purpose: z.string().optional()
  })
});
