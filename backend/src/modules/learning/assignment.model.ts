import { Schema, Types, model, Document } from "mongoose";

export type AssignmentType = "file_upload" | "text_answer" | "mixed";

export interface IAssignment extends Document {
  courseId?: Types.ObjectId;
  classId?: Types.ObjectId;
  lessonId?: Types.ObjectId;
  title: string;
  description: string;
  type: AssignmentType;
  maxScore: number;
  deadline?: Date;
  attachments: Types.ObjectId[];
  isPublished: boolean;
}

const assignmentSchema = new Schema<IAssignment>(
  {
    courseId: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      index: true,
    },
    classId: {
      type: Schema.Types.ObjectId,
      ref: "Class",
      index: true,
    },
    lessonId: {
      type: Schema.Types.ObjectId,
      ref: "Lesson",
      index: true,
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    type: {
      type: String,
      enum: ["file_upload", "text_answer", "mixed"],
      required: true,
    },
    maxScore: { type: Number, default: 100, min: 0 },
    deadline: Date,
    attachments: [{ type: Schema.Types.ObjectId, ref: "File" }],
    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Assignment = model<IAssignment>("Assignment", assignmentSchema);
