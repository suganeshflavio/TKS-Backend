import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { requireAdmin } from "../../middleware/admin.middleware";
import {
  addQuestion,
  createTest,
  deleteQuestion,
  deleteTest,
  getTestById,
  getTests,
  submitAttempt,
  updateQuestion,
  updateTest,
} from "./test.controller";

const router = Router();

router.post("/", authenticate, requireAdmin, createTest);
router.get("/", authenticate, requireAdmin, getTests);
router.get("/:id", authenticate, requireAdmin, getTestById);
router.put("/:id", authenticate, requireAdmin, updateTest);
router.delete("/:id", authenticate, requireAdmin, deleteTest);

router.post("/:id/questions", authenticate, requireAdmin, addQuestion);
router.put("/:id/questions/:questionId", authenticate, requireAdmin, updateQuestion);
router.delete("/:id/questions/:questionId", authenticate, requireAdmin, deleteQuestion);

router.post("/:id/attempts", authenticate, submitAttempt);

export default router;
