import { RoleGuard } from '@/features/auth/components/guards/RoleGuard';

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={['student', 'instructor', 'admin', 'super-admin']} fallback={
      <div className="p-8 text-center text-red-500 font-bold">شما دسترسی لازم برای مشاهده پنل یادگیری را ندارید.</div>
    }>
      {children}
    </RoleGuard>
  );
}
