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

  static async getMyProfile(userId: string) {
    let profile = await InstructorProfile.findOne({ userId }).populate('userId', 'firstName lastName avatar email');
    if (!profile) {
      const user = await User.findById(userId);
      profile = await InstructorProfile.create({
        userId,
        title: user?.specialty || 'مدرس و متخصص آموزشی',
        bio: user?.bio || 'مدرس آکادمی تک‌یاد',
        avatar: user?.avatar || '',
        specialties: [],
        education: [],
        experience: [],
        isApproved: true,
        socialLinks: {}
      });
      profile = await InstructorProfile.findById(profile._id).populate('userId', 'firstName lastName avatar email');
    }
    return profile;
  }

  static async updateMyProfile(userId: string, data: any) {
    let profile = await InstructorProfile.findOne({ userId });
    
    // Also sync bio/avatar/specialty with User document if provided
    if (data.bio !== undefined || data.avatar !== undefined || data.title !== undefined) {
      await User.findByIdAndUpdate(userId, {
        ...(data.bio !== undefined ? { bio: data.bio } : {}),
        ...(data.avatar !== undefined ? { avatar: data.avatar } : {}),
        ...(data.title !== undefined ? { specialty: data.title } : {})
      });
    }

    if (!profile) {
      profile = await InstructorProfile.create({ 
        userId, 
        ...data,
        isApproved: true 
      });
    } else {
      profile = await InstructorProfile.findOneAndUpdate(
        { userId },
        { $set: data },
        { new: true }
      ).populate('userId', 'firstName lastName avatar email');
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
