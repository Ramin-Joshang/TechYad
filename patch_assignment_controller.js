const fs = require('fs');
let code = fs.readFileSync('backend/src/modules/learning/assignment.controller.ts', 'utf8');

code += `
export const getInstructorAssignments = async (req: AuthRequest, res: Response) => {
  const result = await AssignmentService.getInstructorAssignments(req.user._id as string, req.query);
  sendSuccess(res, result, 'Instructor assignments retrieved successfully');
};

export const getInstructorSubmissions = async (req: AuthRequest, res: Response) => {
  const result = await AssignmentService.getInstructorSubmissions(req.user._id as string, req.query);
  sendSuccess(res, result, 'Instructor submissions retrieved successfully');
};
`;

fs.writeFileSync('backend/src/modules/learning/assignment.controller.ts', code);
