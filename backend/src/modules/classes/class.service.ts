import { Class } from './class.model.js';
import { ClassEnrollment } from './class-enrollment.model.js';
import { AppError } from '../../common/errors/AppError.js';
import { Types } from 'mongoose';

export class ClassService {
  static async getInstructorClasses(instructorId: string) {
    return await Class.find({ instructors: instructorId }).sort({ startDate: 1 });
  }

  static async getClasses() {
    return await Class.find({ status: { $in: ['published', 'completed'] } })
      .populate('instructors', 'firstName lastName avatar')
      .sort({ startDate: 1 });
  }

  static async getClassBySlug(slug: string) {
    const classData = await Class.findOne({ slug })
      .populate('instructors', 'firstName lastName bio avatar');
    if (!classData) throw new AppError('Class not found', 404, 'NOT_FOUND');
    return classData;
  }

  static async createClass(userId: string, data: any) {
    const mockRoomLink = data.mode === 'online' ? `https://www.skyroom.online/ch/techyad/${new Types.ObjectId().toString().substring(0, 8)}` : undefined;
    
    return await Class.create({
      capacity: data.capacity || data.maxStudents,
      ...data,
      meetingLink: mockRoomLink,
      createdBy: userId,
      instructors: [userId] // By default, the creator is the instructor
    });
  }

  static async getMyClasses(userId: string) {
    const enrollments = await ClassEnrollment.find({ userId, status: 'active' })
      .populate('classId');
    return enrollments.map(e => e.classId);
  }

  static async joinOnlineClass(userId: string, classId: string) {
    const classData = await Class.findById(classId);
    if (!classData) throw new AppError('Class not found', 404, 'NOT_FOUND');

    if (classData.mode !== 'online') {
      throw new AppError('This is not an online class', 400, 'BAD_REQUEST');
    }

    const enrollment = await ClassEnrollment.findOne({ userId, classId, status: 'active' });
    if (!enrollment) {
      throw new AppError('You are not enrolled in this class', 403, 'FORBIDDEN');
    }

    // In a real app, generate a single-use join token or similar
    return { meetingUrl: classData.meetingLink };
  }
}
