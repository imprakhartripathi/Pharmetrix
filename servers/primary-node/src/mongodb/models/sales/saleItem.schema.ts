import { Schema } from "mongoose";
import { ISaleItem } from "./saleItem.types";

export const SaleItemSchema = new Schema<ISaleItem>(
  {
    saleId: { type: Schema.Types.ObjectId, ref: "Sale", required: true, index: true },
    organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    medicineId: { type: Schema.Types.ObjectId, required: true },
    medicineName: { type: String, required: true },
    batchId: { type: Schema.Types.ObjectId, required: true },
    expiryDate: { type: Date, required: true },
    saleQuantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    totalPrice: { type: Number, required: true, min: 0 },
    isQuickSaleItem: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);
