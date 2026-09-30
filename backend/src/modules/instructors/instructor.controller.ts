import { Request, Response } from 'express';
import { InstructorService } from './instructor.service.js';
import { sendSuccess } from '../../common/utils/response.js';
import { AuthRequest } from '../../common/middleware/auth.js';

export const getPublicInstructors = async (req: Request, res: Response) => {
  const result = await InstructorService.getPublicInstructors();
  sendSuccess(res, result, 'Instructors retrieved successfully');
};

export const getInstructorBySlug = async (req: Request, res: Response) => {
  const result = await InstructorService.getInstructorBySlug(req.params.id as string);
  sendSuccess(res, result, 'Instructor profile retrieved successfully');
};

export const getMyProfile = async (req: AuthRequest, res: Response) => {
  const result = await InstructorService.getMyProfile(req.user._id as string);
  sendSuccess(res, result, 'Instructor profile retrieved successfully');
};

export const updateMyProfile = async (req: AuthRequest, res: Response) => {
  const result = await InstructorService.updateMyProfile(req.user._id as string, req.body);
  sendSuccess(res, result, 'Instructor profile updated successfully');
};

export const getMyEarnings = async (req: AuthRequest, res: Response) => {
  const result = await InstructorService.getInstructorEarnings(req.user._id as string);
  sendSuccess(res, result, 'Earnings retrieved successfully');
};
