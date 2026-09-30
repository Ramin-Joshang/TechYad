import { Schema, Types, model, Document } from "mongoose";

export interface IClassEnrollment extends Document {
  userId: Types.ObjectId;
  classId: Types.ObjectId;
  orderId?: Types.ObjectId;
  status: "active" | "cancelled" | "completed";
  amount: number;
  enrolledAt: Date;

  // Pre-registration / Deposit
  paymentType: "full" | "deposit";
  depositAmount: number;
  remainingBalance: number;
  remainingPaid: boolean;
  remainingPaidAt?: Date;
  dueNotificationSent?: boolean;

  // Attendance stats cache
  attendedSessionsCount: number;

  // Gradebook & Evaluation
  finalGrade?: number;
  evaluationNote?: string;
}

const classEnrollmentSchema = new Schema<IClassEnrollment>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    classId: { type: Schema.Types.ObjectId, ref: "Class", required: true },
    orderId: { type: Schema.Types.ObjectId, ref: "Order" },
    status: { type: String, enum: ["active", "cancelled", "completed"], default: "active" },
    amount: { type: Number, required: true, default: 0 },
    enrolledAt: { type: Date, default: Date.now },

    // Pre-registration fields
    paymentType: { type: String, enum: ["full", "deposit"], default: "full" },
    depositAmount: { type: Number, default: 0 },
    remainingBalance: { type: Number, default: 0 },
    remainingPaid: { type: Boolean, default: true },
    remainingPaidAt: Date,
    dueNotificationSent: { type: Boolean, default: false },

    // Attendance stats
    attendedSessionsCount: { type: Number, default: 0 },

    // Gradebook & Evaluation
    finalGrade: { type: Number, min: 0, max: 100 },
    evaluationNote: { type: String, default: "" },
  },
  { timestamps: true }
);

// Prevent double enrollment
classEnrollmentSchema.index({ userId: 1, classId: 1 }, { unique: true });

export const ClassEnrollment = model<IClassEnrollment>("ClassEnrollment", classEnrollmentSchema);
