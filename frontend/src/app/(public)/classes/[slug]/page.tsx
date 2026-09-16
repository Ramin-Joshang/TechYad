import { ClassDetailsContainer } from '@/components/classes/ClassDetailsContainer';

export const metadata = {
  title: 'جزئیات کلاس | TechYad',
};

export default async function ClassDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  return <ClassDetailsContainer slug={resolvedParams.slug} />;
}
