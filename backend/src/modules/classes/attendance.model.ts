import { Schema, Types, model, Document } from "mongoose";

export interface IAttendanceRecord {
  userId: Types.ObjectId;
  status: "present" | "absent" | "late" | "excused";
  note?: string;
  markedAt: Date;
}

export interface IAttendance extends Document {
  classId: Types.ObjectId;
  sessionNumber: number;
  sessionTitle?: string;
  sessionDate: Date;
  records: IAttendanceRecord[];
  takenBy: Types.ObjectId;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const attendanceRecordSchema = new Schema<IAttendanceRecord>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["present", "absent", "late", "excused"],
      default: "present",
    },
    note: { type: String, default: "" },
    markedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const attendanceSchema = new Schema<IAttendance>(
  {
    classId: { type: Schema.Types.ObjectId, ref: "Class", required: true, index: true },
    sessionNumber: { type: Number, required: true },
    sessionTitle: { type: String, default: "" },
    sessionDate: { type: Date, default: Date.now },
    records: { type: [attendanceRecordSchema], default: [] },
    takenBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

// One attendance record per session per class
attendanceSchema.index({ classId: 1, sessionNumber: 1 }, { unique: true });

export const Attendance = model<IAttendance>("Attendance", attendanceSchema);
