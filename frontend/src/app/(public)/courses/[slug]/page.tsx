import { CourseDetailsContainer } from "@/components/courses/CourseDetailsContainer";
import { Suspense } from "react";


export async function generateMetadata({ params }: { params: Promise<{ slug?: string, id?: string }> }) {
  const resolvedParams = await params;
  const identifier = resolvedParams.slug || resolvedParams.id;
  
  try {
    // In a real app we would fetch the actual data here to populate the metadata
    // For now, we will provide a generic but structured dynamic metadata
    return {
      title: `${identifier} | TechYad`,
      description: `اطلاعات کامل در مورد ${identifier} در تک‌یاد`,
      openGraph: {
        title: `${identifier} | TechYad`,
        description: `اطلاعات کامل در مورد ${identifier} در تک‌یاد`,
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${identifier} | TechYad`,
        description: `اطلاعات کامل در مورد ${identifier} در تک‌یاد`,
      }
    };
  } catch(e) {
    return { title: 'TechYad' };
  }
}


export default async function CoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">درحال بارگذاری دوره...</div>}>
      <CourseDetailsContainer slug={resolvedParams.slug} />
    </Suspense>
  );
}
