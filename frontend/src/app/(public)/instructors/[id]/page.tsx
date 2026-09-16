import { InstructorProfileContainer } from '@/components/instructors/InstructorProfileContainer';

export const metadata = {
  title: 'پروفایل استاد | TechYad',
};

export default async function InstructorProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return <InstructorProfileContainer id={resolvedParams.id} />;
}
