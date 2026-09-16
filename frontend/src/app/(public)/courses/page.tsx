import { CourseListContainer } from "@/components/courses/CourseListContainer";
import { Suspense } from "react";

export const metadata = {
  title: 'دوره‌های آموزشی | TechYad',
  description: 'لیست دوره‌های آموزشی برنامه نویسی، طراحی سایت و هوش مصنوعی',
};

export default function CoursesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">درحال بارگذاری...</div>}>
      <CourseListContainer />
    </Suspense>
  );
}
