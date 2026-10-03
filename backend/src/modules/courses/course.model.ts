import { Schema, Types, model, Document } from "mongoose";

export type CourseStatus =
  | "draft"
  | "pending_review"
  | "published"
  | "rejected"
  | "archived";

export interface ICourse extends Document {
  title: string;
  slug: string;

  shortDescription?: string;
  description?: string;

  thumbnail?: string;

  instructors: Types.ObjectId[];

  categoryId: Types.ObjectId;
  subjectId?: Types.ObjectId;
  fieldId?: Types.ObjectId;
  levelId?: Types.ObjectId;

  price: number;
  discountPrice?: number;
  averageRating: number;
  reviewCount: number;
  studentCount: number;

  totalDuration: number;
  totalLessons: number;

  prerequisites: string[];
  targetAudience: string[];
  features: string[];
  tags: string[];

  status: CourseStatus;
  rejectionReason?: string;
  publishedAt?: Date;
  isRegistrationOpen?: boolean;

  createdBy: Types.ObjectId;
}

const courseSchema = new Schema<ICourse>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    shortDescription: {
      type: String,
      maxlength: 500,
    },
    description: {
      type: String,
    },
    thumbnail: String,
    instructors: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },
    subjectId: {
      type: Schema.Types.ObjectId,
      ref: "Subject",
      index: true,
    },
    fieldId: {
      type: Schema.Types.ObjectId,
      ref: "Field",
      index: true,
    },
    levelId: {
      type: Schema.Types.ObjectId,
      ref: "Level",
      index: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    discountPrice: {
      type: Number,
      min: 0,
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    studentCount: {
      type: Number,
      default: 0,
    },
    totalDuration: {
      type: Number,
      default: 0,
    },
    totalLessons: {
      type: Number,
      default: 0,
    },
    prerequisites: {
      type: [String],
      default: [],
    },
    targetAudience: {
      type: [String],
      default: [],
    },
    features: {
      type: [String],
      default: [],
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    status: {
      type: String,
      enum: [
        "draft",
        "pending_review",
        "published",
        "rejected",
        "archived",
      ],
      default: "draft",
      index: true,
    },
    rejectionReason: String,
    publishedAt: Date,
    isRegistrationOpen: {
      type: Boolean,
      default: true,
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

courseSchema.index({
  title: "text",
  shortDescription: "text",
  description: "text",
  tags: "text",
});

export const Course = model<ICourse>("Course", courseSchema);
