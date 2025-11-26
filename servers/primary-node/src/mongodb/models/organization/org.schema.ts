import { Schema } from "mongoose";
import { IOrganization } from "./org.types";
import { OrgUserSchema } from "./org-user.schema";
import { MedicineSchema } from "../inventory/medicine.schema";
import { DeviceSchema } from "../devices/device.schema";

export const OrganizationSchema = new Schema<IOrganization>(
  {
    name: { type: String, required: true },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    users: { type: [OrgUserSchema], default: [] },
    inventory: { type: [MedicineSchema], default: [] },
    connectedDevices: { type: [DeviceSchema], default: [] },
  },
  { timestamps: true }
);

OrganizationSchema.index({ _id: 1, "inventory.barcodeNo": 1 }, { unique: true });
