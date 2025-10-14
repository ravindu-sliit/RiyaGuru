// routes/progressTrackingRoutes.js
import express from "express";
import {
  getProgress,
  manualUpdateProgress,
  issueCertificate,
  getAllProgress,
} from "../controllers/progressTrackingController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// protect this endpoint — instructors will be scoped in controller
router.get("/", protect, getAllProgress);
router.get("/:studentId/:courseName", getProgress);
router.post("/update/:studentId/:courseName", manualUpdateProgress);
router.post("/certificate/:studentId/:courseName", issueCertificate);

export default router;
