import { Schema } from "mongoose";
import { IDevice, DeviceStatus, ConnectionMethod } from "./device.types";

export const DeviceSchema = new Schema<IDevice>(
  {
    device_id: { type: String, required: true },
    token_hashed: { type: String, required: true },
    public_ip: { type: String, default: null },
    port: { type: Number, default: null },
    last_seen_at: { type: Date, required: true },
    device_status: {
      type: String,
      enum: Object.values(DeviceStatus),
      required: true,
    },
    serial_number: { type: String, required: true },
    mac_address: { type: String, required: true },
    heartbeat_interval: { type: Number, required: true },
    device_version: { type: String, required: true },
    name: { type: String, default: null },
    location: { type: String, default: null },
    last_known_local_ip: { type: String, default: null },
    connection_method: {
      type: String,
      enum: Object.values(ConnectionMethod),
      required: true,
    },
    last_ip_change_at: { type: Date, default: null },
  },
  { _id: false, timestamps: false }
);
