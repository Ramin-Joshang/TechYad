import { Router } from 'express';
import * as Controller from './blog.controller.js';
import { authenticate, authorize } from '../../common/middleware/auth.js';
import { asyncHandler } from '../../common/utils/asyncHandler.js';

const router = Router();
const requireAuth = asyncHandler(authenticate);

// Middleware helpers
const isAdmin = [
  requireAuth,
  (req: any, res: any, next: any) => {
    const roleSlug = req.user?.role?.slug;
    if (roleSlug === 'super-admin' || roleSlug === 'admin') {
      return next();
    }
    return authorize('blog.manage')(req, res, next);
  }
];

const isInstructor = [
  requireAuth,
  (req: any, res: any, next: any) => {
    const roleSlug = req.user?.role?.slug;
    if (roleSlug === 'instructor' || roleSlug === 'super-admin' || roleSlug === 'admin') {
      return next();
    }
    return res.status(403).json({ success: false, message: 'دسترسی فقط مخصوص اساتید و مدیران است' });
  }
];

// --- Public routes ---
router.get('/articles', asyncHandler(Controller.getArticles));
router.get('/articles/:slug', asyncHandler(Controller.getArticle));
router.get('/categories', asyncHandler(Controller.getCategories));
router.get('/tags', asyncHandler(Controller.getTags));

// --- Instructor routes ---
router.get('/instructor/articles', isInstructor, asyncHandler(Controller.getInstructorArticles));
router.post('/instructor/articles', isInstructor, asyncHandler(Controller.createInstructorArticle));
router.put('/instructor/articles/:id', isInstructor, asyncHandler(Controller.updateInstructorArticle));

// --- Admin & Super-Admin routes ---
router.get('/admin/articles', isAdmin, asyncHandler(Controller.getAdminArticles));
router.post('/admin/articles', isAdmin, asyncHandler(Controller.createAdminArticle));
router.put('/admin/articles/:id', isAdmin, asyncHandler(Controller.updateAdminArticle));
router.patch('/admin/articles/:id/status', isAdmin, asyncHandler(Controller.changeArticleStatus));
router.delete('/admin/articles/:id', isAdmin, asyncHandler(Controller.deleteArticle));

// Admin Category routes
router.post('/admin/categories', isAdmin, asyncHandler(Controller.createCategory));
router.put('/admin/categories/:id', isAdmin, asyncHandler(Controller.updateCategory));
router.delete('/admin/categories/:id', isAdmin, asyncHandler(Controller.deleteCategory));

export default router;
