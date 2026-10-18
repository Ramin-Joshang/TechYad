import { Router } from 'express';
import * as Controller from './commerce.controller.js';
import { validate } from '../../common/middleware/validate.js';
import { authenticate, authorize } from '../../common/middleware/auth.js';
import { asyncHandler } from '../../common/utils/asyncHandler.js';
import { addToCartSchema, updateCartItemPlanSchema, applyCouponSchema } from './commerce.validation.js';

const router = Router();
const requireAuth = asyncHandler(authenticate);
const isInstructor = [requireAuth, authorize('create_course')];

// --- Cart ---
router.get('/me/cart', requireAuth, asyncHandler(Controller.getCart));
router.post('/me/cart/items', requireAuth, validate(addToCartSchema), asyncHandler(Controller.addToCart));
router.patch('/me/cart/items/:itemId', requireAuth, validate(updateCartItemPlanSchema), asyncHandler(Controller.updateCartItemPlan));
router.delete('/me/cart/items/:itemId', requireAuth, asyncHandler(Controller.removeFromCart));
router.delete('/me/cart', requireAuth, asyncHandler(Controller.clearCart));

// --- Checkout ---
router.post('/checkout/preview', requireAuth, asyncHandler(Controller.checkoutPreview)); // Optional couponCode in body
router.post('/checkout/create', requireAuth, asyncHandler(Controller.createOrder));

// --- Orders ---
router.get('/me/orders', requireAuth, asyncHandler(Controller.getMyOrders));
router.get('/me/orders/:id', requireAuth, asyncHandler(Controller.getOrderById));

// --- Payments & Bank Gateway Callbacks ---
router.post('/payments/:orderId/create', requireAuth, asyncHandler(Controller.createMockPayment));
router.post('/payments/verify', requireAuth, asyncHandler(Controller.verifyMockPayment));
// Universal bank gateway callbacks (GET / POST)
router.get('/payments/saman/form/:token', asyncHandler(Controller.renderSepForm));
router.get('/payments/saman/form', asyncHandler(Controller.renderSepForm));
router.get('/payments/callback', asyncHandler(Controller.handleGatewayCallback));
router.post('/payments/callback', asyncHandler(Controller.handleGatewayCallback));
router.get('/payments/callback/:gateway', asyncHandler(Controller.handleGatewayCallback));
router.post('/payments/callback/:gateway', asyncHandler(Controller.handleGatewayCallback));

// --- Instructor Sales ---
router.get('/instructor/sales', isInstructor, asyncHandler(Controller.getInstructorSales));

// --- Accounting Dashboard (for Super-Admin, Admin, Accountant, Partner) ---
const requireAccountingAccess = [
  requireAuth,
  (req: any, res: any, next: any) => {
    const roleSlugs: string[] = req.user?.roleSlugs || [req.user?.role?.slug].filter(Boolean);
    const permissions: string[] = req.user?.allPermissions || req.user?.role?.permissions || [];
    if (
      roleSlugs.includes('super-admin') ||
      roleSlugs.includes('admin') ||
      roleSlugs.includes('accountant') ||
      roleSlugs.includes('partner') ||
      permissions.includes('accounting.view') ||
      permissions.includes('admin.access')
    ) {
      return next();
    }
    return res.status(403).json({ success: false, message: 'دسترسی به بخش حسابداری مجاز نمی‌باشد' });
  }
];

router.get('/accounting/overview', requireAccountingAccess, asyncHandler(Controller.getAccountingOverview));
router.get('/accounting/transactions', requireAccountingAccess, asyncHandler(Controller.getAccountingTransactions));
router.get('/accounting/transactions/:id', requireAccountingAccess, asyncHandler(Controller.getAccountingTransactionById));

export default router;
