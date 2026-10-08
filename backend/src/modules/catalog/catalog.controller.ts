import { Request, Response } from 'express';
import { CatalogService } from './catalog.service.js';
import { sendSuccess } from '../../common/utils/response.js';

// --- Category ---
export const createCategory = async (req: Request, res: Response) => {
  const result = await CatalogService.createCategory(req.body);
  sendSuccess(res, result, 'دسته‌بندی با موفقیت ایجاد شد', 201);
};

export const getCategories = async (req: Request, res: Response) => {
  const options = {
    tree: req.query.tree === 'true',
    includeInactive: req.query.includeInactive === 'true',
    parentId: req.query.parentId as string | undefined,
  };
  const result = await CatalogService.getCategories(options);
  sendSuccess(res, result, 'فهرست دسته‌بندی‌ها با موفقیت دریافت شد');
};

export const getCategoryTree = async (req: Request, res: Response) => {
  const includeInactive = req.query.includeInactive === 'true';
  const result = await CatalogService.getCategories({ tree: true, includeInactive });
  sendSuccess(res, result, 'درخت دسته‌بندی‌ها با موفقیت دریافت شد');
};

export const toggleCategoryStatus = async (req: Request, res: Response) => {
  const result = await CatalogService.toggleCategoryStatus(req.params.id as string, req.body.isActive);
  sendSuccess(res, result, 'وضعیت دسته‌بندی با موفقیت تغییر کرد');
};

export const reorderCategories = async (req: Request, res: Response) => {
  const items = req.body.items || req.body;
  const result = await CatalogService.reorderCategories(items);
  sendSuccess(res, result, 'ترتیب دسته‌بندی‌ها بروزرسانی شد');
};

export const getCategoryById = async (req: Request, res: Response) => {
  const result = await CatalogService.getCategoryById(req.params.id as string);
  sendSuccess(res, result, 'اطلاعات دسته‌بندی دریافت شد');
};

export const getCategoryBySlug = async (req: Request, res: Response) => {
  const includeInactive = req.query.includeInactive === 'true';
  const result = await CatalogService.getCategoryBySlug(req.params.slug as string, includeInactive);
  sendSuccess(res, result, 'اطلاعات دسته‌بندی دریافت شد');
};

export const getCategoryContent = async (req: Request, res: Response) => {
  const result = await CatalogService.getCategoryContent(req.params.slug as string, req.query);
  sendSuccess(res, result, 'محتوای دسته‌بندی دریافت شد');
};

export const updateCategory = async (req: Request, res: Response) => {
  const result = await CatalogService.updateCategory(req.params.id as string, req.body);
  sendSuccess(res, result, 'دسته‌بندی با موفقیت بروزرسانی شد');
};

export const deleteCategory = async (req: Request, res: Response) => {
  await CatalogService.deleteCategory(req.params.id as string);
  sendSuccess(res, null, 'دسته‌بندی با موفقیت حذف شد');
};

// --- Simple Catalogs (Subject, Field, Level) ---
type CatalogType = 'subject' | 'field' | 'level';

export const createSimpleCatalog = (type: CatalogType) => async (req: Request, res: Response) => {
  const result = await CatalogService.createSimpleCatalog(type, req.body);
  sendSuccess(res, result, `${type} با موفقیت ایجاد شد`, 201);
};

export const getSimpleCatalogs = (type: CatalogType) => async (req: Request, res: Response) => {
  const result = await CatalogService.getSimpleCatalogs(type);
  sendSuccess(res, result, `فهرست ${type}ها دریافت شد`);
};

export const updateSimpleCatalog = (type: CatalogType) => async (req: Request, res: Response) => {
  const result = await CatalogService.updateSimpleCatalog(type, req.params.id as string, req.body);
  sendSuccess(res, result, `${type} با موفقیت بروزرسانی شد`);
};

export const deleteSimpleCatalog = (type: CatalogType) => async (req: Request, res: Response) => {
  await CatalogService.deleteSimpleCatalog(type, req.params.id as string);
  sendSuccess(res, null, `${type} با موفقیت حذف شد`);
};
