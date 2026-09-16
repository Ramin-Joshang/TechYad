const fs = require('fs');
let code = fs.readFileSync('backend/src/modules/courses/course.controller.ts', 'utf8');

code = code.replace(
  "export const publishCourse",
  "export const getAdminCourses = async (req: AuthRequest, res: Response) => {\n  const result = await CourseService.getAdminCourses(req.query);\n  sendSuccess(res, result, 'Admin courses retrieved successfully');\n};\n\nexport const publishCourse"
);

fs.writeFileSync('backend/src/modules/courses/course.controller.ts', code);
