import { Router } from 'express';
import * as Controller from './assignment.controller.js';
import { validate } from '../../common/middleware/validate.js';
import { authenticate, authorize } from '../../common/middleware/auth.js';
import { asyncHandler } from '../../common/utils/asyncHandler.js';
import { createAssignmentSchema, submitAssignmentSchema, gradeSubmissionSchema } from './assignment.validation.js';

const router = Router();
const requireAuth = asyncHandler(authenticate);
const isInstructor = [requireAuth, authorize('create_course')];

// --- Public / Student ---
router.get('/lessons/:lessonId/assignments', asyncHandler(Controller.getLessonAssignments));

router.get('/me/submissions', requireAuth, asyncHandler(Controller.getMySubmissions));
router.post('/assignments/:assignmentId/submit', requireAuth, validate(submitAssignmentSchema), asyncHandler(Controller.submitAssignment));
router.get('/me/assignments', requireAuth, asyncHandler(Controller.getMyAssignments));
router.get('/me/assignments/:id', requireAuth, asyncHandler(Controller.getMyAssignmentDetails));

// --- Instructor ---
router.post('/instructor/assignments', isInstructor, validate(createAssignmentSchema), asyncHandler(Controller.createInstructorAssignment));
router.post('/instructor/lessons/:lessonId/assignments', isInstructor, validate(createAssignmentSchema), asyncHandler(Controller.createAssignment));
router.get('/instructor/assignments', isInstructor, asyncHandler(Controller.getInstructorAssignments));
router.get('/instructor/submissions', isInstructor, asyncHandler(Controller.getInstructorSubmissions));
router.get('/instructor/assignments/:assignmentId/submissions', isInstructor, asyncHandler(Controller.getSubmissions));
router.patch('/instructor/submissions/:submissionId/grade', isInstructor, validate(gradeSubmissionSchema), asyncHandler(Controller.gradeSubmission));
router.patch('/instructor/assignments/:assignmentId', isInstructor, asyncHandler(Controller.updateAssignment));
router.delete('/instructor/assignments/:assignmentId', isInstructor, asyncHandler(Controller.deleteAssignment));

export default router;
