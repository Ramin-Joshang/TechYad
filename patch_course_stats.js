const fs = require('fs');

let service = fs.readFileSync('backend/src/modules/courses/course.service.ts', 'utf8');

const newStatsFn = `  static async getInstructorStats(instructorId: string) {
    const courses = await Course.find({ instructors: instructorId });
    const { Class } = require('../classes/class.model.js');
    const classes = await Class.find({ instructors: instructorId });
    
    const totalCourses = courses.length;
    const publishedCourses = courses.filter(c => c.status === 'published').length;
    const drafts = courses.filter(c => c.status === 'draft').length;
    const pending = courses.filter(c => c.status === 'pending_review').length;
    const activeClasses = classes.filter(c => c.status === 'published').length;

    const totalStudents = courses.reduce((acc, curr) => acc + (curr.studentCount || 0), 0);
    
    const { Order } = require('../commerce/order.model.js');
    const courseIds = courses.map(c => c._id);
    
    // Total revenue
    const orders = await Order.find({ 
      status: 'paid', 
      'items.itemType': 'course', 
      'items.itemId': { $in: courseIds } 
    });
    
    let totalRevenue = 0;
    orders.forEach(order => {
      const relevantItems = order.items.filter(item => item.itemType === 'course' && courseIds.some(cid => cid.equals(item.itemId)));
      totalRevenue += relevantItems.reduce((acc, curr) => acc + curr.finalPrice, 0) * 0.7;
    });

    // Monthly revenue
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlyOrders = orders.filter(o => o.createdAt >= startDate);
    
    let monthlyRevenue = 0;
    monthlyOrders.forEach(order => {
      const relevantItems = order.items.filter(item => item.itemType === 'course' && courseIds.some(cid => cid.equals(item.itemId)));
      monthlyRevenue += relevantItems.reduce((acc, curr) => acc + curr.finalPrice, 0) * 0.7;
    });
    
    return {
      totalCourses,
      publishedCourses,
      drafts,
      pending,
      activeClasses,
      totalStudents,
      totalRevenue,
      monthlyRevenue
    };
  }`;

service = service.replace(
  /static async getInstructorStats\([\s\S]*?return {[\s\S]*?};[\s\S]*?}/,
  newStatsFn
);

fs.writeFileSync('backend/src/modules/courses/course.service.ts', service);
