import { Router } from "express";
import {
  createPlan,
  getAllPlans,
  getPlanById,
  updatePlan,
  payInstallment
} from "../controllers/installmentController.js";

const router = Router();

// 🔓 No authentication
router.post("/", createPlan);
router.get("/", getAllPlans);
router.get("/:id", getPlanById);
router.put("/:id", updatePlan);
router.patch("/:id/pay", payInstallment);

export default router;
