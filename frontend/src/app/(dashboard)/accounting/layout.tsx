import { RoleGuard } from '@/features/auth/components/guards/RoleGuard';

export default function AccountingLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard
      allowedRoles={['super-admin', 'admin', 'accountant', 'partner']}
      fallback={
        <div className="p-8 text-center text-rose-600 font-bold bg-rose-50/70 rounded-3xl border border-rose-200 m-6">
          شما مجوز لازم برای ورود به سامانه حسابداری را ندارید. دسترسی به این پنل صرفاً مختص مدیران ارشد، حسابداران و شرکای مؤسسه می‌باشد.
        </div>
      }
    >
      {children}
    </RoleGuard>
  );
}
