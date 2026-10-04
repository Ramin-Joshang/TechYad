import { Schema, Types, model, Document } from "mongoose";

export interface IFile extends Document {
  originalName: string;
  filename: string;
  mimeType: string;
  size: number;
  url: string;
  folder?: string;
  path?: string;
  uploadedBy: Types.ObjectId;
}

const fileSchema = new Schema<IFile>(
  {
    originalName: { type: String, required: true },
    filename: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    url: { type: String, required: true },
    folder: { type: String, default: "general" },
    path: { type: String },
    uploadedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export const File = model<IFile>("File", fileSchema);
