import { Types } from "mongoose";
import { Comment, IComment } from "./comment.model.js";
import { Course } from "../courses/course.model.js";
import { Class } from "../classes/class.model.js";
import { AppError } from "../../common/errors/AppError.js";
import { AuditService } from "../../common/services/audit.service.js";

export class CommentService {
  /**
   * Helper to verify if user is an instructor of the specified course or class
   */
  private static async isUserTeacherOfEntity(
    userId: string, 
    courseId?: string | Types.ObjectId, 
    classId?: string | Types.ObjectId
  ): Promise<boolean> {
    if (courseId) {
      const course = await Course.findById(courseId).select('instructors').lean();
      if (course && Array.isArray(course.instructors)) {
        return course.instructors.some((id: any) => id.toString() === userId.toString());
      }
    }
    if (classId) {
      const classItem = await Class.findById(classId).select('instructors').lean();
      if (classItem && Array.isArray(classItem.instructors)) {
        return classItem.instructors.some((id: any) => id.toString() === userId.toString());
      }
    }
    return false;
  }

  /**
   * Add a new comment or reply by an authenticated user
   */
  static async addComment(
    userId: string, 
    userRole: string,
    data: {
      courseId?: string;
      classId?: string;
      content: string;
      parentId?: string;
      rating?: number;
    },
    req?: any
  ) {
    if (!data.content || !data.content.trim()) {
      throw new AppError("متن دیدگاه نمی‌تواند خالی باشد", 400);
    }

    let courseId = data.courseId;
    let classId = data.classId;
    let parentComment: IComment | null = null;

    if (data.parentId) {
      parentComment = await Comment.findById(data.parentId);
      if (!parentComment) {
        throw new AppError("دیدگاه والد برای پاسخ یافت نشد", 404);
      }
      // Inherit courseId or classId from parent if not provided
      courseId = courseId || parentComment.courseId?.toString();
      classId = classId || parentComment.classId?.toString();
    }

    if (!courseId && !classId) {
      throw new AppError("مشخص کردن دوره یا کلاس مربوطه الزامی است", 400);
    }

    // Determine target entity title for logging
    let targetTitle = "دوره / کلاس";
    let targetType = courseId ? "Course" : "Class";
    let targetId = courseId || classId;

    if (courseId) {
      const course = await Course.findById(courseId).select('title').lean();
      if (!course) throw new AppError("دوره مورد نظر یافت نشد", 404);
      targetTitle = course.title;
    } else if (classId) {
      const classItem = await Class.findById(classId).select('title').lean();
      if (!classItem) throw new AppError("کلاس مورد نظر یافت نشد", 404);
      targetTitle = classItem.title;
    }

    // Check if the commenter is the course/class instructor or admin
    const isTeacher = await this.isUserTeacherOfEntity(userId, courseId, classId);
    const isAdminOrSuper = userRole === 'admin' || userRole === 'super-admin';
    const isTeacherReply = isTeacher || (Boolean(data.parentId) && isTeacher);

    // If teacher replies or admin replies, auto-approve; student comments default to 'pending'
    const status = (isTeacher || isAdminOrSuper) ? 'approved' : 'pending';

    const comment = await Comment.create({
      userId: new Types.ObjectId(userId),
      courseId: courseId ? new Types.ObjectId(courseId) : undefined,
      classId: classId ? new Types.ObjectId(classId) : undefined,
      parentId: data.parentId ? new Types.ObjectId(data.parentId) : undefined,
      content: data.content.trim(),
      rating: data.rating && data.rating >= 1 && data.rating <= 5 ? data.rating : undefined,
      status,
      isTeacherReply,
    });

    // Populate user info for immediate response
    await comment.populate('userId', 'firstName lastName avatar role');

    // Audit Log
    AuditService.log({
      req,
      userId,
      userRole: userRole as any,
      action: isTeacherReply ? 'COMMENT_TEACHER_REPLY' : data.parentId ? 'COMMENT_REPLY' : 'COMMENT_CREATE',
      title: isTeacherReply ? `پاسخ مدرس به نظر در ${targetTitle}` : `ثبت نظر جدید در ${targetTitle}`,
      category: 'course',
      targetId,
      targetType,
      targetTitle,
      details: {
        commentId: comment._id,
        isTeacherReply,
        status,
        rating: comment.rating,
        contentSnippet: data.content.substring(0, 100)
      }
    });

    return comment;
  }

  /**
   * Instructor dedicated reply endpoint
   */
  static async replyAsInstructor(
    instructorId: string,
    commentId: string,
    content: string,
    req?: any
  ) {
    if (!content || !content.trim()) {
      throw new AppError("متن پاسخ نمی‌تواند خالی باشد", 400);
    }

    const parentComment = await Comment.findById(commentId);
    if (!parentComment) {
      throw new AppError("دیدگاه مورد نظر یافت نشد", 404);
    }

    const isTeacher = await this.isUserTeacherOfEntity(
      instructorId, 
      parentComment.courseId, 
      parentComment.classId
    );

    const isAdmin = req?.user?.role === 'admin' || req?.user?.role === 'super-admin';

    if (!isTeacher && !isAdmin) {
      throw new AppError("شما مدرس این دوره یا کلاس نیستید و اجازه ارسال پاسخ اختصاصی مدرس را ندارید", 403);
    }

    const reply = await Comment.create({
      userId: new Types.ObjectId(instructorId),
      courseId: parentComment.courseId,
      classId: parentComment.classId,
      parentId: parentComment._id,
      content: content.trim(),
      status: 'approved',
      isTeacherReply: true,
    });

    await reply.populate('userId', 'firstName lastName avatar role');

    AuditService.log({
      req,
      userId: instructorId,
      action: 'INSTRUCTOR_REPLY_PUBLISHED',
      title: 'ارسال پاسخ رسمی مدرس به نظر دانشجو',
      category: 'course',
      targetId: parentComment.courseId?.toString() || parentComment.classId?.toString(),
      details: { parentCommentId: commentId, replyId: reply._id }
    });

    return reply;
  }

  /**
   * Get public approved comments for a Course or Class (with replies tree and ratings)
   */
  static async getApprovedComments(query: {
    courseId?: string;
    courseSlug?: string;
    classId?: string;
    classSlug?: string;
    page?: number;
    limit?: number;
  }) {
    let courseId = query.courseId;
    let classId = query.classId;

    // Resolve slugs to IDs if provided
    if (!courseId && query.courseSlug) {
      const course = await Course.findOne({ slug: query.courseSlug }).select('_id averageRating reviewCount').lean();
      if (course) courseId = course._id.toString();
    }

    if (!classId && query.classSlug) {
      const classItem = await Class.findOne({ slug: query.classSlug }).select('_id rating').lean();
      if (classItem) classId = classItem._id.toString();
    }

    if (!courseId && !classId) {
      return {
        comments: [],
        total: 0,
        page: 1,
        totalPages: 1,
        stats: { averageRating: 0, totalReviews: 0, totalComments: 0 }
      };
    }

    const filter: any = {
      status: 'approved',
      parentId: { $exists: false } // Only top-level comments
    };

    if (courseId) filter.courseId = new Types.ObjectId(courseId);
    if (classId) filter.classId = new Types.ObjectId(classId);

    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(50, Number(query.limit) || 10));
    const skip = (page - 1) * limit;

    const [topComments, totalTopComments, allRatedComments] = await Promise.all([
      Comment.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'firstName lastName avatar role')
        .lean(),
      Comment.countDocuments(filter),
      Comment.find({
        ...(courseId ? { courseId: new Types.ObjectId(courseId) } : { classId: new Types.ObjectId(classId) }),
        status: 'approved',
        rating: { $exists: true, $ne: null }
      }).select('rating').lean()
    ]);

    // Fetch replies for each top-level comment
    const topCommentIds = topComments.map(c => c._id);
    const replies = await Comment.find({
      parentId: { $in: topCommentIds },
      status: 'approved'
    })
      .sort({ createdAt: 1 })
      .populate('userId', 'firstName lastName avatar role')
      .lean();

    // Group replies under each parent comment
    const repliesByParentId = new Map<string, any[]>();
    for (const reply of replies) {
      const pId = reply.parentId?.toString();
      if (!pId) continue;
      if (!repliesByParentId.has(pId)) {
        repliesByParentId.set(pId, []);
      }
      repliesByParentId.get(pId)!.push(reply);
    }

    const commentsWithReplies = topComments.map(c => ({
      ...c,
      replies: repliesByParentId.get(c._id.toString()) || []
    }));

    // Calculate rating stats
    const totalReviews = allRatedComments.length;
    const averageRating = totalReviews > 0
      ? Number((allRatedComments.reduce((acc, curr) => acc + (curr.rating || 0), 0) / totalReviews).toFixed(1))
      : 5.0;

    return {
      comments: commentsWithReplies,
      total: totalTopComments,
      page,
      limit,
      totalPages: Math.ceil(totalTopComments / limit) || 1,
      stats: {
        averageRating,
        totalReviews,
        totalComments: totalTopComments
      }
    };
  }

  /**
   * Admin / Super-Admin: Get all comments with status and target filtering
   */
  static async getAdminComments(query: {
    status?: string;
    targetType?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const filter: any = {};

    if (query.status && query.status !== 'all') {
      filter.status = query.status;
    }

    if (query.targetType === 'course') {
      filter.courseId = { $exists: true, $ne: null };
    } else if (query.targetType === 'class') {
      filter.classId = { $exists: true, $ne: null };
    }

    if (query.search && query.search.trim()) {
      const s = query.search.trim();
      filter.content = { $regex: s, $options: 'i' };
    }

    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const [comments, total, statsCounts] = await Promise.all([
      Comment.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'firstName lastName email avatar role')
        .populate('courseId', 'title slug')
        .populate('classId', 'title slug')
        .populate({
          path: 'parentId',
          select: 'content userId',
          populate: { path: 'userId', select: 'firstName lastName' }
        })
        .lean(),
      Comment.countDocuments(filter),
      Promise.all([
        Comment.countDocuments(),
        Comment.countDocuments({ status: 'pending' }),
        Comment.countDocuments({ status: 'approved' }),
        Comment.countDocuments({ status: 'rejected' })
      ])
    ]);

    return {
      comments: comments.map(c => ({
        ...c,
        targetTitle: c.courseId ? (c.courseId as any).title : c.classId ? (c.classId as any).title : 'دوره یا کلاس نامشخص',
        targetType: c.courseId ? 'course' : 'class',
        targetSlug: c.courseId ? (c.courseId as any).slug : c.classId ? (c.classId as any).slug : ''
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
      stats: {
        total: statsCounts[0],
        pending: statsCounts[1],
        approved: statsCounts[2],
        rejected: statsCounts[3]
      }
    };
  }

  /**
   * Admin: Moderate a comment (approve / reject)
   */
  static async moderateComment(commentId: string, status: 'approved' | 'rejected', adminId?: string, req?: any) {
    const comment = await Comment.findById(commentId);
    if (!comment) {
      throw new AppError("دیدگاه مورد نظر یافت نشد", 404);
    }

    comment.status = status;
    await comment.save();

    // If approved and has course & rating, optionally recompute course rating
    if (status === 'approved' && comment.courseId && comment.rating) {
      try {
        const ratings = await Comment.find({
          courseId: comment.courseId,
          status: 'approved',
          rating: { $exists: true, $ne: null }
        }).select('rating').lean();

        if (ratings.length > 0) {
          const avg = ratings.reduce((sum, r) => sum + (r.rating || 0), 0) / ratings.length;
          await Course.findByIdAndUpdate(comment.courseId, {
            averageRating: Number(avg.toFixed(1)),
            reviewCount: ratings.length
          });
        }
      } catch (e) {
        console.warn('Failed to update course average rating:', e);
      }
    }

    AuditService.log({
      req,
      userId: adminId,
      action: status === 'approved' ? 'COMMENT_APPROVED' : 'COMMENT_REJECTED',
      title: status === 'approved' ? 'تایید دیدگاه در سیستم' : 'رد دیدگاه در سیستم',
      category: 'course',
      targetId: commentId,
      details: { commentId, newStatus: status }
    });

    return comment;
  }

  /**
   * Admin / Owner: Delete a comment and its nested replies
   */
  static async deleteComment(commentId: string, adminId?: string, req?: any) {
    const comment = await Comment.findById(commentId);
    if (!comment) {
      throw new AppError("دیدگاه مورد نظر یافت نشد", 404);
    }

    // Delete child replies
    await Comment.deleteMany({ parentId: comment._id });
    await Comment.findByIdAndDelete(commentId);

    AuditService.log({
      req,
      userId: adminId,
      action: 'COMMENT_DELETED',
      title: 'حذف دیدگاه و پاسخ‌های آن',
      category: 'course',
      targetId: commentId,
      details: { commentId }
    });

    return { success: true };
  }
}
