import { Request, Response } from 'express';
import { ClassService } from './class.service.js';
import { sendSuccess } from '../../common/utils/response.js';
import { AuthRequest } from '../../common/middleware/auth.js';

export const getClasses = async (req: Request, res: Response) => {
  const result = await ClassService.getClasses();
  sendSuccess(res, result, 'Classes retrieved successfully');
};

export const getClassBySlug = async (req: Request, res: Response) => {
  const result = await ClassService.getClassBySlug(req.params.slug as string);
  sendSuccess(res, result, 'Class details retrieved successfully');
};

export const createClass = async (req: AuthRequest, res: Response) => {
  const result = await ClassService.createClass(req.user._id as string, req.body);
  sendSuccess(res, result, 'Class created successfully', 201);
};

export const getMyClasses = async (req: AuthRequest, res: Response) => {
  const result = await ClassService.getMyClasses(req.user._id as string);
  sendSuccess(res, result, 'Your classes retrieved successfully');
};

export const joinOnlineClass = async (req: AuthRequest, res: Response) => {
  const result = await ClassService.joinOnlineClass(req.user._id as string, req.params.id as string);
  sendSuccess(res, result, 'Join link generated successfully');
};

export const getInstructorClasses = async (req: AuthRequest, res: Response) => {
  const result = await ClassService.getInstructorClasses(req.user._id as string);
  sendSuccess(res, result, 'Instructor classes retrieved successfully');
};
