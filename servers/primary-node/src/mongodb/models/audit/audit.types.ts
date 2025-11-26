import { Document } from "mongoose";

export type AuditStatus = "success" | "failure";

export interface IAuditLog extends Document {
  at: Date;
  actorId: string | null;
  orgId: string | null;
  action: string;
  status: AuditStatus;
  requestId?: string;
  meta?: Record<string, any>;
}
