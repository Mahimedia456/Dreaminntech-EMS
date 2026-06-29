import express from "express";
import { getDashboard } from "./dashboard.controller.js";
import { requireAuth } from "../../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", requireAuth, getDashboard);

export default router;