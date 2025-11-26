import { Request, Response, NextFunction } from "express";
import { Organization } from "../mongodb/models/organization";

// Simple aggregated reports (can be evolved into Mongo aggregations)
export const getStockSummary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orgId } = req.params as any;
    const org = await Organization.findById(orgId);
    if (!org) { res.status(404).json({ message: "Organization not found" }); return; }

    let totalItems = 0;
    let totalQty = 0;
    let nearingExpiry = 0;
    const now = Date.now();
    const soon = now + 30 * 24 * 60 * 60 * 1000; // 30 days

    for (const m of (org.inventory as any[])) {
      totalItems += 1;
      const qty = (m.batches || []).filter((b: any) => !b.isDiscarded)
        .reduce((sum: number, b: any) => sum + (b.qty || 0), 0);
      totalQty += qty;
      const earliestExp = Math.min(...(m.batches || []).filter((b: any) => !b.isDiscarded).map((b: any) => new Date(b.combinedExp).getTime()).concat([Infinity]));
      if (earliestExp !== Infinity && earliestExp <= soon) nearingExpiry += 1;
    }

    res.status(200).json({ totalItems, totalQty, nearingExpiry });
  } catch (err) {
    next(err);
  }
};

export const getLowStock = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orgId } = req.params as any;
    const threshold = Math.max(1, parseInt((req.query.threshold as string) || "10", 10));

    const org = await Organization.findById(orgId);
    if (!org) { res.status(404).json({ message: "Organization not found" }); return; }

    const items = (org.inventory as any[]).filter((m: any) => (m.qty || 0) <= threshold);
    res.status(200).json({ items, threshold, count: items.length });
  } catch (err) {
    next(err);
  }
};