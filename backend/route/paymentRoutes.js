import { Router } from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getAllPayments,
  addPayment,
  getPaymentById,
  updatePayment,
  deletePayment
} from "../controllers/paymentController.js";

const router = Router();

router.get("/", protect, getAllPayments);
router.post("/", protect, addPayment);
router.get("/:id", protect, getPaymentById);
router.put("/:id", protect, updatePayment);
router.delete("/:id", protect, deletePayment);

export default router;
