import { Schema, Types, model, Document } from "mongoose";

export type UserStatus =
  | "active"
  | "pending"
  | "blocked";

export interface IUser extends Document {
  role: Types.ObjectId;

  firstName: string;
  lastName: string;

  email: string;
  mobile?: string;

  passwordHash: string;

  avatar?: string;
  bio?: string;
  specialty?: string;

  emailVerified: boolean;
  mobileVerified: boolean;

  status: UserStatus;
}

const userSchema = new Schema<IUser>(
  {
    role: {
      type: Schema.Types.ObjectId,
      ref: "Role",
      required: true,
      index: true,
    },

    firstName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    lastName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    mobile: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      index: true,
    },

    passwordHash: {
      type: String,
      required: true,
      select: false,
    },

    avatar: {
      type: String,
    },

    bio: {
      type: String,
      trim: true,
      maxlength: 1000,
    },

    specialty: {
      type: String,
      trim: true,
      maxlength: 200,
    },

    emailVerified: {
      type: Boolean,
      default: false,
    },

    mobileVerified: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: ["active", "pending", "blocked"],
      default: "pending",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const User = model<IUser>("User", userSchema);
