import { Schema, Types, model, Document } from "mongoose";

export interface IPayment extends Document {
  orderId?: Types.ObjectId;
  userId: Types.ObjectId;
  amount: number;
  currency: string;
  gateway: string;
  originType: "wallet_topup" | "course_checkout" | "class_checkout" | "order";
  walletTransactionId?: Types.ObjectId;
  authority?: string;
  resNum?: string;
  referenceId?: string;
  refNum?: string;
  rrn?: string;
  traceNo?: string;
  terminalId?: string;
  maskedPan?: string;
  status: "pending" | "paid" | "failed" | "refunded" | "under_review";
  initialStatus?: string;
  callbackState?: string;
  verifyResultCode?: string | number;
  gatewayErrorCode?: string;
  gatewayErrorMessage?: string;
  rawResponse?: Record<string, unknown>;
  returnAt?: Date;
  paidAt?: Date;
  verifiedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      index: true,
      sparse: true,
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
    currency: {
      type: String,
      default: "تومان",
    },
    gateway: {
      type: String,
      required: true,
    },
    originType: {
      type: String,
      enum: ["wallet_topup", "course_checkout", "class_checkout", "order"],
      default: "order",
      index: true,
    },
    walletTransactionId: {
      type: Schema.Types.ObjectId,
      ref: "WalletTransaction",
      index: true,
      sparse: true,
    },
    authority: {
      type: String,
      index: true,
    },
    resNum: {
      type: String,
      index: true,
      sparse: true,
    },
    referenceId: {
      type: String,
      index: true,
    },
    refNum: {
      type: String,
      index: true,
      sparse: true,
    },
    rrn: String,
    traceNo: String,
    terminalId: String,
    maskedPan: String,
    status: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded", "under_review"],
      default: "pending",
      index: true,
    },
    initialStatus: String,
    callbackState: String,
    verifyResultCode: Schema.Types.Mixed,
    gatewayErrorCode: String,
    gatewayErrorMessage: String,
    rawResponse: Schema.Types.Mixed,
    returnAt: Date,
    paidAt: Date,
    verifiedAt: Date,
  },
  {
    timestamps: true,
  }
);

paymentSchema.index({ createdAt: -1 });
paymentSchema.index({ userId: 1, createdAt: -1 });

export const Payment = model<IPayment>("Payment", paymentSchema);
