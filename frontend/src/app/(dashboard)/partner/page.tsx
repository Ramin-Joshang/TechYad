'use client';

import { AccountingDashboard } from '@/features/accounting/components/AccountingDashboard';

export default function PartnerDashboardPage() {
  return <AccountingDashboard forcedRole="partner" />;
}
