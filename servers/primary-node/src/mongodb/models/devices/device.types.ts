import { Document } from "mongoose";

export enum DeviceStatus {
  ONLINE = "online",
  OFFLINE = "offline",
}

export enum ConnectionMethod {
  PUBLIC_IP = "PUBLIC_IP",
  TAILSCALE = "TAILSCALE",
  CLOUDFLARE = "CLOUDFLARE",
  LOCAL_NETWORK = "LOCAL_NETWORK",
}

export interface IDevice extends Document {
  device_id: string;
  token_hashed: string;
  public_ip?: string;
  port?: number;
  last_seen_at: Date;
  device_status: DeviceStatus;
  serial_number: string;
  mac_address: string;
  heartbeat_interval: number;
  device_version: string;
  name?: string;
  location?: string;
  last_known_local_ip?: string;
  connection_method: ConnectionMethod;
  last_ip_change_at?: Date;
}
