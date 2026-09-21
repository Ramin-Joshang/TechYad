import { Article } from './article.model.js';
import { BlogCategory } from './blog-category.model.js';
import { AppError } from '../../common/errors/AppError.js';

export class BlogService {
  // --- Public / General Methods ---
  static async getPublishedArticles(query: any = {}) {
    const filter: any = { status: 'published' };
    if (query.category) {
      const category = await BlogCategory.findOne({ 
        $or: [{ slug: query.category }, { _id: query.category }] 
      });
      if (category) {
        filter.categoryId = category._id;
      }
    }
    if (query.tag) {
      filter.tags = query.tag;
    }
    if (query.search) {
      filter.$or = [
        { title: { $regex: query.search, $options: 'i' } },
        { excerpt: { $regex: query.search, $options: 'i' } }
      ];
    }

    return await Article.find(filter)
      .populate('authorId', 'firstName lastName avatar role')
      .populate('categoryId', 'name slug')
      .sort({ publishedAt: -1, createdAt: -1 });
  }

  static async getArticleBySlug(slug: string) {
    let decoded = slug;
    try { decoded = decodeURIComponent(slug); } catch (e) {}

    let article = await Article.findOne({
      $or: [
        { slug },
        { slug: decoded }
      ]
    })
      .populate('authorId', 'firstName lastName avatar role bio')
      .populate('categoryId', 'name slug');

    if (!article && /^[0-9a-fA-F]{24}$/.test(slug)) {
      article = await Article.findById(slug)
        .populate('authorId', 'firstName lastName avatar role bio')
        .populate('categoryId', 'name slug');
    }

    if (!article) throw new AppError('مقاله یافت نشد', 404, 'NOT_FOUND');

    // Increment views
    await Article.findByIdAndUpdate(article._id, { $inc: { viewsCount: 1 } });
    return article;
  }

  // --- Category Management (Admin / Public) ---
  static async getCategories(onlyActive = true) {
    const filter = onlyActive ? { isActive: true } : {};
    const categories = await BlogCategory.find(filter).sort({ order: 1, createdAt: -1 }).lean();
    
    // Enrich with count of published articles
    const enriched = await Promise.all(categories.map(async (cat) => {
      const articlesCount = await Article.countDocuments({ categoryId: cat._id, status: 'published' });
      return { ...cat, articlesCount };
    }));
    return enriched;
  }

  static async createCategory(data: any) {
    const existing = await BlogCategory.findOne({ slug: data.slug.toLowerCase().trim() });
    if (existing) throw new AppError('دسته‌بندی با این نامک (slug) قبلاً ثبت شده است', 400);

    return await BlogCategory.create({
      name: data.name.trim(),
      slug: data.slug.toLowerCase().trim(),
      description: data.description,
      isActive: data.isActive !== undefined ? data.isActive : true,
      order: data.order || 0
    });
  }

  static async updateCategory(id: string, data: any) {
    const category = await BlogCategory.findById(id);
    if (!category) throw new AppError('دسته‌بندی یافت نشد', 404);

    if (data.slug && data.slug !== category.slug) {
      const existing = await BlogCategory.findOne({ slug: data.slug.toLowerCase().trim() });
      if (existing) throw new AppError('این نامک (slug) توسط دسته‌بندی دیگری استفاده شده است', 400);
      category.slug = data.slug.toLowerCase().trim();
    }
    if (data.name) category.name = data.name.trim();
    if (data.description !== undefined) category.description = data.description;
    if (data.isActive !== undefined) category.isActive = data.isActive;
    if (data.order !== undefined) category.order = data.order;

    await category.save();
    return category;
  }

  static async deleteCategory(id: string) {
    const category = await BlogCategory.findById(id);
    if (!category) throw new AppError('دسته‌بندی یافت نشد', 404);

    // Unassign category from articles
    await Article.updateMany({ categoryId: id }, { $unset: { categoryId: 1 } });
    await BlogCategory.findByIdAndDelete(id);
    return { message: 'دسته‌بندی با موفقیت حذف شد' };
  }

  // --- Tags Management (Aggregate distinct tags) ---
  static async getAllTags() {
    const tags = await Article.distinct('tags');
    return tags.filter(Boolean);
  }

  // --- Admin Article Management ---
  static async getAllAdminArticles(query: any = {}) {
    const filter: any = {};
    if (query.status && query.status !== 'all') {
      filter.status = query.status;
    }
    if (query.categoryId) {
      filter.categoryId = query.categoryId;
    }
    if (query.authorId) {
      filter.authorId = query.authorId;
    }
    if (query.search) {
      filter.$or = [
        { title: { $regex: query.search, $options: 'i' } },
        { excerpt: { $regex: query.search, $options: 'i' } },
        { tags: { $in: [new RegExp(query.search, 'i')] } }
      ];
    }

    const articles = await Article.find(filter)
      .populate('authorId', 'firstName lastName avatar role email')
      .populate('categoryId', 'name slug')
      .sort({ createdAt: -1 });

    const total = await Article.countDocuments();
    const published = await Article.countDocuments({ status: 'published' });
    const pending = await Article.countDocuments({ status: 'pending_review' });
    const draft = await Article.countDocuments({ status: 'draft' });
    const rejected = await Article.countDocuments({ status: 'rejected' });

    return {
      articles,
      stats: {
        total,
        published,
        pending,
        draft,
        rejected
      }
    };
  }

  static async createAdminArticle(authorId: string, data: any) {
    const slug = (data.slug || data.title)
      .toLowerCase()
      .trim()
      .replace(/[^\w\u0600-\u06FF\s-]/g, '')
      .replace(/\s+/g, '-');

    const existing = await Article.findOne({ slug });
    if (existing) {
      data.slug = `${slug}-${Date.now().toString().slice(-4)}`;
    } else {
      data.slug = slug;
    }

    const article = await Article.create({
      ...data,
      authorId,
      status: data.status || 'published',
      publishedAt: data.status === 'published' ? new Date() : undefined
    });
    return article;
  }

  static async updateAdminArticle(id: string, data: any) {
    const article = await Article.findById(id);
    if (!article) throw new AppError('مقاله یافت نشد', 404);

    if (data.status === 'published' && article.status !== 'published') {
      data.publishedAt = new Date();
    }

    const updated = await Article.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    )
      .populate('authorId', 'firstName lastName avatar')
      .populate('categoryId', 'name slug');

    return updated;
  }

  static async changeArticleStatus(id: string, status: string, rejectionReason?: string) {
    const article = await Article.findById(id);
    if (!article) throw new AppError('مقاله یافت نشد', 404);

    article.status = status as any;
    if (status === 'published' && !article.publishedAt) {
      article.publishedAt = new Date();
    }
    if (rejectionReason) {
      article.rejectionReason = rejectionReason;
    }

    await article.save();
    return article;
  }

  static async deleteArticle(id: string, user: any) {
    const article = await Article.findById(id);
    if (!article) throw new AppError('مقاله یافت نشد', 404);

    const isSuperAdmin = user.role?.slug === 'super-admin';
    const isAdmin = user.role?.slug === 'admin';
    const isAuthor = article.authorId.toString() === user._id.toString();

    if (!isSuperAdmin && !isAdmin && !isAuthor) {
      throw new AppError('شما دسترسی لازم برای حذف این مقاله را ندارید', 403);
    }

    await Article.findByIdAndDelete(id);
    return { message: 'مقاله با موفقیت حذف شد' };
  }

  // --- Instructor Article Management ---
  static async getInstructorArticles(instructorId: string) {
    const articles = await Article.find({ authorId: instructorId })
      .populate('categoryId', 'name slug')
      .sort({ createdAt: -1 });

    const total = articles.length;
    const published = articles.filter(a => a.status === 'published').length;
    const pending = articles.filter(a => a.status === 'pending_review').length;
    const draft = articles.filter(a => a.status === 'draft').length;
    const rejected = articles.filter(a => a.status === 'rejected').length;

    return {
      articles,
      stats: {
        total,
        published,
        pending,
        draft,
        rejected
      }
    };
  }

  static async createInstructorArticle(instructorId: string, data: any) {
    const slug = (data.slug || data.title)
      .toLowerCase()
      .trim()
      .replace(/[^\w\u0600-\u06FF\s-]/g, '')
      .replace(/\s+/g, '-');

    const existing = await Article.findOne({ slug });
    const finalSlug = existing ? `${slug}-${Date.now().toString().slice(-4)}` : slug;

    // Instructors can only create as 'draft' or 'pending_review'
    const status = data.submitForReview ? 'pending_review' : 'draft';

    const article = await Article.create({
      ...data,
      slug: finalSlug,
      authorId: instructorId,
      status,
      publishedAt: undefined // Instructors cannot directly publish
    });

    return article;
  }

  static async updateInstructorArticle(id: string, instructorId: string, data: any) {
    const article = await Article.findOne({ _id: id, authorId: instructorId });
    if (!article) throw new AppError('مقاله یافت نشد یا شما دسترسی به آن ندارید', 404);

    // If currently published and instructor edits, it returns to pending_review or remains published according to policy
    let newStatus = article.status;
    if (data.submitForReview) {
      newStatus = 'pending_review';
    } else if (data.status === 'draft') {
      newStatus = 'draft';
    }

    const updated = await Article.findByIdAndUpdate(
      id,
      {
        $set: {
          ...data,
          status: newStatus
        }
      },
      { new: true }
    ).populate('categoryId', 'name slug');

    return updated;
  }
}
