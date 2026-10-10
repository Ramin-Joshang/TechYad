import { RoleGuard } from '@/features/auth/components/guards/RoleGuard';

export default function InstructorLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={['instructor']} fallback={
      <div className="p-8 text-center text-red-500 font-bold bg-red-50/50 rounded-2xl border border-red-200 m-6">
        شما مجوز لازم برای ورود به پنل تدریس و اساتید را ندارید. در صورت مدیر بودن، قابلیت تدریس باید به صورت اختصاصی توسط مدیر کل (Super Admin) برای شما فعال گردد.
      </div>
    }>
      {children}
    </RoleGuard>
  );
}
