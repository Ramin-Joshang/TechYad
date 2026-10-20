import { Schema, Types, model, Document } from "mongoose";

export interface IFiscalYear extends Document {
  year: number;
  title: string;
  startDate: Date;
  endDate: Date;
  isClosed: boolean;
  closedAt?: Date;
  closedBy?: Types.ObjectId;
  closeNotes?: string;
  openingEntryId?: Types.ObjectId;
  closingEntryId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const fiscalYearSchema = new Schema<IFiscalYear>(
  {
    year: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    isClosed: {
      type: Boolean,
      default: false,
      index: true,
    },
    closedAt: {
      type: Date,
    },
    closedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    closeNotes: {
      type: String,
      trim: true,
    },
    openingEntryId: {
      type: Schema.Types.ObjectId,
      ref: "JournalEntry",
    },
    closingEntryId: {
      type: Schema.Types.ObjectId,
      ref: "JournalEntry",
    },
  },
  {
    timestamps: true,
  }
);

fiscalYearSchema.index({ isClosed: 1, year: 1 });

export const FiscalYear = model<IFiscalYear>("FiscalYear", fiscalYearSchema);
