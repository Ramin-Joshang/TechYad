import { Schema, Types, model, Document } from "mongoose";

export type FinancialAccountType = "bank" | "cash_register" | "card" | "gateway_clearing" | "other";

export interface IFinancialAccount extends Document {
  title: string;
  accountType: FinancialAccountType;
  bankName?: string;
  accountNumber?: string;
  cardLast4?: string; // Only last 4 digits stored for security and PCI compliance
  shebaNumber?: string;
  branchName?: string;
  accountHolder?: string;
  coaAccountId: Types.ObjectId;
  coaAccountCode: string;
  openingBalance: number;
  openingDate: Date;
  description?: string;
  isActive: boolean;
  isDefault: boolean;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const financialAccountSchema = new Schema<IFinancialAccount>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    accountType: {
      type: String,
      enum: ["bank", "cash_register", "card", "gateway_clearing", "other"],
      required: true,
      default: "bank",
      index: true,
    },
    bankName: {
      type: String,
      trim: true,
    },
    accountNumber: {
      type: String,
      trim: true,
    },
    cardLast4: {
      type: String,
      trim: true,
      maxlength: 4,
    },
    shebaNumber: {
      type: String,
      trim: true,
    },
    branchName: {
      type: String,
      trim: true,
    },
    accountHolder: {
      type: String,
      trim: true,
    },
    coaAccountId: {
      type: Schema.Types.ObjectId,
      ref: "Account",
      required: true,
      index: true,
    },
    coaAccountCode: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    openingBalance: {
      type: Number,
      required: true,
      default: 0,
    },
    openingDate: {
      type: Date,
      default: Date.now,
    },
    description: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

financialAccountSchema.index({ accountType: 1, isActive: 1 });

export const FinancialAccount = model<IFinancialAccount>("FinancialAccount", financialAccountSchema);
