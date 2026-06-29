import express from "express";
import {
  deletePayrollItem,
  downloadPayslipPdf,
  generatePayroll,
  getPayrollItemDetail,
  getPayrollItems,
  getPayrollRuns,
  markPayrollPaid,
  updatePayrollItem,
} from "./payroll.controller.js";
import { allowRoles, requireAuth } from "../../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", requireAuth, getPayrollItems);
router.get("/runs", requireAuth, allowRoles("admin"), getPayrollRuns);

router.post("/generate", requireAuth, allowRoles("admin"), generatePayroll);

router.get("/:id", requireAuth, getPayrollItemDetail);
router.put("/:id", requireAuth, allowRoles("admin"), updatePayrollItem);
router.delete("/:id", requireAuth, allowRoles("admin"), deletePayrollItem);

router.put("/:id/paid", requireAuth, allowRoles("admin"), markPayrollPaid);
router.get("/:id/pdf", requireAuth, downloadPayslipPdf);

export default router;