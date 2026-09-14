import { Assignment } from './assignment.model.js';
import { AssignmentSubmission } from './assignment-submission.model.js';
import { Course } from '../courses/course.model.js';
import { Lesson } from '../courses/lesson.model.js';
import { Enrollment } from './enrollment.model.js';
import { AppError } from '../../common/errors/AppError.js';

export class AssignmentService {
  static async getMyAssignmentDetails(userId: string, assignmentId: string) {
    const assignment = await Assignment.findById(assignmentId).populate('courseId', 'title').populate('lessonId', 'title').populate('attachments');
    if (!assignment) throw new AppError('Assignment not found', 404, 'NOT_FOUND');
    const enrollment = await Enrollment.findOne({ userId, courseId: assignment.courseId });
    if (!enrollment) throw new AppError('Not enrolled in this course', 403, 'FORBIDDEN');
    const submission = await AssignmentSubmission.findOne({ userId, assignmentId }).populate('files');
    return { assignment, submission };
  }
  static async getMyAssignments(userId: string) {
    const enrollments = await Enrollment.find({ userId, status: 'active' });
    const courseIds = enrollments.map(e => e.courseId);
    const assignments = await Assignment.find({ courseId: { $in: courseIds }, isPublished: true }).populate('courseId', 'title').populate('lessonId', 'title');
    const submissions = await AssignmentSubmission.find({ userId });
    return assignments.map(a => {
      const submission = submissions.find(s => s.assignmentId.toString() === a._id.toString());
      return { assignment: a, submission };
    });
  }
  // --- Instructor Actions ---
  static async createAssignment(instructorId: string, lessonId: string, data: any) {
    const lesson = await Lesson.findById(lessonId).populate('courseId');
    if (!lesson) throw new AppError('Lesson not found', 404, 'NOT_FOUND');

    const course = await Course.findOne({ _id: lesson.courseId, instructors: instructorId });
    if (!course) throw new AppError('Unauthorized', 403, 'FORBIDDEN');

    const assignment = await Assignment.create({
      ...data,
      courseId: lesson.courseId,
      lessonId: lesson._id
    });

    await Lesson.findByIdAndUpdate(lessonId, { assignmentId: assignment._id });
    return assignment;
  }

  static async getLessonAssignments(lessonId: string) {
    return await Assignment.find({ lessonId });
  }

  static async getAssignmentSubmissions(instructorId: string, assignmentId: string) {
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) throw new AppError('Assignment not found', 404, 'NOT_FOUND');

    const course = await Course.findOne({ _id: assignment.courseId, instructors: instructorId });
    if (!course) throw new AppError('Unauthorized', 403, 'FORBIDDEN');

    return await AssignmentSubmission.find({ assignmentId })
      .populate('userId', 'firstName lastName email')
      .sort({ submittedAt: -1 });
  }

  static async gradeSubmission(instructorId: string, submissionId: string, data: { score: number, feedback?: string }) {
    const submission = await AssignmentSubmission.findById(submissionId).populate('assignmentId');
    if (!submission) throw new AppError('Submission not found', 404, 'NOT_FOUND');

    const assignment = submission.assignmentId as any;
    const course = await Course.findOne({ _id: assignment.courseId, instructors: instructorId });
    if (!course) throw new AppError('Unauthorized', 403, 'FORBIDDEN');

    if (data.score > assignment.maxScore) {
      throw new AppError(`Score cannot exceed max score of ${assignment.maxScore}`, 400, 'INVALID_SCORE');
    }

    submission.score = data.score;
    submission.feedback = data.feedback;
    submission.status = 'graded';
    submission.gradedBy = instructorId as any;
    submission.gradedAt = new Date();

    await submission.save();
    return submission;
  }

  // --- Student Actions ---
  static async submitAssignment(userId: string, assignmentId: string, data: any) {
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) throw new AppError('Assignment not found', 404, 'NOT_FOUND');

    const enrollment = await Enrollment.findOne({ userId, courseId: assignment.courseId });
    if (!enrollment) throw new AppError('You must be enrolled to submit', 403, 'FORBIDDEN');

    const existing = await AssignmentSubmission.findOne({ userId, assignmentId });
    if (existing) throw new AppError('You have already submitted this assignment', 400, 'ALREADY_SUBMITTED');

    return await AssignmentSubmission.create({
      ...data,
      userId,
      assignmentId
    });
  }

  static async getMySubmissions(userId: string) {
    return await AssignmentSubmission.find({ userId })
      .populate('assignmentId', 'title maxScore deadline')
      .sort({ submittedAt: -1 });
  }
}
