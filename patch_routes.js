const fs = require('fs');
let code = fs.readFileSync('backend/src/modules/courses/course.routes.ts', 'utf8');

code = code.replace(
  "// --- Instructor Routes ---\nrouter.post('/instructor/courses', isInstructor, validate(createCourseSchema), asyncHandler(Controller.createCourse));",
  "// --- Instructor Routes ---\nrouter.get('/instructor/courses', isInstructor, asyncHandler(Controller.getInstructorCourses));\nrouter.get('/instructor/stats', isInstructor, asyncHandler(Controller.getInstructorStats));\nrouter.post('/instructor/courses', isInstructor, validate(createCourseSchema), asyncHandler(Controller.createCourse));"
);

fs.writeFileSync('backend/src/modules/courses/course.routes.ts', code);
