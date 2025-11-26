import { Response, NextFunction } from "express";
import { Organization } from "../mongodb/models/organization";
import { MedicineType } from "../mongodb/models/inventory";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { randomUUID } from "crypto";

// Utility to recompute qty, exp (earliest), mfg (average) from batches
function recomputeMedicineDerivedFields(med: any) {
  const nonDiscarded = med.batches.filter((b: any) => !b.isDiscarded);
  med.qty = nonDiscarded.reduce((sum: number, b: any) => sum + (b.qty || 0), 0);

  if (med.batches.length > 0) {
    // exp: earliest among all batches
    med.exp = new Date(
      Math.min(...med.batches.map((b: any) => new Date(b.combinedExp).getTime()))
    );

    // mfg: average of all batches
    const mfgMs = med.batches
      .map((b: any) => new Date(b.averageMfg).getTime())
      .reduce((a: number, b: number) => a + b, 0) / med.batches.length;
    med.mfg = new Date(mfgMs);
  } else {
    med.exp = null;
    med.mfg = null;
  }
}

export const addMedicine = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { orgId } = req.params;
    const {
      barcodeNo,
      name,
      type,
      qty,
      desc,
      specialInstructions,
      handlingTemp,
      price,
      exp, // Date or string
      mfg, // Date or string
    } = req.body as {
      barcodeNo: string;
      name: string;
      type: MedicineType;
      qty: number;
      desc?: string;
      specialInstructions?: string;
      handlingTemp?: number;
      price?: number;
      exp: string | Date;
      mfg: string | Date;
    };

    if (!barcodeNo || !name || !type || !qty || !exp || !mfg) {
      return res.status(400).json({ message: "barcodeNo, name, type, qty, exp, mfg are required" });
    }

    const unitPrice = Number(price ?? 0);
    if (Number.isNaN(unitPrice) || unitPrice < 0) {
      return res.status(400).json({ message: "price must be a non-negative number" });
    }

    const org = await Organization.findById(orgId);
    if (!org) return res.status(404).json({ message: "Organization not found" });

    // RBAC: Inventory In or Admin only
    const membership = org.users.find((u: any) => String(u.user) === String(req.user?.id));
    const role = membership?.role;
    if (!role) return res.status(403).json({ message: "Not a member of this organization" });
    if (role !== "Admin" && role !== "Inventory In") {
      return res.status(403).json({ message: "Only Admin or Inventory In can add medicine" });
    }

    // Barcode uniqueness per org (enforced via index too)
    const existingBarcode = org.inventory.find((m: any) => m.barcodeNo === barcodeNo && m.name !== name);
    if (existingBarcode) {
      return res.status(409).json({ message: "Barcode already used by another medicine in this organization" });
    }

    // Find medicine by barcode within this org
    let med = org.inventory.find((m: any) => m.barcodeNo === barcodeNo);

    const batch = {
      batchId: randomUUID(),
      qty: Number(qty),
      combinedExp: new Date(exp),
      averageMfg: new Date(mfg),
      isDiscarded: false,
    };

    if (!med) {
      // New medicine entry
      const now = new Date();
      const medId = randomUUID();
      const newMed: any = {
        id: medId,
        barcodeNo,
        name,
        type,
        qty: 0, // will recompute
        price: unitPrice,
        desc: desc ?? null,
        exp: null,
        mfg: null,
        specialInstructions: specialInstructions ?? null,
        handlingTemp: handlingTemp ?? null,
        batches: [batch],
        firstStockedOn: now,
        recentlyStockedOn: now,
      };

      recomputeMedicineDerivedFields(newMed);
      org.inventory.push(newMed);
    } else {
      // Existing medicine: determine if new batch should be created
      const lastBatch = med.batches[med.batches.length - 1];
      const isSameDates =
        lastBatch &&
        new Date(lastBatch.combinedExp).getTime() === new Date(exp).getTime() &&
        new Date(lastBatch.averageMfg).getTime() === new Date(mfg).getTime();

      if (isSameDates) {
        lastBatch.qty += Number(qty);
      } else {
        med.batches.push(batch);
      }

      med.recentlyStockedOn = new Date();
      recomputeMedicineDerivedFields(med);
    }

    await org.save();
    return res.status(201).json({ message: "Medicine stocked successfully" });
  } catch (err) {
    next(err);
  }
};

export const sellMedicine = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { orgId } = req.params;
    const { barcodeNo, qty } = req.body as { barcodeNo: string; qty: number };

    if (!barcodeNo || !qty || qty <= 0) {
      return res.status(400).json({ message: "barcodeNo and positive qty are required" });
    }

    const org = await Organization.findById(orgId);
    if (!org) return res.status(404).json({ message: "Organization not found" });

    // RBAC: Salesperson or Admin only
    const membership = org.users.find((u: any) => String(u.user) === String(req.user?.id));
    const role = membership?.role;
    if (!role) return res.status(403).json({ message: "Not a member of this organization" });
    if (role !== "Admin" && role !== "Salesperson") {
      return res.status(403).json({ message: "Only Admin or Salesperson can sell" });
    }

    const med = org.inventory.find((m: any) => m.barcodeNo === barcodeNo);
    if (!med) return res.status(404).json({ message: "Medicine not found" });

    // Filter non-discarded batches and sort by earliest expiry (closest to expiry first)
    const availableBatches = med.batches
      .filter((b: any) => !b.isDiscarded)
      .sort(
        (a: any, b: any) =>
          new Date(a.combinedExp).getTime() - new Date(b.combinedExp).getTime()
      );

    let remaining = qty;
    for (const b of availableBatches) {
      if (remaining <= 0) break;
      const take = Math.min(b.qty, remaining);
      b.qty -= take;
      remaining -= take;
    }

    if (remaining > 0) {
      return res.status(400).json({ message: "Insufficient stock in non-expired batches" });
    }

    recomputeMedicineDerivedFields(med);
    await org.save();
    return res.status(200).json({ message: "Sale recorded" });
  } catch (err) {
    next(err);
  }
};

export const discardBatch = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { orgId, batchId } = req.params as { orgId: string; batchId: string };

    const org = await Organization.findById(orgId);
    if (!org) return res.status(404).json({ message: "Organization not found" });

    // RBAC: Inventory Manager or Admin only
    const membership = org.users.find((u: any) => String(u.user) === String(req.user?.id));
    const role = membership?.role;
    if (!role) return res.status(403).json({ message: "Not a member of this organization" });
    if (role !== "Admin" && role !== "Inventory Manager") {
      return res.status(403).json({ message: "Only Admin or Inventory Manager can discard batches" });
    }

    // find the medicine that contains this batch
    const med = org.inventory.find((m: any) => m.batches.some((b: any) => b.batchId === batchId));
    if (!med) return res.status(404).json({ message: "Batch not found" });

    const batch = med.batches.find((b: any) => b.batchId === batchId);
    if (!batch) return res.status(404).json({ message: "Batch not found" });

    batch.isDiscarded = true;
    recomputeMedicineDerivedFields(med);
    await org.save();

    return res.status(200).json({ message: "Batch discarded" });
  } catch (err) {
    next(err);
  }
};

export const markExpiredBatches = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { orgId } = req.params as { orgId: string };
    const org = await Organization.findById(orgId);
    if (!org) return res.status(404).json({ message: "Organization not found" });

    // RBAC: Inventory Manager or Admin only
    const membership = org.users.find((u: any) => String(u.user) === String(req.user?.id));
    const role = membership?.role;
    if (!role) return res.status(403).json({ message: "Not a member of this organization" });
    if (role !== "Admin" && role !== "Inventory Manager") {
      return res.status(403).json({ message: "Only Admin or Inventory Manager can trigger expiry checks" });
    }

    const now = Date.now();
    for (const med of org.inventory as any[]) {
      for (const b of med.batches) {
        if (new Date(b.combinedExp).getTime() <= now) {
          b.isDiscarded = true;
        }
      }
      recomputeMedicineDerivedFields(med);
    }

    await org.save();
    return res.status(200).json({ message: "Expired batches marked" });
  } catch (err) {
    next(err);
  }
};

export const getMedicineByBarcode = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { orgId, barcode } = req.params as { orgId: string; barcode: string };

    const org = await Organization.findById(orgId);
    if (!org) return res.status(404).json({ message: "Organization not found" });

    const med = org.inventory.find((m: any) => m.barcodeNo === barcode);
    if (!med) return res.status(404).json({ message: "Medicine not found" });

    return res.status(200).json(med);
  } catch (err) {
    next(err);
  }
};