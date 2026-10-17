"use client";

import { useQuery } from "@tanstack/react-query";
import { homeApi } from "../api/home.api";
import { HeroSection } from "./HeroSection";
import { CategoriesSection } from "./CategoriesSection";
import { CourseGrid } from "./CourseGrid";
import { InstructorsSection } from "./InstructorsSection";
import { ClassesSection } from "./ClassesSection";
import { TestimonialsSection } from "./TestimonialsSection";
import { BlogSection } from "./BlogSection";
import Link from "next/link";

export function HomeContainer() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["homeData"],
    queryFn: homeApi.getHomeData,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  if (isError || !data?.data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-500 mb-4">خطا در دریافت اطلاعات</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            تلاش مجدد
          </button>
        </div>
      </div>
    );
  }

  const homeData = data.data;

  return (
    <main className="flex flex-col min-h-screen">
      <HeroSection />

      <CategoriesSection categories={homeData.categories} />

      <CourseGrid
        title="دوره‌های محبوب"
        description="دوره‌هایی که بیشترین استقبال را از سمت دانشجویان داشته‌اند."
        courses={homeData.popularCourses}
        viewAllLink="/courses?sort=popular"
      />

      <div className="bg-gray-50 py-12 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100 gap-8">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                مشاوره رایگان آموزشی
              </h3>
              <p className="text-gray-600">
                نمی‌دانید از کجا شروع کنید؟ با مشاوران ما تماس بگیرید تا بهترین
                مسیر را به شما پیشنهاد دهیم.
              </p>
            </div>
            <Link
              href="/contact"
              className="shrink-0 px-8 py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-200"
            >
              درخواست مشاوره
            </Link>
          </div>
        </div>
      </div>

      <CourseGrid
        title="جدیدترین دوره‌ها"
        description="به‌روزترین مباحث آموزشی با دوره‌های تازه منتشر شده."
        courses={homeData.newCourses}
        viewAllLink="/courses?sort=new"
      />

      <InstructorsSection instructors={homeData.topInstructors} />

      <CourseGrid
        title="دوره‌های رایگان"
        description="بدون هزینه شروع کنید و مهارت‌های پایه‌ای را یاد بگیرید."
        courses={homeData.freeCourses}
        viewAllLink="/courses?isFree=true"
      />

      <ClassesSection
        onlineClasses={homeData.onlineClasses}
        inPersonClasses={homeData.inPersonClasses}
      />

      <TestimonialsSection testimonials={homeData.testimonials} />

      <BlogSection posts={homeData.blogPosts} />

      {/* CTA Section */}
      <section className="py-20 bg-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-900/20 mix-blend-multiply"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-600/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-600/30 rounded-full blur-3xl"></div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            همین حالا تدریس را شروع کنید!
          </h2>
          <p className="text-lg text-gray-300 mb-10 leading-relaxed">
            آیا در زمینه‌ای متخصص هستید؟ به جمع اساتید تک یاد بپیوندید و دانش
            خود را با هزاران دانشجو به اشتراک بگذارید و درآمد کسب کنید.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register?role=instructor"
              className="px-8 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 transition shadow-lg shadow-blue-900/50"
            >
              ثبت‌نام به عنوان استاد
            </Link>
            <Link
              href="/teach"
              className="px-8 py-4 bg-gray-800 text-white border border-gray-700 font-bold rounded-xl hover:bg-gray-700 transition"
            >
              شرایط و قوانین تدریس
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
