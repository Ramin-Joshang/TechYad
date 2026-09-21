import { Schema, Types, model, Document } from "mongoose";

export interface IOrderItem {
  itemType: "course" | "class";
  itemId: Types.ObjectId;
  titleSnapshot: string;
  thumbnail?: string;
  instructorName?: string;
  price: number;
  discount: number;
  finalPrice: number;
}

export interface IOrder extends Document {
  userId: Types.ObjectId;
  items: IOrderItem[];
  subtotal: number;
  discountAmount: number;
  totalAmount: number;
  couponId?: Types.ObjectId;
  status: "pending" | "paid" | "failed" | "refunded";
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema = new Schema<IOrder>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    items: [
      {
        itemType: {
          type: String,
          enum: ["course", "class"],
          required: true,
        },
        itemId: {
          type: Schema.Types.ObjectId,
          required: true,
        },
        titleSnapshot: {
        thumbnail: String,
        instructorName: String,
          type: String,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        discount: {
          type: Number,
          default: 0,
        },
        finalPrice: {
          type: Number,
          required: true,
        },
      },
    ],
    subtotal: {
      type: Number,
      required: true,
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    couponId: {
      type: Schema.Types.ObjectId,
      ref: "Coupon",
    },
    status: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

orderSchema.index({ userId: 1, createdAt: -1 });

export const Order = model<IOrder>("Order", orderSchema);
