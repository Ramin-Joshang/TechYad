'use client';

import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { catalogApi } from '@/features/catalog/api/catalog.api';
import { ChevronLeft, Check, Layers, AlertCircle, RefreshCw } from 'lucide-react';

interface CategoryNode {
  _id: string;
  name: string;
  slug: string;
  parentId?: any;
  level: number;
  isActive: boolean;
  children?: CategoryNode[];
}

interface CategoryCascadeSelectProps {
  value?: string;
  onChange: (categoryId: string) => void;
  required?: boolean;
  disabled?: boolean;
  label?: string;
}

export function CategoryCascadeSelect({
  value,
  onChange,
  required = false,
  disabled = false,
  label = 'دسته‌بندی تخصصی',
}: CategoryCascadeSelectProps) {
  const { data: categoriesData, isLoading, refetch } = useQuery({
    queryKey: ['categories-flat'],
    queryFn: () => catalogApi.getCategories({ includeInactive: false }).then((res: any) => res?.data || res || []),
    staleTime: 1000 * 60 * 5,
  });

  const flatCategories: CategoryNode[] = useMemo(() => {
    return Array.isArray(categoriesData) ? categoriesData : [];
  }, [categoriesData]);

  // Build tree from flat list
  const categoryTree = useMemo(() => {
    const map = new Map<string, CategoryNode>();
    const roots: CategoryNode[] = [];

    flatCategories.forEach((cat) => {
      map.set(cat._id.toString(), { ...cat, children: [] });
    });

    flatCategories.forEach((cat) => {
      const parentIdStr = cat.parentId ? (typeof cat.parentId === 'object' ? cat.parentId._id?.toString() : cat.parentId.toString()) : null;
      if (parentIdStr && map.has(parentIdStr)) {
        map.get(parentIdStr)!.children!.push(map.get(cat._id.toString())!);
      } else {
        roots.push(map.get(cat._id.toString())!);
      }
    });

    return roots;
  }, [flatCategories]);

  // State for selections
  const [selectedRootId, setSelectedRootId] = useState<string>('');
  const [selectedLevel1Id, setSelectedLevel1Id] = useState<string>('');
  const [selectedLevel2Id, setSelectedLevel2Id] = useState<string>('');

  // Find ancestors when value changes from outside (e.g. on form load)
  useEffect(() => {
    if (!value || flatCategories.length === 0) return;

    const currentCat = flatCategories.find((c) => c._id === value);
    if (!currentCat) return;

    if (currentCat.level === 0) {
      setSelectedRootId(currentCat._id);
      setSelectedLevel1Id('');
      setSelectedLevel2Id('');
    } else if (currentCat.level === 1) {
      const parentId = typeof currentCat.parentId === 'object' ? currentCat.parentId?._id : currentCat.parentId;
      setSelectedRootId(parentId || '');
      setSelectedLevel1Id(currentCat._id);
      setSelectedLevel2Id('');
    } else if (currentCat.level >= 2) {
      const parentId = typeof currentCat.parentId === 'object' ? currentCat.parentId?._id : currentCat.parentId;
      const parentCat = flatCategories.find((c) => c._id === parentId);
      const grandParentId = parentCat ? (typeof parentCat.parentId === 'object' ? parentCat.parentId?._id : parentCat.parentId) : '';

      setSelectedRootId(grandParentId || '');
      setSelectedLevel1Id(parentId || '');
      setSelectedLevel2Id(currentCat._id);
    }
  }, [value, flatCategories]);

  // Subcategories derived from selections
  const rootNode = useMemo(() => {
    return categoryTree.find((c) => c._id === selectedRootId);
  }, [categoryTree, selectedRootId]);

  const level1Node = useMemo(() => {
    return rootNode?.children?.find((c) => c._id === selectedLevel1Id);
  }, [rootNode, selectedLevel1Id]);

  const level2Options = useMemo(() => {
    return level1Node?.children || [];
  }, [level1Node]);

  // Handle Root Change
  const handleRootChange = (rootId: string) => {
    setSelectedRootId(rootId);
    setSelectedLevel1Id('');
    setSelectedLevel2Id('');
    if (rootId) {
      onChange(rootId);
    } else {
      onChange('');
    }
  };

  // Handle Level 1 Change
  const handleLevel1Change = (subId: string) => {
    setSelectedLevel1Id(subId);
    setSelectedLevel2Id('');
    if (subId) {
      onChange(subId);
    } else if (selectedRootId) {
      onChange(selectedRootId);
    }
  };

  // Handle Level 2 Change
  const handleLevel2Change = (subSubId: string) => {
    setSelectedLevel2Id(subSubId);
    if (subSubId) {
      onChange(subSubId);
    } else if (selectedLevel1Id) {
      onChange(selectedLevel1Id);
    }
  };

  // Active path text
  const selectedPath = useMemo(() => {
    if (!value || flatCategories.length === 0) return null;
    const cat = flatCategories.find((c) => c._id === value);
    if (!cat) return null;

    const parts: string[] = [cat.name];
    let parentId = typeof cat.parentId === 'object' ? cat.parentId?._id : cat.parentId;

    while (parentId) {
      const parent = flatCategories.find((c) => c._id === parentId);
      if (!parent) break;
      parts.unshift(parent.name);
      parentId = typeof parent.parentId === 'object' ? parent.parentId?._id : parent.parentId;
    }

    return parts.join(' ← ');
  }, [value, flatCategories]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-xs sm:text-sm font-bold text-[var(--neo-text-main)]">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        {selectedPath && (
          <div className="text-[11px] font-medium text-[var(--neo-primary)] bg-[var(--neo-primary)]/10 px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <Check className="w-3 h-3" />
            <span className="line-clamp-1">{selectedPath}</span>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="p-4 rounded-xl bg-[var(--neo-surface-2)]/60 text-xs text-[var(--neo-text-muted)] flex items-center gap-2 animate-pulse">
          <RefreshCw className="w-4 h-4 animate-spin text-[var(--neo-primary)]" />
          <span>در حال دریافت دسته‌بندی‌های سلسله‌مراتبی...</span>
        </div>
      ) : flatCategories.length === 0 ? (
        <div className="p-3 rounded-xl bg-amber-50 text-amber-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>هیچ دسته‌بندی فعالی در سیستم تعریف نشده است.</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {/* 1. Root Category Select */}
          <div>
            <span className="block text-[11px] font-medium text-[var(--neo-text-muted)] mb-1">
              ۱. شاخه اصلی:
            </span>
            <select
              value={selectedRootId}
              onChange={(e) => handleRootChange(e.target.value)}
              disabled={disabled}
              className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--neo-border)] bg-white text-[var(--neo-text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--neo-primary)] transition"
            >
              <option value="">-- انتخاب دسته اصلی --</option>
              {categoryTree.map((root) => (
                <option key={root._id} value={root._id}>
                  📁 {root.name}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Subcategory (Level 1) Select */}
          <div>
            <span className="block text-[11px] font-medium text-[var(--neo-text-muted)] mb-1">
              ۲. زیر دسته:
            </span>
            <select
              value={selectedLevel1Id}
              onChange={(e) => handleLevel1Change(e.target.value)}
              disabled={disabled || !selectedRootId || (rootNode?.children?.length === 0)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--neo-border)] bg-white text-[var(--neo-text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--neo-primary)] transition disabled:opacity-50 disabled:bg-[var(--neo-surface-2)]"
            >
              <option value="">
                {rootNode?.children?.length ? '-- انتخاب زیر دسته --' : 'فاقد زیردسته'}
              </option>
              {rootNode?.children?.map((sub) => (
                <option key={sub._id} value={sub._id}>
                  📂 {sub.name}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Sub-subcategory (Level 2) Select */}
          <div>
            <span className="block text-[11px] font-medium text-[var(--neo-text-muted)] mb-1">
              ۳. موضوع تخصصی:
            </span>
            <select
              value={selectedLevel2Id}
              onChange={(e) => handleLevel2Change(e.target.value)}
              disabled={disabled || !selectedLevel1Id || level2Options.length === 0}
              className="w-full px-3 py-2 text-xs rounded-xl border border-[var(--neo-border)] bg-white text-[var(--neo-text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--neo-primary)] transition disabled:opacity-50 disabled:bg-[var(--neo-surface-2)]"
            >
              <option value="">
                {level2Options.length ? '-- موضوع تخصصی --' : 'فاقد سطح سوم'}
              </option>
              {level2Options.map((topic) => (
                <option key={topic._id} value={topic._id}>
                  🏷️ {topic.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
