import { Schema, Types, model, Document } from "mongoose";

export interface IPayment extends Document {
  orderId: Types.ObjectId;
  userId: Types.ObjectId;
  amount: number;
  gateway: string;
  authority?: string;
  referenceId?: string;
  status: "pending" | "paid" | "failed" | "refunded";
  rawResponse?: Record<string, unknown>;
  paidAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    gateway: {
      type: String,
      required: true,
    },
    authority: {
      type: String,
      index: true,
    },
    referenceId: {
      type: String,
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
      index: true,
    },
    rawResponse: Schema.Types.Mixed,
    paidAt: Date,
  },
  {
    timestamps: true,
  }
);

export const Payment = model<IPayment>("Payment", paymentSchema);
