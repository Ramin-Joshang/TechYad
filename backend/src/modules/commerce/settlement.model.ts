import { Schema, Types, model, Document } from "mongoose";

export interface ISettlement extends Document {
  instructorId: Types.ObjectId;
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  shabaNumber: string;
  accountHolderName: string;
  bankName?: string;
  trackingCode?: string;
  requestedAt: Date;
  processedAt?: Date;
  processedBy?: Types.ObjectId;
  rejectionReason?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const settlementSchema = new Schema<ISettlement>(
  {
    instructorId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    amount: { type: Number, required: true, min: 1000 },
    status: { 
      type: String, 
      enum: ['pending', 'processing', 'completed', 'rejected'], 
      default: 'pending',
      index: true
    },
    shabaNumber: { type: String, required: true },
    accountHolderName: { type: String, required: true },
    bankName: { type: String },
    trackingCode: { type: String },
    requestedAt: { type: Date, default: Date.now },
    processedAt: { type: Date },
    processedBy: { type: Schema.Types.ObjectId, ref: "User" },
    rejectionReason: { type: String },
    notes: { type: String }
  },
  { timestamps: true }
);

settlementSchema.index({ createdAt: -1 });

export const Settlement = model<ISettlement>("Settlement", settlementSchema);
