import { Schema } from "mongoose";
import { ISale, SaleType, SaleStatus } from "./sale.types";

const TaxBreakupSchema = new Schema(
  {
    cgst: { type: Number, default: null },
    sgst: { type: Number, default: null },
    igst: { type: Number, default: null },
  },
  { _id: false }
);

const CustomerSchema = new Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, default: null },
    address: { type: String, default: null },
    customerId: { type: String, default: null },
  },
  { _id: false }
);

const PrescriptionSchema = new Schema(
  {
    prescriptionId: { type: String, required: true },
    verified: { type: Boolean, default: false },
    validityCheckedAt: { type: Date, required: true },
  },
  { _id: false }
);

export const SaleSchema = new Schema<ISale>(
  {
    saleType: {
      type: String,
      enum: Object.values(SaleType),
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(SaleStatus),
      required: true,
    },
    totalAmount: { type: Number, required: true },
    discount: { type: Number, default: null },
    netAmount: { type: Number, required: true },
    taxBreakup: { type: TaxBreakupSchema, default: null },
    customer: { type: CustomerSchema, default: null },
    prescription: { type: PrescriptionSchema, default: null },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    convertedFromInternal: { type: Boolean, default: false },
  },
  { timestamps: true }
);
