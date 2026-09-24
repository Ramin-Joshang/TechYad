import { InstructorProfileContainer } from '@/components/instructors/InstructorProfileContainer';


export async function generateMetadata({ params }: { params: Promise<{ slug?: string, id?: string }> }) {
  const resolvedParams = await params;
  const identifier = resolvedParams.slug || resolvedParams.id;
  
  try {
    // In a real app we would fetch the actual data here to populate the metadata
    // For now, we will provide a generic but structured dynamic metadata
    return {
      title: `${identifier} | Tecyad`,
      description: `اطلاعات کامل در مورد ${identifier} در تک‌یاد`,
      openGraph: {
        title: `${identifier} | Tecyad`,
        description: `اطلاعات کامل در مورد ${identifier} در تک‌یاد`,
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${identifier} | Tecyad`,
        description: `اطلاعات کامل در مورد ${identifier} در تک‌یاد`,
      }
    };
  } catch(e) {
    return { title: 'Tecyad' };
  }
}


export default async function InstructorProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return <InstructorProfileContainer id={resolvedParams.id} />;
}
