import { Document, Types } from "mongoose";
import { IMedicine } from "../inventory/inventory.types";
import { IDevice } from "../devices/device.types";

export enum OrgRole {
  Admin = "Admin",
  InventoryIn = "Inventory In",
  InventoryManager = "Inventory Manager",
  Salesperson = "Salesperson",
}

export interface IOrgUser extends Document {
  user: Types.ObjectId;
  role: OrgRole;
}

export interface IOrganization extends Document {
  name: string;
  owner: Types.ObjectId;
  users: Types.DocumentArray<IOrgUser>;
  inventory: Types.DocumentArray<IMedicine>;
  connectedDevices: Types.DocumentArray<IDevice>;
  createdAt: Date;
  updatedAt: Date;
}
