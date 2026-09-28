import { Router } from 'express';
import * as Controller from './class.controller.js';
import { authenticate, authorize } from '../../common/middleware/auth.js';
import { asyncHandler } from '../../common/utils/asyncHandler.js';

const router = Router();
const requireAuth = asyncHandler(authenticate);
const isInstructor = [requireAuth, authorize('create_class')];
const isInstructorOrAdmin = [requireAuth]; // Verified inside service or controller based on class instructors

// Public routes
router.get('/classes', asyncHandler(Controller.getClasses));
router.get('/classes/:slug', asyncHandler(Controller.getClassBySlug));

// Instructor routes
router.get('/instructor/classes', isInstructor, asyncHandler(Controller.getInstructorClasses));
router.post('/instructor/classes', isInstructor, asyncHandler(Controller.createClass));
router.patch('/instructor/classes/:id', isInstructor, asyncHandler(Controller.updateClass));
router.delete('/instructor/classes/:id', isInstructor, asyncHandler(Controller.deleteClass));

// Student routes
router.get('/me/classes', requireAuth, asyncHandler(Controller.getMyClasses));
router.get('/classes/:id/enrollment', requireAuth, asyncHandler(Controller.getClassEnrollmentStatus));
router.post('/classes/:id/enroll-free', requireAuth, asyncHandler(Controller.enrollFreeClass));
router.get('/classes/:id/join', requireAuth, asyncHandler(Controller.joinOnlineClass));

// Direct Registration with Wallet & Pre-registration (Deposit)
router.post('/classes/:id/register', requireAuth, asyncHandler(Controller.registerForClass));
router.post('/classes/:id/pay-remaining', requireAuth, asyncHandler(Controller.payClassRemainingBalance));

// Attendance & Students Tracking
router.get('/classes/:id/attendance', requireAuth, asyncHandler(Controller.getClassAttendance));
router.post('/classes/:id/attendance', requireAuth, asyncHandler(Controller.takeSessionAttendance));
router.get('/classes/:id/students', requireAuth, asyncHandler(Controller.getClassStudents));

// Admin routes
const isAdmin = [requireAuth, authorize('classes.manage')];
router.get('/admin/classes', isAdmin, asyncHandler(Controller.getAdminClasses));
router.post('/admin/classes', isAdmin, asyncHandler(Controller.createClass));
router.patch('/admin/classes/:id', isAdmin, asyncHandler(Controller.adminUpdateClass));
router.delete('/admin/classes/:id', isAdmin, asyncHandler(Controller.adminDeleteClass));

export default router;
