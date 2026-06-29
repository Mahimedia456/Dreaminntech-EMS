import express from "express";
import {
  addProjectMember,
  createProject,
  createProjectTask,
  deleteProject,
  deleteProjectTask,
  getProjectDetail,
  getProjects,
  removeProjectMember,
  updateProject,
  updateProjectTask,
} from "./projects.controller.js";
import { allowRoles, requireAuth } from "../../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", requireAuth, getProjects);
router.get("/:id", requireAuth, getProjectDetail);

router.post("/", requireAuth, allowRoles("admin"), createProject);
router.put("/:id", requireAuth, allowRoles("admin"), updateProject);
router.delete("/:id", requireAuth, allowRoles("admin"), deleteProject);

router.post("/:id/members", requireAuth, allowRoles("admin", "manager"), addProjectMember);
router.delete("/:id/members/:memberId", requireAuth, allowRoles("admin", "manager"), removeProjectMember);

router.post("/:id/tasks", requireAuth, allowRoles("admin", "manager"), createProjectTask);
router.put("/:id/tasks/:taskId", requireAuth, updateProjectTask);
router.delete("/:id/tasks/:taskId", requireAuth, allowRoles("admin", "manager"), deleteProjectTask);

export default router;