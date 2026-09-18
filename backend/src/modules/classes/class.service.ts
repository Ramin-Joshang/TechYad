import { Class } from './class.model.js';
import { ClassEnrollment } from './class-enrollment.model.js';
import { AppError } from '../../common/errors/AppError.js';
import { Types } from 'mongoose';

export class ClassService {
  static async getInstructorClasses(instructorId: string) {
    return await Class.find({ instructors: instructorId }).sort({ startDate: 1 });
  }

  static async getClasses(query: any = {}) {
    const filter: any = { status: { $in: ['published', 'completed'] } };

    if (query.mode && query.mode !== 'all') {
      filter.mode = query.mode;
    }
    if (query.type && query.type !== 'all') {
      filter.type = query.type;
    }
    if (query.search) {
      filter.$or = [
        { title: { $regex: query.search, $options: 'i' } },
        { description: { $regex: query.search, $options: 'i' } }
      ];
    }

    const page = parseInt(query.page as string) || 1;
    const limit = parseInt(query.limit as string) || 9;
    const skip = (page - 1) * limit;

    let sortOption: any = { startDate: 1 };
    if (query.sort === 'newest') sortOption = { createdAt: -1 };
    if (query.sort === 'price_asc') sortOption = { price: 1 };
    if (query.sort === 'price_desc') sortOption = { price: -1 };

    const classes = await Class.find(filter)
      .populate('instructors', 'firstName lastName avatar bio')
      .sort(sortOption)
      .skip(skip)
      .limit(limit);

    const total = await Class.countDocuments(filter);
    return {
      classes,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit) || 1
    };
  }

  static async getClassBySlug(slug: string) {
    const classData = await Class.findOne({ slug })
      .populate('instructors', 'firstName lastName bio avatar');
    if (!classData) throw new AppError('Class not found', 404, 'NOT_FOUND');
    return classData;
  }

  static async createClass(userId: string, data: any) {
    const mockRoomLink = data.mode === 'online' ? `https://www.skyroom.online/ch/techyad/${new Types.ObjectId().toString().substring(0, 8)}` : undefined;
    
    const payload = { ...data };
    if (!payload.capacity) payload.capacity = data.maxStudents || 50;
    if (!payload.description) payload.description = data.shortDescription || 'توضیحاتی برای این کلاس وارد نشده است.';
    if (!payload.endDate) payload.endDate = new Date(new Date(data.startDate || new Date()).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
    if (payload.mode === 'in-person') payload.mode = 'in_person';

    return await Class.create({
      ...payload,
      meetingLink: mockRoomLink,
      createdBy: userId,
      instructors: data.instructors?.length > 0 ? data.instructors : [userId]
    });
  }

  static async updateClass(id: string, userId: string, data: any, overrideAuth: boolean = false) {
    const query = overrideAuth ? { _id: id } : { _id: id, instructors: userId };
    const cls = await Class.findOneAndUpdate(query, data, { new: true });
    if (!cls) throw new AppError('Class not found or unauthorized', 404);
    return cls;
  }
  
  static async deleteClass(id: string, userId: string, overrideAuth: boolean = false) {
    const query = overrideAuth ? { _id: id } : { _id: id, instructors: userId };
    const cls = await Class.findOneAndDelete(query);
    if (!cls) throw new AppError('Class not found or unauthorized', 404);
    return cls;
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
