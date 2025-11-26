import { Document, Types } from "mongoose";

export interface ISaleItem extends Document {
  saleId: Types.ObjectId;
  organizationId: Types.ObjectId;
  medicineId: Types.ObjectId;
  medicineName: string;
  batchId: Types.ObjectId;
  expiryDate: Date;
  saleQuantity: number;
  unitPrice: number;
  totalPrice: number;
  isQuickSaleItem: boolean;
  createdAt: Date;
}
