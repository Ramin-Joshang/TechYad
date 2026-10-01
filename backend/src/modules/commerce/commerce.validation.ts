import { z } from 'zod';

export const addToCartSchema = z.object({
  body: z.object({
    itemType: z.enum(['course', 'class']),
    itemId: z.string().min(1, 'Item ID is required')
  })
});

export const applyCouponSchema = z.object({
  body: z.object({
    code: z.string().min(2, 'Coupon code is required')
  })
});

export const createCouponSchema = z.object({
  body: z.object({
    code: z.string().min(2),
    type: z.enum(['percentage', 'fixed']),
    value: z.coerce.number().min(0),
    minOrderAmount: z.coerce.number().optional(),
    maxDiscount: z.coerce.number().optional(),
    usageLimit: z.coerce.number().optional(),
    perUserLimit: z.coerce.number().optional(),
    applicableProducts: z.array(z.object({
      itemType: z.enum(['course', 'class']),
      itemId: z.string()
    })).optional(),
    startAt: z.string().optional().nullable(),
    endAt: z.string().optional().nullable(),
    isActive: z.boolean().optional(),
  })
});
