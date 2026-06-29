import express from "express";
import {
  createEmployee,
  deleteEmployee,
  getDepartments,
  getDesignations,
  getEmployeeDetail,
  getEmployees,
  getShifts,
  updateEmployee,
  createDepartment,
updateDepartment,
deleteDepartment,
createDesignation,
updateDesignation,
deleteDesignation,
createShift,
updateShift,
deleteShift,
} from "./employees.controller.js";
import { allowRoles, requireAuth } from "../../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", requireAuth, getEmployees);
router.post("/", requireAuth, allowRoles("admin"), createEmployee);

router.get("/departments", requireAuth, getDepartments);
router.get("/designations", requireAuth, getDesignations);
router.get("/shifts", requireAuth, getShifts);

router.get("/:id", requireAuth, getEmployeeDetail);
router.put("/:id", requireAuth, allowRoles("admin"), updateEmployee);
router.delete("/:id", requireAuth, allowRoles("admin"), deleteEmployee);
router.post("/departments", requireAuth, allowRoles("admin"), createDepartment);
router.put("/departments/:id", requireAuth, allowRoles("admin"), updateDepartment);
router.delete("/departments/:id", requireAuth, allowRoles("admin"), deleteDepartment);

router.post("/designations", requireAuth, allowRoles("admin"), createDesignation);
router.put("/designations/:id", requireAuth, allowRoles("admin"), updateDesignation);
router.delete("/designations/:id", requireAuth, allowRoles("admin"), deleteDesignation);

router.post("/shifts", requireAuth, allowRoles("admin"), createShift);
router.put("/shifts/:id", requireAuth, allowRoles("admin"), updateShift);
router.delete("/shifts/:id", requireAuth, allowRoles("admin"), deleteShift);

export default router;