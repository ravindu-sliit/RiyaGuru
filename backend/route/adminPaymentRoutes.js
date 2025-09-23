import { Router } from "express";
import { approvePayment, rejectPayment } from "../controllers/adminPaymentController.js";
import { runReminders } from "../controllers/adminPaymentReminderController.js";

const router = Router();

router.patch("/:id/approve", approvePayment);
router.patch("/:id/reject", rejectPayment);

// Manual trigger for reminders
router.post("/reminders/run", runReminders);

export default router;
