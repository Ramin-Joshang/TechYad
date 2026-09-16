import { User } from '../auth/user.model.js';
import { Order } from '../commerce/order.model.js';
import { Course } from '../courses/course.model.js';
import { Coupon } from '../commerce/coupon.model.js';
import { AppError } from '../../common/errors/AppError.js';
import { Role } from '../auth/role.model.js';
import { Class } from '../classes/class.model.js';
import { Ticket } from '../support/ticket.model.js';


export class AdminService {
  static async getDashboardStats() {
    
    
    

    const totalUsers = await User.countDocuments();
    const totalCourses = await Course.countDocuments();
    const publishedCourses = await Course.countDocuments({ status: 'published' });
    const pendingCourses = await Course.countDocuments({ status: 'pending_review' });
    const activeOrders = await Order.countDocuments({ status: 'paid' });
    
    // Students vs Instructors
    const studentRole = await Role.findOne({ slug: 'student' });
    const instructorRole = await Role.findOne({ slug: 'instructor' });
    const students = studentRole ? await User.countDocuments({ role: studentRole._id }) : 0;
    const instructors = instructorRole ? await User.countDocuments({ role: instructorRole._id }) : 0;

    const classes = await Class.countDocuments({ status: 'published' });
    const tickets = await Ticket.countDocuments({ status: 'open' });
    
    // Calculate total revenue from paid orders
    const orders = await Order.find({ status: 'paid' });
    const totalRevenue = orders.reduce((acc, curr) => acc + curr.totalAmount, 0);

    return {
      totalUsers,
      totalCourses,
      publishedCourses,
      pendingCourses,
      activeOrders,
      totalRevenue,
      students,
      instructors,
      classes,
      tickets
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
    
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 20;
    const skip = (page - 1) * limit;
    const tickets = await Ticket.find().populate('userId', 'firstName lastName email').sort({ createdAt: -1 }).skip(skip).limit(limit);
    const total = await Ticket.countDocuments();
    return { tickets, total, page, pages: Math.ceil(total / limit) };
  }
  
  static async updateTicketStatus(ticketId: string, status: string) {
    
    return await Ticket.findByIdAndUpdate(ticketId, { status }, { new: true });
  }

  static async getClasses(query: any) {
    
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
      .filter(o => new Date((o as any).createdAt).getMonth() === new Date().getMonth())
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
