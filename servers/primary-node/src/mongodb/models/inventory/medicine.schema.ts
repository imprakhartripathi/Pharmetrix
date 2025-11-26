import { Schema } from "mongoose";
import { IMedicine, MedicineType } from "./inventory.types";
import { BatchSchema } from "./batch.schema";

export const MedicineSchema = new Schema<IMedicine>(
  {
    id: { type: String, required: true, index: true },
    barcodeNo: { type: String, required: true },
    name: { type: String, required: true },
    type: { type: String, enum: Object.values(MedicineType), required: true },
    qty: { type: Number, default: 0 },
    individualQty: { type: Number, default: 0 },
    price: { type: Number, default: 0, min: 0 },
    desc: { type: String, default: null },
    exp: { type: Date, default: null },
    mfg: { type: Date, default: null },
    specialInstructions: { type: String, default: null },
    handlingTemp: { type: Number, default: null },
    batches: { type: [BatchSchema], default: [] },
    firstStockedOn: { type: Date, default: null },
    recentlyStockedOn: { type: Date, default: null },
  },
  { _id: true, timestamps: false }
);
