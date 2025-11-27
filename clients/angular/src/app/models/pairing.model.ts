export interface PairingSession {
  id: string;
  deviceId: string;
  pairingId: string;
  status: PairingStatus;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
  token?: string;
  approvalTimestamp?: Date;
  callbackUrl?: string;
}

export type PairingStatus = 
  | 'PENDING_ADMIN_APPROVAL'
  | 'APPROVED_PENDING_CALLBACK'
  | 'APPROVED_AWAITING_POLL'
  | 'ACTIVE'
  | 'FAILED'
  | 'EXPIRED';

export interface PairingPollingConfig {
  maxAttempts: number;
  pollInterval: number;
  timeoutMs: number;
}

export interface PairingResult {
  success: boolean;
  pairingId: string;
  token?: string;
  status: PairingStatus;
  message: string;
  error?: string;
}
