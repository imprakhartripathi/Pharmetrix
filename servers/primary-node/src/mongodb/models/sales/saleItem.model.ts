import mongoose from "mongoose";
import { ISaleItem } from "./saleItem.types";
import { SaleItemSchema } from "./saleItem.schema";

export const SaleItem = mongoose.model<ISaleItem>("SaleItem", SaleItemSchema);
