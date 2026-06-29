import express from "express";
import {
  getCompanySettings,
  getRolePermissions,
  updateCompanySettings,
  updateRolePermissions,
} from "./settings.controller.js";
import { allowRoles, requireAuth } from "../../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/company", requireAuth, allowRoles("admin"), getCompanySettings);
router.put("/company", requireAuth, allowRoles("admin"), updateCompanySettings);

router.get("/permissions", requireAuth, allowRoles("admin"), getRolePermissions);
router.put("/permissions", requireAuth, allowRoles("admin"), updateRolePermissions);

export default router;