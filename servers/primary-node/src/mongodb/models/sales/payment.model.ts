import mongoose from "mongoose";
import { IPayment } from "./payment.types";
import { PaymentSchema } from "./payment.schema";

export const Payment = mongoose.model<IPayment>("Payment", PaymentSchema);
