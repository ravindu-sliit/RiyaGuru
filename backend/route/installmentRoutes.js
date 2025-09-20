// backend/route/installmentRoutes.js
import { Router } from "express";
import {
  createPlan,
  getAllPlans,
  getPlanById,
  updatePlan,
  payInstallment
} from "../controllers/installmentController.js";

const router = Router();

router.post("/", createPlan);                  // create plan
router.get("/", getAllPlans);                  // list plans (optional ?studentId=114)
router.get("/:id", getPlanById);               // one plan
router.put("/:id", updatePlan);                // update base fields
router.patch("/:id/pay", payInstallment);      // pay one installment

export default router;
