// backend/route/adminInstallmentRoutes.js
import { Router } from "express";
import { approvePlan, rejectPlan } from "../controllers/adminInstallmentController.js";

const router = Router();

// PATCH /api/admin/installments/:id/approve
router.patch("/:id/approve", approvePlan);

// PATCH /api/admin/installments/:id/reject
router.patch("/:id/reject", rejectPlan);

export default router;
