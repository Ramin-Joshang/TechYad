import { Schema, model, Document } from "mongoose";

export interface ITestimonial extends Document {
  studentName: string;
  courseName: string;
  avatar: string;
  content: string;
  rating: number;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const testimonialSchema = new Schema<ITestimonial>(
  {
    studentName: { type: String, required: true },
    courseName: { type: String, required: true },
    avatar: { type: String },
    content: { type: String, required: true },
    rating: { type: Number, default: 5 },
    isActive: { type: Boolean, default: true, index: true },
    order: { type: Number, default: 0, index: true },
  },
  { timestamps: true }
);

export const Testimonial = model<ITestimonial>("Testimonial", testimonialSchema);
