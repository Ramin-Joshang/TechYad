import { Schema, Types, model, Document } from "mongoose";

export type CommentStatus = 'pending' | 'approved' | 'rejected';

export interface IComment extends Document {
  userId: Types.ObjectId;
  courseId?: Types.ObjectId;
  classId?: Types.ObjectId;
  content: string;
  parentId?: Types.ObjectId;
  status: CommentStatus;
  isTeacherReply: boolean;
  rating?: number;
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<IComment>(
  {
    userId: { 
      type: Schema.Types.ObjectId, 
      ref: "User", 
      required: true, 
      index: true 
    },
    courseId: { 
      type: Schema.Types.ObjectId, 
      ref: "Course", 
      index: true 
    },
    classId: { 
      type: Schema.Types.ObjectId, 
      ref: "Class", 
      index: true 
    },
    content: { 
      type: String, 
      required: true, 
      trim: true, 
      maxlength: 2500 
    },
    parentId: { 
      type: Schema.Types.ObjectId, 
      ref: "Comment", 
      index: true 
    },
    status: { 
      type: String, 
      enum: ['pending', 'approved', 'rejected'], 
      default: 'pending',
      index: true 
    },
    isTeacherReply: { 
      type: Boolean, 
      default: false 
    },
    rating: { 
      type: Number, 
      min: 1, 
      max: 5 
    },
  },
  { timestamps: true }
);

commentSchema.index({ courseId: 1, status: 1, createdAt: -1 });
commentSchema.index({ classId: 1, status: 1, createdAt: -1 });
commentSchema.index({ parentId: 1, status: 1, createdAt: 1 });

export const Comment = model<IComment>("Comment", commentSchema);
