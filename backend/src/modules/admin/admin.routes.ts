import { Router } from 'express';
import * as Controller from './admin.controller.js';
import { authenticate, authorize } from '../../common/middleware/auth.js';
import { asyncHandler } from '../../common/utils/asyncHandler.js';

const router = Router();
const requireAuth = asyncHandler(authenticate);
const isAdmin = [requireAuth, authorize('admin.access')];

// Dashboard
router.get('/admin/dashboard', isAdmin, asyncHandler(Controller.getDashboardStats));

// Users
router.get('/admin/users', isAdmin, asyncHandler(Controller.getUsers));
router.patch('/admin/users/:id/status', isAdmin, asyncHandler(Controller.updateUserStatus));

// Coupons
router.post('/admin/coupons', isAdmin, asyncHandler(Controller.createCoupon));
router.get('/admin/coupons', isAdmin, asyncHandler(Controller.getCoupons));
router.delete('/admin/coupons/:id', isAdmin, asyncHandler(Controller.deleteCoupon));


// Super Admin Specific Routes
const isSuperAdmin = [requireAuth, authorize('super_admin.access')];

router.get('/super-admin/admins', isSuperAdmin, asyncHandler(Controller.getAdmins));
router.post('/super-admin/admins', isSuperAdmin, asyncHandler(Controller.createAdmin));
router.patch('/super-admin/admins/:id/status', isSuperAdmin, asyncHandler(Controller.updateAdminStatus));
router.get('/super-admin/roles', isSuperAdmin, asyncHandler(Controller.getRoles));
router.get('/super-admin/roles/:id', isSuperAdmin, asyncHandler(Controller.getRoleById));
router.post('/super-admin/roles', isSuperAdmin, asyncHandler(Controller.createRole));
router.patch('/super-admin/roles/:id', isSuperAdmin, asyncHandler(Controller.updateRole));
router.delete('/super-admin/roles/:id', isSuperAdmin, asyncHandler(Controller.deleteRole));


// Global Settings
router.get('/super-admin/settings', isSuperAdmin, asyncHandler(Controller.getSettings));
router.patch('/super-admin/settings', isSuperAdmin, asyncHandler(Controller.updateSettings));

export default router;

// Extra Admin Routes
router.get('/admin/orders', isAdmin, asyncHandler(Controller.getOrders));
router.get('/admin/tickets', isAdmin, asyncHandler(Controller.getTickets));
router.patch('/admin/tickets/:id/status', isAdmin, asyncHandler(Controller.updateTicketStatus));
router.get('/admin/classes', isAdmin, asyncHandler(Controller.getClasses));
router.get('/admin/revenue', isAdmin, asyncHandler(Controller.getRevenueStats));
