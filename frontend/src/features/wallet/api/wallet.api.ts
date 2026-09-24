import { api } from '@/lib/api';

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export type WalletTxType =
  | 'deposit'
  | 'withdraw'
  | 'purchase'
  | 'refund'
  | 'referral_reward'
  | 'referral_welcome'
  | 'instructor_share'
  | 'admin_adjustment';

export type WalletTxDirection = 'credit' | 'debit';
export type WalletTxStatus = 'completed' | 'pending' | 'failed' | 'rejected';

export interface WalletTransactionItem {
  _id: string;
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
    role?: {
      name: string;
      slug: string;
    };
  } | string;
  type: WalletTxType;
  direction: WalletTxDirection;
  amount: number;
  balanceAfter: number;
  status: WalletTxStatus;
  title: string;
  description?: string;
  referenceId?: string;
  orderId?: string | { _id: string; totalAmount?: number };
  gateway?: string;
  bankInfo?: {
    shaba?: string;
    cardNumber?: string;
    accountHolder?: string;
    bankName?: string;
  };
  trackingCode?: string;
  adminNote?: string;
  processedBy?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface WalletOverview {
  balance: number;
  user: {
    id: string;
    name: string;
    email: string;
    role: unknown;
  };
  stats: {
    totalCredited: number;
    totalDebited: number;
    totalDeposits: number;
    totalSpentOnOrders: number;
    totalReferralEarnings: number;
    pendingWithdrawalAmount: number;
    pendingWithdrawalCount: number;
  };
  quickDepositPresets: number[];
  recentTransactions: WalletTransactionItem[];
}

export interface WalletTransactionsResponse {
  items: WalletTransactionItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface WalletAdminStats {
  totalLiabilities: number;
  usersWithBalance: number;
  totalDeposits: number;
  totalPurchases: number;
  totalWithdrawals: number;
  totalReferralPaid: number;
  pendingWithdrawalsAmount: number;
  pendingWithdrawalsCount: number;
}

export const walletApi = {
  // User endpoints
  getOverview: async () => {
    return api.get<unknown, ApiResponse<WalletOverview>>('/wallet/overview');
  },

  getTransactions: async (params?: {
    page?: number;
    limit?: number;
    type?: string;
    direction?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    return api.get<unknown, ApiResponse<WalletTransactionsResponse>>('/wallet/transactions', { params });
  },

  chargeWallet: async (amount: number) => {
    return api.post<unknown, ApiResponse<{
      transactionId: string;
      authority: string;
      amount: number;
      paymentUrl: string;
    }>>('/wallet/charge', { amount });
  },

  verifyCharge: async (authority: string, status: 'OK' | 'NOK') => {
    return api.post<unknown, ApiResponse<{
      success: boolean;
      amount: number;
      balance: number;
      trackingCode?: string;
      message?: string;
      alreadyProcessed?: boolean;
    }>>('/wallet/charge/verify', { authority, status });
  },

  payOrderWithWallet: async (orderId: string) => {
    return api.post<unknown, ApiResponse<{
      success: boolean;
      orderId: string;
      amount: number;
      balanceAfter: number;
      trackingCode?: string;
    }>>('/wallet/pay-order', { orderId });
  },

  requestWithdrawal: async (data: {
    amount: number;
    shaba: string;
    accountHolder: string;
    bankName?: string;
    cardNumber?: string;
  }) => {
    return api.post<unknown, ApiResponse<WalletTransactionItem>>('/wallet/withdraw', data);
  },

  // Admin endpoints
  adminGetStats: async () => {
    return api.get<unknown, ApiResponse<WalletAdminStats>>('/wallet/admin/stats');
  },

  adminGetAllTransactions: async (params?: {
    page?: number;
    limit?: number;
    type?: string;
    direction?: string;
    status?: string;
    search?: string;
    userId?: string;
  }) => {
    return api.get<unknown, ApiResponse<WalletTransactionsResponse>>('/wallet/admin/transactions', { params });
  },

  adminAdjustBalance: async (data: {
    targetUserId: string;
    amount: number;
    direction: 'credit' | 'debit';
    reason: string;
  }) => {
    return api.post<unknown, ApiResponse<{
      user: { id: string; name: string; email: string; walletBalance: number };
      transaction: WalletTransactionItem;
    }>>('/wallet/admin/adjust', data);
  },

  adminApproveWithdrawal: async (id: string, data?: { trackingCode?: string; adminNote?: string }) => {
    return api.patch<unknown, ApiResponse<WalletTransactionItem>>(`/wallet/admin/withdrawals/${id}/approve`, data || {});
  },

  adminRejectWithdrawal: async (id: string, rejectionReason: string) => {
    return api.patch<unknown, ApiResponse<WalletTransactionItem>>(`/wallet/admin/withdrawals/${id}/reject`, { rejectionReason });
  },
};
