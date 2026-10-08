import { Schema, Types, model, Document } from "mongoose";

export interface ISessionSyllabus {
  sessionNumber: number;
  title: string;
  description?: string;
  date?: string;
  time?: string;
  durationMinutes?: number;
  meetingLink?: string;
  recordingUrl?: string;
  isHeld?: boolean;
}

export interface IClass extends Document {
  title: string;
  slug: string;
  description: string;
  shortDescription?: string;
  type: "public" | "private";
  mode: "online" | "in_person";
  instructors: Types.ObjectId[];
  categoryId?: Types.ObjectId;
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
  registrationOpen?: boolean;
  status: "draft" | "pending_approval" | "published" | "completed" | "cancelled";
  createdBy: Types.ObjectId;
}

export function getClassPhase(cls: { status: string; startDate: Date | string; endDate?: Date | string }): 'pending_approval' | 'registration' | 'started' | 'completed' | 'cancelled' | 'draft' {
  if (cls.status === 'cancelled') return 'cancelled';
  if (cls.status === 'completed') return 'completed';
  if (cls.status === 'draft') return 'draft';
  if (cls.status === 'pending_approval') return 'pending_approval';
  
  const now = new Date();
  const start = new Date(cls.startDate);
  const end = cls.endDate ? new Date(cls.endDate) : null;
  
  if (end && now > end) return 'completed';
  if (now >= start) return 'started';
  return 'registration';
}

export function isClassRegistrationOpen(cls: { status: string; startDate: Date | string; registrationOpen?: boolean }): boolean {
  if (cls.status !== 'published') return false;
  const now = new Date();
  const hasStarted = now >= new Date(cls.startDate);
  // If explicitly set by admin:
  if (cls.registrationOpen === true) return true;
  if (cls.registrationOpen === false) return false;
  // If default (undefined / not explicitly set): open before start, closed after start
  return !hasStarted;
}

const sessionSyllabusSchema = new Schema<ISessionSyllabus>(
  {
    sessionNumber: { type: Number, required: true },
    title: { type: String, required: true },
    description: String,
    date: String,
    time: String,
    durationMinutes: { type: Number, default: 90 },
    meetingLink: String,
    recordingUrl: String,
    isHeld: { type: Boolean, default: false },
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
    categoryId: { type: Schema.Types.ObjectId, ref: "Category", index: true },
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
    registrationOpen: { type: Boolean, default: null },
    status: { type: String, enum: ["draft", "pending_approval", "published", "completed", "cancelled"], default: "pending_approval" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export const Class = model<IClass>("Class", classSchema);
