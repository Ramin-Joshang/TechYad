import { Schema, Types, model, Document } from "mongoose";

export type EnrollmentStatus = "active" | "completed" | "cancelled";
export type EnrollmentSource = "purchase" | "free" | "admin" | "gift";

export interface IEnrollment extends Document {
  userId: Types.ObjectId;
  courseId: Types.ObjectId;
  orderId?: Types.ObjectId;
  source: EnrollmentSource;
  status: EnrollmentStatus;
  amount: number;
  enrolledAt: Date;
  completedAt?: Date;

  // Instructor share & settlement tracking
  instructorId?: Types.ObjectId;
  instructorSharePercent?: number;
  platformSharePercent?: number;
  instructorEarnings?: number;
  platformEarnings?: number;
  revenueSettlementStatus?: "pending_completion" | "eligible" | "withdrawn" | "refunded";
  revenueEligibleAt?: Date;
  
  // Progress tracking
  progress: number;
  completedLessons: number;
  lastLessonId?: Types.ObjectId;
  lastAccessedAt?: Date;
}

const enrollmentSchema = new Schema<IEnrollment>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
    },
    source: {
      type: String,
      enum: ["purchase", "free", "admin", "gift"],
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "completed", "cancelled"],
      default: "active",
    },
    amount: {
      type: Number,
      default: 0,
    },
    instructorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    instructorSharePercent: Number,
    platformSharePercent: Number,
    instructorEarnings: Number,
    platformEarnings: Number,
    revenueSettlementStatus: {
      type: String,
      enum: ["pending_completion", "eligible", "withdrawn", "refunded"],
      default: "eligible",
    },
    revenueEligibleAt: Date,
    enrolledAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: Date,
    
    // Progress tracking
    progress: { type: Number, default: 0 },
    completedLessons: { type: Number, default: 0 },
    lastLessonId: { type: Schema.Types.ObjectId, ref: "Lesson" },
    lastAccessedAt: Date
  },
  { timestamps: true }
);

enrollmentSchema.index({ userId: 1, courseId: 1 }, { unique: true });

export const Enrollment = model<IEnrollment>("Enrollment", enrollmentSchema);
