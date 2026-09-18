import { InstructorProfile } from './instructor-profile.model.js';
import { User } from '../auth/user.model.js';
import { AppError } from '../../common/errors/AppError.js';

export class InstructorService {
  static async getPublicInstructors() {
    // Only return approved instructors with their user details
    return await InstructorProfile.find({ isApproved: true })
      .populate('userId', 'firstName lastName avatar email')
      .exec();
  }

  static async getInstructorBySlug(id: string) {
    let profile = await InstructorProfile.findOne({
      $or: [
        { userId: id },
        { _id: id }
      ],
      isApproved: true
    }).populate('userId', 'firstName lastName avatar email');

    if (!profile) {
      // Also try find by userId even if id might match either
      try {
        profile = await InstructorProfile.findById(id).populate('userId', 'firstName lastName avatar email');
      } catch (e) {
        // ignore invalid ObjectId format
      }
    }

    if (!profile) throw new AppError('Instructor not found', 404, 'NOT_FOUND');
    return profile;
  }

  static async updateMyProfile(userId: string, data: any) {
    let profile = await InstructorProfile.findOne({ userId });
    
    if (!profile) {
      profile = await InstructorProfile.create({ userId, ...data });
    } else {
      profile = await InstructorProfile.findOneAndUpdate(
        { userId },
        { $set: data },
        { new: true }
      );
    }
    
    return profile;
  }

  static async getInstructorEarnings(userId: string) {
    // In a real app, this would aggregate from Orders where course instructor = userId
    // Mocking statistics for the MVP
    return {
      totalEarnings: 15500000,
      monthlyEarnings: 3200000,
      totalStudents: 145,
      activeCourses: 3
    };
  }
}
