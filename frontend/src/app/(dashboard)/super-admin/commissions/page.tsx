"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { superAdminApi } from "@/features/admin/api/super-admin.api";
import {
  Percent,
  Save,
  Loader2,
  Sparkles,
  AlertCircle,
  Search,
  BookOpen,
  Video,
  CheckCircle2,
  RotateCcw,
  Settings,
  ArrowUpRight,
  Filter,
  Info,
  ShieldCheck,
} from "lucide-react";
import toast from "react-hot-toast";
import { NumericInput } from "@/components/ui/NumericInput";
import { toEnDigits } from "@/lib/utils";

export default function CommissionsPage() {
  const queryClient = useQueryClient();

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [itemTypeFilter, setItemTypeFilter] = useState<
    "all" | "course" | "class"
  >("all");

  // Override Modal
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [overrideModalOpen, setOverrideModalOpen] = useState(false);
  const [customPercent, setCustomPercent] = useState<number>(70);

  // Form State for Global Commission Defaults
  const [globalForm, setGlobalForm] = useState({
    defaultCourseInstructorShare: 70,
    defaultClassInstructorShare: 70,
    minWithdrawalAmount: 50000,
    settlementReviewDays: 2,
  });

  // 1. Fetch Global Settings
  const { data: globalData, isLoading: loadingGlobal } = useQuery({
    queryKey: ["financialCommissionSettings"],
    queryFn: async () => {
      const res = await superAdminApi.getFinancialCommissionSettings();
      const val = res.data;
      if (val) {
        setGlobalForm({
          defaultCourseInstructorShare: val.defaultCourseInstructorShare ?? 70,
          defaultClassInstructorShare: val.defaultClassInstructorShare ?? 70,
          minWithdrawalAmount: val.minWithdrawalAmount ?? 50000,
          settlementReviewDays: val.settlementReviewDays ?? 2,
        });
      }
      return val;
    },
  });

  // 2. Fetch Catalog Items with Commission Details
  const { data: itemsData, isLoading: loadingItems } = useQuery({
    queryKey: ["commissionItemsList", searchTerm, itemTypeFilter],
    queryFn: async () => {
      const res = await superAdminApi.listCommissionItems({
        search: searchTerm || undefined,
        type: itemTypeFilter === "all" ? undefined : itemTypeFilter,
      });
      return res.data;
    },
  });

  // Mutation: Update Global Settings
  const updateGlobalMutation = useMutation({
    mutationFn: (data: typeof globalForm) =>
      superAdminApi.updateFinancialCommissionSettings(data),
    onSuccess: () => {
      toast.success("تنظیمات پیش‌فرض سهم با موفقیت ذخیره و اعمال شد");
      queryClient.invalidateQueries({
        queryKey: ["financialCommissionSettings"],
      });
      queryClient.invalidateQueries({ queryKey: ["commissionItemsList"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "خطا در ذخیره تنظیمات");
    },
  });

  // Mutation: Set Custom Item Override
  const setOverrideMutation = useMutation({
    mutationFn: (data: {
      itemType: "course" | "class";
      itemId: string;
      instructorSharePercent: number | null;
    }) => superAdminApi.setItemCommissionOverride(data),
    onSuccess: (_, variables) => {
      if (variables.instructorSharePercent === null) {
        toast.success("سهم اختصاصی حذف و به نرخ پیش‌فرض سامانه بازگشت");
      } else {
        toast.success(
          `سهم اختصاصی ${variables.instructorSharePercent}٪ با موفقیت ثبت گردید`,
        );
      }
      setOverrideModalOpen(false);
      setSelectedItem(null);
      queryClient.invalidateQueries({ queryKey: ["commissionItemsList"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "خطا در ثبت درصد اختصاصی");
    },
  });

  const handleSaveGlobal = (e: React.FormEvent) => {
    e.preventDefault();
    const courseShare = Number(globalForm.defaultCourseInstructorShare);
    const classShare = Number(globalForm.defaultClassInstructorShare);

    if (courseShare < 0 || courseShare > 100) {
      toast.error("سهم مدرس دوره باید بین ۰ تا ۱۰۰ درصد باشد");
      return;
    }
    if (classShare < 0 || classShare > 100) {
      toast.error("سهم مدرس کلاس باید بین ۰ تا ۱۰۰ درصد باشد");
      return;
    }

    updateGlobalMutation.mutate(globalForm);
  };

  const handleOpenOverride = (item: any) => {
    setSelectedItem(item);
    setCustomPercent(
      item.instructorSharePercent ??
        (item.itemType === "course"
          ? globalForm.defaultCourseInstructorShare
          : globalForm.defaultClassInstructorShare),
    );
    setOverrideModalOpen(true);
  };

  const handleApplyOverride = () => {
    if (!selectedItem) return;
    const p = Math.round(Number(customPercent));
    if (isNaN(p) || p < 0 || p > 100) {
      toast.error("درصد اختصاصی باید عددی بین ۰ تا ۱۰۰ باشد");
      return;
    }

    setOverrideMutation.mutate({
      itemType: selectedItem.itemType,
      itemId: selectedItem._id,
      instructorSharePercent: p,
    });
  };

  const handleResetToDefault = (item: any) => {
    if (
      confirm(
        `آیا از بازگرداندن سهم «${item.title}» به درصد پیش‌فرض سامانه مطمئن هستید؟`,
      )
    ) {
      setOverrideMutation.mutate({
        itemType: item.itemType,
        itemId: item._id,
        instructorSharePercent: null,
      });
    }
  };

  const items = itemsData?.items || [];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-[var(--neo-border)] shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
            <Percent className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[var(--neo-text-main)]">
              تنظیمات مالی و سهم مدرس‌ها
            </h1>
            <p className="text-sm text-[var(--neo-text-secondary)] mt-1">
              تعیین درصد پیش‌فرض سهم مدرس و مجموعه، تنظیم درصدهای اختصاصی برای
              هر دوره یا کلاس، و سقف برداشت
            </p>
          </div>
        </div>
      </div>

      {/* بخش اول: تعیین سهم پیش‌فرض سامانه */}
      <div className="bg-white rounded-3xl border border-[var(--neo-border)] p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-[var(--neo-border)] pb-4">
          <div className="flex items-center gap-2.5">
            <Settings className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-[var(--neo-text-main)]">
              درصدهای پیش‌فرض سامانه (Global Defaults)
            </h2>
          </div>
          <span className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium">
            مجموع سهم مدرس و مجموعه در هر بخش ۱۰۰٪ است
          </span>
        </div>

        <form onSubmit={handleSaveGlobal} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* سهم پیش‌فرض دوره‌ها */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-[var(--neo-text-main)] flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-emerald-600" />
                  دوره‌های آموزشی و ویدیویی
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  سهم کل: ۱۰۰٪
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-600 font-bold mb-1.5">
                    سهم مدرس (درصد)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={globalForm.defaultCourseInstructorShare}
                      onChange={(e) => {
                        const val = Math.min(
                          100,
                          Math.max(0, Number(e.target.value) || 0),
                        );
                        setGlobalForm((prev) => ({
                          ...prev,
                          defaultCourseInstructorShare: val,
                        }));
                      }}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                    <span className="absolute left-3 top-2.5 text-xs text-slate-400">
                      ٪
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-600 font-bold mb-1.5">
                    سهم مجموعه تک یاد (محاسباتی)
                  </label>
                  <div className="w-full px-3.5 py-2.5 bg-slate-200/70 border border-slate-300 rounded-xl text-sm font-bold text-slate-600 select-none">
                    {100 - globalForm.defaultCourseInstructorShare} ٪
                  </div>
                </div>
              </div>

              {/* Progress bar visual */}
              <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden flex">
                <div
                  className="bg-emerald-500 h-full transition-all duration-300"
                  style={{
                    width: `${globalForm.defaultCourseInstructorShare}%`,
                  }}
                  title={`مدرس: ${globalForm.defaultCourseInstructorShare}٪`}
                />
                <div
                  className="bg-blue-600 h-full transition-all duration-300"
                  style={{
                    width: `${100 - globalForm.defaultCourseInstructorShare}%`,
                  }}
                  title={`مجموعه: ${100 - globalForm.defaultCourseInstructorShare}٪`}
                />
              </div>
            </div>

            {/* سهم پیش‌فرض کلاس‌ها */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-[var(--neo-text-main)] flex items-center gap-2">
                  <Video className="w-4 h-4 text-purple-600" />
                  کلاس‌های آنلاین و وبینارها
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  سهم کل: ۱۰۰٪
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-600 font-bold mb-1.5">
                    سهم مدرس (درصد)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={globalForm.defaultClassInstructorShare}
                      onChange={(e) => {
                        const val = Math.min(
                          100,
                          Math.max(0, Number(e.target.value) || 0),
                        );
                        setGlobalForm((prev) => ({
                          ...prev,
                          defaultClassInstructorShare: val,
                        }));
                      }}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                    />
                    <span className="absolute left-3 top-2.5 text-xs text-slate-400">
                      ٪
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-600 font-bold mb-1.5">
                    سهم مجموعه تک یاد (محاسباتی)
                  </label>
                  <div className="w-full px-3.5 py-2.5 bg-slate-200/70 border border-slate-300 rounded-xl text-sm font-bold text-slate-600 select-none">
                    {100 - globalForm.defaultClassInstructorShare} ٪
                  </div>
                </div>
              </div>

              {/* Progress bar visual */}
              <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden flex">
                <div
                  className="bg-purple-500 h-full transition-all duration-300"
                  style={{
                    width: `${globalForm.defaultClassInstructorShare}%`,
                  }}
                  title={`مدرس: ${globalForm.defaultClassInstructorShare}٪`}
                />
                <div
                  className="bg-blue-600 h-full transition-all duration-300"
                  style={{
                    width: `${100 - globalForm.defaultClassInstructorShare}%`,
                  }}
                  title={`مجموعه: ${100 - globalForm.defaultClassInstructorShare}٪`}
                />
              </div>
            </div>

            {/* حداقل مبلغ تسویه */}
            <div>
              <label className="block text-xs text-slate-600 font-bold mb-1.5">
                حداقل مبلغ درخواست برداشت (تومان)
              </label>
              <NumericInput
                value={globalForm.minWithdrawalAmount}
                onChange={(val) =>
                  setGlobalForm((prev) => ({
                    ...prev,
                    minWithdrawalAmount: val,
                  }))
                }
                placeholder="مثلاً ۵۰,۰۰۰"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-800"
              />
            </div>

            {/* مهلت بررسی تسویه */}
            <div>
              <label className="block text-xs text-slate-600 font-bold mb-1.5">
                مهلت بررسی و انتقال وجه (روز کاری)
              </label>
              <input
                type="number"
                min={1}
                max={14}
                value={globalForm.settlementReviewDays}
                onChange={(e) =>
                  setGlobalForm((prev) => ({
                    ...prev,
                    settlementReviewDays: Math.max(
                      1,
                      Number(e.target.value) || 1,
                    ),
                  }))
                }
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-800"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[var(--neo-border)]">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Info className="w-4 h-4 text-blue-500" />
              <span>
                تغییر درصدهای پیش‌فرض فقط برای خریدهای جدید اعمال می‌شود و
                درآمدهای گذشته تغییر نخواهند کرد.
              </span>
            </div>

            <button
              type="submit"
              disabled={updateGlobalMutation.isPending}
              className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-colors shadow-sm disabled:opacity-50 text-sm"
            >
              {updateGlobalMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              ذخیره درصدهای پیش‌فرض
            </button>
          </div>
        </form>
      </div>

      {/* بخش دوم: درصد اختصاصی برای هر دوره یا کلاس */}
      <div className="bg-white rounded-3xl border border-[var(--neo-border)] p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[var(--neo-border)] pb-4">
          <div>
            <h2 className="text-lg font-bold text-[var(--neo-text-main)]">
              سهم‌های اختصاصی دوره‌ها و کلاس‌ها (Item Overrides)
            </h2>
            <p className="text-xs text-[var(--neo-text-secondary)] mt-1">
              سوپر ادمین می‌تواند برای یک دوره یا کلاس خاص، درصدی متفاوت از
              پیش‌فرض سامانه تعیین کند.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <input
                type="text"
                placeholder="جست‌وجوی عنوان..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-9 pl-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
            </div>

            {/* Type Filter */}
            <select
              value={itemTypeFilter}
              onChange={(e) => setItemTypeFilter(e.target.value as any)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
            >
              <option value="all">همه موارد</option>
              <option value="course">فقط دوره‌ها</option>
              <option value="class">فقط کلاس‌ها</option>
            </select>
          </div>
        </div>

        {/* Table of Items */}
        <div className="overflow-x-auto">
          {loadingItems ? (
            <div className="py-16 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <span className="text-xs font-bold">
                در حال بارگذاری فهرست دوره‌ها و کلاس‌ها...
              </span>
            </div>
          ) : items.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-sm">
              هیچ دوره یا کلاسی یافت نشد.
            </div>
          ) : (
            <table className="w-full text-right border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-slate-500 font-bold bg-slate-50/60">
                  <th className="py-3 px-4 rounded-r-xl">عنوان</th>
                  <th className="py-3 px-4">نوع</th>
                  <th className="py-3 px-4">مدرس</th>
                  <th className="py-3 px-4">قیمت (تومان)</th>
                  <th className="py-3 px-4">سهم مدرس</th>
                  <th className="py-3 px-4">سهم مجموعه</th>
                  <th className="py-3 px-4">وضعیت تنظیم</th>
                  <th className="py-3 px-4 rounded-l-xl text-center">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item: any) => {
                  const instName = item.instructors?.[0]
                    ? `${item.instructors[0].firstName} ${item.instructors[0].lastName}`
                    : "استاد تک یاد";

                  return (
                    <tr
                      key={`${item.itemType}-${item._id}`}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td
                        className="py-3.5 px-4 font-bold text-[var(--neo-text-main)] max-w-[220px] truncate"
                        title={item.title}
                      >
                        {item.title}
                      </td>
                      <td className="py-3.5 px-4">
                        {item.itemType === "course" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold text-[11px] border border-emerald-200/60">
                            <BookOpen className="w-3 h-3" />
                            دوره
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-purple-50 text-purple-700 font-bold text-[11px] border border-purple-200/60">
                            <Video className="w-3 h-3" />
                            کلاس
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-medium text-xs">
                        {instName}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 font-bold text-xs">
                        {(item.price || 0).toLocaleString("fa-IR")}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-emerald-600">
                        {item.instructorSharePercent} ٪
                      </td>
                      <td className="py-3.5 px-4 font-bold text-blue-600">
                        {item.platformSharePercent} ٪
                      </td>
                      <td className="py-3.5 px-4">
                        {item.isCustom ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-[11px] font-bold border border-amber-200">
                            <Sparkles className="w-3 h-3" />
                            سهم اختصاصی
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[11px] font-medium">
                            پیش‌فرض سامانه
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenOverride(item)}
                            className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold transition"
                          >
                            تنظیم سهم اختصاصی
                          </button>
                          {item.isCustom && (
                            <button
                              onClick={() => handleResetToDefault(item)}
                              title="بازگشت به پیش‌فرض سامانه"
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal: Set Custom Commission Override */}
      {overrideModalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-5 text-right">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-base text-[var(--neo-text-main)] flex items-center gap-2">
                <Percent className="w-5 h-5 text-blue-600" />
                تعیین درصد اختصاصی سهم
              </h3>
              <button
                onClick={() => setOverrideModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/70 space-y-1.5 text-xs text-slate-600">
              <div className="font-bold text-slate-800 text-sm truncate">
                {selectedItem.title}
              </div>
              <div>
                نوع:{" "}
                {selectedItem.itemType === "course"
                  ? "دوره آموزشی"
                  : "کلاس آنلاین"}{" "}
                | نرخ پیش‌فرض سامانه: {selectedItem.defaultPercent}٪ مدرس /{" "}
                {100 - selectedItem.defaultPercent}٪ مجموعه
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  درصد اختصاصی سهم مدرس (از ۰ تا ۱۰۰):
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={customPercent}
                    onChange={(e) =>
                      setCustomPercent(
                        Math.min(100, Math.max(0, Number(e.target.value) || 0)),
                      )
                    }
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  <span className="absolute left-3.5 top-2.5 text-xs text-slate-400">
                    ٪
                  </span>
                </div>
              </div>

              <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-100 text-xs text-blue-800 flex items-center justify-between">
                <span>سهم متناظر مجموعه تک یاد:</span>
                <span className="font-black text-sm">
                  {100 - customPercent} ٪
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t">
              <button
                type="button"
                onClick={() => setOverrideModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
              >
                انصراف
              </button>

              <button
                type="button"
                onClick={handleApplyOverride}
                disabled={setOverrideMutation.isPending}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition shadow-sm disabled:opacity-50 flex items-center gap-2"
              >
                {setOverrideMutation.isPending && (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                )}
                ثبت سهم اختصاصی
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
