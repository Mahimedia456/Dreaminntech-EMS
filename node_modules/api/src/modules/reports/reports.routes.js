import express from "express";
import {
  getReportData,
  getReportsSummary,
} from "./reports.controller.js";
import { requireAuth } from "../../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/summary", requireAuth, getReportsSummary);
router.get("/:type", requireAuth, getReportData);

export default router;