import { Schema, Types, model, Document } from "mongoose";

export interface IBlogCategory extends Document {
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  order: number;
}

const blogCategorySchema = new Schema<IBlogCategory>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: String,
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export const BlogCategory = model<IBlogCategory>("BlogCategory", blogCategorySchema);
