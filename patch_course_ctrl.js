const fs = require('fs');
let controller = fs.readFileSync('backend/src/modules/courses/course.controller.ts', 'utf8');

const newMethods = `
export const updateChapter = async (req: AuthRequest, res: Response) => {
  const result = await CourseService.updateChapter(req.params.chapterId, req.user._id as string, req.body);
  sendSuccess(res, result, 'Chapter updated successfully');
};
export const deleteChapter = async (req: AuthRequest, res: Response) => {
  const result = await CourseService.deleteChapter(req.params.chapterId, req.user._id as string);
  sendSuccess(res, result, 'Chapter deleted successfully');
};
export const updateLesson = async (req: AuthRequest, res: Response) => {
  const result = await CourseService.updateLesson(req.params.lessonId, req.user._id as string, req.body);
  sendSuccess(res, result, 'Lesson updated successfully');
};
export const deleteLesson = async (req: AuthRequest, res: Response) => {
  const result = await CourseService.deleteLesson(req.params.lessonId, req.user._id as string);
  sendSuccess(res, result, 'Lesson deleted successfully');
};
`;
if (!controller.includes('updateChapter')) {
    fs.writeFileSync('backend/src/modules/courses/course.controller.ts', controller + newMethods);
}

let routes = fs.readFileSync('backend/src/modules/courses/course.routes.ts', 'utf8');
const newRoutes = `
router.patch('/instructor/chapters/:chapterId', isInstructor, asyncHandler(Controller.updateChapter));
router.delete('/instructor/chapters/:chapterId', isInstructor, asyncHandler(Controller.deleteChapter));
router.patch('/instructor/lessons/:lessonId', isInstructor, asyncHandler(Controller.updateLesson));
router.delete('/instructor/lessons/:lessonId', isInstructor, asyncHandler(Controller.deleteLesson));
`;
if (!routes.includes('updateChapter')) {
    fs.writeFileSync('backend/src/modules/courses/course.routes.ts', routes + newRoutes);
}
