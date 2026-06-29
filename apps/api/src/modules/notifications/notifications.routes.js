import express from "express";
import {
  createNotification,
  deleteNotification,
  getNotifications,
  getUnreadCount,
  markAllNotificationsRead,
  markNotificationRead,
} from "./notifications.controller.js";
import { requireAuth } from "../../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", requireAuth, getNotifications);
router.get("/unread-count", requireAuth, getUnreadCount);

router.post("/", requireAuth, createNotification);

router.put("/read-all", requireAuth, markAllNotificationsRead);
router.put("/:id/read", requireAuth, markNotificationRead);

router.delete("/:id", requireAuth, deleteNotification);

export default router;