import { ClassesList } from '@/components/classes/ClassesList';
import { Suspense } from 'react';

export const metadata = {
  title: 'کلاس‌های آموزشی | TechYad',
  description: 'کلاس‌های آموزشی آنلاین و حضوری',
};

export default function ClassesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-500">درحال بارگذاری کلاس‌ها...</div>}>
      <ClassesList />
    </Suspense>
  );
}
