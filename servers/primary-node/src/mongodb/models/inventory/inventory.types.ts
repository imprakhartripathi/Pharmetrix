import { Document, Types } from "mongoose";

export enum MedicineType {
  TABLET = "Tablet",
  CAPSULE = "Capsule",
  INJECTION = "Injection",
  SYRUP = "Syrup",
  POWDER = "Powder",
  TUBE = "Tube",
  SPRAY = "Spray",
  INHALER = "Inhaler",
}

export interface IBatch extends Document {
  batchId: string;
  qty: number;
  combinedExp: Date;
  averageMfg: Date;
  isDiscarded: boolean;
}

export interface IMedicine extends Document {
  id: string;
  barcodeNo: string;
  name: string;
  type: MedicineType;
  qty: number;
  individualQty: number;
  price: number;
  desc?: string;
  exp: Date | null;
  mfg: Date | null;
  specialInstructions?: string;
  handlingTemp?: number;
  batches: Types.DocumentArray<IBatch>;
  firstStockedOn: Date | null;
  recentlyStockedOn: Date | null;
}
