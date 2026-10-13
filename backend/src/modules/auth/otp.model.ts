import { Schema, model, Document } from "mongoose";

export interface IOtp extends Document {
  mobile: string;
  code: string;
  purpose: string;
  expiresAt: Date;
}

const otpSchema = new Schema<IOtp>({
  mobile: { type: String, required: true, index: true },
  code: { type: String, required: true },
  purpose: { type: String, default: 'login' },
  expiresAt: { type: Date, required: true, index: { expires: 0 } }
}, { timestamps: true });

export const Otp = model<IOtp>("Otp", otpSchema);
