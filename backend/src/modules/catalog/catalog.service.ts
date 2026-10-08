import { Types } from 'mongoose';
import { Category, ICategory } from './category.model.js';
import { Subject, Field, Level } from './simple-catalog.model.js';
import { Course } from '../courses/course.model.js';
import { Class } from '../classes/class.model.js';
import { AppError } from '../../common/errors/AppError.js';

export interface CategoryTreeItem {
  _id: string;
  name: string;
  slug: string;
  parentId?: string | null;
  level: number;
  description?: string;
  isActive: boolean;
  sortOrder: number;
  image?: string;
  icon?: string;
  seoTitle?: string;
  seoDescription?: string;
  courseCount?: number;
  classCount?: number;
  children: CategoryTreeItem[];
}

export class CatalogService {
  /**
   * Recursively get all descendant category IDs for a given category ID
   */
  static async getAllDescendantCategoryIds(categoryId: string | Types.ObjectId): Promise<Types.ObjectId[]> {
    const objectId = typeof categoryId === 'string' ? new Types.ObjectId(categoryId) : categoryId;
    const result: Types.ObjectId[] = [objectId];

    const findChildren = async (parentId: Types.ObjectId) => {
      const children = await Category.find({ parentId, isActive: true }, { _id: 1 }).lean();
      for (const child of children) {
        result.push(child._id as Types.ObjectId);
        await findChildren(child._id as Types.ObjectId);
      }
    };

    await findChildren(objectId);
    return result;
  }

  /**
   * Helper to verify if targetParentId is a descendant of categoryId (circular reference check)
   */
  private static async isDescendantOf(potentialDescendantId: string, ancestorId: string): Promise<boolean> {
    if (potentialDescendantId === ancestorId) return true;
    let current = await Category.findById(potentialDescendantId).lean();
    while (current && current.parentId) {
      if (current.parentId.toString() === ancestorId) {
        return true;
      }
      current = await Category.findById(current.parentId).lean();
    }
    return false;
  }

  // --- Category Management ---

  static async createCategory(data: any) {
    const slug = String(data.slug || '').toLowerCase().trim();
    if (!slug) {
      throw new AppError('شناسه دسته‌بندی (slug) الزامی است', 400, 'VALIDATION_ERROR');
    }

    const existingSlug = await Category.findOne({ slug });
    if (existingSlug) {
      throw new AppError('دسته‌بندی با این شناسه انگلیسی (slug) از قبل وجود دارد', 400, 'CATEGORY_SLUG_EXISTS');
    }

    let level = 0;
    let parentId = null;

    if (data.parentId && String(data.parentId).trim() !== '') {
      const parent = await Category.findById(data.parentId);
      if (!parent) {
        throw new AppError('دسته‌بندی والد مشخص شده یافت نشد', 400, 'PARENT_NOT_FOUND');
      }
      parentId = parent._id;
      level = (parent.level || 0) + 1;
    }

    const category = await Category.create({
      name: data.name.trim(),
      slug,
      parentId,
      level,
      description: data.description || '',
      isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
      sortOrder: data.sortOrder !== undefined ? Number(data.sortOrder) : 0,
      image: data.image || '',
      icon: data.icon || '',
      seoTitle: data.seoTitle || '',
      seoDescription: data.seoDescription || '',
    });

    return category;
  }

  static async getCategories(options: { tree?: boolean; includeInactive?: boolean; parentId?: string | null } = {}) {
    const filter: any = {};
    if (!options.includeInactive) {
      filter.isActive = true;
    }
    if (options.parentId !== undefined) {
      filter.parentId = options.parentId === 'null' || !options.parentId ? null : options.parentId;
    }

    const categories = await Category.find(filter)
      .populate('parentId', 'name slug level')
      .sort({ level: 1, sortOrder: 1, createdAt: 1 })
      .lean();

    // Enrich categories with course and class counts
    const categoryIds = categories.map((c) => c._id);

    const [courseCounts, classCounts] = await Promise.all([
      Course.aggregate([
        { $match: { categoryId: { $in: categoryIds }, status: 'published' } },
        { $group: { _id: '$categoryId', count: { $sum: 1 } } }
      ]),
      Class.aggregate([
        { $match: { categoryId: { $in: categoryIds }, status: 'published' } },
        { $group: { _id: '$categoryId', count: { $sum: 1 } } }
      ])
    ]);

    const courseCountMap = new Map<string, number>();
    courseCounts.forEach((c) => courseCountMap.set(c._id.toString(), c.count));

    const classCountMap = new Map<string, number>();
    classCounts.forEach((c) => classCountMap.set(c._id.toString(), c.count));

    const enriched = categories.map((cat) => ({
      ...cat,
      courseCount: courseCountMap.get(cat._id.toString()) || 0,
      classCount: classCountMap.get(cat._id.toString()) || 0,
    }));

    if (options.tree) {
      return this.buildTree(enriched);
    }

    return enriched;
  }

  private static buildTree(flatCategories: any[]): CategoryTreeItem[] {
    const map = new Map<string, any>();
    const tree: CategoryTreeItem[] = [];

    // Initialize all items in map with empty children array
    flatCategories.forEach((cat) => {
      map.set(cat._id.toString(), {
        ...cat,
        children: [],
      });
    });

    // Link children to their parent
    flatCategories.forEach((cat) => {
      const parentIdStr = cat.parentId ? (typeof cat.parentId === 'object' ? cat.parentId._id?.toString() : cat.parentId.toString()) : null;
      if (parentIdStr && map.has(parentIdStr)) {
        map.get(parentIdStr).children.push(map.get(cat._id.toString()));
      } else {
        tree.push(map.get(cat._id.toString()));
      }
    });

    return tree;
  }

  static async getCategoryById(id: string) {
    if (Types.ObjectId.isValid(id)) {
      const category = await Category.findById(id).populate('parentId', 'name slug level');
      if (category) return category;
    }
    // Fallback: search by slug
    const bySlug = await Category.findOne({ slug: id.toLowerCase().trim() }).populate('parentId', 'name slug level');
    if (bySlug) return bySlug;
    throw new AppError('دسته‌بندی مورد نظر یافت نشد', 404, 'NOT_FOUND');
  }

  static async toggleCategoryStatus(id: string, isActive?: boolean) {
    const category = await Category.findById(id);
    if (!category) throw new AppError('دسته‌بندی مورد نظر یافت نشد', 404, 'NOT_FOUND');
    category.isActive = isActive !== undefined ? Boolean(isActive) : !category.isActive;
    await category.save();
    return category;
  }

  static async reorderCategories(items: Array<{ id?: string; _id?: string; sortOrder: number }>) {
    if (!Array.isArray(items)) {
      throw new AppError('لیست مرتب‌سازی نامعتبر است', 400, 'VALIDATION_ERROR');
    }
    const updates = items.map((item) => {
      const itemId = item.id || item._id;
      if (!itemId) return Promise.resolve(null);
      return Category.findByIdAndUpdate(itemId, { sortOrder: Number(item.sortOrder) || 0 });
    });
    await Promise.all(updates);
    return { success: true };
  }

  static async getCategoryBySlug(slug: string, includeInactive = false) {
    const query: any = { slug: slug.toLowerCase().trim() };
    if (!includeInactive) {
      query.isActive = true;
    }

    const category = await Category.findOne(query).populate('parentId', 'name slug level').lean();
    if (!category) {
      throw new AppError('دسته‌بندی یافت نشد', 404, 'NOT_FOUND');
    }

    // Calculate ancestors / breadcrumbs from root to this category
    const breadcrumbs: Array<{ _id: string; name: string; slug: string; level: number }> = [];
    let currentParentId = category.parentId ? (category.parentId as any)._id || category.parentId : null;

    while (currentParentId) {
      const ancestor = await Category.findById(currentParentId).select('name slug level parentId').lean();
      if (!ancestor) break;
      breadcrumbs.unshift({
        _id: ancestor._id.toString(),
        name: ancestor.name,
        slug: ancestor.slug,
        level: ancestor.level,
      });
      currentParentId = ancestor.parentId;
    }

    // Add current category to end of breadcrumbs
    breadcrumbs.push({
      _id: category._id.toString(),
      name: category.name,
      slug: category.slug,
      level: category.level,
    });

    // Fetch immediate active child categories
    const children = await Category.find({ parentId: category._id, isActive: true })
      .sort({ sortOrder: 1, name: 1 })
      .lean();

    // Fetch total courses and classes for this category
    const descendantIds = await this.getAllDescendantCategoryIds(category._id);
    const [courseCount, classCount] = await Promise.all([
      Course.countDocuments({ categoryId: { $in: descendantIds }, status: 'published' }),
      Class.countDocuments({ categoryId: { $in: descendantIds }, status: 'published' }),
    ]);

    return {
      ...category,
      breadcrumbs,
      children,
      courseCount,
      classCount,
    };
  }

  static async getCategoryContent(slug: string, queryParams: any = {}) {
    const categoryData = await this.getCategoryBySlug(slug, false);
    const targetCategoryIds = await this.getAllDescendantCategoryIds(categoryData._id);

    const type = queryParams.type || 'all'; // 'all' | 'course' | 'class'
    const page = Math.max(1, parseInt(queryParams.page as string) || 1);
    const limit = Math.min(24, Math.max(1, parseInt(queryParams.limit as string) || 12));
    const skip = (page - 1) * limit;

    let courses: any[] = [];
    let classes: any[] = [];
    let totalCourses = 0;
    let totalClasses = 0;

    // Fetch Courses if type is 'all' or 'course'
    if (type === 'all' || type === 'course') {
      const courseFilter: any = {
        categoryId: { $in: targetCategoryIds },
        status: 'published',
      };

      if (queryParams.price === 'free') {
        courseFilter.price = 0;
      } else if (queryParams.price === 'paid') {
        courseFilter.price = { $gt: 0 };
      }

      totalCourses = await Course.countDocuments(courseFilter);

      let courseSort: any = { createdAt: -1 };
      if (queryParams.sort === 'popular') courseSort = { studentCount: -1 };
      if (queryParams.sort === 'price_asc') courseSort = { price: 1 };
      if (queryParams.sort === 'price_desc') courseSort = { price: -1 };

      courses = await Course.find(courseFilter)
        .populate('instructors', 'firstName lastName avatar specialty')
        .populate('categoryId', 'name slug')
        .sort(courseSort)
        .skip(type === 'course' ? skip : 0)
        .limit(type === 'course' ? limit : 6)
        .lean();
    }

    // Fetch Classes if type is 'all' or 'class'
    if (type === 'all' || type === 'class') {
      const classFilter: any = {
        categoryId: { $in: targetCategoryIds },
        status: 'published',
      };

      if (queryParams.price === 'free') {
        classFilter.price = 0;
      } else if (queryParams.price === 'paid') {
        classFilter.price = { $gt: 0 };
      }

      if (queryParams.mode && queryParams.mode !== 'all') {
        classFilter.mode = queryParams.mode; // 'online' | 'in_person'
      }

      totalClasses = await Class.countDocuments(classFilter);

      let classSort: any = { startDate: 1 };
      if (queryParams.sort === 'newest') classSort = { createdAt: -1 };
      if (queryParams.sort === 'price_asc') classSort = { price: 1 };
      if (queryParams.sort === 'price_desc') classSort = { price: -1 };

      classes = await Class.find(classFilter)
        .populate('instructors', 'firstName lastName avatar specialty personnelPhoto')
        .populate('categoryId', 'name slug')
        .sort(classSort)
        .skip(type === 'class' ? skip : 0)
        .limit(type === 'class' ? limit : 6)
        .lean();
    }

    return {
      category: categoryData,
      breadcrumbs: categoryData.breadcrumbs,
      children: categoryData.children,
      courses,
      classes,
      totalCourses,
      totalClasses,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil((type === 'course' ? totalCourses : type === 'class' ? totalClasses : Math.max(totalCourses, totalClasses)) / limit) || 1,
      },
    };
  }

  static async updateCategory(id: string, data: any) {
    const category = await Category.findById(id);
    if (!category) throw new AppError('دسته‌بندی مورد نظر یافت نشد', 404, 'NOT_FOUND');

    // Slug validation if updating slug
    if (data.slug) {
      const cleanSlug = String(data.slug).toLowerCase().trim();
      if (cleanSlug !== category.slug) {
        const slugExists = await Category.findOne({ slug: cleanSlug, _id: { $ne: id } });
        if (slugExists) {
          throw new AppError('دسته‌بندی با این شناسه انگلیسی (slug) از قبل وجود دارد', 400, 'CATEGORY_SLUG_EXISTS');
        }
        category.slug = cleanSlug;
      }
    }

    // Circular parent check if updating parentId
    if (data.parentId !== undefined) {
      if (data.parentId && String(data.parentId).trim() !== '') {
        const newParentIdStr = String(data.parentId).trim();
        if (newParentIdStr === id) {
          throw new AppError('یک دسته‌بندی نمی‌تواند والد خودش باشد', 400, 'CIRCULAR_HIERARCHY');
        }

        const isCircular = await this.isDescendantOf(newParentIdStr, id);
        if (isCircular) {
          throw new AppError('امکان انتخاب این دسته به عنوان والد وجود ندارد، زیرا از زیرمجموعه‌های همین دسته است', 400, 'CIRCULAR_HIERARCHY');
        }

        const parent = await Category.findById(newParentIdStr);
        if (!parent) {
          throw new AppError('دسته‌بندی والد مشخص شده یافت نشد', 400, 'PARENT_NOT_FOUND');
        }

        category.parentId = parent._id;
        category.level = (parent.level || 0) + 1;
      } else {
        category.parentId = null;
        category.level = 0;
      }

      // Recursively update descendants level
      await this.updateDescendantLevels(category._id, category.level);
    }

    if (data.name !== undefined) category.name = String(data.name).trim();
    if (data.description !== undefined) category.description = data.description;
    if (data.isActive !== undefined) category.isActive = Boolean(data.isActive);
    if (data.sortOrder !== undefined) category.sortOrder = Number(data.sortOrder);
    if (data.image !== undefined) category.image = data.image;
    if (data.icon !== undefined) category.icon = data.icon;
    if (data.seoTitle !== undefined) category.seoTitle = data.seoTitle;
    if (data.seoDescription !== undefined) category.seoDescription = data.seoDescription;

    await category.save();
    return category;
  }

  private static async updateDescendantLevels(parentId: Types.ObjectId, parentLevel: number) {
    const children = await Category.find({ parentId });
    for (const child of children) {
      child.level = parentLevel + 1;
      await child.save();
      await this.updateDescendantLevels(child._id, child.level);
    }
  }

  static async deleteCategory(id: string) {
    const category = await Category.findById(id);
    if (!category) throw new AppError('دسته‌بندی یافت نشد', 404, 'NOT_FOUND');

    // 1. Safe Delete Check: Child Categories
    const childCount = await Category.countDocuments({ parentId: id });
    if (childCount > 0) {
      throw new AppError(`این دسته‌بندی دارای ${childCount} زیردسته فعال است. ابتدا زیردسته‌ها را حذف یا به دسته دیگری منتقل کنید.`, 400, 'CATEGORY_HAS_CHILDREN');
    }

    // 2. Safe Delete Check: Courses
    const courseCount = await Course.countDocuments({ categoryId: id });
    if (courseCount > 0) {
      throw new AppError(`امکان حذف این دسته‌بندی وجود ندارد؛ ${courseCount} دوره آموزشی به آن متصل است. ابتدا دوره‌ها را به دسته‌بندی دیگری منتقل کنید.`, 400, 'CATEGORY_HAS_COURSES');
    }

    // 3. Safe Delete Check: Classes
    const classCount = await Class.countDocuments({ categoryId: id });
    if (classCount > 0) {
      throw new AppError(`امکان حذف این دسته‌بندی وجود ندارد؛ ${classCount} کلاس به آن متصل است. ابتدا کلاس‌ها را به دسته‌بندی دیگری منتقل کنید.`, 400, 'CATEGORY_HAS_CLASSES');
    }

    await Category.findByIdAndDelete(id);
    return null;
  }

  // --- Generic Simple Catalogs (Subject, Field, Level) ---
  static getModel(type: 'subject' | 'field' | 'level') {
    switch (type) {
      case 'subject': return Subject;
      case 'field': return Field;
      case 'level': return Level;
      default: throw new AppError('Invalid catalog type', 400, 'INVALID_TYPE');
    }
  }

  static async createSimpleCatalog(type: 'subject' | 'field' | 'level', data: any) {
    const Model = this.getModel(type);
    return await Model.create(data);
  }

  static async getSimpleCatalogs(type: 'subject' | 'field' | 'level') {
    const Model = this.getModel(type);
    return await Model.find();
  }

  static async updateSimpleCatalog(type: 'subject' | 'field' | 'level', id: string, data: any) {
    const Model = this.getModel(type);
    const doc = await Model.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!doc) throw new AppError(`${type} not found`, 404, 'NOT_FOUND');
    return doc;
  }

  static async deleteSimpleCatalog(type: 'subject' | 'field' | 'level', id: string) {
    const Model = this.getModel(type);
    const doc = await Model.findByIdAndDelete(id);
    if (!doc) throw new AppError(`${type} not found`, 404, 'NOT_FOUND');
    return null;
  }
}
