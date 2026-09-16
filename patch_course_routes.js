const fs = require('fs');
let code = fs.readFileSync('backend/src/modules/courses/course.routes.ts', 'utf8');

code = code.replace(
  "router.get('/instructor/stats', isInstructor, asyncHandler(Controller.getInstructorStats));",
  "router.get('/instructor/stats', isInstructor, asyncHandler(Controller.getInstructorStats));\nrouter.get('/instructor/comments', isInstructor, asyncHandler(CommentController.getInstructorComments));\nrouter.get('/instructor/courses/:courseId/students', isInstructor, asyncHandler(Controller.getCourseStudents));"
);

fs.writeFileSync('backend/src/modules/courses/course.routes.ts', code);
