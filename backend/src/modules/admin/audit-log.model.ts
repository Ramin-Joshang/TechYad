import { Schema, Types, model, Document } from "mongoose";

export interface IAuditLog extends Document {
  userId?: Types.ObjectId;
  userEmail?: string;
  userName?: string;
  action: string;
  category: 'auth' | 'course' | 'user' | 'order' | 'settings' | 'security' | 'settlement' | 'notification' | 'system';
  targetId?: string;
  targetType?: string;
  details?: any;
  ip?: string;
  userAgent?: string;
  device?: string;
  browser?: string;
  os?: string;
  status: 'success' | 'failure' | 'warning';
  createdAt: Date;
  updatedAt: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    userEmail: { type: String, index: true },
    userName: { type: String },
    action: { type: String, required: true, index: true },
    category: { 
      type: String, 
      enum: ['auth', 'course', 'user', 'order', 'settings', 'security', 'settlement', 'notification', 'system'], 
      default: 'system',
      index: true
    },
    targetId: { type: String, index: true },
    targetType: { type: String },
    details: { type: Schema.Types.Mixed },
    ip: { type: String },
    userAgent: { type: String },
    device: { type: String },
    browser: { type: String },
    os: { type: String },
    status: { type: String, enum: ['success', 'failure', 'warning'], default: 'success' },
  },
  { timestamps: true }
);

auditLogSchema.index({ createdAt: -1 });

export const AuditLog = model<IAuditLog>("AuditLog", auditLogSchema);
