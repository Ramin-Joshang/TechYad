import { Schema, model, Document } from "mongoose";

export interface ISetting extends Document {
  key: string;
  value: any;
  group: string;
}

const settingSchema = new Schema<ISetting>(
  {
    key: { type: String, required: true, unique: true },
    value: { type: Schema.Types.Mixed, required: true },
    group: { type: String, default: 'general' }
  },
  { timestamps: true }
);

export const Setting = model<ISetting>("Setting", settingSchema);
