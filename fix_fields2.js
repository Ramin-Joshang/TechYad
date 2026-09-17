const fs = require('fs');

let code = fs.readFileSync('frontend/src/app/(dashboard)/admin/page.tsx', 'utf8');

code = code.replace(/\(statsData\.totalUsers \|\| 0\)/g, '(statsData?.totalUsers || 0)');
code = code.replace(/\(statsData\.totalRevenue \|\| 0\)/g, '(statsData?.totalRevenue || 0)');
code = code.replace(/\(statsData\.totalCourses \|\| 0\)/g, '(statsData?.totalCourses || 0)');
code = code.replace(/\(statsData\.activeOrders \|\| 0\)/g, '(statsData?.activeOrders || 0)');
code = code.replace(/\(statsData\.students \|\| 0\)/g, '(statsData?.students || 0)');
code = code.replace(/\(statsData\.instructors \|\| 0\)/g, '(statsData?.instructors || 0)');
code = code.replace(/\(statsData\.classes \|\| 0\)/g, '(statsData?.classes || 0)');
code = code.replace(/\(statsData\.tickets \|\| 0\)/g, '(statsData?.tickets || 0)');
code = code.replace(/\(statsData\.publishedCourses \|\| 0\)/g, '(statsData?.publishedCourses || 0)');
code = code.replace(/\(statsData\.pendingCourses \|\| 0\)/g, '(statsData?.pendingCourses || 0)');

fs.writeFileSync('frontend/src/app/(dashboard)/admin/page.tsx', code);
console.log('Safe access applied');
