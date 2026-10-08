import { z } from 'zod';

export const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(2, 'نام دسته‌بندی باید حداقل ۲ کاراکتر باشد'),
    slug: z.string().min(2, 'شناسه انگلیسی (slug) الزامی است'),
    parentId: z.string().optional().nullable(),
    description: z.string().optional(),
    isActive: z.boolean().optional(),
    sortOrder: z.number().optional(),
    icon: z.string().optional(),
    image: z.string().optional(),
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
  })
});

export const createSimpleCatalogSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name is required'),
    slug: z.string().min(2, 'Slug is required'),
    isActive: z.boolean().optional(),
  })
});

export const updateCategorySchema = z.object({
  body: z.object({
    name: z.string().optional(),
    slug: z.string().optional(),
    parentId: z.string().optional().nullable(),
    description: z.string().optional(),
    isActive: z.boolean().optional(),
    sortOrder: z.number().optional(),
    icon: z.string().optional(),
    image: z.string().optional(),
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
  })
});

export const updateSimpleCatalogSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    slug: z.string().optional(),
    isActive: z.boolean().optional(),
  })
});
