import { CourseDetailsContainer } from "@/components/courses/CourseDetailsContainer";
import { Suspense } from "react";

export const metadata = {
  title: 'جزئیات دوره | TechYad',
};

export default async function CoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">درحال بارگذاری دوره...</div>}>
      <CourseDetailsContainer slug={resolvedParams.slug} />
    </Suspense>
  );
}
