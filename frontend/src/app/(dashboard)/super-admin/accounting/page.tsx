'use client';

import { AccountingDashboard } from '@/features/accounting/components/AccountingDashboard';

export default function SuperAdminAccountingPage() {
  return <AccountingDashboard forcedRole="super-admin" />;
}
