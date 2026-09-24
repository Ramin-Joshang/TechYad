import { Router } from 'express';
import * as Controller from './commerce.controller.js';
import { validate } from '../../common/middleware/validate.js';
import { authenticate, authorize } from '../../common/middleware/auth.js';
import { asyncHandler } from '../../common/utils/asyncHandler.js';
import { addToCartSchema, applyCouponSchema } from './commerce.validation.js';

const router = Router();
const requireAuth = asyncHandler(authenticate);
const isInstructor = [requireAuth, authorize('create_course')];

// --- Cart ---
router.get('/me/cart', requireAuth, asyncHandler(Controller.getCart));
router.post('/me/cart/items', requireAuth, validate(addToCartSchema), asyncHandler(Controller.addToCart));
router.delete('/me/cart/items/:itemId', requireAuth, asyncHandler(Controller.removeFromCart));
router.delete('/me/cart', requireAuth, asyncHandler(Controller.clearCart));

// --- Checkout ---
router.post('/checkout/preview', requireAuth, asyncHandler(Controller.checkoutPreview)); // Optional couponCode in body
router.post('/checkout/create', requireAuth, asyncHandler(Controller.createOrder));

// --- Orders ---
router.get('/me/orders', requireAuth, asyncHandler(Controller.getMyOrders));
router.get('/me/orders/:id', requireAuth, asyncHandler(Controller.getOrderById));

// --- Payments (Mock) ---
router.post('/payments/:orderId/create', requireAuth, asyncHandler(Controller.createMockPayment));
router.post('/payments/verify', requireAuth, asyncHandler(Controller.verifyMockPayment));

// --- Instructor Sales ---
router.get('/instructor/sales', isInstructor, asyncHandler(Controller.getInstructorSales));

export default router;
