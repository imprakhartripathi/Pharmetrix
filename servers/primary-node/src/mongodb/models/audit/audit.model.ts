import mongoose from "mongoose";
import { IAuditLog } from "./audit.types";
import { AuditLogSchema } from "./audit.schema";

export const AuditLog = mongoose.model<IAuditLog>("AuditLog", AuditLogSchema);
