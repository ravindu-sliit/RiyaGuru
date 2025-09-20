import express from "express";
import {
  getCompletionRates,
  getAverageCompletionTimes,
  getInstructorPerformance,
} from "../controllers/reportController.js";

const router = express.Router();

// Reports
router.get("/completion-rates", getCompletionRates);
router.get("/average-completion-times", getAverageCompletionTimes);
router.get("/instructor-performance", getInstructorPerformance);

export default router;
