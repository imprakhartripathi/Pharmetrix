import { Schema } from "mongoose";
import { IPayment, PaymentMode } from "./payment.types";

export const PaymentSchema = new Schema<IPayment>(
  {
    saleId: { type: Schema.Types.ObjectId, ref: "Sale", required: true, index: true },
    organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    mode: {
      type: String,
      enum: Object.values(PaymentMode),
      required: true,
    },
    amountPaid: { type: Number, required: true, min: 0 },
    transactionId: { type: String, default: null },
    paymentTimestamp: { type: Date, required: true },
  },
  { timestamps: false }
);
