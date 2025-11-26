import { Schema } from "mongoose";
import { IBatch } from "./inventory.types";

export const BatchSchema = new Schema<IBatch>(
  {
    batchId: { type: String, required: true, index: true },
    qty: { type: Number, required: true, min: 0 },
    combinedExp: { type: Date, required: true },
    averageMfg: { type: Date, required: true },
    isDiscarded: { type: Boolean, default: false },
  },
  { _id: false, timestamps: false }
);
