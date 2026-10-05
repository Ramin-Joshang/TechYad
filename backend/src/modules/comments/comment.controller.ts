import { Request, Response } from 'express';
import { CommentService } from './comment.service.js';
import { sendSuccess } from '../../common/utils/response.js';
import { AuthRequest } from '../../common/middleware/auth.js';

export const addComment = async (req: AuthRequest, res: Response) => {
  const userId = req.user._id.toString();
  const userRole = req.user.role || 'student';
  const result = await CommentService.addComment(userId, userRole, req.body, req);
  sendSuccess(res, result, 'دیدگاه با موفقیت ثبت شد و پس از بررسی منتشر خواهد شد', 201);
};

export const replyAsInstructor = async (req: AuthRequest, res: Response) => {
  const instructorId = req.user._id.toString();
  const result = await CommentService.replyAsInstructor(
    instructorId, 
    req.params.id as string, 
    req.body.content, 
    req
  );
  sendSuccess(res, result, 'پاسخ مدرس با موفقیت منتشر گردید', 201);
};

export const getPublicComments = async (req: Request, res: Response) => {
  const result = await CommentService.getApprovedComments({
    courseId: req.query.courseId as string,
    courseSlug: req.query.courseSlug as string,
    classId: req.query.classId as string,
    classSlug: req.query.classSlug as string,
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 10
  });
  sendSuccess(res, result, 'لیست دیدگاه‌ها با موفقیت دریافت شد');
};

export const getAdminComments = async (req: Request, res: Response) => {
  const result = await CommentService.getAdminComments({
    status: req.query.status as string,
    targetType: req.query.targetType as string,
    search: req.query.search as string,
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 20
  });
  sendSuccess(res, result, 'لیست مدیریت دیدگاه‌ها با موفقیت دریافت شد');
};

export const moderateComment = async (req: AuthRequest, res: Response) => {
  const adminId = req.user?._id?.toString();
  const result = await CommentService.moderateComment(
    req.params.id as string, 
    req.body.status, 
    adminId, 
    req
  );
  sendSuccess(res, result, 'وضعیت دیدگاه با موفقیت به‌روزرسانی شد');
};

export const deleteComment = async (req: AuthRequest, res: Response) => {
  const adminId = req.user?._id?.toString();
  const result = await CommentService.deleteComment(
    req.params.id as string, 
    adminId, 
    req
  );
  sendSuccess(res, result, 'دیدگاه با موفقیت حذف گردید');
};
