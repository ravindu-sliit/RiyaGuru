// backend/routes/receiptRoutes.js
import { Router } from "express";
import { downloadReceipt } from "../controllers/receiptController.js";

const router = Router();

// GET /api/receipts/:id
router.get("/:id", downloadReceipt);

export default router;
