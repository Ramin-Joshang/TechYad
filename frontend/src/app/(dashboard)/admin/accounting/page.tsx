'use client';

import { AccountingDashboard } from '@/features/accounting/components/AccountingDashboard';

export default function AdminAccountingPage() {
  return <AccountingDashboard forcedRole="accountant" />;
}
