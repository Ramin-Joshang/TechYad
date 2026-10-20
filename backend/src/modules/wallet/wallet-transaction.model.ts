import { Schema, Types, model, Document } from "mongoose";

export type WalletTransactionType =
  | "deposit"           // شارژ آنلاین یا شتاب
  | "withdraw"          // تسویه حساب یا برداشت به حساب بانکی
  | "purchase"          // خرید دوره یا کلاس
  | "refund"            // بازگشت وجه سفارش لغو شده
  | "referral_reward"   // پاداش همکاری در فروش و دعوت دوستان
  | "referral_welcome"  // هدیه عضویت با کد معرف
  | "instructor_share"  // سهم مدرس از فروش
  | "admin_adjustment"; // تغییر دستی موجودی توسط مدیریت

export type WalletTransactionDirection = "credit" | "debit"; // credit = واریز (+), debit = برداشت (-)

export type WalletTransactionStatus = "completed" | "pending" | "failed" | "rejected" | "under_review";

export interface IWalletTransaction extends Document {
  userId: Types.ObjectId;
  type: WalletTransactionType;
  direction: WalletTransactionDirection;
  amount: number;
  balanceAfter: number;
  status: WalletTransactionStatus;
  title: string;
  description?: string;
  referenceId?: string; // شماره تراکنش، کد پیگیری، شماره سفارش
  resNum?: string;
  refNum?: string;
  rrn?: string;
  traceNo?: string;
  terminalId?: string;
  maskedPan?: string;
  initialStatus?: string;
  callbackState?: string;
  verifyResultCode?: string | number;
  gatewayErrorCode?: string;
  gatewayErrorMessage?: string;
  returnAt?: Date;
  verifiedAt?: Date;
  orderId?: Types.ObjectId;
  gateway?: string;     // 'saman' | 'zarinpal_mock' | 'wallet' | 'manual' | 'referral' | 'settlement'
  bankInfo?: {
    shaba?: string;
    cardNumber?: string;
    accountHolder?: string;
    bankName?: string;
  };
  trackingCode?: string;
  adminNote?: string;
  processedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const walletTransactionSchema = new Schema<IWalletTransaction>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        "deposit",
        "withdraw",
        "purchase",
        "refund",
        "referral_reward",
        "referral_welcome",
        "instructor_share",
        "admin_adjustment",
      ],
      required: true,
      index: true,
    },
    direction: {
      type: String,
      enum: ["credit", "debit"],
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    balanceAfter: {
      type: Number,
      required: true,
      default: 0,
    },
    status: {
      type: String,
      enum: ["completed", "pending", "failed", "rejected", "under_review"],
      default: "completed",
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    referenceId: {
      type: String,
      index: true,
      trim: true,
    },
    resNum: {
      type: String,
      index: true,
      trim: true,
    },
    refNum: {
      type: String,
      index: true,
      trim: true,
    },
    rrn: String,
    traceNo: String,
    terminalId: String,
    maskedPan: String,
    initialStatus: String,
    callbackState: String,
    verifyResultCode: Schema.Types.Mixed,
    gatewayErrorCode: String,
    gatewayErrorMessage: String,
    returnAt: Date,
    verifiedAt: Date,
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      index: true,
    },
    gateway: {
      type: String,
      trim: true,
    },
    bankInfo: {
      shaba: { type: String, trim: true },
      cardNumber: { type: String, trim: true },
      accountHolder: { type: String, trim: true },
      bankName: { type: String, trim: true },
    },
    trackingCode: {
      type: String,
      trim: true,
    },
    adminNote: {
      type: String,
      trim: true,
    },
    processedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

walletTransactionSchema.index({ userId: 1, createdAt: -1 });
walletTransactionSchema.index({ type: 1, createdAt: -1 });
walletTransactionSchema.index({ status: 1, createdAt: -1 });

export const WalletTransaction = model<IWalletTransaction>(
  "WalletTransaction",
  walletTransactionSchema
);
