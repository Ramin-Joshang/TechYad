'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { catalogApi, CategoryItem } from '@/features/catalog/api/catalog.api';
import { 
  FolderTree, Plus, Edit, Trash2, ChevronRight, ChevronDown, 
  BookOpen, GraduationCap, Eye, EyeOff, Sparkles, AlertTriangle, 
  CheckCircle2, X, RefreshCw, Layers, ShieldAlert, ArrowUpDown
} from 'lucide-react';
import toast from 'react-hot-toast';

interface TreeNode extends CategoryItem {
  children?: TreeNode[];
}

export default function AdminCategoriesPage() {
  const queryClient = useQueryClient();

  // Dialog & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [deleteWarningCategory, setDeleteWarningCategory] = useState<CategoryItem | null>(null);
  
  // Expanded tree nodes
  const [expandedNodeIds, setExpandedNodeIds] = useState<Set<string>>(new Set());

  // Form Fields
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    parentId: '',
    description: '',
    sortOrder: 0,
    isActive: true,
    icon: '',
    seoTitle: '',
    seoDescription: '',
  });

  // Query: Flat Categories (with courseCount & classCount)
  const { data: categoriesData, isLoading, refetch } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: () => catalogApi.getCategories({ includeInactive: true }).then((res: any) => res?.data || res || []),
  });

  const flatCategories: CategoryItem[] = useMemo(() => {
    return Array.isArray(categoriesData) ? categoriesData : [];
  }, [categoriesData]);

  // Build Hierarchical Tree
  const categoryTree: TreeNode[] = useMemo(() => {
    const map = new Map<string, TreeNode>();
    const roots: TreeNode[] = [];

    flatCategories.forEach((cat) => {
      map.set(cat._id, { ...cat, children: [] });
    });

    flatCategories.forEach((cat) => {
      const parentIdStr = cat.parentId ? (typeof cat.parentId === 'object' ? cat.parentId._id : cat.parentId) : null;
      if (parentIdStr && map.has(parentIdStr)) {
        map.get(parentIdStr)!.children!.push(map.get(cat._id)!);
      } else {
        roots.push(map.get(cat._id)!);
      }
    });

    // Auto expand roots on initial load
    if (roots.length > 0 && expandedNodeIds.size === 0) {
      const initialExpanded = new Set<string>();
      roots.forEach(r => initialExpanded.add(r._id));
      setExpandedNodeIds(initialExpanded);
    }

    return roots;
  }, [flatCategories]);

  // Total summary stats
  const stats = useMemo(() => {
    const total = flatCategories.length;
    const active = flatCategories.filter(c => c.isActive).length;
    const totalCourses = flatCategories.reduce((sum, c) => sum + (c.courseCount || 0), 0);
    const totalClasses = flatCategories.reduce((sum, c) => sum + (c.classCount || 0), 0);
    return { total, active, totalCourses, totalClasses };
  }, [flatCategories]);

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: any) => catalogApi.createCategory(data),
    onSuccess: () => {
      toast.success('دسته‌بندی جدید با موفقیت ایجاد شد');
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories-flat'] });
      setIsModalOpen(false);
      resetForm();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'خطا در ایجاد دسته‌بندی');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => catalogApi.updateCategory(id, data),
    onSuccess: () => {
      toast.success('دسته‌بندی با موفقیت بروزرسانی شد');
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories-flat'] });
      setIsModalOpen(false);
      resetForm();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'خطا در ویرایش دسته‌بندی');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => catalogApi.deleteCategory(id),
    onSuccess: () => {
      toast.success('دسته‌بندی با موفقیت حذف شد');
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories-flat'] });
      setDeleteWarningCategory(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'خطا در حذف دسته‌بندی');
    }
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => 
      catalogApi.updateCategory(id, { isActive }),
    onSuccess: () => {
      toast.success('وضعیت دسته‌بندی تغییر یافت');
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories-flat'] });
    },
    onError: () => toast.error('خطا در تغییر وضعیت دسته‌بندی')
  });

  const resetForm = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      slug: '',
      parentId: '',
      description: '',
      sortOrder: 0,
      isActive: true,
      icon: '',
      seoTitle: '',
      seoDescription: '',
    });
  };

  const openCreateModal = (parent?: CategoryItem) => {
    resetForm();
    if (parent) {
      setFormData(prev => ({
        ...prev,
        parentId: parent._id,
      }));
    }
    setIsModalOpen(true);
  };

  const openEditModal = (cat: CategoryItem) => {
    setEditingCategory(cat);
    const parentIdStr = cat.parentId ? (typeof cat.parentId === 'object' ? cat.parentId._id : cat.parentId) : '';
    setFormData({
      name: cat.name,
      slug: cat.slug,
      parentId: parentIdStr || '',
      description: cat.description || '',
      sortOrder: cat.sortOrder || 0,
      isActive: cat.isActive !== undefined ? cat.isActive : true,
      icon: cat.icon || '',
      seoTitle: cat.seoTitle || '',
      seoDescription: cat.seoDescription || '',
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      parentId: formData.parentId ? formData.parentId : null,
      sortOrder: Number(formData.sortOrder) || 0,
    };

    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory._id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const toggleNodeExpanded = (nodeId: string) => {
    setExpandedNodeIds(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  };

  const expandAll = () => {
    const allIds = new Set<string>();
    flatCategories.forEach(c => allIds.add(c._id));
    setExpandedNodeIds(allIds);
  };

  const collapseAll = () => {
    setExpandedNodeIds(new Set());
  };

  // Safe delete handler
  const handleDeleteClick = (cat: CategoryItem) => {
    setDeleteWarningCategory(cat);
  };

  // Filter available parents for edit modal (cannot pick self or descendants)
  const availableParents = useMemo(() => {
    if (!editingCategory) return flatCategories;

    // Helper to find all descendant IDs of current editing category
    const descendantIds = new Set<string>([editingCategory._id]);
    let added = true;
    while (added) {
      added = false;
      flatCategories.forEach(c => {
        const pId = c.parentId ? (typeof c.parentId === 'object' ? c.parentId._id : c.parentId) : null;
        if (pId && descendantIds.has(pId) && !descendantIds.has(c._id)) {
          descendantIds.add(c._id);
          added = true;
        }
      });
    }

    return flatCategories.filter(c => !descendantIds.has(c._id));
  }, [flatCategories, editingCategory]);

  // Recursive Tree Node Renderer
  const renderTreeNode = (node: TreeNode, depth: number = 0) => {
    const hasChildren = Boolean(node.children && node.children.length > 0);
    const isExpanded = expandedNodeIds.has(node._id);
    const totalAttached = (node.courseCount || 0) + (node.classCount || 0);

    return (
      <div key={node._id} className="select-none">
        <div 
          className={`flex items-center justify-between p-3.5 sm:p-4 rounded-2xl transition-all border my-1.5 ${
            depth === 0 
              ? 'bg-white border-[var(--neo-border)] shadow-xs hover:border-[var(--neo-primary)]/40' 
              : depth === 1
              ? 'bg-[var(--neo-surface-2)]/60 border-[var(--neo-border)]/70 hover:bg-white hover:border-[var(--neo-primary)]/40'
              : 'bg-white/80 border-dashed border-[var(--neo-border)] hover:border-[var(--neo-primary)]/40'
          }`}
          style={{ marginRight: `${depth * 24}px` }}
        >
          {/* Left / Info side */}
          <div className="flex items-center gap-2.5 sm:gap-3 flex-1 min-w-0">
            {hasChildren ? (
              <button
                type="button"
                onClick={() => toggleNodeExpanded(node._id)}
                className="p-1 rounded-lg text-[var(--neo-text-muted)] hover:text-[var(--neo-primary)] hover:bg-[var(--neo-surface-2)] transition cursor-pointer shrink-0"
              >
                {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            ) : (
              <span className="w-6 shrink-0 flex items-center justify-center text-[var(--neo-border)]">•</span>
            )}

            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold bg-[var(--neo-surface-2)] text-[var(--neo-primary)] border border-[var(--neo-border)]">
              {depth === 0 ? '📁' : depth === 1 ? '📂' : '🏷️'}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-black text-xs sm:text-sm text-[var(--neo-text-main)] truncate">
                  {node.name}
                </span>
                <span className="text-[10px] text-[var(--neo-text-muted)] font-mono dir-ltr bg-[var(--neo-surface-2)] px-2 py-0.5 rounded-md border border-[var(--neo-border)]/50">
                  {node.slug}
                </span>
                {!node.isActive && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200">
                    غیرفعال
                  </span>
                )}
                {node.sortOrder !== undefined && node.sortOrder > 0 && (
                  <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                    ترتیب: {node.sortOrder}
                  </span>
                )}
              </div>
              {node.description && (
                <p className="text-[11px] text-[var(--neo-text-secondary)] truncate max-w-xl mt-0.5">
                  {node.description}
                </p>
              )}
            </div>
          </div>

          {/* Right / Actions side */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            {/* Counts Badges */}
            <div className="hidden md:flex items-center gap-2 text-xs">
              <span 
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl font-medium border ${
                  (node.courseCount || 0) > 0 
                    ? 'bg-blue-50 text-blue-700 border-blue-200' 
                    : 'bg-slate-50 text-slate-400 border-slate-200'
                }`}
                title="تعداد دوره‌های فعال در این دسته"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>{node.courseCount || 0} دوره</span>
              </span>

              <span 
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl font-medium border ${
                  (node.classCount || 0) > 0 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                    : 'bg-slate-50 text-slate-400 border-slate-200'
                }`}
                title="تعداد کلاس‌های فعال در این دسته"
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>{node.classCount || 0} کلاس</span>
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => openCreateModal(node)}
                className="p-1.5 sm:p-2 rounded-xl text-emerald-600 hover:bg-emerald-50 transition cursor-pointer"
                title="افزودن زیردسته"
              >
                <Plus className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => toggleStatusMutation.mutate({ id: node._id, isActive: !node.isActive })}
                className={`p-1.5 sm:p-2 rounded-xl transition cursor-pointer ${
                  node.isActive ? 'text-slate-500 hover:bg-slate-100' : 'text-amber-600 hover:bg-amber-50'
                }`}
                title={node.isActive ? 'غیرفعال کردن' : 'فعال‌سازی'}
              >
                {node.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>

              <button
                type="button"
                onClick={() => openEditModal(node)}
                className="p-1.5 sm:p-2 rounded-xl text-[var(--neo-primary)] hover:bg-[var(--neo-primary)]/10 transition cursor-pointer"
                title="ویرایش دسته‌بندی"
              >
                <Edit className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => handleDeleteClick(node)}
                className="p-1.5 sm:p-2 rounded-xl text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                title="حذف دسته‌بندی"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Children Render */}
        {hasChildren && isExpanded && (
          <div className="space-y-1">
            {node.children!.map((child) => renderTreeNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div dir="rtl" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 text-right">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[var(--neo-border)] shadow-xs">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-[var(--neo-primary)]/10 text-[var(--neo-primary)] rounded-2xl border border-[var(--neo-primary)]/20">
            <FolderTree className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[var(--neo-text-main)]">
              مدیریت دسته‌بندی‌های سلسله‌مراتبی
            </h1>
            <p className="text-xs sm:text-sm text-[var(--neo-text-secondary)] mt-1">
              تعریف ساختار درختی و دسته‌بندی‌های تخصصی برای دوره‌ها، کلاس‌ها و کارگاه‌های آنلاین
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={expandAll}
            className="px-3 py-2 text-xs font-bold rounded-xl bg-[var(--neo-surface-2)] text-[var(--neo-text-secondary)] hover:bg-[var(--neo-border)] transition"
          >
            باز کردن همه
          </button>
          <button
            type="button"
            onClick={collapseAll}
            className="px-3 py-2 text-xs font-bold rounded-xl bg-[var(--neo-surface-2)] text-[var(--neo-text-secondary)] hover:bg-[var(--neo-border)] transition"
          >
            بستن همه
          </button>
          <button
            type="button"
            onClick={() => openCreateModal()}
            className="px-4 py-2.5 rounded-xl bg-[var(--neo-primary)] text-white text-xs sm:text-sm font-bold flex items-center gap-2 hover:opacity-95 shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>دسته‌بندی اصلی جدید</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-[var(--neo-border)] shadow-xs">
          <div className="text-xs text-[var(--neo-text-muted)] font-medium">کل دسته‌بندی‌ها</div>
          <div className="text-xl font-black text-[var(--neo-text-main)] mt-1">{stats.total}</div>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-[var(--neo-border)] shadow-xs">
          <div className="text-xs text-[var(--neo-text-muted)] font-medium">دسته‌های فعال</div>
          <div className="text-xl font-black text-emerald-600 mt-1">{stats.active}</div>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-[var(--neo-border)] shadow-xs">
          <div className="text-xs text-[var(--neo-text-muted)] font-medium">دوره‌های متصل</div>
          <div className="text-xl font-black text-blue-600 mt-1">{stats.totalCourses}</div>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-[var(--neo-border)] shadow-xs">
          <div className="text-xs text-[var(--neo-text-muted)] font-medium">کلاس‌های متصل</div>
          <div className="text-xl font-black text-purple-600 mt-1">{stats.totalClasses}</div>
        </div>
      </div>

      {/* Hierarchical Tree Container */}
      <div className="bg-white rounded-3xl border border-[var(--neo-border)] p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--neo-border)] text-xs text-[var(--neo-text-muted)]">
          <div className="font-bold text-[var(--neo-text-main)]">درخت دسته‌بندی‌ها (Hierarchical Category Tree)</div>
          <div>برای باز کردن زیرشاخه‌ها روی فلش کلیک کنید</div>
        </div>

        {isLoading ? (
          <div className="p-16 flex flex-col items-center justify-center gap-3 text-xs text-[var(--neo-text-muted)]">
            <RefreshCw className="w-6 h-6 animate-spin text-[var(--neo-primary)]" />
            <span>در حال بارگذاری ساختار درختی دسته‌بندی‌ها...</span>
          </div>
        ) : categoryTree.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <FolderTree className="w-12 h-12 mx-auto text-[var(--neo-text-muted)]" />
            <h3 className="font-bold text-[var(--neo-text-main)] text-sm">هیچ دسته‌بندی‌ای یافت نشد</h3>
            <p className="text-xs text-[var(--neo-text-secondary)]">با کلیک بر روی دکمه بالا اولین دسته را تعریف کنید.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {categoryTree.map((rootNode) => renderTreeNode(rootNode, 0))}
          </div>
        )}
      </div>

      {/* Modal: Create & Edit Category */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-[var(--neo-border)] shadow-2xl max-w-xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[var(--neo-border)]">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-[var(--neo-primary)]/10 text-[var(--neo-primary)]">
                  <FolderTree className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-black text-[var(--neo-text-main)]">
                  {editingCategory ? `ویرایش دسته‌بندی «${editingCategory.name}»` : 'ایجاد دسته‌بندی جدید'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl text-[var(--neo-text-muted)] hover:bg-[var(--neo-surface-2)] transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-right">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[var(--neo-text-main)] mb-1">
                    نام دسته‌بندی (فارسی) <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="مثال: هوش مصنوعی"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--neo-border)] bg-[var(--neo-surface-2)] text-xs font-bold text-[var(--neo-text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--neo-primary)]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--neo-text-main)] mb-1">
                    شناسه انگلیسی یکتا (Slug) <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="artificial-intelligence"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--neo-border)] bg-[var(--neo-surface-2)] text-xs font-mono dir-ltr text-left text-[var(--neo-text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--neo-primary)]"
                  />
                </div>
              </div>

              {/* Parent category selector */}
              <div>
                <label className="block text-xs font-bold text-[var(--neo-text-main)] mb-1">
                  دسته‌بندی والد (Parent Category)
                </label>
                <select
                  value={formData.parentId}
                  onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--neo-border)] bg-[var(--neo-surface-2)] text-xs text-[var(--neo-text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--neo-primary)]"
                >
                  <option value="">-- دسته اصلی (بدون والد - ریشه) --</option>
                  {availableParents.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.level === 0 ? '📁 ' : cat.level === 1 ? '  📂 ' : '    🏷️ '}
                      {cat.name} ({cat.slug})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-[var(--neo-text-muted)] mt-1">
                  در صورت انتخاب نکردن والد، این دسته به عنوان یک دسته اصلی در سطح ریشه قرار می‌گیرد.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[var(--neo-text-main)] mb-1">
                    ترتیب نمایش (Sort Order)
                  </label>
                  <input
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData({ ...formData, sortOrder: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--neo-border)] bg-[var(--neo-surface-2)] text-xs dir-ltr text-left"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--neo-text-main)] mb-1">
                    وضعیت دسته‌بندی
                  </label>
                  <select
                    value={formData.isActive ? 'active' : 'inactive'}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'active' })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--neo-border)] bg-[var(--neo-surface-2)] text-xs"
                  >
                    <option value="active">فعال (نمایش عمومی در سایت)</option>
                    <option value="inactive">غیرفعال (مخفی از نمایش عمومی)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--neo-text-main)] mb-1">
                  توضیحات معرفی دسته‌بندی
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="توضیحاتی برای معرفی این شاخه در صفحات عمومی و راهنمای کاربران..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--neo-border)] bg-[var(--neo-surface-2)] text-xs resize-none"
                />
              </div>

              <div className="space-y-3 pt-2 border-t border-[var(--neo-border)]">
                <span className="text-xs font-bold text-[var(--neo-primary)]">تنظیمات بهینه‌سازی موتورهای جستجو (SEO)</span>
                <div>
                  <label className="block text-[11px] font-medium text-[var(--neo-text-secondary)] mb-1">
                    عنوان سئو (SEO Title)
                  </label>
                  <input
                    type="text"
                    value={formData.seoTitle}
                    onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                    placeholder="مثال: دوره‌ها و کلاس‌های آموزش هوش مصنوعی | تک‌یاد"
                    className="w-full px-3.5 py-2 rounded-xl border border-[var(--neo-border)] bg-[var(--neo-surface-2)] text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-[var(--neo-text-secondary)] mb-1">
                    توضیحات سئو (SEO Description)
                  </label>
                  <textarea
                    rows={2}
                    value={formData.seoDescription}
                    onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
                    placeholder="توضیحات متای صفحه دسته‌بندی در گوگل..."
                    className="w-full px-3.5 py-2 rounded-xl border border-[var(--neo-border)] bg-[var(--neo-surface-2)] text-xs resize-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-[var(--neo-border)]">
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="flex-1 py-2.5 rounded-xl bg-[var(--neo-primary)] text-white text-xs sm:text-sm font-bold hover:opacity-95 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  {(createMutation.isPending || updateMutation.isPending) && (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  )}
                  <span>{editingCategory ? 'ذخیره تغییرات' : 'ثبت دسته‌بندی'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-[var(--neo-surface-2)] text-[var(--neo-text-secondary)] text-xs sm:text-sm font-bold hover:bg-[var(--neo-border)] transition"
                >
                  انصراف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Safe Delete Warning */}
      {deleteWarningCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-[var(--neo-border)] shadow-2xl max-w-md w-full p-6 space-y-5 text-center">
            {/* Warning icon */}
            <div className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center ${
              ((deleteWarningCategory.courseCount || 0) > 0 || (deleteWarningCategory.classCount || 0) > 0)
                ? 'bg-rose-100 text-rose-600'
                : 'bg-amber-100 text-amber-600'
            }`}>
              <ShieldAlert className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-black text-[var(--neo-text-main)]">
                حذف دسته‌بندی «{deleteWarningCategory.name}»
              </h3>

              {((deleteWarningCategory.courseCount || 0) > 0 || (deleteWarningCategory.classCount || 0) > 0) ? (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 leading-relaxed text-right space-y-1.5">
                  <div className="font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>امکان حذف مستقیم این دسته‌بندی وجود ندارد!</span>
                  </div>
                  <p>
                    این دسته‌بندی در حال حاضر دارای{' '}
                    <span className="font-bold underline">{deleteWarningCategory.courseCount || 0} دوره آموزشی</span>{' '}
                    و{' '}
                    <span className="font-bold underline">{deleteWarningCategory.classCount || 0} کلاس</span> است.
                  </p>
                  <p className="text-[11px] text-rose-700">
                    برای جلوگیری از مفقود شدن داده‌ها و اختلال در دسترسی کاربران، ابتدا محتواهای متصل را به دسته‌بندی دیگری منتقل کنید.
                  </p>
                </div>
              ) : (
                <p className="text-xs text-[var(--neo-text-secondary)] leading-relaxed">
                  آیا از حذف این دسته‌بندی اطمینان دارید؟ این عملیات قابل بازگشت نیست.
                </p>
              )}
            </div>

            <div className="flex items-center gap-3 pt-2">
              {((deleteWarningCategory.courseCount || 0) > 0 || (deleteWarningCategory.classCount || 0) > 0) ? (
                <button
                  type="button"
                  onClick={() => setDeleteWarningCategory(null)}
                  className="w-full py-2.5 rounded-xl bg-[var(--neo-surface-2)] text-[var(--neo-text-main)] text-xs font-bold hover:bg-[var(--neo-border)] transition"
                >
                  متوجه شدم، بازگشت
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => deleteMutation.mutate(deleteWarningCategory._id)}
                    disabled={deleteMutation.isPending}
                    className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition flex items-center justify-center gap-2"
                  >
                    {deleteMutation.isPending && <RefreshCw className="w-4 h-4 animate-spin" />}
                    <span>بله، حذف شود</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteWarningCategory(null)}
                    className="flex-1 py-2.5 rounded-xl bg-[var(--neo-surface-2)] text-[var(--neo-text-main)] text-xs font-bold hover:bg-[var(--neo-border)] transition"
                  >
                    انصراف
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
