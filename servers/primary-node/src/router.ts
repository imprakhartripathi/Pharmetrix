import express from "express";
import { checkTokenExpiry, login, sendUserInfo, signup } from "./controllers/auth.controller";
import { deleteUser, updateUser } from "./controllers/user.controller";
import { authenticate } from "./middleware/auth.middleware";
import { requireSelf } from "./middleware/ownership.middleware";
import { requireOrgRole } from "./middleware/rbac.middleware";

import { createOrganization, addUserToOrganization, getInventory } from "./controllers/org.controller";
import { addMedicine, sellMedicine, discardBatch, markExpiredBatches, getMedicineByBarcode } from "./controllers/inventory.controller";
import { getStockSummary, getLowStock } from "./controllers/reports.controller";
import { submitContact } from "./controllers/contact.controller";
import { sendOtp, verifyOtp } from "./controllers/otp.controller";
import { resetPassword } from "./controllers/reset.controller";

export const router = express.Router();

router.get('/', (req, res) => {
  res.status(200).send('Welcome to Pharmetrix Primary Node.js Backend');
});

router.get('/ping', (req, res) => {
  res.status(200).send('pong');
});

// Public contact route for landing page
router.post('/contact', submitContact);

router.post('/signup', signup);
router.post('/login', login);
router.get("/check-token", checkTokenExpiry);
router.get("/getuserinfo", sendUserInfo, authenticate, requireSelf);

// OTP routes
router.post('/otp/send', sendOtp);
router.post('/otp/verify', verifyOtp);
router.post('/user/reset-password', resetPassword);

router.patch("/user/edit/:id", authenticate, requireSelf, updateUser); // takes updates via body and id for finding
router.delete("/user/delete/:id", authenticate, requireSelf, deleteUser); // just id

// SPIS: Organization & Inventory routes
router.post('/orgs', authenticate, createOrganization);
router.post('/orgs/:orgId/users', authenticate, requireOrgRole(["Admin"] as any), addUserToOrganization);
router.get('/orgs/:orgId/inventory', authenticate, requireOrgRole("ANY" as any), getInventory);
router.get('/orgs/:orgId/reports/stock-summary', authenticate, requireOrgRole(["Admin", "Inventory Manager"] as any), getStockSummary);
router.get('/orgs/:orgId/reports/low-stock', authenticate, requireOrgRole(["Admin", "Inventory Manager"] as any), getLowStock);

router.get('/orgs/:orgId/medicines/:barcode', authenticate, requireOrgRole("ANY" as any), getMedicineByBarcode);
router.post('/orgs/:orgId/medicines', authenticate, requireOrgRole(["Admin", "Inventory In"] as any), addMedicine);
router.post('/orgs/:orgId/sell', authenticate, requireOrgRole(["Admin", "Salesperson"] as any), sellMedicine);
router.post('/orgs/:orgId/batches/:batchId/discard', authenticate, requireOrgRole(["Admin", "Inventory Manager"] as any), discardBatch);
router.post('/orgs/:orgId/expire-check', authenticate, requireOrgRole(["Admin", "Inventory Manager"] as any), markExpiredBatches);
