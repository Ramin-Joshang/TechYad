import { Schema, Types, model, Document } from "mongoose";

export interface IAuditLog extends Document {
  userId?: Types.ObjectId;
  userEmail?: string;
  userPhone?: string;
  userName?: string;
  userRole?: 'student' | 'instructor' | 'admin' | 'super-admin' | 'guest';
  action: string;
  title?: string;
  category: 'auth' | 'course' | 'class' | 'assignment' | 'quiz' | 'wallet' | 'order' | 'referral' | 'support' | 'security' | 'profile' | 'settings' | 'settlement' | 'notification' | 'system' | 'sms' | 'payment' | 'user';
  targetId?: string;
  targetType?: string;
  targetTitle?: string;
  targetResource?: string;
  details?: any;
  ip?: string;
  userAgent?: string;
  device?: string;
  browser?: string;
  os?: string;
  deviceDetails?: {
    deviceType?: string;
    brand?: string;
    model?: string;
    osName?: string;
    osVersion?: string;
    browserName?: string;
    browserVersion?: string;
    engine?: string;
    cpuArch?: string;
    platform?: string;
    screenResolution?: string;
    language?: string;
    location?: string;
    clientIp?: string;
    forwardedFor?: string;
    protocol?: string;
    isMobile?: boolean;
    isTablet?: boolean;
    isDesktop?: boolean;
    isBot?: boolean;
  };
  status: 'success' | 'failure' | 'warning';
  severity?: 'info' | 'warning' | 'critical';
  createdAt: Date;
  updatedAt: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    userEmail: { type: String, index: true },
    userPhone: { type: String, index: true },
    userName: { type: String },
    userRole: { 
      type: String, 
      enum: ['student', 'instructor', 'admin', 'super-admin', 'guest'],
      index: true 
    },
    action: { type: String, required: true, index: true },
    title: { type: String },
    category: { 
      type: String, 
      enum: [
        'auth', 'course', 'class', 'assignment', 'quiz', 
        'wallet', 'order', 'referral', 'support', 'security', 
        'profile', 'settings', 'settlement', 'notification', 
        'system', 'sms', 'payment', 'user'
      ], 
      default: 'system',
      index: true
    },
    targetId: { type: String, index: true },
    targetType: { type: String },
    targetTitle: { type: String },
    targetResource: { type: String },
    details: { type: Schema.Types.Mixed },
    ip: { type: String },
    userAgent: { type: String },
    device: { type: String },
    browser: { type: String },
    os: { type: String },
    deviceDetails: { type: Schema.Types.Mixed },
    status: { type: String, enum: ['success', 'failure', 'warning'], default: 'success', index: true },
    severity: { type: String, enum: ['info', 'warning', 'critical'], default: 'info', index: true },
  },
  { timestamps: true }
);

auditLogSchema.index({ createdAt: -1 });

export const AuditLog = model<IAuditLog>("AuditLog", auditLogSchema);
