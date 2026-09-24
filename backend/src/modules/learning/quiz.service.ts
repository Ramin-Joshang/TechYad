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
  static async getInstructorQuizzes(instructorId: string) {
    const courses = await Course.find({ instructors: instructorId });
    const courseIds = courses.map((c: any) => c._id);
    const quizzes = await Quiz.find({ courseId: { $in: courseIds } })
      .populate('courseId', 'title slug thumbnail')
      .populate('lessonId', 'title')
      .sort({ createdAt: -1 });

    const quizIds = quizzes.map(q => q._id);
    const attempts = await QuizAttempt.find({ quizId: { $in: quizIds }, status: 'submitted' });

    return quizzes.map(q => {
      const qAttempts = attempts.filter(a => a.quizId.toString() === q._id.toString());
      const totalAttempts = qAttempts.length;
      const passedAttempts = qAttempts.filter(a => (a.percentage || 0) >= (q.passingScore || 70)).length;
      const avgScore = totalAttempts > 0 
        ? Math.round(qAttempts.reduce((sum, a) => sum + (a.percentage || 0), 0) / totalAttempts) 
        : 0;

      return {
        ...q.toObject(),
        totalAttempts,
        passedAttempts,
        avgScore,
        questionsCount: q.questions?.length || 0
      };
    });
  }

  static async getQuizForInstructor(instructorId: string, quizId: string) {
    const quiz = await Quiz.findById(quizId).populate('courseId', 'title slug').populate('lessonId', 'title');
    if (!quiz) throw new AppError('Quiz not found', 404, 'NOT_FOUND');

    const course = await Course.findOne({ _id: quiz.courseId, instructors: instructorId });
    if (!course) throw new AppError('Unauthorized', 403, 'FORBIDDEN');

    return quiz;
  }

  static async getQuizAttemptsForInstructor(instructorId: string, quizId: string) {
    const quiz = await Quiz.findById(quizId);
    if (!quiz) throw new AppError('Quiz not found', 404, 'NOT_FOUND');

    const course = await Course.findOne({ _id: quiz.courseId, instructors: instructorId });
    if (!course) throw new AppError('Unauthorized', 403, 'FORBIDDEN');

    const attempts = await QuizAttempt.find({ quizId })
      .populate('userId', 'firstName lastName email avatar')
      .sort({ submittedAt: -1, createdAt: -1 });

    return attempts.map(a => ({
      _id: a._id,
      user: a.userId,
      score: a.score,
      totalScore: a.totalScore,
      percentage: a.percentage,
      passed: (a.percentage || 0) >= (quiz.passingScore || 70),
      status: a.status,
      submittedAt: a.submittedAt || (a as any).createdAt
    }));
  }

  static async updateQuiz(quizId: string, instructorId: string, data: any) {
    const quiz = await Quiz.findById(quizId);
    if (!quiz) throw new AppError('Quiz not found', 404, 'NOT_FOUND');
    
    let course = await Course.findOne({ _id: quiz.courseId, instructors: instructorId });
    if (!course && quiz.lessonId) {
      const lesson = await Lesson.findById(quiz.lessonId);
      course = await Course.findOne({ _id: lesson?.courseId, instructors: instructorId });
    }
    if (!course) throw new AppError('Unauthorized', 403, 'FORBIDDEN');

    const updatePayload = {
      ...data,
      duration: data.duration ?? data.timeLimit ?? quiz.duration,
      passingScore: data.passingScore ?? data.passMark ?? quiz.passingScore,
      ...(data.questions ? { questions: data.questions } : {})
    };

    return await Quiz.findByIdAndUpdate(quizId, updatePayload, { new: true });
  }

  static async deleteQuiz(quizId: string, instructorId: string) {
    const quiz = await Quiz.findById(quizId);
    if (!quiz) throw new AppError('Quiz not found', 404, 'NOT_FOUND');

    let course = await Course.findOne({ _id: quiz.courseId, instructors: instructorId });
    if (!course && quiz.lessonId) {
      const lesson = await Lesson.findById(quiz.lessonId);
      course = await Course.findOne({ _id: lesson?.courseId, instructors: instructorId });
    }
    if (!course) throw new AppError('Unauthorized', 403, 'FORBIDDEN');

    if (quiz.lessonId) {
      await Lesson.findByIdAndUpdate(quiz.lessonId, { $unset: { quizId: 1 } });
    }
    await QuizAttempt.deleteMany({ quizId });
    await Quiz.findByIdAndDelete(quizId);
    return { success: true };
  }
  
  static async createQuiz(instructorId: string, lessonId?: string, data?: any) {
    const payload = data || {};
    let courseId = payload.courseId;
    let targetLessonId = lessonId || payload.lessonId;

    if (targetLessonId) {
      const lesson = await Lesson.findById(targetLessonId).populate('courseId');
      if (!lesson) throw new AppError('Lesson not found', 404, 'NOT_FOUND');
      courseId = lesson.courseId;
    }

    if (!courseId) throw new AppError('Course ID is required', 400, 'BAD_REQUEST');

    const course = await Course.findOne({ _id: courseId, instructors: instructorId });
    if (!course) throw new AppError('Unauthorized or course not found', 403, 'FORBIDDEN');

    const quiz = await Quiz.create({
      ...payload,
      duration: payload.duration ?? payload.timeLimit ?? 30,
      passingScore: payload.passingScore ?? payload.passMark ?? 70,
      questions: payload.questions || [],
      courseId,
      lessonId: targetLessonId || undefined,
      isPublished: payload.isPublished ?? true
    });

    if (targetLessonId) {
      await Lesson.findByIdAndUpdate(targetLessonId, { quizId: quiz._id });
    }
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
