import express from "express";
import { getProgress, manualUpdateProgress } from "../controllers/progressTrackingController.js";

const router = express.Router();

router.get("/:studentCourseId", getProgress);
router.post("/update/:studentCourseId", manualUpdateProgress);

export default router;
