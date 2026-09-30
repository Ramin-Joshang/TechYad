import { Router } from 'express';
import * as Controller from './general.controller.js';
import { authenticate, authorize } from '../../common/middleware/auth.js';
import { asyncHandler } from '../../common/utils/asyncHandler.js';

const router = Router();
const requireAuth = asyncHandler(authenticate);
const isAdmin = [requireAuth, authorize('admin.access')];

// FAQs
router.get('/faqs', asyncHandler(Controller.getFaqs));
router.get('/admin/faqs', isAdmin, asyncHandler(Controller.getAllFaqsAdmin));
router.post('/admin/faqs', isAdmin, asyncHandler(Controller.createFaq));
router.put('/admin/faqs/:id', isAdmin, asyncHandler(Controller.updateFaq));
router.delete('/admin/faqs/:id', isAdmin, asyncHandler(Controller.deleteFaq));

// Contact Messages
router.post('/contact', asyncHandler(Controller.submitContact));
router.get('/admin/contacts', isAdmin, asyncHandler(Controller.getContactsAdmin));
router.patch('/admin/contacts/:id', isAdmin, asyncHandler(Controller.updateContactStatus));
router.delete('/admin/contacts/:id', isAdmin, asyncHandler(Controller.deleteContact));

// Careers & Job Positions
router.get('/careers/positions', asyncHandler(Controller.getJobPositions));
router.get('/admin/careers/positions', isAdmin, asyncHandler(Controller.getAllJobPositionsAdmin));
router.post('/admin/careers/positions', isAdmin, asyncHandler(Controller.createJobPosition));
router.put('/admin/careers/positions/:id', isAdmin, asyncHandler(Controller.updateJobPosition));
router.delete('/admin/careers/positions/:id', isAdmin, asyncHandler(Controller.deleteJobPosition));

// Career Applications
router.post('/careers', asyncHandler(Controller.submitCareer));
router.get('/admin/careers/applications', isAdmin, asyncHandler(Controller.getCareerApplicationsAdmin));
router.patch('/admin/careers/applications/:id', isAdmin, asyncHandler(Controller.updateCareerApplicationStatus));
router.delete('/admin/careers/applications/:id', isAdmin, asyncHandler(Controller.deleteCareerApplication));

export default router;
