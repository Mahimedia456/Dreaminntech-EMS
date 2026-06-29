import express from "express";
import {
  addChecklistItem,
  addTaskComment,
  createTask,
  deleteChecklistItem,
  deleteTask,
  deleteTaskComment,
  getTaskDetail,
  getTasks,
  startTaskTimer,
  stopTaskTimer,
  updateChecklistItem,
  updateTask,
  updateTaskProgress,
  updateTaskStatus,
} from "./tasks.controller.js";
import { requireAuth } from "../../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", requireAuth, getTasks);
router.get("/:id", requireAuth, getTaskDetail);

router.post("/", requireAuth, createTask);
router.put("/:id", requireAuth, updateTask);
router.delete("/:id", requireAuth, deleteTask);

router.patch("/:id/status", requireAuth, updateTaskStatus);
router.patch("/:id/progress", requireAuth, updateTaskProgress);

router.post("/:id/comments", requireAuth, addTaskComment);
router.delete("/comments/:commentId", requireAuth, deleteTaskComment);

router.post("/:id/checklists", requireAuth, addChecklistItem);
router.put("/checklists/:checklistId", requireAuth, updateChecklistItem);
router.delete("/checklists/:checklistId", requireAuth, deleteChecklistItem);

router.post("/:id/start-timer", requireAuth, startTaskTimer);
router.post("/:id/stop-timer", requireAuth, stopTaskTimer);

export default router;