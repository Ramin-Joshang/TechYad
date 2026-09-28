import { Schema, Types, model, Document } from "mongoose";

export interface ISessionSyllabus {
  sessionNumber: number;
  title: string;
  description?: string;
  date?: string;
  time?: string;
  durationMinutes?: number;
}

export interface IClass extends Document {
  title: string;
  slug: string;
  description: string;
  shortDescription?: string;
  type: "public" | "private";
  mode: "online" | "in_person";
  instructors: Types.ObjectId[];
  subject?: Types.ObjectId;
  price: number;
  discountPrice?: number;
  capacity: number;
  startDate: Date;
  endDate: Date;
  enrolledCount?: number;
  rating?: number;
  sessions?: number;
  totalHours?: number;
  thumbnail?: string;

  // Calendar & Schedule
  scheduleDays?: string[];
  scheduleTime?: string;

  // Venue / In-Person
  location?: string;
  address?: string;
  city?: string;
  venueDetails?: string;

  // Online
  meetingPlatform?: string;
  meetingLink?: string;

  // Pre-registration / Deposit
  allowPreRegistration: boolean;
  preRegistrationDeposit: number;
  remainingPaymentDueAfterSession: number;

  // Syllabus
  syllabus: ISessionSyllabus[];

  // Audience & Prerequisites
  targetAudience?: string[];
  prerequisites?: string[];
  sessionDuration?: number;

  allowEnrollmentAfterStart?: boolean;
  status: "draft" | "published" | "completed" | "cancelled";
  createdBy: Types.ObjectId;
}

const sessionSyllabusSchema = new Schema<ISessionSyllabus>(
  {
    sessionNumber: { type: Number, required: true },
    title: { type: String, required: true },
    description: String,
    date: String,
    time: String,
    durationMinutes: { type: Number, default: 90 },
  },
  { _id: false }
);

const classSchema = new Schema<IClass>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    shortDescription: String,
    type: { type: String, enum: ["public", "private"], default: "public" },
    mode: { type: String, enum: ["online", "in_person"], required: true },
    instructors: [{ type: Schema.Types.ObjectId, ref: "User" }],
    subject: { type: Schema.Types.ObjectId, ref: "Subject" },
    price: { type: Number, required: true },
    discountPrice: Number,
    capacity: { type: Number, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    enrolledCount: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    sessions: { type: Number, default: 0 },
    totalHours: { type: Number, default: 0 },
    thumbnail: { type: String },

    // Calendar
    scheduleDays: { type: [String], default: [] },
    scheduleTime: { type: String, default: "" },

    // Physical venue
    location: String,
    address: String,
    city: { type: String, default: "تهران" },
    venueDetails: String,

    // Online
    meetingPlatform: { type: String, default: "اسکای‌روم (Skyroom)" },
    meetingLink: String,

    // Pre-registration
    allowPreRegistration: { type: Boolean, default: false },
    preRegistrationDeposit: { type: Number, default: 0 },
    remainingPaymentDueAfterSession: { type: Number, default: 2 },

    // Syllabus
    syllabus: { type: [sessionSyllabusSchema], default: [] },

    // Audience & Prerequisites
    targetAudience: { type: [String], default: [] },
    prerequisites: { type: [String], default: [] },
    sessionDuration: { type: Number, default: 90 },

    allowEnrollmentAfterStart: { type: Boolean, default: true },
    status: { type: String, enum: ["draft", "published", "completed", "cancelled"], default: "draft" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export const Class = model<IClass>("Class", classSchema);
