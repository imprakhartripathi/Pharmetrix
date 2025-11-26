import { Document, Types } from "mongoose";

export enum PaymentMode {
  CASH = "CASH",
  UPI = "UPI",
  CARD = "CARD",
  WALLET = "WALLET",
}

export interface IPayment extends Document {
  saleId: Types.ObjectId;
  organizationId: Types.ObjectId;
  mode: PaymentMode;
  amountPaid: number;
  transactionId?: string;
  paymentTimestamp: Date;
}
