import { Router } from "express";
import {
  getAllPayments,
  addPayment,
  getPaymentById,
  updatePayment,
  deletePayment
} from "../controllers/paymentController.js";

const router = Router();

// No authentication middleware (independent module)
router.get("/", getAllPayments);
router.post("/", addPayment);
router.get("/:id", getPaymentById);
router.put("/:id", updatePayment);
router.delete("/:id", deletePayment);

export default router;
