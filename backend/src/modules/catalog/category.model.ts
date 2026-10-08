import { Schema, Types, model, Document } from "mongoose";

export interface ICategory extends Document {
  name: string;
  slug: string;
  parentId?: Types.ObjectId | null;
  level: number;
  description?: string;
  isActive: boolean;
  sortOrder: number;
  image?: string;
  icon?: string;
  seoTitle?: string;
  seoDescription?: string;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    parentId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      default: null,
      index: true,
    },
    level: {
      type: Number,
      default: 0,
      index: true,
    },
    description: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
      index: true,
    },
    image: {
      type: String,
      default: "",
    },
    icon: {
      type: String,
      default: "",
    },
    seoTitle: {
      type: String,
      default: "",
    },
    seoDescription: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for fast hierarchical queries
categorySchema.index({ parentId: 1, sortOrder: 1, isActive: 1 });
categorySchema.index({ isActive: 1, sortOrder: 1 });

export const Category = model<ICategory>("Category", categorySchema);
