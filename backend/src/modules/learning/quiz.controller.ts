import { Request, Response } from 'express';
import { QuizService } from './quiz.service.js';
import { sendSuccess } from '../../common/utils/response.js';
import { AuthRequest } from '../../common/middleware/auth.js';

export const createQuiz = async (req: AuthRequest, res: Response) => {
  const result = await QuizService.createQuiz(req.user._id as string, req.params.lessonId as string, req.body);
  sendSuccess(res, result, 'Quiz created successfully', 201);
};

export const getQuiz = async (req: AuthRequest, res: Response) => {
  const result = await QuizService.getQuizForStudent(req.user._id as string, req.params.quizId as string);
  sendSuccess(res, result, 'Quiz retrieved successfully');
};

export const startQuiz = async (req: AuthRequest, res: Response) => {
  const result = await QuizService.startQuiz(req.user._id as string, req.params.quizId as string);
  sendSuccess(res, result, 'Quiz started successfully');
};

export const submitQuiz = async (req: AuthRequest, res: Response) => {
  const result = await QuizService.submitQuiz(req.user._id as string, req.params.quizId as string, req.body.answers);
  sendSuccess(res, result, 'Quiz submitted successfully');
};

export const getQuizResult = async (req: AuthRequest, res: Response) => {
  const result = await QuizService.getQuizResult(req.user._id as string, req.params.quizId as string);
  sendSuccess(res, result, 'Quiz result retrieved successfully');
};

export const getMyQuizzes = async (req: AuthRequest, res: Response) => {
  const result = await QuizService.getMyQuizzes(req.user._id as string);
  sendSuccess(res, result, 'My quizzes retrieved successfully');
};
