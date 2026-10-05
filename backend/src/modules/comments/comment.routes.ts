import { Router } from 'express';
import * as Controller from './comment.controller.js';
import { authenticate, authorize } from '../../common/middleware/auth.js';
import { asyncHandler } from '../../common/utils/asyncHandler.js';

const router = Router();
const requireAuth = asyncHandler(authenticate);
const isAdmin = [requireAuth, authorize('admin.access')];

// 1. Public comments retrieval for Course / Class
router.get('/comments', asyncHandler(Controller.getPublicComments));

// 2. Authenticated user comments and replies
router.post('/comments', requireAuth, asyncHandler(Controller.addComment));
router.post('/comments/:id/reply', requireAuth, asyncHandler(Controller.replyAsInstructor));

// 3. Admin / Super Admin moderation routes
router.get('/admin/comments/v2', isAdmin, asyncHandler(Controller.getAdminComments));
router.patch('/admin/comments/v2/:id/status', isAdmin, asyncHandler(Controller.moderateComment));
router.delete('/admin/comments/v2/:id', isAdmin, asyncHandler(Controller.deleteComment));

export default router;
