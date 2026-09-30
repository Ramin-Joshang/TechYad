import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ICareerApplication extends Document {
  fullName: string;
  mobile: string;
  email: string;
  specialty: string;
  degree: string;
  experience: string;
  jobPositionId?: Types.ObjectId;
  jobTitle?: string;
  resumeUrl?: string;
  demoUrl?: string;
  description?: string;
  adminNotes?: string;
  status: 'pending' | 'reviewed' | 'interview' | 'accepted' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

const careerSchema = new Schema<ICareerApplication>({
  fullName: { type: String, required: true },
  mobile: { type: String, required: true },
  email: { type: String, required: true },
  specialty: { type: String, required: true },
  degree: { type: String, required: true },
  experience: { type: String, required: true },
  jobPositionId: { type: Schema.Types.ObjectId, ref: 'JobPosition' },
  jobTitle: { type: String },
  resumeUrl: { type: String },
  demoUrl: { type: String },
  description: { type: String },
  adminNotes: { type: String },
  status: { 
    type: String, 
    enum: ['pending', 'reviewed', 'interview', 'accepted', 'rejected'], 
    default: 'pending',
    index: true 
  }
}, { timestamps: true });

export const CareerApplication = mongoose.model<ICareerApplication>('CareerApplication', careerSchema);
