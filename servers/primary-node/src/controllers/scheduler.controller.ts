import cron from "node-cron";
import { Organization, OrgRole } from "../mongodb/models/organization";
import { notifyUsers } from "./notification.controller";

export function initializeExpiryScheduler() {
  // Run daily at 02:00 server time
  cron.schedule("0 2 * * *", async () => {
    const now = Date.now();
    const orgs = await Organization.find();
    for (const org of orgs) {
      let changed = false;
      for (const med of (org.inventory as any[])) {
        for (const b of med.batches) {
          if (!b.isDiscarded && new Date(b.combinedExp).getTime() <= now) {
            b.isDiscarded = true;
            changed = true;
          }
        }
      }
      if (changed) {
        await org.save();
        // Notify org Admin and Inventory Manager
        const managerIds = org.users
          .filter((u: any) => [OrgRole.Admin, OrgRole.InventoryManager].includes(u.role))
          .map((u: any) => String(u.user));
        await notifyUsers(managerIds, "Expired Batches Marked", `Some batches were auto-marked expired in org ${org.name}`);
      }
    }
  });
}