import { Router } from 'express';
import * as Controller from './course.controller.js';
import { validate } from '../../common/middleware/validate.js';
import { authenticate, authorize } from '../../common/middleware/auth.js';
import { asyncHandler } from '../../common/utils/asyncHandler.js';
import {
  createCourseSchema,
  updateCourseSchema,
  createChapterSchema,
  createLessonSchema
} from './course.validation.js';
import * as CommentController from './comment.controller.js';

const router = Router();

// Middlewares
const requireAuth = asyncHandler(authenticate);
const isAdmin = [requireAuth, authorize('courses.publish')];
const isInstructor = [requireAuth, authorize('create_course')];

// --- Public Routes ---
router.get('/courses', asyncHandler(Controller.getCourses));
router.get('/courses/:slug', asyncHandler(Controller.getCourseBySlug));
router.get('/courses/:id/related', asyncHandler(Controller.getRelatedCourses));
router.get('/courses/:courseId/chapters', asyncHandler(Controller.getChapters));
router.get('/chapters/:chapterId/lessons', asyncHandler(Controller.getLessons));
router.get('/lessons/:lessonId/comments', asyncHandler(CommentController.getLessonComments));

// --- Auth Routes ---
router.post('/lessons/:lessonId/comments', requireAuth, asyncHandler(CommentController.addLessonComment));

// --- Instructor Routes ---
router.get('/instructor/courses', isInstructor, asyncHandler(Controller.getInstructorCourses));
router.get('/instructor/courses/:id', isInstructor, asyncHandler(Controller.getInstructorCourseById));
router.get('/instructor/stats', isInstructor, asyncHandler(Controller.getInstructorStats));
router.get('/instructor/comments', isInstructor, asyncHandler(CommentController.getInstructorComments));
router.get('/instructor/courses/:courseId/students', isInstructor, asyncHandler(Controller.getCourseStudents));
router.post('/instructor/courses', isInstructor, validate(createCourseSchema), asyncHandler(Controller.createCourse));
router.patch('/instructor/courses/:id', isInstructor, validate(updateCourseSchema), asyncHandler(Controller.updateCourse));
router.post('/instructor/courses/:id/request-review', isInstructor, asyncHandler(Controller.requestReview));
router.post('/instructor/courses/:courseId/chapters', isInstructor, validate(createChapterSchema), asyncHandler(Controller.createChapter));
router.post('/instructor/chapters/:chapterId/lessons', isInstructor, validate(createLessonSchema), asyncHandler(Controller.createLesson));

// --- Admin Routes ---
router.get('/admin/courses', isAdmin, asyncHandler(Controller.getAdminCourses));
router.post('/admin/courses/:id/publish', isAdmin, asyncHandler(Controller.publishCourse));
router.post('/admin/courses/:id/reject', isAdmin, asyncHandler(Controller.rejectCourse));

export default router;

router.patch('/instructor/chapters/:chapterId', isInstructor, asyncHandler(Controller.updateChapter));
router.delete('/instructor/chapters/:chapterId', isInstructor, asyncHandler(Controller.deleteChapter));
router.patch('/instructor/lessons/:lessonId', isInstructor, asyncHandler(Controller.updateLesson));
router.delete('/instructor/lessons/:lessonId', isInstructor, asyncHandler(Controller.deleteLesson));
