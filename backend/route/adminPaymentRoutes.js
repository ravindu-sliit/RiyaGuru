// backend/route/adminPaymentRoutes.js
import { Router } from "express";
import { approvePayment, rejectPayment } from "../controllers/adminPaymentController.js";

const router = Router();

router.patch("/:id/approve", approvePayment);
router.patch("/:id/reject", rejectPayment);

export default router;
