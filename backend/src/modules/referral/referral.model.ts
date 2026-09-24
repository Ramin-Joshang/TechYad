import { Schema, Types, model, Document } from "mongoose";

export interface IReferral extends Document {
  referrerId: Types.ObjectId; // User who shared the code
  refereeId: Types.ObjectId; // Newly registered user
  referralCode: string;
  status: "pending" | "completed" | "rewarded" | "rejected";
  rewardAmount: number; // Reward earned by referrer (Tomans)
  refereeRewardAmount: number; // Welcome bonus/discount received by referee (Tomans)
  orderId?: Types.ObjectId; // Order that triggered completion
  orderAmount?: number;
  commissionPercentage?: number;
  rewardType: "wallet_credit" | "cash_payout" | "discount_coupon";
  notes?: string;
  deviceIp?: string;
  userAgent?: string;
  qualificationDate?: Date;
  rewardSettledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const referralSchema = new Schema<IReferral>(
  {
    referrerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    refereeId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // Each referee can only be referred once
      index: true,
    },
    referralCode: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "rewarded", "rejected"],
      default: "pending",
      index: true,
    },
    rewardAmount: {
      type: Number,
      default: 0,
    },
    refereeRewardAmount: {
      type: Number,
      default: 0,
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
    },
    orderAmount: {
      type: Number,
      default: 0,
    },
    commissionPercentage: {
      type: Number,
      default: 0,
    },
    rewardType: {
      type: String,
      enum: ["wallet_credit", "cash_payout", "discount_coupon"],
      default: "wallet_credit",
    },
    notes: {
      type: String,
    },
    deviceIp: {
      type: String,
    },
    userAgent: {
      type: String,
    },
    qualificationDate: {
      type: Date,
    },
    rewardSettledAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

referralSchema.index({ referrerId: 1, createdAt: -1 });

export const Referral = model<IReferral>("Referral", referralSchema);
