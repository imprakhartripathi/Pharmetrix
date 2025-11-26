import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./auth.middleware";
import { Organization, OrgRole } from "../mongodb/models/organization";

// Loads the caller's role in the organization into req for later use
export const requireOrgRole = (roles: OrgRole[] | "ANY") => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id as string;
      const orgId = (req.params as any).orgId as string;
      if (!userId || !orgId) return res.status(401).json({ message: "Unauthorized" });

      const org = await Organization.findById(orgId);
      if (!org) return res.status(404).json({ message: "Organization not found" });

      const membership = org.users.find((u: any) => String(u.user) === String(userId));
      if (!membership) return res.status(403).json({ message: "Not a member of this organization" });

      (req as any).org = org;
      (req as any).orgRole = membership.role as OrgRole;

      if (roles === "ANY") return next();

      if (membership.role === OrgRole.Admin) return next(); // Admin can do everything

      if (!roles.includes(membership.role)) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      return next();
    } catch (err) {
      next(err);
    }
  };
};