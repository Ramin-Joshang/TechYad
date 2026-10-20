'use client';

import { AccountingDashboard } from '@/features/accounting/components/AccountingDashboard';

export default function PartnerAccountingPage() {
  return <AccountingDashboard forcedRole="partner" />;
}
