import { AuthGuard } from '@/features/auth/components/guards/AuthGuard';
import { RoleGuard } from '@/features/auth/components/guards/RoleGuard';

export default function PlayerLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <RoleGuard allowedRoles={['student', 'admin', 'instructor']}>
        <div className="h-screen w-full bg-gray-900 overflow-hidden text-white flex flex-col">
          {children}
        </div>
      </RoleGuard>
    </AuthGuard>
  );
}
