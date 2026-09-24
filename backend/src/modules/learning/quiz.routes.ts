import { Router } from 'express';
import * as Controller from './quiz.controller.js';
import { validate } from '../../common/middleware/validate.js';
import { authenticate, authorize } from '../../common/middleware/auth.js';
import { asyncHandler } from '../../common/utils/asyncHandler.js';
import { createQuizSchema, submitQuizSchema } from './quiz.validation.js';

const router = Router();
const requireAuth = asyncHandler(authenticate);
const isInstructor = [requireAuth, authorize('create_course')];

// --- Student ---
router.get('/me/quizzes/:quizId', requireAuth, asyncHandler(Controller.getQuiz));
router.post('/me/quizzes/:quizId/start', requireAuth, asyncHandler(Controller.startQuiz));
router.post('/me/quizzes/:quizId/submit', requireAuth, validate(submitQuizSchema), asyncHandler(Controller.submitQuiz));
router.get('/me/quizzes/:quizId/result', requireAuth, asyncHandler(Controller.getQuizResult));
router.get('/me/quizzes', requireAuth, asyncHandler(Controller.getMyQuizzes));

// --- Instructor ---
router.get('/instructor/quizzes', isInstructor, asyncHandler(Controller.getInstructorQuizzes));
router.get('/instructor/quizzes/:quizId', isInstructor, asyncHandler(Controller.getQuizForInstructor));
router.get('/instructor/quizzes/:quizId/attempts', isInstructor, asyncHandler(Controller.getQuizAttemptsForInstructor));
router.post('/instructor/quizzes', isInstructor, validate(createQuizSchema), asyncHandler(Controller.createInstructorQuiz));
router.post('/instructor/lessons/:lessonId/quizzes', isInstructor, validate(createQuizSchema), asyncHandler(Controller.createQuiz));
router.patch('/instructor/quizzes/:quizId', isInstructor, asyncHandler(Controller.updateQuiz));
router.delete('/instructor/quizzes/:quizId', isInstructor, asyncHandler(Controller.deleteQuiz));

export default router;
