const fs = require('fs');

let service = fs.readFileSync('backend/src/modules/commerce/commerce.service.ts', 'utf8');
if (!service.includes('getInstructorSales')) {
  service = service.replace(
    "export class CommerceService {",
    "export class CommerceService {\n  static async getInstructorSales(instructorId: string, month?: number, year?: number) {\n    const { Course } = require('../courses/course.model.js');\n    const courses = await Course.find({ instructors: instructorId });\n    const courseIds = courses.map(c => c._id);\n    \n    let dateFilter = {};\n    if (month && year) {\n      const startDate = new Date(year, month - 1, 1);\n      const endDate = new Date(year, month, 0, 23, 59, 59);\n      dateFilter = { createdAt: { $gte: startDate, $lte: endDate } };\n    }\n    \n    const orders = await Order.find({ \n      status: 'paid', \n      'items.itemType': 'course', \n      'items.itemId': { $in: courseIds },\n      ...dateFilter\n    }).populate('userId', 'firstName lastName avatar').sort({ createdAt: -1 });\n    \n    // Filter items to only include this instructor's courses and calculate total\n    let totalSales = 0;\n    const sales = orders.map(order => {\n      const relevantItems = order.items.filter(item => item.itemType === 'course' && courseIds.some(cid => cid.equals(item.itemId)));\n      const orderTotal = relevantItems.reduce((acc, curr) => acc + curr.finalPrice, 0);\n      totalSales += orderTotal * 0.7; // 70% share\n      \n      return {\n        _id: order._id,\n        userId: order.userId,\n        items: relevantItems,\n        total: orderTotal,\n        instructorShare: orderTotal * 0.7,\n        createdAt: order.createdAt\n      };\n    });\n    \n    return { sales, totalSales };\n  }\n"
  );
  fs.writeFileSync('backend/src/modules/commerce/commerce.service.ts', service);
}

let controller = fs.readFileSync('backend/src/modules/commerce/commerce.controller.ts', 'utf8');
if (!controller.includes('getInstructorSales')) {
  controller += `
export const getInstructorSales = async (req: AuthRequest, res: Response) => {
  const { month, year } = req.query;
  const result = await CommerceService.getInstructorSales(
    req.user._id as string, 
    month ? parseInt(month as string) : undefined,
    year ? parseInt(year as string) : undefined
  );
  sendSuccess(res, result, 'Instructor sales retrieved successfully');
};
`;
  fs.writeFileSync('backend/src/modules/commerce/commerce.controller.ts', controller);
}

let routes = fs.readFileSync('backend/src/modules/commerce/commerce.routes.ts', 'utf8');
if (!routes.includes('getInstructorSales')) {
  routes = routes.replace(
    "// Public routes",
    "// Instructor routes\nrouter.get('/instructor/sales', isInstructor, asyncHandler(Controller.getInstructorSales));\n\n// Public routes"
  );
  fs.writeFileSync('backend/src/modules/commerce/commerce.routes.ts', routes);
}
