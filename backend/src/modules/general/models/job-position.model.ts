import mongoose, { Document, Schema } from 'mongoose';

export interface IJobPosition extends Document {
  title: string;
  type: string; // 'آنلاین / پاره‌وقت', 'حضوری / تمام‌وقت', etc.
  department: string; // 'آموزش', 'فنی', 'محتوا', etc.
  location?: string;
  description?: string;
  requirements?: string[];
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const jobPositionSchema = new Schema<IJobPosition>({
  title: { type: String, required: true },
  type: { type: String, required: true },
  department: { type: String, default: 'آموزش' },
  location: { type: String, default: 'تهران / دورکاری' },
  description: { type: String },
  requirements: [{ type: String }],
  isActive: { type: Boolean, default: true, index: true },
  order: { type: Number, default: 0, index: true }
}, { timestamps: true });

export const JobPosition = mongoose.model<IJobPosition>('JobPosition', jobPositionSchema);
