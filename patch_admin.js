const fs = require('fs');

let service = fs.readFileSync('backend/src/modules/admin/admin.service.ts', 'utf8');
let controller = fs.readFileSync('backend/src/modules/admin/admin.controller.ts', 'utf8');
let routes = fs.readFileSync('backend/src/modules/admin/admin.routes.ts', 'utf8');

if (!service.includes('getOrders')) {
  // Update Service
  const newMethods = `
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
`;
  service = service.replace('// --- Coupons ---', newMethods + '\n  // --- Coupons ---');
  fs.writeFileSync('backend/src/modules/admin/admin.service.ts', service);

  // Update Controller
  const ctrlMethods = `
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
`;
  fs.writeFileSync('backend/src/modules/admin/admin.controller.ts', controller + ctrlMethods);

  // Update Routes
  const routeMethods = `
// Extra Admin Routes
router.get('/admin/orders', isAdmin, asyncHandler(Controller.getOrders));
router.get('/admin/tickets', isAdmin, asyncHandler(Controller.getTickets));
router.patch('/admin/tickets/:id/status', isAdmin, asyncHandler(Controller.updateTicketStatus));
router.get('/admin/classes', isAdmin, asyncHandler(Controller.getClasses));
router.get('/admin/revenue', isAdmin, asyncHandler(Controller.getRevenueStats));
`;
  fs.writeFileSync('backend/src/modules/admin/admin.routes.ts', routes + routeMethods);
}

