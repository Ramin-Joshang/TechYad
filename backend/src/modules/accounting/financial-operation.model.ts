import { Schema, Types, model, Document } from "mongoose";

export type FinancialOperationType =
  | "expense"
  | "revenue"
  | "transfer"
  | "partner_capital"
  | "partner_loan"
  | "partner_loan_repayment"
  | "partner_withdrawal"
  | "partner_dividend";

export type PartyRole =
  | "partner"
  | "instructor"
  | "vendor"
  | "employee"
  | "customer"
  | "bank"
  | "other";

export interface IFinancialParty {
  name: string;
  phone?: string;
  role: PartyRole;
  refUserId?: Types.ObjectId;
}

export interface IFinancialOperation extends Document {
  operationNumber: string;
  type: FinancialOperationType;
  category: string;
  categoryTitle: string;
  amount: number; // In Toman
  date: Date;
  description: string;
  financialAccountId?: Types.ObjectId;
  toFinancialAccountId?: Types.ObjectId; // Used in transfers
  party: IFinancialParty;
  trackingCode?: string;
  attachmentUrl?: string;
  journalEntryId: Types.ObjectId;
  status: "completed" | "cancelled";
  idempotencyKey?: string;
  notes?: string;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const financialPartySchema = new Schema<IFinancialParty>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ["partner", "instructor", "vendor", "employee", "customer", "bank", "other"],
      required: true,
      default: "other",
    },
    refUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
  },
  { _id: false }
);

const financialOperationSchema = new Schema<IFinancialOperation>(
  {
    operationNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        "expense",
        "revenue",
        "transfer",
        "partner_capital",
        "partner_loan",
        "partner_loan_repayment",
        "partner_withdrawal",
        "partner_dividend",
      ],
      required: true,
      index: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    categoryTitle: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 1,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    financialAccountId: {
      type: Schema.Types.ObjectId,
      ref: "FinancialAccount",
      index: true,
    },
    toFinancialAccountId: {
      type: Schema.Types.ObjectId,
      ref: "FinancialAccount",
      index: true,
    },
    party: {
      type: financialPartySchema,
      required: true,
    },
    trackingCode: {
      type: String,
      trim: true,
      index: true,
    },
    attachmentUrl: {
      type: String,
      trim: true,
    },
    journalEntryId: {
      type: Schema.Types.ObjectId,
      ref: "JournalEntry",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["completed", "cancelled"],
      default: "completed",
      index: true,
    },
    idempotencyKey: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    notes: {
      type: String,
      trim: true,
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

financialOperationSchema.index({ type: 1, date: -1 });
financialOperationSchema.index({ category: 1, date: -1 });

export const FinancialOperation = model<IFinancialOperation>(
  "FinancialOperation",
  financialOperationSchema
);
