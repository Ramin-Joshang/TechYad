const fs = require('fs');

let code = fs.readFileSync('frontend/src/app/(dashboard)/admin/page.tsx', 'utf8');

code = code.replace(/statsData\.revenue\.toLocaleString\(\)/g, '(statsData.totalRevenue || 0).toLocaleString()');
code = code.replace(/statsData\.orders\.toLocaleString\(\)/g, '(statsData.activeOrders || 0).toLocaleString()');
code = code.replace(/statsData\.totalUsers\.toLocaleString\(\)/g, '(statsData.totalUsers || 0).toLocaleString()');
code = code.replace(/statsData\.students\.toLocaleString\(\)/g, '(statsData.students || 0).toLocaleString()');

// Also make sure to provide defaults for others just in case
code = code.replace(/statsData\.totalCourses/g, '(statsData.totalCourses || 0)');
code = code.replace(/statsData\.instructors/g, '(statsData.instructors || 0)');
code = code.replace(/statsData\.classes/g, '(statsData.classes || 0)');
code = code.replace(/statsData\.tickets/g, '(statsData.tickets || 0)');
code = code.replace(/statsData\.publishedCourses/g, '(statsData.publishedCourses || 0)');
code = code.replace(/statsData\.pendingCourses/g, '(statsData.pendingCourses || 0)');

fs.writeFileSync('frontend/src/app/(dashboard)/admin/page.tsx', code);
console.log('Fixed fields in admin/page.tsx');
