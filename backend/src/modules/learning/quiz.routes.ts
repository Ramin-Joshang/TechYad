import { Router } from 'express';
import * as Controller from './quiz.controller.js';
import { validate } from '../../common/middleware/validate.js';
import { authenticate, authorize } from '../../common/middleware/auth.js';
import { asyncHandler } from '../../common/utils/asyncHandler.js';
import { createQuizSchema, submitQuizSchema } from './quiz.validation.js';

const router = Router();
const requireAuth = asyncHandler(authenticate);
const isInstructor = [requireAuth, authorize('courses.manage')]; // Simplified

// --- Student ---
router.get('/me/quizzes/:quizId', requireAuth, asyncHandler(Controller.getQuiz));
router.post('/me/quizzes/:quizId/start', requireAuth, asyncHandler(Controller.startQuiz));
router.post('/me/quizzes/:quizId/submit', requireAuth, validate(submitQuizSchema), asyncHandler(Controller.submitQuiz));
router.get('/me/quizzes/:quizId/result', requireAuth, asyncHandler(Controller.getQuizResult));

// --- Instructor ---
router.post('/instructor/lessons/:lessonId/quizzes', isInstructor, validate(createQuizSchema), asyncHandler(Controller.createQuiz));

export default router;

router.get('/me/quizzes', requireAuth, asyncHandler(Controller.getMyQuizzes));
