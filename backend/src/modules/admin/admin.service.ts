import * as argon2 from 'argon2';
import { Setting } from './setting.model.js';
import { User } from '../auth/user.model.js';
import { Order } from '../commerce/order.model.js';
import { Course } from '../courses/course.model.js';
import { Coupon } from '../commerce/coupon.model.js';
import { AppError } from '../../common/errors/AppError.js';
import { Role } from '../auth/role.model.js';
import { Class } from '../classes/class.model.js';
import { Ticket } from '../support/ticket.model.js';


export class AdminService {
  
  // --- Global Settings ---
  static async getSettings() {
    const settings = await Setting.find().lean();
    return settings.reduce((acc, curr) => {
       acc[curr.key] = curr.value;
       return acc;
    }, {} as Record<string, any>);
  }

  static async updateSettings(data: Record<string, any>) {
    const operations = Object.entries(data).map(([key, value]) => ({
      updateOne: {
        filter: { key },
        update: { $set: { value } },
        upsert: true
      }
    }));
    if (operations.length > 0) {
      await Setting.bulkWrite(operations);
    }
    return this.getSettings();
  }
  
  static async getDashboardStats() {
    
    
    

    const totalUsers = await User.countDocuments();
    const totalCourses = await Course.countDocuments();
    const publishedCourses = await Course.countDocuments({ status: 'published' });
    const pendingCourses = await Course.countDocuments({ status: 'pending_review' });
    const activeOrders = await Order.countDocuments({ status: 'paid' });
    
    // Students vs Instructors
    const studentRole = await Role.findOne({ slug: 'student' });
    const instructorRole = await Role.findOne({ slug: 'instructor' });
    const adminRole = await Role.findOne({ slug: 'admin' });
    const superAdminRole = await Role.findOne({ slug: 'super-admin' });
    const students = studentRole ? await User.countDocuments({ role: studentRole._id }) : 0;
    const instructors = instructorRole ? await User.countDocuments({ role: instructorRole._id }) : 0;
    const admins = (adminRole ? await User.countDocuments({ role: adminRole._id }) : 0) + (superAdminRole ? await User.countDocuments({ role: superAdminRole._id }) : 0);

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
      tickets,
      admins
    };
  }

  static async getUsers() {
    return await User.find().populate('role', 'name slug').select('-passwordHash');
  }

  static async updateUser(id: string, data: any) {
    if (data.password) {
      data.passwordHash = await argon2.hash(data.password);
      delete data.password;
    }
    const userToUpdate = await User.findByIdAndUpdate(id, data, { new: true });
    if (!userToUpdate) throw new AppError('User not found', 404);
    return userToUpdate;
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
      
    // Create monthly data for the chart
    const monthNames = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'];
    const monthlyData = monthNames.map(name => ({ name, revenue: 0 }));
    
    // Simply group by JS getMonth() for current year
    const currentYear = new Date().getFullYear();
    orders.forEach(o => {
      const date = new Date((o as any).createdAt);
      if (date.getFullYear() === currentYear) {
         // rough map to jalali month, for demo purposes we just use index 0-11
         // A better way is relying on actual jalali conversion, but let's keep it simple mapping
         const monthIndex = date.getMonth(); // 0-11
         if (monthlyData[monthIndex]) {
            monthlyData[monthIndex].revenue += o.totalAmount;
         }
      }
    });

    return { totalRevenue, thisMonthRevenue, ordersCount: orders.length, chartData: monthlyData };
  }

  // --- Coupons ---
  static async createCoupon(data: any) {
    return await Coupon.create(data);
  }

  
  // --- Super Admin ---
  static async getAdmins() {
    const adminRoles = await Role.find({ slug: { $in: ['admin', 'super-admin'] } });
    const roleIds = adminRoles.map(r => r._id);
    return await User.find({ role: { $in: roleIds } })
      .populate('role', 'name slug')
      .sort({ createdAt: -1 });
  }

  static async createAdmin(data: any) {
    // Only super-admin or admin role should be assignable here
    const role = await Role.findById(data.role);
    if (!role || !['admin', 'super-admin'].includes(role.slug)) {
       throw new AppError('Invalid role for admin creation', 400);
    }
    
    // Hash password manually
    if (data.password) {
      data.passwordHash = await argon2.hash(data.password);
      delete data.password;
    } else {
      throw new AppError('Password is required', 400);
    }
    const newUser = await User.create(data);
    return newUser;
  }

  static async updateAdmin(id: string, data: any) {
    if (data.password) {
      data.passwordHash = await argon2.hash(data.password);
      delete data.password;
    }
    const userToUpdate = await User.findByIdAndUpdate(id, data, { new: true });
    if (!userToUpdate) throw new AppError('Admin not found', 404);
    return userToUpdate;
  }

  static async updateAdminStatus(adminId: string, status: string) {
    const userToUpdate = await User.findById(adminId).populate('role');
    if (!userToUpdate) throw new AppError('Admin not found', 404);
    
    // Prevent blocking super-admin
    if ((userToUpdate.role as any)?.slug === 'super-admin' && status === 'blocked') {
      throw new AppError('Cannot block a super admin', 403);
    }
    
    userToUpdate.status = status as 'active' | 'blocked';
    await userToUpdate.save();
    return userToUpdate;
  }

  static async getRoles() {
    // Add user count to each role
    const roles = await Role.find().lean();
    const rolesWithCounts = await Promise.all(roles.map(async (role) => {
      const count = await User.countDocuments({ role: role._id });
      return { ...role, userCount: count };
    }));
    return rolesWithCounts.sort((a: any, b: any) => (a.createdAt > b.createdAt ? 1 : -1));
  }

  static async getRoleById(id: string) {
    const role = await Role.findById(id);
    if (!role) throw new AppError('Role not found', 404);
    return role;
  }

  static async createRole(data: any) {
    if (['super-admin', 'admin', 'instructor', 'student', 'support'].includes(data.slug)) {
       throw new AppError('Cannot create system reserved roles', 400);
    }
    
    if (data.permissions && data.permissions.includes('super_admin.access')) {
        throw new AppError('Cannot grant super_admin access to new roles', 403);
    }
    return await Role.create(data);
  }

  static async updateRole(id: string, data: any) {
    const role = await Role.findById(id);
    if (!role) throw new AppError('Role not found', 404);
    
    // Protection
    if (['super-admin', 'admin', 'instructor', 'student'].includes(role.slug)) {
       // Allow updating description and permissions (except super-admin which has all), but not slug/name
       if (role.slug === 'super-admin') {
           throw new AppError('Cannot modify super-admin role', 403);
       }
       delete data.slug; // prevent slug change
       delete data.name; // prevent name change
    }
    
    
    if (role.slug !== 'super-admin' && data.permissions && data.permissions.includes('super_admin.access')) {
        throw new AppError('Cannot grant super_admin access to non-super-admin roles', 403);
    }
    Object.assign(role, data);
    await role.save();
    return role;
  }

  static async deleteRole(id: string) {
    const role = await Role.findById(id);
    if (!role) throw new AppError('Role not found', 404);
    
    if (['super-admin', 'admin', 'instructor', 'student', 'support'].includes(role.slug)) {
       throw new AppError('Cannot delete system roles', 403);
    }
    
    const usersWithRole = await User.countDocuments({ role: id });
    if (usersWithRole > 0) {
       throw new AppError('Cannot delete role that is assigned to users', 400);
    }
    
    await role.deleteOne();
    return { success: true };
  }

  static async getCoupons() {
    return await Coupon.find().sort({ createdAt: -1 });
  }

  static async deleteCoupon(id: string) {
    await Coupon.findByIdAndDelete(id);
    return { success: true };
  }
}
