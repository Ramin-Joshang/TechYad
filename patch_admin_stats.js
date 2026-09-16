const fs = require('fs');
let code = fs.readFileSync('backend/src/modules/admin/admin.service.ts', 'utf8');

const newStats = `
  static async getDashboardStats() {
    const Role = require('../auth/role.model.js').Role;
    const Class = require('../classes/class.model.js').Class;
    const Ticket = require('../support/ticket.model.js').Ticket;

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
`;

code = code.replace(/static async getDashboardStats\(\) \{[\s\S]*?return \{[\s\S]*?\};\n  \}/, newStats.trim());
fs.writeFileSync('backend/src/modules/admin/admin.service.ts', code);
