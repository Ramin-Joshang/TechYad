import { Request, Response } from 'express';
import { AdminService } from './admin.service.js';
import { sendSuccess } from '../../common/utils/response.js';

export const getDashboardStats = async (req: Request, res: Response) => {
  const result = await AdminService.getDashboardStats();
  sendSuccess(res, result, 'Dashboard statistics retrieved');
};

export const getUsers = async (req: Request, res: Response) => {
  const result = await AdminService.getUsers();
  sendSuccess(res, result, 'Users retrieved');
};

export const getUserById = async (req: Request, res: Response) => {
  const result = await AdminService.getUserDetails(req.params.id as string);
  sendSuccess(res, result, 'User details retrieved');
};

export const updateUser = async (req: Request, res: Response) => {
  const result = await AdminService.updateUser((req.params.id as string), req.body);
  res.status(200).json({ success: true, data: result });
};

export const updateUserStatus = async (req: Request, res: Response) => {
  const result = await AdminService.updateUserStatus(((req.params.id as string) as any as string) as any as string, req.body.status);
  sendSuccess(res, result, 'User status updated');
};

export const createCoupon = async (req: Request, res: Response) => {
  const result = await AdminService.createCoupon(req.body);
  sendSuccess(res, result, 'Coupon created successfully', 201);
};

export const getCoupons = async (req: Request, res: Response) => {
  const result = await AdminService.getCoupons();
  sendSuccess(res, result, 'Coupons retrieved');
};

export const updateCoupon = async (req: Request, res: Response) => {
  const result = await AdminService.updateCoupon(req.params.id as string, req.body);
  sendSuccess(res, result, 'Coupon updated successfully');
};

export const toggleCouponStatus = async (req: Request, res: Response) => {
  const result = await AdminService.toggleCouponStatus(req.params.id as string);
  sendSuccess(res, result, 'Coupon status toggled');
};

export const deleteCoupon = async (req: Request, res: Response) => {
  const result = await AdminService.deleteCoupon(req.params.id as string);
  sendSuccess(res, result, 'Coupon deleted');
};

export const getOrders = async (req: Request, res: Response) => {
  const result = await AdminService.getOrders(req.query);
  sendSuccess(res, result, 'Orders retrieved');
};

export const getOrderById = async (req: Request, res: Response) => {
  const result = await AdminService.getOrderById(req.params.id as string);
  sendSuccess(res, result, 'Order details retrieved');
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  const result = await AdminService.updateOrderStatus(req.params.id as string, req.body.status);
  sendSuccess(res, result, 'Order status updated');
};

export const getTickets = async (req: Request, res: Response) => {
  const result = await AdminService.getTickets(req.query);
  sendSuccess(res, result, 'Tickets retrieved');
};

export const getTicketDetails = async (req: Request, res: Response) => {
  const result = await AdminService.getTicketDetails(req.params.id as string);
  sendSuccess(res, result, 'Ticket details retrieved');
};

export const replyToTicket = async (req: Request, res: Response) => {
  const adminId = (req as any).user?.id || (req as any).user?._id;
  const result = await AdminService.adminReplyToTicket(adminId, req.params.id as string, req.body.message, req.body.status);
  sendSuccess(res, result, 'Reply sent successfully');
};

export const updateTicketStatus = async (req: Request, res: Response) => {
  const result = await AdminService.updateTicketStatus(req.params.id as string, req.body.status, req.body.priority);
  sendSuccess(res, result, 'Ticket status updated');
};

export const getClasses = async (req: Request, res: Response) => {
  const result = await AdminService.getClasses(req.query);
  sendSuccess(res, result, 'Classes retrieved');
};

export const getRevenueStats = async (req: Request, res: Response) => {
  const result = await AdminService.getRevenueStats();
  sendSuccess(res, result, 'Revenue stats retrieved');
};

export const getComprehensiveReports = async (req: Request, res: Response) => {
  const result = await AdminService.getComprehensiveReports(req.query);
  sendSuccess(res, result, 'Comprehensive reports retrieved');
};


export const getAdmins = async (req: Request, res: Response) => {
  const result = await AdminService.getAdmins();
  sendSuccess(res, result, 'Admins retrieved');
};

export const createAdmin = async (req: Request, res: Response) => {
  const result = await AdminService.createAdmin(req.body);
  sendSuccess(res, result, 'Admin created successfully', 201);
};

export const updateAdmin = async (req: Request, res: Response) => {
  const result = await AdminService.updateAdmin((req.params.id as string), req.body);
  res.status(200).json({ success: true, data: result });
};

export const updateAdminStatus = async (req: Request, res: Response) => {
  const result = await AdminService.updateAdminStatus(((req.params.id as string) as any as string) as any as string, req.body.status);
  sendSuccess(res, result, 'Admin status updated');
};

export const getRoles = async (req: Request, res: Response) => {
  const result = await AdminService.getRoles();
  sendSuccess(res, result, 'Roles retrieved');
};

export const getRoleById = async (req: Request, res: Response) => {
  const result = await AdminService.getRoleById(((req.params.id as string) as any as string) as any as string);
  sendSuccess(res, result, 'Role retrieved');
};

export const createRole = async (req: Request, res: Response) => {
  const result = await AdminService.createRole(req.body);
  sendSuccess(res, result, 'Role created successfully', 201);
};

export const updateRole = async (req: Request, res: Response) => {
  const result = await AdminService.updateRole(((req.params.id as string) as any as string) as any as string, req.body);
  sendSuccess(res, result, 'Role updated successfully');
};

export const deleteRole = async (req: Request, res: Response) => {
  const result = await AdminService.deleteRole(((req.params.id as string) as any as string) as any as string);
  sendSuccess(res, result, 'Role deleted successfully');
};

export const getSettings = async (req: Request, res: Response) => {
  const result = await AdminService.getSettings();
  sendSuccess(res, result, 'Settings retrieved');
};

export const getPublicSettings = async (req: Request, res: Response) => {
  const result = await AdminService.getPublicSettings();
  sendSuccess(res, result, 'Public settings retrieved');
};

export const updateSettings = async (req: Request, res: Response) => {
  const result = await AdminService.updateSettings(req.body);
  sendSuccess(res, result, 'Settings updated successfully');
};

// Settlements
export const getSettlements = async (req: Request, res: Response) => {
  const result = await AdminService.getSettlements(req.query);
  sendSuccess(res, result, 'Settlements retrieved');
};

export const createSettlement = async (req: Request, res: Response) => {
  const adminId = (req as any).user?.id || (req as any).user?._id;
  const result = await AdminService.createSettlement(adminId, req.body);
  sendSuccess(res, result, 'Settlement created successfully', 201);
};

export const updateSettlementStatus = async (req: Request, res: Response) => {
  const adminId = (req as any).user?.id || (req as any).user?._id;
  const result = await AdminService.updateSettlementStatus(
    adminId,
    req.params.id as string,
    req.body.status,
    req.body.trackingCode,
    req.body.rejectionReason
  );
  sendSuccess(res, result, 'Settlement updated');
};

// Comments & Reviews Moderation
export const getComments = async (req: Request, res: Response) => {
  const result = await AdminService.getCommentsAndReviews(req.query);
  sendSuccess(res, result, 'Comments and reviews retrieved');
};

export const moderateComment = async (req: Request, res: Response) => {
  const result = await AdminService.moderateComment(
    req.params.id as string,
    req.body.itemType,
    req.body.status
  );
  sendSuccess(res, result, 'Comment status updated');
};

export const deleteComment = async (req: Request, res: Response) => {
  const result = await AdminService.deleteComment(
    req.params.id as string,
    req.query.itemType as string
  );
  sendSuccess(res, result, 'Comment deleted');
};

// Broadcast Notifications
export const sendBroadcastNotification = async (req: Request, res: Response) => {
  const adminId = (req as any).user?.id || (req as any).user?._id;
  const result = await AdminService.sendBroadcastNotification(adminId, req.body);
  sendSuccess(res, result, 'Broadcast sent successfully');
};

// Audit Logs
export const getAuditLogs = async (req: Request, res: Response) => {
  const result = await AdminService.getAuditLogs(req.query);
  sendSuccess(res, result, 'Audit logs retrieved');
};

// Security
export const getSecurityOverview = async (req: Request, res: Response) => {
  const result = await AdminService.getSecurityOverview();
  sendSuccess(res, result, 'Security overview retrieved');
};

export const updateSecurityConfig = async (req: Request, res: Response) => {
  const result = await AdminService.updateSecurityConfig(req.body);
  sendSuccess(res, result, 'Security config updated');
};

