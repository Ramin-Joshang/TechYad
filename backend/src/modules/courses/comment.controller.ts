import { Request, Response } from 'express';
import { sendSuccess } from '../../common/utils/response.js';
import { LessonComment } from './lesson-comment.model.js';
import { AuthRequest } from '../../common/middleware/auth.js';

export const getLessonComments = async (req: Request, res: Response) => {
  const comments = await LessonComment.find({ 
    lessonId: req.params.lessonId as string, 
    status: 'approved' 
  }).populate('userId', 'firstName lastName avatar').sort({ createdAt: -1 });
  
  sendSuccess(res, comments, 'Comments retrieved successfully');
};

export const addLessonComment = async (req: AuthRequest, res: Response) => {
  const comment = await LessonComment.create({
    lessonId: req.params.lessonId as string,
    userId: req.user._id,
    text: req.body.text,
    parentId: req.body.parentId,
    status: 'approved' // Automatically approved for demo
  });
  
  sendSuccess(res, comment, 'Comment added successfully', 201);
};

export const getInstructorComments = async (req: AuthRequest, res: Response) => {
  // Simple implementation: fetch all comments for now, or filter by course owner
  const comments = await LessonComment.find()
    .populate('userId', 'firstName lastName avatar')
    .populate('lessonId', 'title')
    .sort({ createdAt: -1 })
    .limit(50);
  sendSuccess(res, comments, 'Instructor comments retrieved');
};
