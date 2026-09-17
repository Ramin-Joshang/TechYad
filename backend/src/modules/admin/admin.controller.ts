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

export const deleteCoupon = async (req: Request, res: Response) => {
  const result = await AdminService.deleteCoupon(((req.params.id as string) as any as string) as any as string);
  sendSuccess(res, result, 'Coupon deleted');
};

export const getOrders = async (req: Request, res: Response) => {
  const result = await AdminService.getOrders(req.query);
  sendSuccess(res, result, 'Orders retrieved');
};
export const getTickets = async (req: Request, res: Response) => {
  const result = await AdminService.getTickets(req.query);
  sendSuccess(res, result, 'Tickets retrieved');
};
export const updateTicketStatus = async (req: Request, res: Response) => {
  const result = await AdminService.updateTicketStatus(((req.params.id as string) as any as string) as any as string, req.body.status);
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

export const updateSettings = async (req: Request, res: Response) => {
  const result = await AdminService.updateSettings(req.body);
  sendSuccess(res, result, 'Settings updated successfully');
};
