import { Schema, Types, model, Document } from "mongoose";

export interface IInstructorProfile extends Document {
  userId: Types.ObjectId;
  title: string;
  bio: string;
  avatar?: string;
  specialties: string[];
  education: {
    degree: string;
    field: string;
    university: string;
    startYear?: number;
    endYear?: number;
  }[];
  experience?: {
    position: string;
    company: string;
    startYear?: number;
    endYear?: number;
    current?: boolean;
    description?: string;
  }[];
  socialLinks: {
    linkedin?: string;
    website?: string;
    instagram?: string;
  };
  isApproved: boolean;
  rating?: number;
  totalStudents?: number;
  coursesCount?: number;
  classesCount?: number;
}

const instructorProfileSchema = new Schema<IInstructorProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    title: { type: String, required: true },
    bio: { type: String, required: true },
    avatar: String,
    specialties: [{ type: String }],
    education: [
      {
        degree: String,
        field: String,
        university: String,
        startYear: Number,
        endYear: Number,
      }
    ],
    experience: [
      {
        position: String,
        company: String,
        startYear: Number,
        endYear: Number,
        current: Boolean,
        description: String,
      }
    ],
    socialLinks: {
      linkedin: String,
      website: String,
      instagram: String,
    },
    isApproved: { type: Boolean, default: false },
    rating: { type: Number, default: 0 },
    totalStudents: { type: Number, default: 0 },
    coursesCount: { type: Number, default: 0 },
    classesCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const InstructorProfile = model<IInstructorProfile>("InstructorProfile", instructorProfileSchema);
