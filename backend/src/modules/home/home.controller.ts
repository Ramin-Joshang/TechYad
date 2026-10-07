import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { Course } from "../courses/course.model.js";
import { Category } from "../catalog/category.model.js";
import { Article } from "../blog/article.model.js";
import { InstructorProfile } from "../instructors/instructor-profile.model.js";
import { Testimonial } from "./testimonial.model.js";
import { User } from "../auth/user.model.js";
import { Role } from "../auth/role.model.js";
import { Class, getClassPhase, isClassRegistrationOpen } from "../classes/class.model.js";

export const getHomeData = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (mongoose.connection.readyState !== 1) {
       return res.status(503).json({
          success: false,
          message: "Database connection is not established. Please ensure MongoDB is running locally (port 27017) or check your MONGO_URI.",
          data: {}
       });
    }

    const categories = await Category.find({ isActive: true }).limit(8);
    const popularCourses = await Course.find({ status: "published" }).sort({ totalLessons: -1 }).limit(4).populate('instructors', 'firstName lastName avatar personnelPhoto specialty');
    const newCourses = await Course.find({ status: "published" }).sort({ createdAt: -1 }).limit(4).populate('instructors', 'firstName lastName avatar personnelPhoto specialty');
    const freeCourses = await Course.find({ status: "published", price: 0 }).limit(4).populate('instructors', 'firstName lastName avatar personnelPhoto specialty');
    
    // Classes: Fetch interactive live classes and in-person workshops from Class model if available, fallback to tagged courses
    let rawOnlineClasses: any[] = await Class.find({ mode: 'online', status: 'published' }).limit(4).populate('instructors', 'firstName lastName avatar personnelPhoto specialty');
    let onlineClasses = rawOnlineClasses.map((c: any) => {
      const obj = c.toObject();
      return { ...obj, phase: getClassPhase(obj), isRegistrationOpen: isClassRegistrationOpen(obj) };
    });
    if (!onlineClasses || onlineClasses.length === 0) {
      onlineClasses = await Course.find({ status: "published", tags: "آنلاین" }).limit(4).populate('instructors', 'firstName lastName avatar personnelPhoto specialty');
    }

    let rawInPersonClasses: any[] = await Class.find({ mode: 'in_person', status: 'published' }).limit(4).populate('instructors', 'firstName lastName avatar personnelPhoto specialty');
    let inPersonClasses = rawInPersonClasses.map((c: any) => {
      const obj = c.toObject();
      return { ...obj, phase: getClassPhase(obj), isRegistrationOpen: isClassRegistrationOpen(obj) };
    });
    if (!inPersonClasses || inPersonClasses.length === 0) {
      inPersonClasses = await Course.find({ status: "published", tags: "حضوری" }).limit(4).populate('instructors', 'firstName lastName avatar personnelPhoto specialty');
    }

    const topInstructors = await InstructorProfile.find({ isApproved: true })
      .limit(8)
      .populate('userId', 'firstName lastName avatar personnelPhoto specialty bio')
      .lean();
    const latestArticles = await Article.find({ status: "published" }).sort({ createdAt: -1 }).limit(4);
    const testimonials = await Testimonial.find({ isActive: { $ne: false } }).sort({ order: 1, createdAt: -1 }).limit(6);

    res.status(200).json({
      success: true,
      data: {
        categories,
        popularCourses,
        newCourses,
        freeCourses,
        onlineClasses,
        inPersonClasses,
        topInstructors,
        latestArticles,
        testimonials,
      }
    });
  } catch (error) {
    console.error("Error in getHomeData:", error);
    next(error);
  }
};

// ==================== Testimonial CRUD for Admin ====================
export const getAllTestimonialsAdmin = async (req: Request, res: Response) => {
  const testimonials = await Testimonial.find().sort({ order: 1, createdAt: -1 });
  res.status(200).json({ success: true, data: testimonials, message: 'All testimonials retrieved' });
};

export const createTestimonial = async (req: Request, res: Response) => {
  const testimonial = await Testimonial.create(req.body);
  res.status(201).json({ success: true, data: testimonial, message: 'Testimonial created successfully' });
};

export const updateTestimonial = async (req: Request, res: Response) => {
  const testimonial = await Testimonial.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!testimonial) {
    return res.status(404).json({ success: false, message: 'Testimonial not found' });
  }
  res.status(200).json({ success: true, data: testimonial, message: 'Testimonial updated successfully' });
};

export const deleteTestimonial = async (req: Request, res: Response) => {
  await Testimonial.findByIdAndDelete(req.params.id);
  res.status(200).json({ success: true, data: null, message: 'Testimonial deleted successfully' });
};
