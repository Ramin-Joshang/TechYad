import { Schema, Types, model, Document } from "mongoose";

export interface IArticle extends Document {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  thumbnail?: string;
  authorId: Types.ObjectId;
  categoryId?: Types.ObjectId;
  tags: string[];
  status: "draft" | "pending_review" | "published" | "rejected";
  rejectionReason?: string;
  publishedAt?: Date;
  viewsCount?: number;
}

const articleSchema = new Schema<IArticle>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    excerpt: { type: String, required: true },
    content: { type: String, required: true },
    thumbnail: String,
    authorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    categoryId: { type: Schema.Types.ObjectId, ref: "BlogCategory" },
    tags: [{ type: String }],
    status: { 
      type: String, 
      enum: ["draft", "pending_review", "published", "rejected"], 
      default: "draft" 
    },
    rejectionReason: String,
    publishedAt: Date,
    viewsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Article = model<IArticle>("Article", articleSchema);
