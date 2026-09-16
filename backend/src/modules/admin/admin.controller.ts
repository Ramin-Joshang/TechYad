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

export const updateUserStatus = async (req: Request, res: Response) => {
  const result = await AdminService.updateUserStatus(req.params.id as string, req.body.status);
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
  const result = await AdminService.deleteCoupon(req.params.id as string);
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
  const result = await AdminService.updateTicketStatus(req.params.id, req.body.status);
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
