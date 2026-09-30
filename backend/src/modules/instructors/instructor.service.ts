import { InstructorProfile } from './instructor-profile.model.js';
import { User } from '../auth/user.model.js';
import { Course } from '../courses/course.model.js';
import { Class } from '../classes/class.model.js';
import { AppError } from '../../common/errors/AppError.js';

export class InstructorService {
  static async getPublicInstructors() {
    // Return approved instructors with their user details
    const profiles = await InstructorProfile.find({ isApproved: true })
      .populate('userId', 'firstName lastName avatar email specialty bio')
      .sort({ rating: -1, totalStudents: -1 })
      .lean();

    // Dynamically calculate accurate counts for each instructor
    const enrichedProfiles = await Promise.all(
      profiles.map(async (p: any) => {
        const uId = p.userId?._id || p.userId;
        const [cCount, clCount] = await Promise.all([
          Course.countDocuments({ $or: [{ instructors: uId }, { createdBy: uId }], status: 'published' }),
          Class.countDocuments({ $or: [{ instructors: uId }, { createdBy: uId }], status: { $ne: 'cancelled' } })
        ]);
        return {
          ...p,
          coursesCount: cCount,
          classesCount: clCount,
          rating: p.rating || 5
        };
      })
    );

    return enrichedProfiles;
  }

  static async getInstructorBySlug(id: string) {
    let profile: any = null;

    // Try finding by userId or _id in InstructorProfile
    profile = await InstructorProfile.findOne({
      $or: [
        { userId: id },
        { _id: id }
      ]
    }).populate('userId', 'firstName lastName avatar email mobile specialty bio');

    if (!profile) {
      try {
        profile = await InstructorProfile.findById(id).populate('userId', 'firstName lastName avatar email mobile specialty bio');
      } catch (e) {
        // ignore invalid ObjectId
      }
    }

    // If still not found, check if User with that ID exists (auto-create instructor profile)
    if (!profile) {
      try {
        const user = await User.findById(id);
        if (user) {
          profile = await InstructorProfile.create({
            userId: user._id,
            title: user.specialty || 'مدرس و متخصص آموزشی',
            bio: user.bio || 'مدرس دوره‌ها و کارگاه‌های تخصصی در آکادمی تک‌یاد',
            avatar: user.avatar || '',
            specialties: user.specialty ? [user.specialty] : ['برنامه‌نویسی و وب'],
            education: [],
            experience: [],
            socialLinks: {},
            isApproved: true,
            rating: 5,
            totalStudents: 0
          });
          profile = await InstructorProfile.findById(profile._id).populate('userId', 'firstName lastName avatar email mobile specialty bio');
        }
      } catch (e) {
        // ignore error
      }
    }

    if (!profile) throw new AppError('استاد مورد نظر یافت نشد', 404, 'NOT_FOUND');

    const uId = profile.userId?._id || profile.userId;

    // Fetch real courses and classes taught by this instructor
    const [courses, classes] = await Promise.all([
      Course.find({ $or: [{ instructors: uId }, { createdBy: uId }], status: 'published' })
        .select('title slug thumbnail price discountPrice averageRating reviewCount studentCount levelId categoryId totalLessons totalDuration')
        .populate('categoryId', 'name slug')
        .lean(),
      Class.find({ $or: [{ instructors: uId }, { createdBy: uId }], status: { $ne: 'cancelled' } })
        .select('title slug thumbnail price discountPrice capacity enrolledCount mode type startDate endDate scheduleDays scheduleTime city address meetingPlatform')
        .lean()
    ]);

    const totalStudentsFromDB = courses.reduce((acc, curr: any) => acc + (curr.studentCount || 0), 0) +
      classes.reduce((acc, curr: any) => acc + (curr.enrolledCount || 0), 0);

    const ratedCourses = courses.filter((c: any) => c.averageRating && c.averageRating > 0);
    const calculatedRating = ratedCourses.length > 0
      ? Number((ratedCourses.reduce((sum: number, c: any) => sum + c.averageRating, 0) / ratedCourses.length).toFixed(1))
      : (profile.rating && profile.rating > 0 ? profile.rating : 5);

    const profileObj = profile.toObject ? profile.toObject() : profile;

    return {
      ...profileObj,
      courses,
      classes,
      rating: calculatedRating,
      totalStudents: totalStudentsFromDB > 0 ? totalStudentsFromDB : (profileObj.totalStudents || 0),
      coursesCount: courses.length,
      classesCount: classes.length
    };
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
