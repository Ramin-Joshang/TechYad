import { api } from '@/lib/api';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface UserReferralInfo {
  referralCode: string;
  shareLinks: {
    directLink: string;
    telegram: string;
    whatsapp: string;
    eitaa: string;
    bale: string;
    sms: string;
  };
  stats: {
    totalInvited: number;
    totalConversions: number;
    conversionRate: number;
    totalEarned: number;
    walletBalance: number;
    minWithdrawalAmount: number;
    commissionPercent: number;
    refereeDiscountPercent: number;
  };
  tier: {
    level: string;
    name: string;
    color: string;
    bonusRate: number;
    minInvites: number;
    nextTier: string | null;
    invitesNeededForNext: number;
    badgeText: string;
  };
  referrals: Array<{
    _id: string;
    name: string;
    email: string;
    avatar?: string;
    registeredAt: string;
    status: 'pending' | 'completed' | 'rewarded' | 'rejected';
    rewardAmount: number;
    orderAmount: number;
    qualificationDate?: string;
  }>;
  payouts: Array<{
    _id: string;
    amount: number;
    status: 'pending' | 'approved' | 'paid' | 'rejected';
    method: 'bank_transfer' | 'wallet_credit';
    bankInfo?: {
      shaba?: string;
      cardNumber?: string;
      bankName?: string;
      accountHolder?: string;
    };
    adminNote?: string;
    transactionReference?: string;
    requestedAt: string;
    processedAt?: string;
  }>;
  settings: {
    termsAndConditions?: string;
    isActive: boolean;
  };
}

export interface InstructorReferralInfo extends UserReferralInfo {
  instructorCourses: Array<{
    courseId: string;
    title: string;
    price: number;
    thumbnail?: string;
    affiliateUrl: string;
    telegramShareUrl: string;
  }>;
}

export interface ReferralAdminOverview {
  totalReferrals: number;
  rewardedReferrals: number;
  pendingReferrals: number;
  totalReferrersCount: number;
  totalRewardPaid: number;
  totalRevenueGenerated: number;
  conversionRate: number;
  pendingPayoutsCount: number;
  pendingPayoutsAmount: number;
}

export interface ReferralSettingData {
  _id?: string;
  isActive: boolean;
  rewardMode: 'percentage' | 'fixed';
  defaultCommissionPercent: number;
  fixedRewardAmount: number;
  refereeDiscountPercent: number;
  refereeWelcomeCredit: number;
  instructorCommissionPercent: number;
  minWithdrawalAmount: number;
  qualificationCondition: 'first_purchase' | 'any_purchase' | 'registration_only';
  autoCreditWallet: boolean;
  termsAndConditions?: string;
}

export const referralApi = {
  // Public
  validateCode: async (code: string) => {
    return api.get<unknown, ApiResponse<{
      valid: boolean;
      referrerName: string;
      discountPercent: number;
      welcomeCredit: number;
    }>>(`/referrals/validate/${code}`);
  },

  getLeaderboard: async (limit = 10) => {
    return api.get<unknown, ApiResponse<Array<{
      rank: number;
      userId: string;
      name: string;
      avatar?: string;
      role: string;
      referralCount: number;
      referralEarnings: number;
      tier: string;
    }>>>(`/referrals/leaderboard?limit=${limit}`);
  },

  // Student / General User
  getMyInfo: async () => {
    return api.get<unknown, ApiResponse<UserReferralInfo>>('/referrals/my-info');
  },

  // Instructor
  getInstructorInfo: async () => {
    return api.get<unknown, ApiResponse<InstructorReferralInfo>>('/referrals/instructor-info');
  },

  // Request Payout
  requestPayout: async (data: {
    amount: number;
    method: 'bank_transfer' | 'wallet_credit';
    bankInfo?: {
      shaba?: string;
      cardNumber?: string;
      bankName?: string;
      accountHolder?: string;
    };
  }) => {
    return api.post<unknown, ApiResponse<Record<string, unknown>>>('/referrals/request-payout', data);
  },

  // Admin & Super Admin
  getAdminOverview: async () => {
    return api.get<unknown, ApiResponse<ReferralAdminOverview>>('/referrals/admin/overview');
  },

  getAdminReferrals: async (params?: { page?: number; limit?: number; status?: string; search?: string }) => {
    return api.get<unknown, ApiResponse<{
      referrals: Record<string, unknown>[];
      total: number;
      page: number;
      totalPages: number;
    }>>('/referrals/admin/list', { params });
  },

  getAdminPayouts: async (params?: { page?: number; limit?: number; status?: string }) => {
    return api.get<unknown, ApiResponse<{
      payouts: Record<string, unknown>[];
      total: number;
      page: number;
      totalPages: number;
    }>>('/referrals/admin/payouts', { params });
  },

  updatePayoutStatus: async (
    payoutId: string,
    data: {
      status: 'approved' | 'paid' | 'rejected';
      adminNote?: string;
      transactionReference?: string;
    }
  ) => {
    return api.patch<unknown, ApiResponse<Record<string, unknown>>>(`/referrals/admin/payouts/${payoutId}`, data);
  },

  getSettings: async () => {
    return api.get<unknown, ApiResponse<ReferralSettingData>>('/referrals/admin/settings');
  },

  updateSettings: async (settings: Partial<ReferralSettingData>) => {
    return api.put<unknown, ApiResponse<ReferralSettingData>>('/referrals/admin/settings', settings);
  },

  manualBonusCredit: async (data: { userId: string; amount: number; reason: string }) => {
    return api.post<unknown, ApiResponse<Record<string, unknown>>>('/referrals/admin/manual-bonus', data);
  },
};
