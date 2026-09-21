import { Request, Response } from 'express';
import { BlogService } from './blog.service.js';
import { sendSuccess } from '../../common/utils/response.js';
import { AuthRequest } from '../../common/middleware/auth.js';

// --- Public Endpoints ---
export const getArticles = async (req: Request, res: Response) => {
  const result = await BlogService.getPublishedArticles(req.query);
  sendSuccess(res, result, 'مقالات با موفقیت دریافت شدند');
};

export const getArticle = async (req: Request, res: Response) => {
  const result = await BlogService.getArticleBySlug(req.params.slug as string);
  sendSuccess(res, result, 'مقاله با موفقیت دریافت شد');
};

export const getCategories = async (req: Request, res: Response) => {
  const onlyActive = req.query.all !== 'true';
  const result = await BlogService.getCategories(onlyActive);
  sendSuccess(res, result, 'دسته‌بندی‌های وبلاگ دریافت شدند');
};

export const getTags = async (req: Request, res: Response) => {
  const result = await BlogService.getAllTags();
  sendSuccess(res, result, 'تگ‌های وبلاگ دریافت شدند');
};

// --- Category Management (Admin) ---
export const createCategory = async (req: AuthRequest, res: Response) => {
  const result = await BlogService.createCategory(req.body);
  sendSuccess(res, result, 'دسته‌بندی با موفقیت ایجاد شد', 201);
};

export const updateCategory = async (req: AuthRequest, res: Response) => {
  const result = await BlogService.updateCategory(req.params.id as string, req.body);
  sendSuccess(res, result, 'دسته‌بندی با موفقیت به‌روزرسانی شد');
};

export const deleteCategory = async (req: AuthRequest, res: Response) => {
  const result = await BlogService.deleteCategory(req.params.id as string);
  sendSuccess(res, result, 'دسته‌بندی با موفقیت حذف شد');
};

// --- Admin Article Management ---
export const getAdminArticles = async (req: AuthRequest, res: Response) => {
  const result = await BlogService.getAllAdminArticles(req.query);
  sendSuccess(res, result, 'لیست مقالات ادمین با موفقیت دریافت شد');
};

export const createAdminArticle = async (req: AuthRequest, res: Response) => {
  const result = await BlogService.createAdminArticle(req.user._id as string, req.body);
  sendSuccess(res, result, 'مقاله با موفقیت منتشر / ثبت شد', 201);
};

export const updateAdminArticle = async (req: AuthRequest, res: Response) => {
  const result = await BlogService.updateAdminArticle(req.params.id as string, req.body);
  sendSuccess(res, result, 'مقاله با موفقیت ویرایش شد');
};

export const changeArticleStatus = async (req: AuthRequest, res: Response) => {
  const { status, rejectionReason } = req.body;
  const result = await BlogService.changeArticleStatus(req.params.id as string, status, rejectionReason);
  sendSuccess(res, result, 'وضعیت مقاله تغییر یافت');
};

export const deleteArticle = async (req: AuthRequest, res: Response) => {
  const result = await BlogService.deleteArticle(req.params.id as string, req.user);
  sendSuccess(res, result, 'مقاله با موفقیت حذف شد');
};

// --- Instructor Article Management ---
export const getInstructorArticles = async (req: AuthRequest, res: Response) => {
  const result = await BlogService.getInstructorArticles(req.user._id as string);
  sendSuccess(res, result, 'مقالات شما با موفقیت دریافت شد');
};

export const createInstructorArticle = async (req: AuthRequest, res: Response) => {
  const result = await BlogService.createInstructorArticle(req.user._id as string, req.body);
  sendSuccess(res, result, 'مقاله شما با موفقیت ثبت شد و در انتظار بررسی قرار گرفت', 201);
};

export const updateInstructorArticle = async (req: AuthRequest, res: Response) => {
  const result = await BlogService.updateInstructorArticle(req.params.id as string, req.user._id as string, req.body);
  sendSuccess(res, result, 'مقاله شما با موفقیت ویرایش شد');
};
