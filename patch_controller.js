const fs = require('fs');
let code = fs.readFileSync('backend/src/modules/courses/course.controller.ts', 'utf8');

code = code.replace(
  "export const updateCourse",
  "export const getInstructorCourses = async (req: AuthRequest, res: Response) => {\n  const result = await CourseService.getInstructorCourses(req.user._id, req.query);\n  sendSuccess(res, result, 'Instructor courses retrieved successfully');\n};\n\nexport const getInstructorStats = async (req: AuthRequest, res: Response) => {\n  const result = await CourseService.getInstructorStats(req.user._id);\n  sendSuccess(res, result, 'Instructor stats retrieved successfully');\n};\n\nexport const updateCourse"
);

fs.writeFileSync('backend/src/modules/courses/course.controller.ts', code);
