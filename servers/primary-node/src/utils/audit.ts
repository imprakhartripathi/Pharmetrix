import { AuditLog } from "../mongodb/models/audit";

export async function audit(action: string, status: "success" | "failure", options: {
  actorId?: string | null,
  orgId?: string | null,
  requestId?: string,
  meta?: Record<string, any>
} = {}) {
  try {
    await AuditLog.create({
      action,
      status,
      actorId: options.actorId ?? null,
      orgId: options.orgId ?? null,
      requestId: options.requestId,
      meta: options.meta,
    });
  } catch (e) {
    // swallow logging errors to not affect main flow
  }
}