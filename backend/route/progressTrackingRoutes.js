// routes/progressTrackingRoutes.js
import express from "express";
import {
  getProgress,
  manualUpdateProgress,
  issueCertificate,
  getAllProgress,
} from "../controllers/progressTrackingController.js";

const router = express.Router();

router.get("/", getAllProgress);
router.get("/:studentId/:courseName", getProgress);
router.post("/update/:studentId/:courseName", manualUpdateProgress);
router.post("/certificate/:studentId/:courseName", issueCertificate);

export default router;
