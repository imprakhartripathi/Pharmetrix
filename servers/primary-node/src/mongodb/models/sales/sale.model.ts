import mongoose from "mongoose";
import { ISale } from "./sale.types";
import { SaleSchema } from "./sale.schema";

export const Sale = mongoose.model<ISale>("Sale", SaleSchema);
