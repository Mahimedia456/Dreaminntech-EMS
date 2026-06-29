import express from "express";
import {
  forgotPassword,
  login,
  me,
  resetPassword,
  verifyOtp,
} from "./auth.controller.js";
import { requireAuth } from "../../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/login", login);
router.get("/me", requireAuth, me);

router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPassword);

export default router;