import { Schema, Types, model, Document } from "mongoose";

interface IQuestionOption {
  _id: Types.ObjectId;
  text: string;
  isCorrect: boolean;
}

interface IQuestion {
  _id: Types.ObjectId;
  type: "single_choice" | "multiple_choice" | "true_false";
  text: string;
  score: number;
  options: IQuestionOption[];
  order: number;
}

export interface IQuiz extends Document {
  courseId?: Types.ObjectId;
  classId?: Types.ObjectId;
  lessonId?: Types.ObjectId;
  title: string;
  description?: string;
  duration?: number;
  passingScore?: number;
  questions: IQuestion[];
  isPublished: boolean;
}

const quizSchema = new Schema<IQuiz>(
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
    description: String,
    duration: Number,
    passingScore: Number,
    questions: [
      {
        _id: { type: Schema.Types.ObjectId, auto: true },
        type: {
          type: String,
          enum: ["single_choice", "multiple_choice", "true_false"],
          required: true,
        },
        text: { type: String, required: true },
        score: { type: Number, default: 1 },
        options: [
          {
            _id: { type: Schema.Types.ObjectId, auto: true },
            text: { type: String, required: true },
            isCorrect: { type: Boolean, required: true },
          },
        ],
        order: { type: Number, required: true },
      },
    ],
    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Quiz = model<IQuiz>("Quiz", quizSchema);
