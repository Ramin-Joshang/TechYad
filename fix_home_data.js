const fs = require('fs');

let code = fs.readFileSync('frontend/src/components/home/HomeDataView.tsx', 'utf8');

code = code.replace(
  `  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">درحال بارگذاری اطلاعات...</div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-500">خطا در دریافت اطلاعات</div>;
  }

  const d = data || {};

  return (
    <div className="min-h-screen flex flex-col">
      <Hero />
      <Intro />
      <Categories data={d.categories} />
      <CourseList title="دوره‌های محبوب" data={d.popularCourses} />
      <CourseList title="جدیدترین دوره‌ها" data={d.newCourses} />
      <CourseList title="دوره‌های رایگان" data={d.freeCourses} />
      <InstructorGrid data={d.topInstructors} />
      <CourseList title="کلاس‌های آنلاین" data={d.onlineClasses} />
      <CourseList title="کلاس‌های حضوری" data={d.inPersonClasses} />
      <Advantages />
      <Testimonials data={d.testimonials} />
      <LatestArticles data={d.blogPosts || d.latestArticles} />
      <CTA />
    </div>
  );`,
  `  const d = data || {};

  return (
    <div className="min-h-screen flex flex-col">
      <Hero />
      <Intro />
      
      {isLoading ? (
        <div className="py-32 flex flex-col items-center justify-center gap-4 text-blue-600">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-bold">درحال بارگذاری دوره‌ها...</p>
        </div>
      ) : error ? (
        <div className="py-32 flex items-center justify-center text-red-500 font-bold">خطا در دریافت اطلاعات سرور</div>
      ) : (
        <>
          <Categories data={d.categories} />
          <CourseList title="دوره‌های محبوب" data={d.popularCourses} />
          <CourseList title="جدیدترین دوره‌ها" data={d.newCourses} />
          <CourseList title="دوره‌های رایگان" data={d.freeCourses} />
          <InstructorGrid data={d.topInstructors} />
          <CourseList title="کلاس‌های آنلاین" data={d.onlineClasses} />
          <CourseList title="کلاس‌های حضوری" data={d.inPersonClasses} />
        </>
      )}

      <Advantages />
      
      {!isLoading && !error && (
        <>
          <Testimonials data={d.testimonials} />
          <LatestArticles data={d.blogPosts || d.latestArticles} />
        </>
      )}
      
      <CTA />
    </div>
  );`
);

fs.writeFileSync('frontend/src/components/home/HomeDataView.tsx', code);
