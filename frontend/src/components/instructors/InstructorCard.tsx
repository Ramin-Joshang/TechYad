"use client";

import Link from "next/link";
import {
  GraduationCap,
  Award,
  BookOpen,
  Users,
  Star,
  ArrowLeft,
} from "lucide-react";
import { getImageUrl, handleImageError } from "@/lib/utils";

export interface InstructorCardProps {
  instructor: any;
  featured?: boolean;
  variant?: "standard" | "carousel";
}

export function InstructorCard({
  instructor,
  featured = false,
  variant = "standard",
}: InstructorCardProps) {
  if (!instructor) return null;

  // Extract user details whether instructor object is populated profile or user
  const user = instructor.userId || instructor;
  const firstName = user.firstName || "";
  const lastName = user.lastName || "";
  const fullName =
    `${firstName} ${lastName}`.trim() ||
    instructor.name ||
    "استاد آکادمی تک یاد";

  const displayAvatar = getImageUrl(
    user.personnelPhoto ||
      instructor.personnelPhoto ||
      user.avatar ||
      instructor.avatar,
    "avatar",
    fullName,
  );

  const title =
    instructor.title ||
    user.specialty ||
    instructor.headline ||
    "مدرس و متخصص ارشد";
  const bio = instructor.bio || user.bio || "";
  const cleanBio =
    typeof bio === "string" ? bio.replace(/<[^>]*>/g, "").trim() : "";

  const specialties =
    Array.isArray(instructor.specialties) && instructor.specialties.length > 0
      ? instructor.specialties
      : Array.isArray(instructor.expertise)
        ? instructor.expertise
        : [];

  const instructorSlug =
    instructor.slug ||
    user.slug ||
    (firstName && lastName
      ? `${firstName}-${lastName}`.replace(/\s+/g, "-")
      : user._id || instructor._id);

  const coursesCount =
    instructor.coursesCount !== undefined
      ? Number(instructor.coursesCount)
      : Array.isArray(instructor.courses)
        ? instructor.courses.length
        : 0;
  const classesCount =
    instructor.classesCount !== undefined
      ? Number(instructor.classesCount)
      : Array.isArray(instructor.classes)
        ? instructor.classes.length
        : 0;
  const totalTraining =
    instructor.trainingCount !== undefined
      ? Number(instructor.trainingCount)
      : coursesCount + classesCount;
  const totalStudents =
    instructor.studentCount || instructor.studentsCount || 0;
  const rating = instructor.averageRating || instructor.rating || 5.0;

  return (
    <Link
      href={`/instructors/${encodeURIComponent(instructorSlug)}`}
      className="group block h-full text-right"
      title={`مشاهده رزومه، دوره‌ها و کلاس‌های ${fullName}`}
    >
      <div
        className={`bg-white rounded-3xl p-5 sm:p-6 border transition-all duration-300 h-full flex flex-col justify-between relative overflow-hidden ${
          featured
            ? "border-amber-200/90 shadow-md shadow-amber-500/5 hover:border-amber-400 hover:shadow-xl"
            : "border-[var(--neo-border)] shadow-xs hover:border-[var(--neo-primary)]/40 hover:shadow-xl hover:-translate-y-1"
        }`}
      >
        {/* Subtle decorative background gradient */}
        <div
          className={`absolute top-0 right-0 w-32 h-32 rounded-full -translate-y-16 translate-x-16 pointer-events-none transition duration-500 ${
            featured
              ? "bg-amber-100/60 group-hover:scale-150"
              : "bg-[var(--neo-primary)]/5 group-hover:scale-150"
          }`}
        />

        {/* Top Header: 1:1 Profile Picture & Info */}
        <div className="relative z-10 flex items-center gap-4 mb-4">
          {/* Strictly 1:1 Aspect Ratio Square Avatar Container */}
          <div className="relative w-20 h-20 sm:w-22 sm:h-22 aspect-square shrink-0 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-xs">
            <img
              src={displayAvatar}
              onError={(e) => handleImageError(e, "avatar", fullName)}
              alt={fullName}
              className="w-full h-full aspect-square object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            />
            {featured && (
              <div
                className="absolute top-1.5 right-1.5 bg-amber-500 text-white rounded-lg p-1 shadow-xs z-10"
                title="استاد برگزیده"
              >
                <Award className="w-3.5 h-3.5" />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 mb-1">
              <h3 className="font-bold text-base sm:text-lg text-[var(--neo-text-main)] group-hover:text-[var(--neo-primary)] transition-colors truncate">
                {fullName}
              </h3>
            </div>

            <p className="text-xs sm:text-[13px] text-slate-500 font-medium line-clamp-1 mb-2">
              {title}
            </p>

            {/* Quick rating indicator */}
            <div className="flex items-center gap-1 text-xs text-amber-600 font-bold">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{rating ? Number(rating).toFixed(1) : "۵.۰"}</span>
              <span className="text-slate-400 font-normal text-[11px] mr-1">
                ({totalTraining} آموزش)
              </span>
            </div>
          </div>
        </div>

        {/* Short Bio (Fixed lines so height stays consistent) */}
        {cleanBio && (
          <p className="relative z-10 text-xs text-slate-600 leading-relaxed line-clamp-2 mb-4 font-normal min-h-[34px]">
            {cleanBio}
          </p>
        )}

        {/* Specialties / Tags */}
        <div className="relative z-10 mt-auto pt-3 border-t border-slate-100 flex flex-col gap-3">
          {specialties.length > 0 && (
            <div className="flex flex-wrap gap-1.5 overflow-hidden max-h-14">
              {specialties.slice(0, 3).map((spec: string, i: number) => (
                <span
                  key={i}
                  className="text-[11px] font-medium text-slate-700 bg-slate-50 border border-slate-200/80 px-2 py-0.5 rounded-lg truncate max-w-[140px]"
                >
                  {spec}
                </span>
              ))}
              {specialties.length > 3 && (
                <span className="text-[10px] text-slate-400 self-center">
                  +{specialties.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Footer CTA & Profile Link */}
          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
              <GraduationCap className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>مشاهده کارنامه</span>
            </span>

            <span className="font-bold text-[var(--neo-primary)] flex items-center gap-1 group-hover:-translate-x-1 transition-transform">
              <span>پروفایل و کلاس‌ها</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
