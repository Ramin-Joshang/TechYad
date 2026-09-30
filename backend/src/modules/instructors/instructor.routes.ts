import { Router } from 'express';
import * as Controller from './instructor.controller.js';
import { authenticate, authorize } from '../../common/middleware/auth.js';
import { asyncHandler } from '../../common/utils/asyncHandler.js';

const router = Router();
const requireAuth = asyncHandler(authenticate);
const isInstructor = [requireAuth, authorize(['create_course', 'create_class', 'courses.manage'])];

// Public routes
router.get('/instructors', asyncHandler(Controller.getPublicInstructors));
router.get('/instructors/:id', asyncHandler(Controller.getInstructorBySlug));

// Instructor dashboard routes
router.get('/instructor/profile', isInstructor, asyncHandler(Controller.getMyProfile));
router.put('/instructor/profile', isInstructor, asyncHandler(Controller.updateMyProfile));
router.patch('/instructor/profile', isInstructor, asyncHandler(Controller.updateMyProfile));
router.get('/instructor/earnings', isInstructor, asyncHandler(Controller.getMyEarnings));

export default router;
