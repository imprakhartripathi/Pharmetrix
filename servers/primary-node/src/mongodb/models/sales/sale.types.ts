import { Document, Types } from "mongoose";

export enum SaleType {
  QUICK = "QUICK",
  PROPER = "PROPER",
}

export enum SaleStatus {
  INTERNAL = "INTERNAL",
  FINALIZED = "FINALIZED",
}

export interface ITaxBreakup {
  cgst?: number;
  sgst?: number;
  igst?: number;
}

export interface ICustomer {
  name: string;
  phone?: string;
  address?: string;
  customerId?: string;
}

export interface IPrescription {
  prescriptionId: string;
  verified: boolean;
  validityCheckedAt: Date;
}

export interface ISale extends Document {
  saleType: SaleType;
  status: SaleStatus;
  totalAmount: number;
  discount?: number;
  netAmount: number;
  taxBreakup?: ITaxBreakup;
  customer?: ICustomer;
  prescription?: IPrescription;
  createdBy: Types.ObjectId;
  organizationId: Types.ObjectId;
  convertedFromInternal: boolean;
  createdAt: Date;
  updatedAt: Date;
}
