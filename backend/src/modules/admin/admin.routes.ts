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
router.get('/admin/users/:id', isAdmin, asyncHandler(Controller.getUserById));
router.patch('/admin/users/:id', isAdmin, asyncHandler(Controller.updateUser));
router.patch('/admin/users/:id/status', isAdmin, asyncHandler(Controller.updateUserStatus));

// Coupons
router.post('/admin/coupons', isAdmin, asyncHandler(Controller.createCoupon));
router.get('/admin/coupons', isAdmin, asyncHandler(Controller.getCoupons));
router.patch('/admin/coupons/:id', isAdmin, asyncHandler(Controller.updateCoupon));
router.patch('/admin/coupons/:id/toggle', isAdmin, asyncHandler(Controller.toggleCouponStatus));
router.delete('/admin/coupons/:id', isAdmin, asyncHandler(Controller.deleteCoupon));

// Orders
router.get('/admin/orders', isAdmin, asyncHandler(Controller.getOrders));
router.get('/admin/orders/:id', isAdmin, asyncHandler(Controller.getOrderById));
router.patch('/admin/orders/:id/status', isAdmin, asyncHandler(Controller.updateOrderStatus));

// Tickets & Support
router.get('/admin/tickets', isAdmin, asyncHandler(Controller.getTickets));
router.get('/admin/tickets/:id', isAdmin, asyncHandler(Controller.getTicketDetails));
router.post('/admin/tickets/:id/reply', isAdmin, asyncHandler(Controller.replyToTicket));
router.patch('/admin/tickets/:id/status', isAdmin, asyncHandler(Controller.updateTicketStatus));

// Classes & Financial Reports
router.get('/admin/classes', isAdmin, asyncHandler(Controller.getClasses));
router.get('/admin/revenue', isAdmin, asyncHandler(Controller.getRevenueStats));
router.get('/admin/reports/analytics', isAdmin, asyncHandler(Controller.getComprehensiveReports));

// Super Admin Specific Routes
const isSuperAdmin = [requireAuth, authorize('super_admin.access')];

router.get('/super-admin/admins', isSuperAdmin, asyncHandler(Controller.getAdmins));
router.post('/super-admin/admins', isSuperAdmin, asyncHandler(Controller.createAdmin));
router.patch('/super-admin/admins/:id', isSuperAdmin, asyncHandler(Controller.updateAdmin));
router.patch('/super-admin/admins/:id/status', isSuperAdmin, asyncHandler(Controller.updateAdminStatus));
router.get('/super-admin/roles', isSuperAdmin, asyncHandler(Controller.getRoles));
router.get('/admin/roles', isAdmin, asyncHandler(Controller.getRoles));
router.get('/super-admin/roles/:id', isSuperAdmin, asyncHandler(Controller.getRoleById));
router.post('/super-admin/roles', isSuperAdmin, asyncHandler(Controller.createRole));
router.patch('/super-admin/roles/:id', isSuperAdmin, asyncHandler(Controller.updateRole));
router.delete('/super-admin/roles/:id', isSuperAdmin, asyncHandler(Controller.deleteRole));

// Global Settings
router.get('/settings/public', asyncHandler(Controller.getPublicSettings));
router.get('/super-admin/settings', isSuperAdmin, asyncHandler(Controller.getSettings));
router.patch('/super-admin/settings', isSuperAdmin, asyncHandler(Controller.updateSettings));
router.get('/admin/settings', isAdmin, asyncHandler(Controller.getSettings));
router.patch('/admin/settings', isAdmin, asyncHandler(Controller.updateSettings));

// Settlements & Instructor Payouts
router.get('/admin/settlements', isAdmin, asyncHandler(Controller.getSettlements));
router.post('/admin/settlements', isSuperAdmin, asyncHandler(Controller.createSettlement));
router.patch('/admin/settlements/:id/status', isSuperAdmin, asyncHandler(Controller.updateSettlementStatus));

// Comments & Reviews Moderation
router.get('/admin/comments', isAdmin, asyncHandler(Controller.getComments));
router.patch('/admin/comments/:id', isAdmin, asyncHandler(Controller.moderateComment));
router.delete('/admin/comments/:id', isAdmin, asyncHandler(Controller.deleteComment));

// Broadcast Notifications
router.post('/super-admin/broadcast', isSuperAdmin, asyncHandler(Controller.sendBroadcastNotification));

// Audit Logs
router.get('/super-admin/audit-logs', isSuperAdmin, asyncHandler(Controller.getAuditLogs));

// Security & Active Sessions
router.get('/super-admin/security', isSuperAdmin, asyncHandler(Controller.getSecurityOverview));
router.patch('/super-admin/security', isSuperAdmin, asyncHandler(Controller.updateSecurityConfig));

export default router;

