import { Router } from "express";
import * as Controller from "./home.controller.js";
import { authenticate, authorize } from "../../common/middleware/auth.js";
import { asyncHandler } from "../../common/utils/asyncHandler.js";

const router = Router();
const requireAuth = asyncHandler(authenticate);
const isAdmin = [requireAuth, authorize('admin.access')];

router.get("/", asyncHandler(Controller.getHomeData));

// Testimonials management
router.get("/admin/testimonials", isAdmin, asyncHandler(Controller.getAllTestimonialsAdmin));
router.post("/admin/testimonials", isAdmin, asyncHandler(Controller.createTestimonial));
router.put("/admin/testimonials/:id", isAdmin, asyncHandler(Controller.updateTestimonial));
router.delete("/admin/testimonials/:id", isAdmin, asyncHandler(Controller.deleteTestimonial));

export default router;
