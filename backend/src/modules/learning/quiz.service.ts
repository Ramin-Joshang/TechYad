import { Quiz } from './quiz.model.js';
import { QuizAttempt } from './quiz-attempt.model.js';
import { Course } from '../courses/course.model.js';
import { Lesson } from '../courses/lesson.model.js';
import { Enrollment } from './enrollment.model.js';
import { AppError } from '../../common/errors/AppError.js';
import { Types } from 'mongoose';

export class QuizService {
  static async getMyQuizzes(userId: string) {
    const enrollments = await Enrollment.find({ userId, status: 'active' });
    const courseIds = enrollments.map(e => e.courseId);
    const quizzes = await Quiz.find({ courseId: { $in: courseIds }, isPublished: true }).populate('courseId', 'title');
    const attempts = await QuizAttempt.find({ userId });
    return quizzes.map(q => {
      const attempt = attempts.find(a => a.quizId.toString() === q._id.toString());
      return { quiz: q, attempt };
    });
  }
  // --- Instructor Actions ---
  static async createQuiz(instructorId: string, lessonId: string, data: any) {
    const lesson = await Lesson.findById(lessonId).populate('courseId');
    if (!lesson) throw new AppError('Lesson not found', 404, 'NOT_FOUND');

    const course = await Course.findOne({ _id: lesson.courseId, instructors: instructorId });
    if (!course) throw new AppError('Unauthorized', 403, 'FORBIDDEN');

    const quiz = await Quiz.create({
      ...data,
      courseId: lesson.courseId,
      lessonId: lesson._id
    });

    await Lesson.findByIdAndUpdate(lessonId, { quizId: quiz._id });
    return quiz;
  }

  // --- Student Actions ---
  static async getQuizForStudent(userId: string, quizId: string) {
    const quiz = await Quiz.findById(quizId).lean();
    if (!quiz) throw new AppError('Quiz not found', 404, 'NOT_FOUND');

    const enrollment = await Enrollment.findOne({ userId, courseId: quiz.courseId });
    if (!enrollment) throw new AppError('You must be enrolled to access this quiz', 403, 'FORBIDDEN');

    // Strip out `isCorrect` from options before sending to student
    quiz.questions.forEach(q => {
      q.options.forEach(o => {
        delete (o as any).isCorrect;
      });
    });

    return quiz;
  }

  static async startQuiz(userId: string, quizId: string) {
    const quiz = await Quiz.findById(quizId);
    if (!quiz) throw new AppError('Quiz not found', 404, 'NOT_FOUND');

    const enrollment = await Enrollment.findOne({ userId, courseId: quiz.courseId });
    if (!enrollment) throw new AppError('You must be enrolled', 403, 'FORBIDDEN');

    // Check if there's already an active attempt
    let attempt = await QuizAttempt.findOne({ userId, quizId, status: 'in_progress' });
    if (attempt) return attempt;

    attempt = await QuizAttempt.create({
      userId,
      quizId,
      answers: [],
      status: 'in_progress'
    });

    return attempt;
  }

  static async submitQuiz(userId: string, quizId: string, answersData: { questionId: string, selectedOptionIds: string[] }[]) {
    const attempt = await QuizAttempt.findOne({ userId, quizId, status: 'in_progress' });
    if (!attempt) throw new AppError('No active quiz attempt found. Start the quiz first.', 400, 'NO_ACTIVE_ATTEMPT');

    const quiz = await Quiz.findById(quizId);
    if (!quiz) throw new AppError('Quiz not found', 404, 'NOT_FOUND');

    let totalScore = 0;
    let earnedScore = 0;

    const evaluatedAnswers = quiz.questions.map(q => {
      totalScore += q.score;
      const studentAnswer = answersData.find(a => a.questionId === q._id.toString());
      
      let isCorrect = false;
      const correctOptionIds = q.options.filter(o => o.isCorrect).map(o => o._id.toString());
      
      if (studentAnswer) {
        // Compare sorted arrays to check if selected options match correct options
        const selected = [...studentAnswer.selectedOptionIds].sort();
        const correct = [...correctOptionIds].sort();
        
        isCorrect = selected.length === correct.length && selected.every((val, index) => val === correct[index]);
      }

      const score = isCorrect ? q.score : 0;
      earnedScore += score;

      return {
        questionId: q._id,
        selectedOptionIds: studentAnswer ? studentAnswer.selectedOptionIds.map(id => new Types.ObjectId(id)) : [],
        isCorrect,
        score
      };
    });

    const percentage = totalScore > 0 ? (earnedScore / totalScore) * 100 : 0;

    attempt.answers = evaluatedAnswers as any;
    attempt.score = earnedScore;
    attempt.totalScore = totalScore;
    attempt.percentage = percentage;
    attempt.status = 'submitted';
    attempt.submittedAt = new Date();

    await attempt.save();
    return attempt;
  }

  static async getQuizResult(userId: string, quizId: string) {
    const attempt = await QuizAttempt.findOne({ userId, quizId, status: 'submitted' }).sort({ submittedAt: -1 });
    if (!attempt) throw new AppError('No submitted attempt found', 404, 'NOT_FOUND');
    return attempt;
  }
}
