import { Schema, Types, model, Document } from "mongoose";

export interface IClass extends Document {
  title: string;
  slug: string;
  description: string;
  type: "public" | "private";
  mode: "online" | "in_person";
  instructors: Types.ObjectId[];
  subject?: Types.ObjectId;
  price: number;
  capacity: number;
  startDate: Date;
  endDate: Date;
  enrolledCount?: number;
  rating?: number;
  sessions?: number;
  thumbnail?: string;
  location?: string;
  meetingLink?: string;
  allowEnrollmentAfterStart?: boolean;
  status: "draft" | "published" | "completed" | "cancelled";
  createdBy: Types.ObjectId;
}

const classSchema = new Schema<IClass>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    type: { type: String, enum: ["public", "private"], default: "public" },
    mode: { type: String, enum: ["online", "in_person"], required: true },
    instructors: [{ type: Schema.Types.ObjectId, ref: "User" }],
    subject: { type: Schema.Types.ObjectId, ref: "Subject" },
    price: { type: Number, required: true },
    capacity: { type: Number, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    enrolledCount: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    sessions: { type: Number, default: 0 },
    thumbnail: { type: String },
    location: String,
    meetingLink: String,
    allowEnrollmentAfterStart: { type: Boolean, default: true },
    status: { type: String, enum: ["draft", "published", "completed", "cancelled"], default: "draft" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export const Class = model<IClass>("Class", classSchema);
