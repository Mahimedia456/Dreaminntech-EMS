import express from "express";
import {
  approveLeaveRequest,
  cancelLeaveRequest,
  createLeaveRequest,
  getLeaveBalances,
  getLeaveRequests,
  getLeaveTypes,
  rejectLeaveRequest,
} from "./leaves.controller.js";
import { allowRoles, requireAuth } from "../../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", requireAuth, getLeaveRequests);
router.post("/", requireAuth, createLeaveRequest);

router.get("/types", requireAuth, getLeaveTypes);
router.get("/balances", requireAuth, getLeaveBalances);

router.put("/:id/approve", requireAuth, allowRoles("admin", "manager"), approveLeaveRequest);
router.put("/:id/reject", requireAuth, allowRoles("admin", "manager"), rejectLeaveRequest);
router.put("/:id/cancel", requireAuth, cancelLeaveRequest);

export default router;