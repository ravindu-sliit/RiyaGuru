// routes/progressTrackingRoutes.js
import express from "express";
import {
  getProgress,
  manualUpdateProgress,
  issueCertificate,
} from "../controllers/progressTrackingController.js";

const router = express.Router();

router.get("/:studentCourseId", getProgress);
router.post("/update/:studentCourseId", manualUpdateProgress);
router.post("/certificate/:studentCourseId", issueCertificate);

export default router;
