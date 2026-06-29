import express from "express";
import {
  addFinanceExpenseFile,
  createFinanceExpense,
  deleteFinanceExpense,
  deleteFinanceExpenseFile,
  getFinanceCategories,
  getFinanceExpenseDetail,
  getFinanceExpenses,
  reviewFinanceExpense,
  submitFinanceExpense,
  updateFinanceExpense,
} from "./financeExpenses.controller.js";
import { requireAuth } from "../../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/categories", requireAuth, getFinanceCategories);

router.get("/", requireAuth, getFinanceExpenses);
router.get("/:id", requireAuth, getFinanceExpenseDetail);

router.post("/", requireAuth, createFinanceExpense);
router.put("/:id", requireAuth, updateFinanceExpense);
router.delete("/:id", requireAuth, deleteFinanceExpense);

router.put("/:id/submit", requireAuth, submitFinanceExpense);
router.put("/:id/review", requireAuth, reviewFinanceExpense);

router.post("/:id/files", requireAuth, addFinanceExpenseFile);
router.delete("/files/:fileId", requireAuth, deleteFinanceExpenseFile);

export default router;