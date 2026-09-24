import { Enrollment } from './enrollment.model.js';
import { LessonProgress } from './lesson-progress.model.js';
import { AssignmentSubmission } from './assignment-submission.model.js';
import { Course } from '../courses/course.model.js';
import { Lesson } from '../courses/lesson.model.js';
import { AppError } from '../../common/errors/AppError.js';
import { QuizAttempt } from './quiz-attempt.model.js';
import { Order } from '../commerce/order.model.js';

export class LearningService {
  // --- Dashboard ---
  static async getStudentDashboard(userId: string) {
    const enrollments = await Enrollment.find({ userId, status: 'active' })
      .populate('courseId', 'title slug thumbnail totalLessons')
      .populate('lastLessonId', 'title slug')
      .sort({ lastAccessedAt: -1 })
      .limit(5);

    const completedLessons = await LessonProgress.countDocuments({ userId, completed: true });
    
    const pendingAssignments = await AssignmentSubmission.countDocuments({ userId, status: 'submitted' });
    
    const latestQuizzes = await QuizAttempt.find({ userId })
      .populate('quizId', 'title passMark')
      .sort({ createdAt: -1 })
      .limit(3);

    return {
      stats: {
        activeCourses: enrollments.length,
        completedLessons,
        pendingAssignments
      },
      recentEnrollments: enrollments,
      latestQuizzes
    };
  }

  // --- Enrollments ---
  static async enrollInFreeCourse(userId: string, courseId: string) {
    const course = await Course.findById(courseId);
    if (!course) throw new AppError('Course not found', 404, 'NOT_FOUND');
    if (course.price > 0) throw new AppError('Course is not free, please purchase it via cart', 400, 'BAD_REQUEST');
    if (course.status !== 'published') throw new AppError('Course is not available', 400, 'BAD_REQUEST');
    
    const existing = await Enrollment.findOne({ userId, courseId });
    if (existing) throw new AppError('You are already enrolled in this course', 400, 'ALREADY_ENROLLED');

    return await Enrollment.create({
      userId,
      courseId,
      source: 'free',
      status: 'active',
      amount: 0
    });
  }

  static async getMyEnrollments(userId: string) {
    return await Enrollment.find({ userId })
      .populate({
        path: 'courseId',
        select: 'title slug thumbnail totalLessons totalDuration price instructor level category averageRating ratingCount description shortDescription syllabus',
        populate: [
          { path: 'instructors', select: 'firstName lastName avatar' },
          { path: 'category', select: 'name slug' }
        ]
      })
      .populate('lastLessonId', 'title slug duration order')
      .sort({ lastAccessedAt: -1, enrolledAt: -1 });
  }

  static async getMyEnrollmentDetails(userId: string, courseId: string) {
    const enrollment = await Enrollment.findOne({ userId, courseId });
    return enrollment || null;
  }

  // --- Progress ---
  static async updateLessonProgress(userId: string, lessonId: string, data: any) {
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) throw new AppError('Lesson not found', 404, 'NOT_FOUND');

    let enrollment = null;
    // Only check enrollment if the lesson is not free
    if (!lesson.isFree) {
      enrollment = await Enrollment.findOne({ userId, courseId: lesson.courseId });
      if (!enrollment) {
        throw new AppError('Must be enrolled to track progress for this lesson', 403, 'FORBIDDEN');
      }
    }

    const progressData: any = {
      ...data,
      courseId: lesson.courseId,
      lastWatchedAt: new Date()
    };

    if (data.completed) {
      progressData.completedAt = new Date();
    }

    const progress = await LessonProgress.findOneAndUpdate(
      { userId, lessonId },
      progressData,
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    // Update Enrollment progress
    if (enrollment) {
      const completedCount = await LessonProgress.countDocuments({ 
        userId, 
        courseId: lesson.courseId, 
        completed: true 
      });

      const course = await Course.findById(lesson.courseId);
      const total = course?.totalLessons || 1;
      
      enrollment.completedLessons = completedCount;
      enrollment.progress = Math.round((completedCount / total) * 100);
      enrollment.lastLessonId = lesson._id;
      enrollment.lastAccessedAt = new Date();
      await enrollment.save();
    }
    
    return progress;
  }

  static async getLessonProgress(userId: string, lessonId: string) {
    return await LessonProgress.findOne({ userId, lessonId });
  }

  // --- Secure Content Access ---
  static async getSecureLesson(userId: string, lessonId: string) {
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) throw new AppError('Lesson not found', 404, 'NOT_FOUND');

    if (!lesson.isFree) {
      const enrollment = await Enrollment.findOne({ userId, courseId: lesson.courseId, status: 'active' });
      if (!enrollment) {
        throw new AppError('You must purchase this course to access this lesson', 403, 'FORBIDDEN');
      }
    }

    return lesson;
  }
}
