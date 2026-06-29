import express from "express";
import { getAttendanceAnalytics } from "./attendanceAnalytics.controller.js";
import { requireAuth } from "../../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", requireAuth, getAttendanceAnalytics);

export default router;