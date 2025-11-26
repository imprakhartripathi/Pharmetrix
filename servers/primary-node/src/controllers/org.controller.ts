import { Request, Response, NextFunction } from "express";
import { Organization, OrgRole } from "../mongodb/models/organization";
import { User } from "../mongodb/models/user";
import { AuthenticatedRequest } from "../middleware/auth.middleware";

import { audit } from "../utils/audit";

export const createOrganization = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name } = req.body;
    if (!name) {
      res.status(400).json({ message: "Organization name is required" });
      return;
    }
    const ownerId = req.user?.id;
    if (!ownerId) { res.status(401).json({ message: "Unauthorized" }); return; }

    const owner = await User.findById(ownerId);
    if (!owner) { res.status(404).json({ message: "Owner user not found" }); return; }

    const org = await Organization.create({
      name,
      owner: owner._id,
      users: [{ user: owner._id, role: OrgRole.Admin }],
      inventory: [],
    });

    await audit("org.create", "success", { actorId: ownerId, orgId: String(org._id), requestId: (req as any).requestId, meta: { name } });
    res.status(201).json(org);
  } catch (err: any) {
    await audit("org.create", "failure", { actorId: req.user?.id ?? null, requestId: (req as any).requestId, meta: { error: err?.message } });
    next(err);
  }
};

export const addUserToOrganization = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { orgId } = req.params;
    const { userId, role } = req.body as { userId: string; role: OrgRole };
    if (!userId || !role) {
      res.status(400).json({ message: "userId and role are required" });
      return;
    }

    const org = await Organization.findById(orgId);
    if (!org) { res.status(404).json({ message: "Organization not found" }); return; }

    const user = await User.findById(userId);
    if (!user) { res.status(404).json({ message: "User not found" }); return; }

    const already = org.users.find((u) => String(u.user) === String(userId));
    if (already) { res.status(409).json({ message: "User already in organization" }); return; }

    org.users.push({ user: user._id, role });
    await org.save();

    await audit("org.addUser", "success", { actorId: req.user?.id ?? null, orgId, requestId: (req as any).requestId, meta: { userId, role } });
    res.status(200).json(org);
  } catch (err: any) {
    await audit("org.addUser", "failure", { actorId: req.user?.id ?? null, orgId: (req.params as any).orgId, requestId: (req as any).requestId, meta: { error: err?.message } });
    next(err);
  }
};

export const getInventory = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { orgId } = req.params as { orgId: string };
    const org = await Organization.findById(orgId);
    if (!org) { res.status(404).json({ message: "Organization not found" }); return; }

    const role = (req as any).orgRole as string;
    const q = (req.query.q as string) || ""; // search query
    const page = Math.max(1, parseInt((req.query.page as string) || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt((req.query.limit as string) || "20", 10)));

    let list = org.inventory.map((m: any) => ({ ...m.toObject?.() ?? m }));

    // Search by name or barcode
    if (q) {
      const qLower = q.toLowerCase();
      list = list.filter((m: any) =>
        (m.name || "").toLowerCase().includes(qLower) ||
        (m.barcodeNo || "").toLowerCase().includes(qLower)
      );
    }

    // Salesperson: only sellable + limited fields
    if (role === "Salesperson") {
      list = list
        .map((m: any) => {
          const batches = (m.batches || []).filter((b: any) => !b.isDiscarded && (b.qty || 0) > 0);
          const qty = batches.reduce((sum: number, b: any) => sum + (b.qty || 0), 0);
          if (qty <= 0) return null;
          return {
            id: m.id,
            barcodeNo: m.barcodeNo,
            name: m.name,
            type: m.type,
            qty,
            price: m.price ?? 0,
            exp: m.exp,
            mfg: m.mfg,
          };
        })
        .filter(Boolean) as any[];
    }

    const total = list.length;
    const start = (page - 1) * limit;
    const items = list.slice(start, start + limit);

    res.status(200).json({ items, page, limit, total });
  } catch (err) {
    next(err);
  }
};