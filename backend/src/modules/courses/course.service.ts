import { Types } from 'mongoose';
import { Course } from './course.model.js';
import { Chapter } from './chapter.model.js';
import { Lesson } from './lesson.model.js';
import '../auth/user.model.js';
import '../catalog/category.model.js';
import { AppError } from '../../common/errors/AppError.js';
import { Class } from '../classes/class.model.js';
import { ClassEnrollment } from '../classes/class-enrollment.model.js';
import { Order } from '../commerce/order.model.js';
import { Enrollment } from '../learning/enrollment.model.js';
import { AuditService } from '../../common/services/audit.service.js';

export class CourseService {
  // --- Courses ---
  static async createCourse(instructorId: string, data: any) {
    const course = await Course.create({
      ...data,
      instructors: data.instructors?.length > 0 ? data.instructors : [instructorId],
      createdBy: instructorId,
      status: 'draft'
    });

    // Audit Log for Instructor creating course
    AuditService.log({
      userId: instructorId,
      userRole: 'instructor',
      action: 'create_course',
      category: 'course',
      title: `استاد دوره جدید «${course.title}» را ایجاد کرد`,
      targetId: course._id.toString(),
      targetType: 'course',
      targetTitle: course.title,
      details: {
        price: course.price,
        categoryId: course.categoryId,
        status: course.status
      }
    });

    return course;
  }

  static async getCourses(query: any) {
    const filter: any = { status: 'published' };
    
    // Advanced filtering
    if (query.category) filter.categoryId = query.category;
    if (query.subject) filter.subjectId = query.subject;
    if (query.field) filter.fieldId = query.field;
    if (query.level) filter.levelId = query.level;
    if (query.instructor) filter.instructors = query.instructor;
    if (query.isFree === 'true') filter.price = 0;
    
    // Price range
    if (query.minPrice || query.maxPrice) {
      filter.price = {};
      if (query.minPrice) filter.price.$gte = Number(query.minPrice);
      if (query.maxPrice) filter.price.$lte = Number(query.maxPrice);
    }

    if (query.search) filter.$text = { $search: query.search };

    // Pagination & Sorting
    const page = parseInt(query.page as string) || 1;
    const limit = parseInt(query.limit as string) || 10;
    const skip = (page - 1) * limit;

    let sortOption: any = { createdAt: -1 };
    if (query.sort === 'price_asc') sortOption = { price: 1 };
    if (query.sort === 'price_desc') sortOption = { price: -1 };
    
    const courses = await Course.find(filter)
      .populate('instructors', 'firstName lastName avatar personnelPhoto bio specialty')
      .populate('categoryId', 'name slug')
      .sort(sortOption)
      .skip(skip)
      .limit(limit);

    const total = await Course.countDocuments(filter);

    return { courses, total, page, limit, pages: Math.ceil(total / limit) };
  }

  static async getCourseBySlug(slug: string) {
    const isObjectId = Types.ObjectId.isValid(slug);
    const query: any = isObjectId 
      ? { $or: [{ slug }, { _id: slug }] }
      : { slug };

    let course = await Course.findOne({ ...query, status: 'published' })
      .populate('instructors', 'firstName lastName avatar personnelPhoto bio specialty')
      .populate('categoryId', 'name slug');
      
    if (!course) {
      course = await Course.findOne(query)
        .populate('instructors', 'firstName lastName avatar personnelPhoto bio specialty')
        .populate('categoryId', 'name slug');
    }

    if (!course) throw new AppError('Course not found', 404, 'NOT_FOUND');
    return course;
  }

  static async getRelatedCourses(courseId: string) {
    const course = await Course.findById(courseId);
    if (!course) throw new AppError('Course not found', 404, 'NOT_FOUND');

    return await Course.find({
      _id: { $ne: course._id },
      status: 'published',
      $or: [
        { categoryId: course.categoryId },
        { subjectId: course.subjectId },
        { tags: { $in: course.tags } }
      ]
    })
    .populate('instructors', 'firstName lastName avatar personnelPhoto bio specialty')
    .limit(4);
  }

  
  static async getCourseById(courseId: string) {
    const course = await Course.findById(courseId)
      .populate('instructors', 'firstName lastName avatar personnelPhoto bio specialty')
      .populate('categoryId', 'name slug');
    if (!course) throw new AppError('Course not found', 404, 'NOT_FOUND');
    return course;
  }

  static async getInstructorCourseById(courseId: string, instructorId: string) {
    const course = await Course.findOne({ _id: courseId, instructors: instructorId });
    if (!course) throw new AppError('Course not found or you are not authorized', 404, 'NOT_FOUND');
    return course;
  }
static async getInstructorCourses(instructorId: string, query: any) {
    const page = parseInt(query.page) || 1;
    const limit = query.all === 'true' || query.limit === 'all' ? 1000 : (parseInt(query.limit) || 10);
    const skip = (page - 1) * limit;
    const filter: any = { $or: [{ instructors: instructorId }, { createdBy: instructorId }] };
    if (query.status && query.status !== 'all') {
      filter.status = query.status;
    }
    const courses = await Course.find(filter)
      .populate('categoryId', 'title slug')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    const total = await Course.countDocuments(filter);
    return {
      courses,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  }

  static async getInstructorStats(instructorId: string) {
    const courses = await Course.find({ $or: [{ instructors: instructorId }, { createdBy: instructorId }] });
    const classes = await Class.find({ $or: [{ instructors: instructorId }, { createdBy: instructorId }] });
    
    const totalCourses = courses.length;
    const publishedCourses = courses.filter((c: any) => c.status === 'published').length;
    const drafts = courses.filter((c: any) => c.status === 'draft').length;
    const pending = courses.filter((c: any) => c.status === 'pending_review').length;
    const activeClasses = classes.filter((c: any) => c.status === 'published').length;

    const totalStudents = courses.reduce((acc: number, curr: any) => acc + (curr.studentCount || 0), 0);
    
    
    const courseIds = courses.map((c: any) => c._id);
    
    // Total revenue
    const orders = await Order.find({ 
      status: 'paid', 
      'items.itemType': 'course', 
      'items.itemId': { $in: courseIds } 
    });
    
    let totalRevenue = 0;
    orders.forEach((order: any) => {
      const relevantItems = order.items.filter((item: any) => item.itemType === 'course' && courseIds.some((cid: any) => cid.equals(item.itemId)));
      totalRevenue += relevantItems.reduce((acc: number, curr: any) => acc + curr.finalPrice, 0) * 0.7;
    });

    // Monthly revenue
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlyOrders = orders.filter(o => (o as any).createdAt >= startDate);
    
    let monthlyRevenue = 0;
    monthlyOrders.forEach((order: any) => {
      const relevantItems = order.items.filter((item: any) => item.itemType === 'course' && courseIds.some((cid: any) => cid.equals(item.itemId)));
      monthlyRevenue += relevantItems.reduce((acc: number, curr: any) => acc + curr.finalPrice, 0) * 0.7;
    });
    
    return {
      totalCourses,
      publishedCourses,
      drafts,
      pending,
      activeClasses,
      totalStudents,
      totalRevenue,
      monthlyRevenue
    };
  }

  static async updateCourse(id: string, instructorId: string, data: any, overrideAuth: boolean = false) {
    const query = overrideAuth ? { _id: id } : { _id: id, instructors: instructorId };
    const course = await Course.findOneAndUpdate(
      query,
      data,
      { new: true, runValidators: true }
    );
    if (!course) throw new AppError('Course not found or unauthorized', 404, 'NOT_FOUND');

    // Audit Log for Course Update
    AuditService.log({
      userId: instructorId,
      userRole: overrideAuth ? 'admin' : 'instructor',
      action: 'update_course',
      category: 'course',
      title: `ویرایش اطلاعات دوره «${course.title}»`,
      targetId: course._id.toString(),
      targetType: 'course',
      targetTitle: course.title,
      details: {
        status: course.status,
        price: course.price,
        publishedAt: course.publishedAt
      }
    });

    return course;
  }

  // --- Course Workflows ---
  static async getInstructorAllStudents(instructorId: string, query: any) {
    const courses = await Course.find({ $or: [{ instructors: instructorId }, { createdBy: instructorId }] }).select('_id title slug thumbnail');
    const classes = await Class.find({ $or: [{ instructors: instructorId }, { createdBy: instructorId }] }).select('_id title slug thumbnail mode');
    
    const courseIds = courses.map(c => c._id);
    const classIds = classes.map(c => c._id);
    
    const page = Math.max(1, parseInt(query.page) || 1);
    const limit = Math.max(1, parseInt(query.limit) || 10);
    const filterType = query.type || 'all'; // 'all' | 'course' | 'class'
    const targetItemId = query.item || query.course; // specific courseId or classId or 'all'

    let courseFilter: any = null;
    let classFilter: any = null;

    if (targetItemId && targetItemId !== 'all') {
      const isCourse = courseIds.some(id => id.toString() === targetItemId);
      const isClass = classIds.some(id => id.toString() === targetItemId);
      if (isCourse) {
        courseFilter = { courseId: targetItemId };
      } else if (isClass) {
        classFilter = { classId: targetItemId };
      }
    } else {
      if (filterType === 'all' || filterType === 'course') {
        courseFilter = { courseId: { $in: courseIds } };
      }
      if (filterType === 'all' || filterType === 'class') {
        classFilter = { classId: { $in: classIds } };
      }
    }

    const [courseEnrollments, classEnrollments, totalCoursesCount, totalClassesCount] = await Promise.all([
      courseFilter
        ? Enrollment.find(courseFilter)
            .populate('userId', 'firstName lastName email avatar mobile')
            .populate('courseId', 'title slug thumbnail')
            .lean()
        : Promise.resolve([]),
      classFilter
        ? ClassEnrollment.find(classFilter)
            .populate('userId', 'firstName lastName email avatar mobile')
            .populate('classId', 'title slug thumbnail mode')
            .lean()
        : Promise.resolve([]),
      Enrollment.countDocuments({ courseId: { $in: courseIds } }),
      ClassEnrollment.countDocuments({ classId: { $in: classIds } })
    ]);

    const unifiedList: any[] = [];

    for (const e of courseEnrollments) {
      if (!e.userId) continue;
      unifiedList.push({
        _id: e._id,
        type: 'course',
        userId: e.userId,
        item: {
          _id: (e.courseId as any)?._id || e.courseId,
          title: (e.courseId as any)?.title || 'دوره آموزشی',
          slug: (e.courseId as any)?.slug,
          thumbnail: (e.courseId as any)?.thumbnail,
          type: 'course'
        },
        courseId: e.courseId,
        status: e.status || 'active',
        progress: e.progress || 0,
        amount: e.amount || 0,
        paymentType: 'full',
        enrolledAt: (e as any).createdAt || new Date(),
        createdAt: (e as any).createdAt || new Date()
      });
    }

    for (const c of classEnrollments) {
      if (!c.userId) continue;
      unifiedList.push({
        _id: c._id,
        type: 'class',
        userId: c.userId,
        item: {
          _id: (c.classId as any)?._id || c.classId,
          title: (c.classId as any)?.title || 'کلاس آموزشی',
          slug: (c.classId as any)?.slug,
          thumbnail: (c.classId as any)?.thumbnail,
          type: 'class',
          mode: (c.classId as any)?.mode || 'online'
        },
        courseId: c.classId,
        classId: c.classId,
        status: c.status || 'active',
        progress: c.attendedSessionsCount || 0,
        amount: c.amount || 0,
        paymentType: c.paymentType || 'full',
        depositAmount: c.depositAmount || 0,
        remainingBalance: c.remainingBalance || 0,
        remainingPaid: c.remainingPaid,
        enrolledAt: c.enrolledAt || (c as any).createdAt || new Date(),
        createdAt: (c as any).createdAt || c.enrolledAt || new Date()
      });
    }

    unifiedList.sort((a, b) => new Date(b.enrolledAt).getTime() - new Date(a.enrolledAt).getTime());

    const total = unifiedList.length;
    const skip = (page - 1) * limit;
    const paginated = unifiedList.slice(skip, skip + limit);

    return {
      students: paginated,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit) || 1,
      courses,
      classes,
      stats: {
        totalStudents: totalCoursesCount + totalClassesCount,
        courseStudentsCount: totalCoursesCount,
        classStudentsCount: totalClassesCount
      }
    };
  }

  static async getCourseStudents(courseId: string, query: any) {
    
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const skip = (page - 1) * limit;
    const enrollments = await Enrollment.find({ courseId })
      .populate('userId', 'firstName lastName email avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    const total = await Enrollment.countDocuments({ courseId });
    return { students: enrollments, total, page, pages: Math.ceil(total / limit) };
  }

  static async requestReview(id: string, instructorId: string) {
    const course = await Course.findOneAndUpdate(
      { _id: id, instructors: instructorId, status: { $in: ['draft', 'rejected'] } },
      { status: 'pending_review' },
      { new: true }
    );
    if (!course) throw new AppError('Course not found or not in draft status', 404, 'NOT_FOUND');
    return course;
  }

  static async getAdminCourses(query: any) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const skip = (page - 1) * limit;
    const filter: any = {};
    if (query.status) filter.status = query.status;
    const courses = await Course.find(filter)
      .populate('instructors', 'firstName lastName avatar')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit);
    const total = await Course.countDocuments(filter);
    return { courses, total, page, pages: Math.ceil(total / limit) };
  }

  static async deleteCourse(id: string) {
    const course = await Course.findByIdAndDelete(id);
    if (!course) throw new AppError('Course not found', 404);
    // TODO: cleanup chapters, lessons, etc.
    return course;
  }
  static async publishCourse(id: string) {
    const course = await Course.findByIdAndUpdate(id, { status: 'published', publishedAt: new Date() }, { new: true });
    if (!course) throw new AppError('Course not found', 404, 'NOT_FOUND');
    return course;
  }

  static async rejectCourse(id: string, reason: string) {
    const course = await Course.findByIdAndUpdate(id, { status: 'rejected', rejectionReason: reason }, { new: true });
    if (!course) throw new AppError('Course not found', 404, 'NOT_FOUND');
    return course;
  }

  // --- Chapters ---
  static async createChapter(courseId: string, instructorId: string, data: any, userRole?: string) {
    const course = await Course.findById(courseId);
    if (!course) throw new AppError('Course not found', 404, 'NOT_FOUND');
    
    const isAuthorized = userRole === 'admin' || userRole === 'super-admin' || course.instructors.some((ins: any) => ins.toString() === instructorId?.toString());
    if (!isAuthorized) throw new AppError('Unauthorized', 403, 'FORBIDDEN');
    
    let order = data.order;
    if (order === undefined || order === null || isNaN(Number(order))) {
      const highestOrder = await Chapter.findOne({ courseId }).sort({ order: -1 }).select('order');
      order = highestOrder ? (highestOrder.order + 1) : 1;
    } else {
      order = Number(order);
    }
    
    return await Chapter.create({ ...data, order, courseId });
  }

  static async updateChapter(chapterId: string, instructorId: string, data: any, userRole?: string) {
    const chapter = await Chapter.findById(chapterId);
    if (!chapter) throw new AppError('Chapter not found', 404, 'NOT_FOUND');
    const course = await Course.findById(chapter.courseId);
    if (!course) throw new AppError('Course not found', 404, 'NOT_FOUND');
    
    const isAuthorized = userRole === 'admin' || userRole === 'super-admin' || course.instructors.some((ins: any) => ins.toString() === instructorId?.toString());
    if (!isAuthorized) throw new AppError('Unauthorized', 403, 'FORBIDDEN');
    
    return await Chapter.findByIdAndUpdate(chapterId, data, { new: true });
  }

  static async deleteChapter(chapterId: string, instructorId: string, userRole?: string) {
    const chapter = await Chapter.findById(chapterId);
    if (!chapter) throw new AppError('Chapter not found', 404, 'NOT_FOUND');
    const course = await Course.findById(chapter.courseId);
    if (!course) throw new AppError('Course not found', 404, 'NOT_FOUND');
    
    const isAuthorized = userRole === 'admin' || userRole === 'super-admin' || course.instructors.some((ins: any) => ins.toString() === instructorId?.toString());
    if (!isAuthorized) throw new AppError('Unauthorized', 403, 'FORBIDDEN');
    
    await Chapter.findByIdAndDelete(chapterId);
    await Lesson.deleteMany({ chapterId });
    return { success: true };
  }
  
  static async getChapters(courseId: string) {
    return await Chapter.find({ courseId }).sort({ order: 1 });
  }

  // --- Lessons ---
  static async createLesson(chapterId: string, instructorId: string, data: any, userRole?: string) {
    const chapter = await Chapter.findById(chapterId);
    if (!chapter) throw new AppError('Chapter not found', 404, 'NOT_FOUND');

    const course = await Course.findById(chapter.courseId);
    if (!course) throw new AppError('Course not found', 404, 'NOT_FOUND');

    const isAuthorized = userRole === 'admin' || userRole === 'super-admin' || course.instructors.some((ins: any) => ins.toString() === instructorId?.toString());
    if (!isAuthorized) throw new AppError('Course not found or unauthorized', 403, 'FORBIDDEN');

    let order = data.order;
    if (order === undefined || order === null || isNaN(Number(order))) {
      const highestOrder = await Lesson.findOne({ chapterId }).sort({ order: -1 }).select('order');
      order = highestOrder ? (highestOrder.order + 1) : 1;
    } else {
      order = Number(order);
    }

    const isFree = data.isFree !== undefined ? Boolean(data.isFree) : Boolean(data.isFreePreview);

    let video = data.video;
    if (!video && data.videoUrl) {
      video = {
        provider: 'self_hosted',
        externalId: data.videoUrl,
        duration: Number(data.duration) || 0,
      };
    }

    return await Lesson.create({
      ...data,
      order,
      isFree,
      ...(video ? { video } : {}),
      chapterId,
      courseId: course._id
    });
  }

  static async updateLesson(lessonId: string, instructorId: string, data: any, userRole?: string) {
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) throw new AppError('Lesson not found', 404, 'NOT_FOUND');
    const course = await Course.findById(lesson.courseId);
    if (!course) throw new AppError('Course not found', 404, 'NOT_FOUND');
    
    const isAuthorized = userRole === 'admin' || userRole === 'super-admin' || course.instructors.some((ins: any) => ins.toString() === instructorId?.toString());
    if (!isAuthorized) throw new AppError('Unauthorized', 403, 'FORBIDDEN');
    
    if (data.videoUrl && !data.video) {
      data.video = {
        provider: 'self_hosted',
        externalId: data.videoUrl,
        duration: Number(data.duration) || 0,
      };
    }
    if (data.isFreePreview !== undefined && data.isFree === undefined) {
      data.isFree = Boolean(data.isFreePreview);
    }

    return await Lesson.findByIdAndUpdate(lessonId, data, { new: true });
  }

  static async deleteLesson(lessonId: string, instructorId: string, userRole?: string) {
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) throw new AppError('Lesson not found', 404, 'NOT_FOUND');
    const course = await Course.findById(lesson.courseId);
    if (!course) throw new AppError('Course not found', 404, 'NOT_FOUND');
    
    const isAuthorized = userRole === 'admin' || userRole === 'super-admin' || course.instructors.some((ins: any) => ins.toString() === instructorId?.toString());
    if (!isAuthorized) throw new AppError('Unauthorized', 403, 'FORBIDDEN');
    
    await Lesson.findByIdAndDelete(lessonId);
    return { success: true };
  }
  
  static async getLessons(chapterId: string) {
    const lessons = await Lesson.find({ chapterId }).sort({ order: 1 });
    // Strip secure content if not fetching via secure route
    return lessons.map(l => {
      const lObj = l.toObject();
      if (!lObj.isFree) {
        delete (lObj as any).video;
        delete (lObj as any).files;
      }
      return lObj;
    });
  }

  static async toggleRegistration(courseId: string, userId: string, isOpen?: boolean) {
    const course = await Course.findById(courseId);
    if (!course) throw new AppError('دوره یافت نشد', 404, 'NOT_FOUND');

    const newStatus = typeof isOpen === 'boolean' ? isOpen : !course.isRegistrationOpen;
    course.isRegistrationOpen = newStatus;
    await course.save();

    AuditService.log({
      userId,
      userRole: 'admin',
      action: 'toggle_course_registration',
      category: 'course',
      title: `${newStatus ? 'باز کردن' : 'بستن'} ثبت‌نام دوره «${course.title}»`,
      targetId: course._id.toString(),
      targetType: 'course',
      targetTitle: course.title,
      details: { isRegistrationOpen: newStatus }
    });

    return course;
  }
}
