import { Schema, Types, model, Document } from "mongoose";

export type JournalEntryStatus = "draft" | "posted" | "reversed";

export type JournalEntrySourceType =
  | "order"
  | "wallet_topup"
  | "settlement"
  | "expense"
  | "manual"
  | "refund"
  | "gateway_reconciliation"
  | "opening"
  | "other";

export interface IJournalEntryLine {
  _id?: Types.ObjectId;
  accountId: Types.ObjectId;
  accountCode: string;
  accountTitle: string;
  description: string;
  debit: number;
  credit: number;
  entityType?: "user" | "instructor" | "course" | "class" | "bank";
  entityId?: Types.ObjectId;
}

export interface IJournalEntry extends Document {
  entryNumber: number;
  date: Date;
  fiscalYear: number;
  description: string;
  status: JournalEntryStatus;
  sourceType: JournalEntrySourceType;
  sourceId?: string;
  idempotencyKey?: string;
  lines: IJournalEntryLine[];
  totalDebit: number;
  totalCredit: number;
  createdBy: Types.ObjectId;
  postedBy?: Types.ObjectId;
  postedAt?: Date;
  reversedBy?: Types.ObjectId;
  reversedAt?: Date;
  reversalOf?: Types.ObjectId;
  reversedInEntry?: Types.ObjectId;
  reversalReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const journalEntryLineSchema = new Schema<IJournalEntryLine>(
  {
    accountId: {
      type: Schema.Types.ObjectId,
      ref: "Account",
      required: true,
      index: true,
    },
    accountCode: {
      type: String,
      required: true,
      trim: true,
    },
    accountTitle: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    debit: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    credit: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    entityType: {
      type: String,
      enum: ["user", "instructor", "course", "class", "bank"],
    },
    entityId: {
      type: Schema.Types.ObjectId,
      index: true,
    },
  },
  { _id: true }
);

const journalEntrySchema = new Schema<IJournalEntry>(
  {
    entryNumber: {
      type: Number,
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
    fiscalYear: {
      type: Number,
      required: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["draft", "posted", "reversed"],
      default: "draft",
      index: true,
    },
    sourceType: {
      type: String,
      enum: [
        "order",
        "wallet_topup",
        "settlement",
        "expense",
        "manual",
        "refund",
        "gateway_reconciliation",
        "opening",
        "other",
      ],
      default: "manual",
      index: true,
    },
    sourceId: {
      type: String,
      index: true,
      sparse: true,
    },
    idempotencyKey: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    lines: {
      type: [journalEntryLineSchema],
      required: true,
      validate: {
        validator: function (v: IJournalEntryLine[]) {
          return Array.isArray(v) && v.length >= 2;
        },
        message: "هر سند حسابداری باید حداقل شامل دو ردیف (یک بدهکار و یک بستانکار) باشد.",
      },
    },
    totalDebit: {
      type: Number,
      required: true,
      min: 0,
    },
    totalCredit: {
      type: Number,
      required: true,
      min: 0,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    postedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    postedAt: Date,
    reversedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    reversedAt: Date,
    reversalOf: {
      type: Schema.Types.ObjectId,
      ref: "JournalEntry",
      index: true,
    },
    reversedInEntry: {
      type: Schema.Types.ObjectId,
      ref: "JournalEntry",
    },
    reversalReason: String,
  },
  {
    timestamps: true,
  }
);

// Compound indexes
journalEntrySchema.index({ fiscalYear: 1, entryNumber: 1 }, { unique: true });
journalEntrySchema.index({ sourceType: 1, sourceId: 1 });
journalEntrySchema.index({ date: -1 });

export const JournalEntry = model<IJournalEntry>("JournalEntry", journalEntrySchema);
