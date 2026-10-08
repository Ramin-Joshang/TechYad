import { Router } from 'express';
import * as Controller from './catalog.controller.js';
import { validate } from '../../common/middleware/validate.js';
import { authenticate, authorize } from '../../common/middleware/auth.js';
import { asyncHandler } from '../../common/utils/asyncHandler.js';
import {
  createCategorySchema,
  updateCategorySchema,
  createSimpleCatalogSchema,
  updateSimpleCatalogSchema
} from './catalog.validation.js';

const router = Router();

// Helper for admin routes
const adminAuth = [asyncHandler(authenticate), authorize('catalog.manage', 'categories.manage')];

// --- Categories ---
router.get('/categories', asyncHandler(Controller.getCategories));
router.get('/categories/tree', asyncHandler(Controller.getCategoryTree));
router.get('/categories/slug/:slug', asyncHandler(Controller.getCategoryBySlug));
router.get('/categories/slug/:slug/content', asyncHandler(Controller.getCategoryContent));
router.get('/categories/:id', asyncHandler(Controller.getCategoryById));
router.post('/categories', adminAuth, validate(createCategorySchema), asyncHandler(Controller.createCategory));
router.post('/categories/reorder', adminAuth, asyncHandler(Controller.reorderCategories));
router.patch('/categories/reorder', adminAuth, asyncHandler(Controller.reorderCategories));
router.patch('/categories/:id/status', adminAuth, asyncHandler(Controller.toggleCategoryStatus));
router.patch('/categories/:id', adminAuth, validate(updateCategorySchema), asyncHandler(Controller.updateCategory));
router.put('/categories/:id', adminAuth, validate(updateCategorySchema), asyncHandler(Controller.updateCategory));
router.delete('/categories/:id', adminAuth, asyncHandler(Controller.deleteCategory));

// --- Subjects ---
router.get('/subjects', asyncHandler(Controller.getSimpleCatalogs('subject')));
router.post('/subjects', adminAuth, validate(createSimpleCatalogSchema), asyncHandler(Controller.createSimpleCatalog('subject')));
router.patch('/subjects/:id', adminAuth, validate(updateSimpleCatalogSchema), asyncHandler(Controller.updateSimpleCatalog('subject')));
router.delete('/subjects/:id', adminAuth, asyncHandler(Controller.deleteSimpleCatalog('subject')));

// --- Fields ---
router.get('/fields', asyncHandler(Controller.getSimpleCatalogs('field')));
router.post('/fields', adminAuth, validate(createSimpleCatalogSchema), asyncHandler(Controller.createSimpleCatalog('field')));
router.patch('/fields/:id', adminAuth, validate(updateSimpleCatalogSchema), asyncHandler(Controller.updateSimpleCatalog('field')));
router.delete('/fields/:id', adminAuth, asyncHandler(Controller.deleteSimpleCatalog('field')));

// --- Levels ---
router.get('/levels', asyncHandler(Controller.getSimpleCatalogs('level')));
router.post('/levels', adminAuth, validate(createSimpleCatalogSchema), asyncHandler(Controller.createSimpleCatalog('level')));
router.patch('/levels/:id', adminAuth, validate(updateSimpleCatalogSchema), asyncHandler(Controller.updateSimpleCatalog('level')));
router.delete('/levels/:id', adminAuth, asyncHandler(Controller.deleteSimpleCatalog('level')));

export default router;
