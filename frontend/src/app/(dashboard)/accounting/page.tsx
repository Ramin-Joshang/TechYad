'use client';

import { Suspense } from 'react';
import { AccountingDashboard } from '@/features/accounting/components/AccountingDashboard';
import { Loader2 } from 'lucide-react';

export default function AccountingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          <span className="text-xs font-bold text-slate-500">در حال بارگذاری پنل حسابداری و دفاتر مالی...</span>
        </div>
      }
    >
      <AccountingDashboard />
    </Suspense>
  );
}
