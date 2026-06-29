import express from "express";
import {
  getMyProfile,
  updateMyProfile,
} from "./profile.controller.js";
import { requireAuth } from "../../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/me", requireAuth, getMyProfile);
router.put("/me", requireAuth, updateMyProfile);

export default router;