import { Schema, Types, model, Document } from "mongoose";

export interface IApiRequestLog extends Document {
  requestId: string;
  method: string;
  path: string;
  route?: string;
  statusCode: number;
  durationMs: number;
  status: 'success' | 'failure' | 'warning';
  isError: boolean;
  is5xx: boolean;
  userId?: Types.ObjectId;
  userRole?: string;
  userEmail?: string;
  clientIp: string;
  userAgent: string;
  device?: string;
  browser?: string;
  os?: string;
  query?: any;
  body?: any;
  responseSnippet?: string;
  error?: {
    code: string;
    message: string;
    name?: string;
    stack?: string;
    fieldErrors?: Record<string, string>;
    isOperational?: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
}

const apiRequestLogSchema = new Schema<IApiRequestLog>(
  {
    requestId: { type: String, required: true, unique: true, index: true },
    method: { type: String, required: true, uppercase: true, index: true },
    path: { type: String, required: true, index: true },
    route: { type: String, index: true },
    statusCode: { type: Number, required: true, index: true },
    durationMs: { type: Number, required: true },
    status: { type: String, enum: ['success', 'failure', 'warning'], required: true, index: true },
    isError: { type: Boolean, default: false, index: true },
    is5xx: { type: Boolean, default: false, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    userRole: { type: String, index: true },
    userEmail: { type: String, index: true },
    clientIp: { type: String, required: true, index: true },
    userAgent: { type: String, default: '' },
    device: { type: String, default: 'دسکتاپ' },
    browser: { type: String, default: 'مرورگر وب' },
    os: { type: String, default: 'سیستم‌عامل' },
    query: { type: Schema.Types.Mixed },
    body: { type: Schema.Types.Mixed },
    responseSnippet: { type: String },
    error: {
      code: { type: String, index: true },
      message: { type: String },
      name: { type: String },
      stack: { type: String },
      fieldErrors: { type: Schema.Types.Mixed },
      isOperational: { type: Boolean, default: true },
    },
    // Automatic TTL expiration after 60 days
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      index: { expires: 0 },
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for optimal search and dashboard filters
apiRequestLogSchema.index({ createdAt: -1 });
apiRequestLogSchema.index({ isError: 1, createdAt: -1 });
apiRequestLogSchema.index({ is5xx: 1, createdAt: -1 });
apiRequestLogSchema.index({ statusCode: 1, createdAt: -1 });
apiRequestLogSchema.index({ method: 1, path: 1, createdAt: -1 });

export const ApiRequestLog = model<IApiRequestLog>("ApiRequestLog", apiRequestLogSchema);
