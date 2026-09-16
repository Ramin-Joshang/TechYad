import { Request, Response } from 'express';
import { AssignmentService } from './assignment.service.js';
import { sendSuccess } from '../../common/utils/response.js';
import { AuthRequest } from '../../common/middleware/auth.js';

export const createAssignment = async (req: AuthRequest, res: Response) => {
  const result = await AssignmentService.createAssignment(req.user._id as string, req.params.lessonId as string, req.body);
  sendSuccess(res, result, 'Assignment created successfully', 201);
};

export const getLessonAssignments = async (req: Request, res: Response) => {
  const result = await AssignmentService.getLessonAssignments(req.params.lessonId as string);
  sendSuccess(res, result, 'Assignments retrieved successfully');
};

export const getSubmissions = async (req: AuthRequest, res: Response) => {
  const result = await AssignmentService.getAssignmentSubmissions(req.user._id as string, req.params.assignmentId as string);
  sendSuccess(res, result, 'Submissions retrieved successfully');
};

export const gradeSubmission = async (req: AuthRequest, res: Response) => {
  const result = await AssignmentService.gradeSubmission(req.user._id as string, req.params.submissionId as string, req.body);
  sendSuccess(res, result, 'Submission graded successfully');
};

export const submitAssignment = async (req: AuthRequest, res: Response) => {
  const result = await AssignmentService.submitAssignment(req.user._id as string, req.params.assignmentId as string, req.body);
  sendSuccess(res, result, 'Assignment submitted successfully', 201);
};

export const getMySubmissions = async (req: AuthRequest, res: Response) => {
  const result = await AssignmentService.getMySubmissions(req.user._id as string);
  sendSuccess(res, result, 'My submissions retrieved successfully');
};

export const getMyAssignments = async (req: AuthRequest, res: Response) => {
  const result = await AssignmentService.getMyAssignments(req.user._id as string);
  sendSuccess(res, result, 'My assignments retrieved successfully');
};

export const getMyAssignmentDetails = async (req: AuthRequest, res: Response) => {
  const result = await AssignmentService.getMyAssignmentDetails(req.user._id as string, req.params.id as string);
  sendSuccess(res, result, 'Assignment details retrieved successfully');
};

export const getInstructorAssignments = async (req: AuthRequest, res: Response) => {
  const result = await AssignmentService.getInstructorAssignments(req.user._id as string, req.query);
  sendSuccess(res, result, 'Instructor assignments retrieved successfully');
};

export const getInstructorSubmissions = async (req: AuthRequest, res: Response) => {
  const result = await AssignmentService.getInstructorSubmissions(req.user._id as string, req.query);
  sendSuccess(res, result, 'Instructor submissions retrieved successfully');
};
