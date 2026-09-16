const fs = require('fs');
let code = fs.readFileSync('backend/src/modules/learning/assignment.routes.ts', 'utf8');

code = code.replace(
  "router.get('/instructor/assignments/:assignmentId/submissions', isInstructor, asyncHandler(Controller.getSubmissions));",
  "router.get('/instructor/assignments', isInstructor, asyncHandler(Controller.getInstructorAssignments));\nrouter.get('/instructor/submissions', isInstructor, asyncHandler(Controller.getInstructorSubmissions));\nrouter.get('/instructor/assignments/:assignmentId/submissions', isInstructor, asyncHandler(Controller.getSubmissions));"
);

fs.writeFileSync('backend/src/modules/learning/assignment.routes.ts', code);
