export interface Device {
  id: string;
  serialNumber: string;
  model: string;
  hardwareVersion: string;
  firmwareVersion: string;
  pairingId: string;
  accessPoint: string;
  imei: string;
  imsi: string;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'ERROR';
  pairedAt?: Date;
  lastHeartbeat?: Date;
}

export interface PairingRequest {
  serialNumber: string;
  accessPoint: string;
  imei: string;
  imsi: string;
  pairingId: string;
}

export interface PairingResponse {
  status: 'PENDING_ADMIN_APPROVAL' | 'APPROVED_PENDING_CALLBACK' | 'APPROVED_AWAITING_POLL' | 'ACTIVE' | 'ERROR' | 'FAILED' | 'EXPIRED';
  pairingId: string;
  token?: string;
  message?: string;
  error?: string;
}

export interface DeviceInfo {
  serialNumber: string;
  model: string;
  hardwareVersion: string;
  firmwareVersion: string;
  uptime: number;
  memoryUsage: number;
  cpuUsage: number;
  diskUsage: number;
}
