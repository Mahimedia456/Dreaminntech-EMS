import express from "express";
import {
  breakIn,
  breakOut,
  checkIn,
  checkOut,
  getAttendanceHistory,
  getAttendanceSummary,
  getTodayAttendance,
  lunchIn,
  lunchOut,
  submitDailyReport,
} from "./attendance.controller.js";
import { requireAuth } from "../../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/today", requireAuth, getTodayAttendance);
router.get("/history", requireAuth, getAttendanceHistory);
router.get("/summary", requireAuth, getAttendanceSummary);

router.post("/check-in", requireAuth, checkIn);
router.post("/lunch-out", requireAuth, lunchOut);
router.post("/lunch-in", requireAuth, lunchIn);
router.post("/break-out", requireAuth, breakOut);
router.post("/break-in", requireAuth, breakIn);
router.post("/check-out", requireAuth, checkOut);
router.post("/daily-report", requireAuth, submitDailyReport);

export default router;