import searchRoutes from "../modules/search/search.routes.js";
import { Router } from 'express';
import { sendSuccess } from '../common/utils/response.js';
import authRoutes from '../modules/auth/auth.routes.js';
import catalogRoutes from '../modules/catalog/catalog.routes.js';
import courseRoutes from '../modules/courses/course.routes.js';
import learningRoutes from '../modules/learning/learning.routes.js';
import commerceRoutes from '../modules/commerce/commerce.routes.js';
import assignmentRoutes from '../modules/learning/assignment.routes.js';
import quizRoutes from '../modules/learning/quiz.routes.js';
import communityRoutes from '../modules/community/community.routes.js';
import mediaRoutes from '../modules/media/media.routes.js';
import blogRoutes from '../modules/blog/blog.routes.js';
import notificationRoutes from '../modules/notifications/notification.routes.js';
import supportRoutes from '../modules/support/support.routes.js';
import instructorRoutes from '../modules/instructors/instructor.routes.js';
import classRoutes from '../modules/classes/class.routes.js';
import adminRoutes from '../modules/admin/admin.routes.js';
import homeRoutes from '../modules/home/home.routes.js';
import generalRoutes from '../modules/general/general.routes.js';
import referralRoutes from '../modules/referral/referral.routes.js';
import walletRoutes from '../modules/wallet/wallet.routes.js';

const router = Router();


// Health check endpoint
import mongoose from 'mongoose';

router.get('/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus = dbState === 1 ? 'connected' : dbState === 2 ? 'connecting' : dbState === 3 ? 'disconnecting' : 'disconnected';
  
  sendSuccess(res, { 
    timestamp: new Date().toISOString(),
    api: 'ok',
    database: dbStatus,
    storage: 'Not Configured',
    externalIntegrations: 'Not Configured'
  }, 'System status retrieved');
});

router.use('/home', homeRoutes);
router.use('/auth', authRoutes);
router.use('/', catalogRoutes);
router.use('/', courseRoutes);
router.use('/', learningRoutes);
router.use('/', commerceRoutes);
router.use('/', assignmentRoutes);
router.use('/', quizRoutes);
router.use('/', communityRoutes);
router.use('/', mediaRoutes);
router.use('/blog', blogRoutes);
router.use('/', notificationRoutes);
router.use('/', supportRoutes);
router.use('/', instructorRoutes);
router.use('/', classRoutes);
router.use('/', adminRoutes);
router.use('/', generalRoutes);
router.use('/', referralRoutes);
router.use('/', walletRoutes);

router.use("/", searchRoutes);
export default router;
