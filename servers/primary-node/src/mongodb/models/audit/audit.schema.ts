import { Schema } from "mongoose";
import { IAuditLog } from "./audit.types";

export const AuditLogSchema = new Schema<IAuditLog>({
  at: { type: Date, default: () => new Date() },
  actorId: { type: String, default: null },
  orgId: { type: String, default: null },
  action: { type: String, required: true, index: true },
  status: { type: String, enum: ["success", "failure"], required: true },
  requestId: { type: String },
  meta: { type: Schema.Types.Mixed },
});
