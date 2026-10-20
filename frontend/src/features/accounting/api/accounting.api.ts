import { api } from '@/lib/api';

export interface ChartAccount {
  _id: string;
  code: string;
  name?: string;
  title?: string;
  type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  nature: 'debit' | 'credit';
  level: number;
  parentCode?: string;
  description?: string;
  isActive: boolean;
  isSystem: boolean;
  currency: string;
}

export interface JournalEntryLine {
  accountCode: string;
  accountName?: string;
  description?: string;
  debit: number;
  credit: number;
  currency?: string;
  entityType?: 'user' | 'instructor' | 'bank' | 'order' | 'partner' | 'other';
  entityId?: string;
}

export interface JournalEntry {
  _id: string;
  entryNumber: number;
  date: string;
  description: string;
  status: 'draft' | 'posted' | 'reversed';
  totalAmount: number;
  lines: JournalEntryLine[];
  sourceType?: string;
  sourceId?: string;
  referenceDocument?: string;
  reversalOf?: string;
  reversedBy?: string;
  createdBy?: {
    _id: string;
    firstName: string;
    lastName: string;
    email?: string;
  };
  postedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FinancialAccountItem {
  _id: string;
  name?: string;
  title?: string;
  type: 'bank' | 'card' | 'cash' | 'gateway_settlement' | 'partner_equity' | 'other';
  code: string;
  bankName?: string;
  accountNumber?: string;
  cardLast4?: string;
  shaba?: string;
  accountHolderName?: string;
  currency: string;
  initialBalance: number;
  isActive: boolean;
  totalInflow?: number;
  totalOutflow?: number;
  currentBalance?: number;
}

export interface FinancialOperationItem {
  _id: string;
  operationNumber: string;
  type: 'income' | 'expense' | 'transfer' | 'partner_equity' | 'partner_loan' | 'partner_repayment' | 'partner_withdrawal' | 'partner_dividend';
  category: string;
  amount: number;
  date: string;
  description: string;
  status: 'completed' | 'cancelled';
  journalEntryId?: any;
  fromAccountId?: FinancialAccountItem;
  toAccountId?: FinancialAccountItem;
  partnerId?: {
    _id: string;
    firstName: string;
    lastName: string;
    mobile?: string;
  };
  payerOrPayee?: string;
  receiptAttachment?: string;
  createdBy?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
}

export interface TrialBalanceItem {
  accountCode: string;
  accountName: string;
  type: string;
  nature: string;
  debitSum: number;
  creditSum: number;
  balanceDebit: number;
  balanceCredit: number;
}

export interface ReceivablesPayablesSummary {
  receivables: {
    total: number;
    gatewayTransit: number;
    studentInstallments: number;
  };
  payables: {
    total: number;
    instructorsPendingSettlement: number;
    studentWalletLiabilities: number;
    partnerLoans: number;
  };
  equityAndReserves: {
    partnerCapital: number;
    partnerWithdrawals: number;
    retainedEarnings: number;
  };
  systemTime: string;
}

export const accountingApi = {
  // 1. Chart of Accounts
  getAccounts: (params?: { type?: string; parentCode?: string; search?: string }) =>
    api.get<any, { success: boolean; data: ChartAccount[] }>('/accounting/accounts', { params }),

  seedCOA: () =>
    api.post<any, { success: boolean; message: string; seededCount: number }>('/accounting/seed-coa'),

  createAccount: (data: Partial<ChartAccount>) =>
    api.post<any, { success: boolean; data: ChartAccount }>('/accounting/accounts', data),

  // 2. Journal Entries
  getJournalEntries: (params?: {
    page?: number;
    limit?: number;
    status?: string;
    sourceType?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
  }) =>
    api.get<any, { success: boolean; data: { entries: JournalEntry[]; total: number; page: number; totalPages: number } }>(
      '/accounting/journal-entries',
      { params }
    ),

  getJournalEntryById: (id: string) =>
    api.get<any, { success: boolean; data: JournalEntry }>(`/accounting/journal-entries/${id}`),

  createJournalEntry: (data: {
    date: string | Date;
    description: string;
    status: 'draft' | 'posted';
    sourceType?: string;
    sourceId?: string;
    referenceDocument?: string;
    lines: JournalEntryLine[];
  }) => api.post<any, { success: boolean; data: JournalEntry }>('/accounting/journal-entries', data),

  updateDraftJournalEntry: (id: string, data: any) =>
    api.put<any, { success: boolean; data: JournalEntry }>(`/accounting/journal-entries/${id}`, data),

  deleteDraftJournalEntry: (id: string) =>
    api.delete<any, { success: boolean; message: string }>(`/accounting/journal-entries/${id}`),

  postJournalEntry: (id: string) =>
    api.post<any, { success: boolean; data: JournalEntry }>(`/accounting/journal-entries/${id}/post`),

  reverseJournalEntry: (id: string, reason: string) =>
    api.post<any, { success: boolean; data: { originalEntry: JournalEntry; reversalEntry: JournalEntry } }>(
      `/accounting/journal-entries/${id}/reverse`,
      { reason }
    ),

  // 3. Ledgers & Trial Balance
  getTrialBalance: (params?: { startDate?: string; endDate?: string }) =>
    api.get<any, { success: boolean; data: { items: TrialBalanceItem[]; totalDebit: number; totalCredit: number; isBalanced: boolean } }>(
      '/accounting/trial-balance',
      { params }
    ),

  getAccountLedger: (accountCode: string, params?: { startDate?: string; endDate?: string; page?: number; limit?: number }) =>
    api.get<any, { success: boolean; data: any }>(`/accounting/ledger/${accountCode}`, { params }),

  // 4. Fiscal Years
  getFiscalYears: () =>
    api.get<any, { success: boolean; data: any[] }>('/accounting/fiscal-years'),

  createFiscalYear: (data: { year: number; title: string; startDate: string; endDate: string }) =>
    api.post<any, { success: boolean; data: any }>('/accounting/fiscal-years', data),

  closeFiscalYear: (year: number) =>
    api.post<any, { success: boolean; data: any }>(`/accounting/fiscal-years/${year}/close`),

  // 5. Financial Accounts (بانک، صندوق، کارت)
  getFinancialAccounts: () =>
    api.get<any, { success: boolean; data: FinancialAccountItem[] }>('/accounting/financial-accounts'),

  getFinancialAccountById: (id: string) =>
    api.get<any, { success: boolean; data: FinancialAccountItem }>(`/accounting/financial-accounts/${id}`),

  createFinancialAccount: (data: Partial<FinancialAccountItem>) =>
    api.post<any, { success: boolean; data: FinancialAccountItem }>('/accounting/financial-accounts', data),

  updateFinancialAccount: (id: string, data: Partial<FinancialAccountItem>) =>
    api.put<any, { success: boolean; data: FinancialAccountItem }>(`/accounting/financial-accounts/${id}`, data),

  // 6. Financial Operations (درآمدها، هزینه‌ها، انتقال، شرکا)
  getFinancialOperations: (params?: {
    page?: number;
    limit?: number;
    type?: string;
    category?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }) =>
    api.get<any, { success: boolean; data: { operations: FinancialOperationItem[]; total: number; page: number; totalPages: number } }>(
      '/accounting/operations',
      { params }
    ),

  getFinancialOperationById: (id: string) =>
    api.get<any, { success: boolean; data: FinancialOperationItem }>(`/accounting/operations/${id}`),

  createFinancialOperation: (data: any) =>
    api.post<any, { success: boolean; data: FinancialOperationItem }>('/accounting/operations', data),

  cancelFinancialOperation: (id: string, reason?: string) =>
    api.post<any, { success: boolean; data: FinancialOperationItem }>(`/accounting/operations/${id}/cancel`, { reason }),

  // 7. Receivables, Payables & Equity Summary
  getReceivablesAndPayablesSummary: () =>
    api.get<any, { success: boolean; data: ReceivablesPayablesSummary }>('/accounting/receivables-payables-summary'),

  // 8. Audit Logs
  getAuditLogs: (params?: { page?: number; limit?: number }) =>
    api.get<any, { success: boolean; data: any }>('/accounting/audit-logs', { params }),
};
