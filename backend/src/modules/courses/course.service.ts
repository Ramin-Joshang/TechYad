import { Course } from './course.model.js';
import { Chapter } from './chapter.model.js';
import { Lesson } from './lesson.model.js';
import { AppError } from '../../common/errors/AppError.js';
import { Class } from '../classes/class.model.js';
import { Order } from '../commerce/order.model.js';
import { Enrollment } from '../learning/enrollment.model.js';

export class CourseService {
  // --- Courses ---
  static async createCourse(instructorId: string, data: any) {
    return await Course.create({
      ...data,
      instructors: [instructorId],
      createdBy: instructorId,
      status: 'draft'
    });
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
      .populate('instructors', 'firstName lastName avatar')
      .populate('categoryId', 'name slug')
      .sort(sortOption)
      .skip(skip)
      .limit(limit);

    const total = await Course.countDocuments(filter);

    return { courses, total, page, limit, pages: Math.ceil(total / limit) };
  }

  static async getCourseBySlug(slug: string) {
    const course = await Course.findOne({ slug, status: 'published' })
      .populate('instructors', 'firstName lastName avatar bio')
      .populate('categoryId', 'name slug');
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
    .populate('instructors', 'firstName lastName avatar')
    .limit(4);
  }

  
  static async getInstructorCourseById(courseId: string, instructorId: string) {
    const course = await Course.findOne({ _id: courseId, instructors: instructorId });
    if (!course) throw new AppError('Course not found or you are not authorized', 404, 'NOT_FOUND');
    return course;
  }
static async getInstructorCourses(instructorId: string, query: any) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const skip = (page - 1) * limit;
    const filter: any = { instructors: instructorId };
    if (query.status) {
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
    const courses = await Course.find({ instructors: instructorId });
    
    const classes = await Class.find({ instructors: instructorId });
    
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

  static async updateCourse(id: string, instructorId: string, data: any) {
    const course = await Course.findOneAndUpdate(
      { _id: id, instructors: instructorId },
      data,
      { new: true, runValidators: true }
    );
    if (!course) throw new AppError('Course not found or unauthorized', 404, 'NOT_FOUND');
    return course;
  }

  // --- Course Workflows ---
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
  static async createChapter(courseId: string, instructorId: string, data: any) {
    const course = await Course.findOne({ _id: courseId, instructors: instructorId });
    if (!course) throw new AppError('Course not found or unauthorized', 404, 'NOT_FOUND');
    
    return await Chapter.create({ ...data, courseId });
  }

  
  static async updateChapter(chapterId: string, instructorId: string, data: any) {
    const chapter = await Chapter.findById(chapterId);
    if (!chapter) throw new AppError('Chapter not found', 404, 'NOT_FOUND');
    const course = await Course.findOne({ _id: chapter.courseId, instructors: instructorId });
    if (!course) throw new AppError('Unauthorized', 403, 'FORBIDDEN');
    
    return await Chapter.findByIdAndUpdate(chapterId, data, { new: true });
  }

  static async deleteChapter(chapterId: string, instructorId: string) {
    const chapter = await Chapter.findById(chapterId);
    if (!chapter) throw new AppError('Chapter not found', 404, 'NOT_FOUND');
    const course = await Course.findOne({ _id: chapter.courseId, instructors: instructorId });
    if (!course) throw new AppError('Unauthorized', 403, 'FORBIDDEN');
    
    await Chapter.findByIdAndDelete(chapterId);
    // Cascade delete lessons? Yes.
    await Lesson.deleteMany({ chapterId });
    return { success: true };
  }
  
  static async getChapters(courseId: string) {
    return await Chapter.find({ courseId }).sort({ order: 1 });
  }

  // --- Lessons ---
  static async createLesson(chapterId: string, instructorId: string, data: any) {
    const chapter = await Chapter.findById(chapterId);
    if (!chapter) throw new AppError('Chapter not found', 404, 'NOT_FOUND');

    const course = await Course.findOne({ _id: chapter.courseId, instructors: instructorId });
    if (!course) throw new AppError('Course not found or unauthorized', 404, 'NOT_FOUND');

    return await Lesson.create({ ...data, chapterId, courseId: course._id });
  }

  
  static async updateLesson(lessonId: string, instructorId: string, data: any) {
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) throw new AppError('Lesson not found', 404, 'NOT_FOUND');
    const course = await Course.findOne({ _id: lesson.courseId, instructors: instructorId });
    if (!course) throw new AppError('Unauthorized', 403, 'FORBIDDEN');
    
    return await Lesson.findByIdAndUpdate(lessonId, data, { new: true });
  }

  static async deleteLesson(lessonId: string, instructorId: string) {
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) throw new AppError('Lesson not found', 404, 'NOT_FOUND');
    const course = await Course.findOne({ _id: lesson.courseId, instructors: instructorId });
    if (!course) throw new AppError('Unauthorized', 403, 'FORBIDDEN');
    
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
}
