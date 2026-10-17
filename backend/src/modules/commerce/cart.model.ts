import { Schema, Types, model, Document } from "mongoose";

export interface ICartItem {
  itemType: "course" | "class";
  itemId: Types.ObjectId;
  paymentPlan?: "cash" | "installment";
}

export interface ICart extends Document {
  userId: Types.ObjectId;
  items: ICartItem[];
}

const cartSchema = new Schema<ICart>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
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
        paymentPlan: {
          type: String,
          enum: ["cash", "installment"],
          default: "cash",
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Cart = model<ICart>("Cart", cartSchema);
