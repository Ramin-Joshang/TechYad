const fs = require('fs');
let code = fs.readFileSync('backend/src/modules/courses/comment.controller.ts', 'utf8');

code += `
export const getInstructorComments = async (req: AuthRequest, res: Response) => {
  // Simple implementation: fetch all comments for now, or filter by course owner
  const comments = await LessonComment.find()
    .populate('userId', 'firstName lastName avatar')
    .populate('lessonId', 'title')
    .sort({ createdAt: -1 })
    .limit(50);
  sendSuccess(res, comments, 'Instructor comments retrieved');
};
`;

fs.writeFileSync('backend/src/modules/courses/comment.controller.ts', code);
