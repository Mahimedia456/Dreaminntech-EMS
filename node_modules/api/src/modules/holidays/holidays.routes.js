import express from "express";

import {
  getHolidays,
  createHoliday,
  updateHoliday,
  deleteHoliday,
} from "./holidays.controller.js";

import {
  requireAuth,
  allowRoles,
} from "../../middlewares/authMiddleware.js";

const router = express.Router();

router.get(
  "/",
  requireAuth,
  getHolidays
);

router.post(
  "/",
  requireAuth,
  allowRoles("admin"),
  createHoliday
);

router.put(
  "/:id",
  requireAuth,
  allowRoles("admin"),
  updateHoliday
);

router.delete(
  "/:id",
  requireAuth,
  allowRoles("admin"),
  deleteHoliday
);

export default router;