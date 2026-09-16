const fs = require('fs');

// ASSIGNMENTS
let assignService = fs.readFileSync('backend/src/modules/learning/assignment.service.ts', 'utf8');
if (!assignService.includes('updateAssignment')) {
  const newAssignMethods = `
  static async updateAssignment(assignmentId: string, instructorId: string, data: any) {
    const Assignment = require('./assignment.model').Assignment;
    const Course = require('../courses/course.model').Course;
    const Lesson = require('../courses/lesson.model').Lesson;

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) throw new AppError('Assignment not found', 404, 'NOT_FOUND');
    const lesson = await Lesson.findById(assignment.lessonId);
    const course = await Course.findOne({ _id: lesson.courseId, instructors: instructorId });
    if (!course) throw new AppError('Unauthorized', 403, 'FORBIDDEN');

    return await Assignment.findByIdAndUpdate(assignmentId, data, { new: true });
  }

  static async deleteAssignment(assignmentId: string, instructorId: string) {
    const Assignment = require('./assignment.model').Assignment;
    const Course = require('../courses/course.model').Course;
    const Lesson = require('../courses/lesson.model').Lesson;

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) throw new AppError('Assignment not found', 404, 'NOT_FOUND');
    const lesson = await Lesson.findById(assignment.lessonId);
    const course = await Course.findOne({ _id: lesson.courseId, instructors: instructorId });
    if (!course) throw new AppError('Unauthorized', 403, 'FORBIDDEN');

    await Assignment.findByIdAndDelete(assignmentId);
    return { success: true };
  }
  `;
  assignService = assignService.replace('static async createAssignment', newAssignMethods + '\n  static async createAssignment');
  fs.writeFileSync('backend/src/modules/learning/assignment.service.ts', assignService);
}

let assignCtrl = fs.readFileSync('backend/src/modules/learning/assignment.controller.ts', 'utf8');
if (!assignCtrl.includes('updateAssignment')) {
  fs.writeFileSync('backend/src/modules/learning/assignment.controller.ts', assignCtrl + `
export const updateAssignment = async (req: AuthRequest, res: Response) => {
  const result = await AssignmentService.updateAssignment(req.params.assignmentId, req.user._id as string, req.body);
  sendSuccess(res, result, 'Assignment updated successfully');
};
export const deleteAssignment = async (req: AuthRequest, res: Response) => {
  const result = await AssignmentService.deleteAssignment(req.params.assignmentId, req.user._id as string);
  sendSuccess(res, result, 'Assignment deleted successfully');
};
`);
}

let assignRoutes = fs.readFileSync('backend/src/modules/learning/assignment.routes.ts', 'utf8');
if (!assignRoutes.includes('updateAssignment')) {
  assignRoutes += `
router.patch('/instructor/assignments/:assignmentId', isInstructor, asyncHandler(Controller.updateAssignment));
router.delete('/instructor/assignments/:assignmentId', isInstructor, asyncHandler(Controller.deleteAssignment));
`;
  fs.writeFileSync('backend/src/modules/learning/assignment.routes.ts', assignRoutes);
}

// QUIZZES
let quizService = fs.readFileSync('backend/src/modules/learning/quiz.service.ts', 'utf8');
if (!quizService.includes('updateQuiz')) {
  const newQuizMethods = `
  static async updateQuiz(quizId: string, instructorId: string, data: any) {
    const Quiz = require('./quiz.model').Quiz;
    const Course = require('../courses/course.model').Course;
    const Lesson = require('../courses/lesson.model').Lesson;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) throw new AppError('Quiz not found', 404, 'NOT_FOUND');
    const lesson = await Lesson.findById(quiz.lessonId);
    const course = await Course.findOne({ _id: lesson.courseId, instructors: instructorId });
    if (!course) throw new AppError('Unauthorized', 403, 'FORBIDDEN');

    return await Quiz.findByIdAndUpdate(quizId, data, { new: true });
  }

  static async deleteQuiz(quizId: string, instructorId: string) {
    const Quiz = require('./quiz.model').Quiz;
    const Course = require('../courses/course.model').Course;
    const Lesson = require('../courses/lesson.model').Lesson;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) throw new AppError('Quiz not found', 404, 'NOT_FOUND');
    const lesson = await Lesson.findById(quiz.lessonId);
    const course = await Course.findOne({ _id: lesson.courseId, instructors: instructorId });
    if (!course) throw new AppError('Unauthorized', 403, 'FORBIDDEN');

    await Quiz.findByIdAndDelete(quizId);
    return { success: true };
  }
  `;
  quizService = quizService.replace('static async createQuiz', newQuizMethods + '\n  static async createQuiz');
  fs.writeFileSync('backend/src/modules/learning/quiz.service.ts', quizService);
}

let quizCtrl = fs.readFileSync('backend/src/modules/learning/quiz.controller.ts', 'utf8');
if (!quizCtrl.includes('updateQuiz')) {
  fs.writeFileSync('backend/src/modules/learning/quiz.controller.ts', quizCtrl + `
export const updateQuiz = async (req: AuthRequest, res: Response) => {
  const result = await QuizService.updateQuiz(req.params.quizId, req.user._id as string, req.body);
  sendSuccess(res, result, 'Quiz updated successfully');
};
export const deleteQuiz = async (req: AuthRequest, res: Response) => {
  const result = await QuizService.deleteQuiz(req.params.quizId, req.user._id as string);
  sendSuccess(res, result, 'Quiz deleted successfully');
};
`);
}

let quizRoutes = fs.readFileSync('backend/src/modules/learning/quiz.routes.ts', 'utf8');
if (!quizRoutes.includes('updateQuiz')) {
  quizRoutes += `
router.patch('/instructor/quizzes/:quizId', isInstructor, asyncHandler(Controller.updateQuiz));
router.delete('/instructor/quizzes/:quizId', isInstructor, asyncHandler(Controller.deleteQuiz));
`;
  fs.writeFileSync('backend/src/modules/learning/quiz.routes.ts', quizRoutes);
}

