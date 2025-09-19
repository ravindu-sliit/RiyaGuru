// backend/route/receiptRoutes.js
import { Router } from "express";
import { getReceipt } from "../controllers/receiptController.js";

const router = Router();

router.get("/:id", getReceipt);

export default router;
