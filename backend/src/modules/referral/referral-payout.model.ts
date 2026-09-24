import { Schema, Types, model, Document } from "mongoose";

export interface IReferralPayout extends Document {
  userId: Types.ObjectId;
  amount: number;
  status: "pending" | "approved" | "paid" | "rejected";
  method: "bank_transfer" | "wallet_credit";
  bankInfo?: {
    shaba?: string;
    cardNumber?: string;
    bankName?: string;
    accountHolder?: string;
  };
  adminNote?: string;
  transactionReference?: string;
  requestedAt: Date;
  processedAt?: Date;
  processedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const referralPayoutSchema = new Schema<IReferralPayout>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 1000,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "paid", "rejected"],
      default: "pending",
      index: true,
    },
    method: {
      type: String,
      enum: ["bank_transfer", "wallet_credit"],
      default: "bank_transfer",
    },
    bankInfo: {
      shaba: { type: String, trim: true },
      cardNumber: { type: String, trim: true },
      bankName: { type: String, trim: true },
      accountHolder: { type: String, trim: true },
    },
    adminNote: {
      type: String,
    },
    transactionReference: {
      type: String,
      trim: true,
    },
    requestedAt: {
      type: Date,
      default: Date.now,
    },
    processedAt: {
      type: Date,
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

referralPayoutSchema.index({ userId: 1, createdAt: -1 });

export const ReferralPayout = model<IReferralPayout>("ReferralPayout", referralPayoutSchema);
