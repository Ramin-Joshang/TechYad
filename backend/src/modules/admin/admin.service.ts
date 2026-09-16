import { User } from '../auth/user.model.js';
import { Order } from '../commerce/order.model.js';
import { Course } from '../courses/course.model.js';
import { Coupon } from '../commerce/coupon.model.js';
import { AppError } from '../../common/errors/AppError.js';

export class AdminService {
  static async getDashboardStats() {
    const totalUsers = await User.countDocuments();
    const totalCourses = await Course.countDocuments();
    const activeOrders = await Order.countDocuments({ status: 'paid' });
    
    // Calculate total revenue from paid orders
    const orders = await Order.find({ status: 'paid' });
    const totalRevenue = orders.reduce((acc, curr) => acc + curr.totalAmount, 0);

    return {
      totalUsers,
      totalCourses,
      activeOrders,
      totalRevenue
    };
  }

  static async getUsers() {
    return await User.find().populate('role', 'name slug').select('-passwordHash');
  }

  static async updateUserStatus(userId: string, status: 'active' | 'blocked' | 'pending') {
    const user = await User.findByIdAndUpdate(userId, { status }, { new: true });
    if (!user) throw new AppError('User not found', 404, 'NOT_FOUND');
    return user;
  }

  
  static async getOrders(query: any) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 20;
    const skip = (page - 1) * limit;
    const orders = await Order.find().populate('userId', 'firstName lastName email').sort({ createdAt: -1 }).skip(skip).limit(limit);
    const total = await Order.countDocuments();
    return { orders, total, page, pages: Math.ceil(total / limit) };
  }

  static async getTickets(query: any) {
    const SupportTicket = require('../support/support.model').SupportTicket;
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 20;
    const skip = (page - 1) * limit;
    const tickets = await SupportTicket.find().populate('userId', 'firstName lastName email').sort({ createdAt: -1 }).skip(skip).limit(limit);
    const total = await SupportTicket.countDocuments();
    return { tickets, total, page, pages: Math.ceil(total / limit) };
  }
  
  static async updateTicketStatus(ticketId: string, status: string) {
    const SupportTicket = require('../support/support.model').SupportTicket;
    return await SupportTicket.findByIdAndUpdate(ticketId, { status }, { new: true });
  }

  static async getClasses(query: any) {
    const Class = require('../classes/class.model').Class;
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 20;
    const skip = (page - 1) * limit;
    const classes = await Class.find().populate('instructors', 'firstName lastName').sort({ createdAt: -1 }).skip(skip).limit(limit);
    const total = await Class.countDocuments();
    return { classes, total, page, pages: Math.ceil(total / limit) };
  }

  static async getRevenueStats() {
    const orders = await Order.find({ status: 'paid' });
    const totalRevenue = orders.reduce((acc, curr) => acc + curr.totalAmount, 0);
    const thisMonthRevenue = orders
      .filter(o => new Date(o.createdAt).getMonth() === new Date().getMonth())
      .reduce((acc, curr) => acc + curr.totalAmount, 0);
      
    return { totalRevenue, thisMonthRevenue, ordersCount: orders.length };
  }

  // --- Coupons ---
  static async createCoupon(data: any) {
    return await Coupon.create(data);
  }

  static async getCoupons() {
    return await Coupon.find().sort({ createdAt: -1 });
  }

  static async deleteCoupon(id: string) {
    await Coupon.findByIdAndDelete(id);
    return { success: true };
  }
}
