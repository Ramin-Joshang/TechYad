import { Schema, model, Document } from "mongoose";

export interface IReferralSetting extends Document {
  isActive: boolean;
  rewardMode: "percentage" | "fixed";
  defaultCommissionPercent: number; // e.g. 15%
  fixedRewardAmount: number; // e.g. 50,000 Tomans
  refereeDiscountPercent: number; // e.g. 10%
  refereeWelcomeCredit: number; // e.g. 20,000 Tomans
  instructorCommissionPercent: number; // e.g. 20%
  minWithdrawalAmount: number; // e.g. 100,000 Tomans
  qualificationCondition: "first_purchase" | "any_purchase" | "registration_only";
  autoCreditWallet: boolean;
  termsAndConditions?: string;
  createdAt: Date;
  updatedAt: Date;
}

const referralSettingSchema = new Schema<IReferralSetting>(
  {
    isActive: { type: Boolean, default: true },
    rewardMode: { type: String, enum: ["percentage", "fixed"], default: "percentage" },
    defaultCommissionPercent: { type: Number, default: 15 },
    fixedRewardAmount: { type: Number, default: 50000 },
    refereeDiscountPercent: { type: Number, default: 10 },
    refereeWelcomeCredit: { type: Number, default: 20000 },
    instructorCommissionPercent: { type: Number, default: 20 },
    minWithdrawalAmount: { type: Number, default: 100000 },
    qualificationCondition: {
      type: String,
      enum: ["first_purchase", "any_purchase", "registration_only"],
      default: "first_purchase",
    },
    autoCreditWallet: { type: Boolean, default: true },
    termsAndConditions: {
      type: String,
      default: "پاداش معرفی پس از انجام اولین خرید موفق کاربر دعوت‌شده به کیف پول واریز خواهد شد.",
    },
  },
  {
    timestamps: true,
  }
);

export const ReferralSetting = model<IReferralSetting>("ReferralSetting", referralSettingSchema);
