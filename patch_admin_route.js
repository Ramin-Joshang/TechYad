const fs = require('fs');
let code = fs.readFileSync('backend/src/modules/courses/course.routes.ts', 'utf8');

code = code.replace(
  "// --- Admin Routes ---",
  "// --- Admin Routes ---\nrouter.get('/admin/courses', isAdmin, asyncHandler(Controller.getAdminCourses));"
);

fs.writeFileSync('backend/src/modules/courses/course.routes.ts', code);
