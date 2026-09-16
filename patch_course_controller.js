const fs = require('fs');
let code = fs.readFileSync('backend/src/modules/courses/course.controller.ts', 'utf8');

code += `
export const getCourseStudents = async (req: AuthRequest, res: Response) => {
  const result = await CourseService.getCourseStudents(req.params.courseId, req.query);
  sendSuccess(res, result, 'Students retrieved successfully');
};
`;

fs.writeFileSync('backend/src/modules/courses/course.controller.ts', code);
