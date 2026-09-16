import { Request, Response } from 'express';
import { CourseService } from './course.service.js';
import { sendSuccess } from '../../common/utils/response.js';
import { AuthRequest } from '../../common/middleware/auth.js';

export const createCourse = async (req: AuthRequest, res: Response) => {
  const result = await CourseService.createCourse(req.user._id, req.body);
  sendSuccess(res, result, 'Course created successfully', 201);
};

export const getCourses = async (req: Request, res: Response) => {
  const result = await CourseService.getCourses(req.query);
  sendSuccess(res, result, 'Courses retrieved successfully');
};

export const getCourseBySlug = async (req: Request, res: Response) => {
  const result = await CourseService.getCourseBySlug(req.params.slug as string);
  sendSuccess(res, result, 'Course retrieved successfully');
};

export const getRelatedCourses = async (req: Request, res: Response) => {
  const result = await CourseService.getRelatedCourses(req.params.id as string);
  sendSuccess(res, result, 'Related courses retrieved successfully');
};

export const getInstructorCourses = async (req: AuthRequest, res: Response) => {
  const result = await CourseService.getInstructorCourses(req.user._id, req.query);
  sendSuccess(res, result, 'Instructor courses retrieved successfully');
};

export const getInstructorStats = async (req: AuthRequest, res: Response) => {
  const result = await CourseService.getInstructorStats(req.user._id);
  sendSuccess(res, result, 'Instructor stats retrieved successfully');
};

export const updateCourse = async (req: AuthRequest, res: Response) => {
  const result = await CourseService.updateCourse(req.params.id as string, req.user._id, req.body);
  sendSuccess(res, result, 'Course updated successfully');
};

// Workflows
export const requestReview = async (req: AuthRequest, res: Response) => {
  const result = await CourseService.requestReview(req.params.id as string, req.user._id);
  sendSuccess(res, result, 'Course submitted for review');
};

export const getAdminCourses = async (req: AuthRequest, res: Response) => {
  const result = await CourseService.getAdminCourses(req.query);
  sendSuccess(res, result, 'Admin courses retrieved successfully');
};

export const publishCourse = async (req: Request, res: Response) => {
  const result = await CourseService.publishCourse(req.params.id as string);
  sendSuccess(res, result, 'Course published successfully');
};

export const rejectCourse = async (req: Request, res: Response) => {
  const result = await CourseService.rejectCourse(req.params.id as string, req.body.reason);
  sendSuccess(res, result, 'Course rejected');
};

// Chapters
export const createChapter = async (req: AuthRequest, res: Response) => {
  const result = await CourseService.createChapter(req.params.courseId as string, req.user._id, req.body);
  sendSuccess(res, result, 'Chapter created successfully', 201);
};

export const getChapters = async (req: Request, res: Response) => {
  const result = await CourseService.getChapters(req.params.courseId as string);
  sendSuccess(res, result, 'Chapters retrieved successfully');
};

// Lessons
export const createLesson = async (req: AuthRequest, res: Response) => {
  const result = await CourseService.createLesson(req.params.chapterId as string, req.user._id, req.body);
  sendSuccess(res, result, 'Lesson created successfully', 201);
};

export const getLessons = async (req: Request, res: Response) => {
  const result = await CourseService.getLessons(req.params.chapterId as string);
  sendSuccess(res, result, 'Lessons retrieved successfully');
};

export const getCourseStudents = async (req: AuthRequest, res: Response) => {
  const result = await CourseService.getCourseStudents(req.params.courseId, req.query);
  sendSuccess(res, result, 'Students retrieved successfully');
};

  export const getInstructorCourseById = async (req: AuthRequest, res: Response) => {
    const course = await CourseService.getInstructorCourseById(req.params.id, req.user._id as string);
    sendSuccess(res, course, 'Course retrieved successfully');
  };
  