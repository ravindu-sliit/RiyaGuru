import { Router } from "express";
import {
  getAllPayments,
  addPayment,
  getPaymentById,
  updatePayment,
  deletePayment,
  uploadSlip
} from "../controllers/paymentController.js";
import paymentSlipUpload from "../middleware/paymentSlipUpload.js";

const router = Router();

// No authentication middleware (independent module)
router.post("/upload-slip", paymentSlipUpload.single("file"), uploadSlip);
router.get("/", getAllPayments);
router.post("/", addPayment);
router.get("/:id", getPaymentById);
router.put("/:id", updatePayment);
router.delete("/:id", deletePayment);

export default router;
