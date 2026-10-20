import { Schema, Types, model, Document } from "mongoose";

export type AccountType = "asset" | "liability" | "equity" | "revenue" | "expense";
export type AccountNature = "debit" | "credit";
export type AccountLevel = "group" | "general" | "subsidiary" | "detail";

export interface IAccount extends Document {
  code: string;
  title: string;
  type: AccountType;
  nature: AccountNature;
  level: AccountLevel;
  parentId?: Types.ObjectId;
  description?: string;
  isSystem: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const accountSchema = new Schema<IAccount>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["asset", "liability", "equity", "revenue", "expense"],
      required: true,
      index: true,
    },
    nature: {
      type: String,
      enum: ["debit", "credit"],
      required: true,
    },
    level: {
      type: String,
      enum: ["group", "general", "subsidiary", "detail"],
      required: true,
      default: "subsidiary",
    },
    parentId: {
      type: Schema.Types.ObjectId,
      ref: "Account",
      default: null,
      index: true,
    },
    description: {
      type: String,
      trim: true,
    },
    isSystem: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

accountSchema.index({ type: 1, code: 1 });
accountSchema.index({ level: 1 });

export const Account = model<IAccount>("Account", accountSchema);
