import express from "express";
import {
  getCompletionRates,
  getAverageCompletionTimes,
  getInstructorPerformance,
  getStudentSummary,
  getAllStudentsSummary,
} from "../controllers/progressReportController.js";

const router = express.Router();

// Reports
router.get("/completion-rates", getCompletionRates);
router.get("/average-completion-times", getAverageCompletionTimes);
router.get("/instructor-performance", getInstructorPerformance);
router.get("/student/:studentId", getStudentSummary);
router.get("/students", getAllStudentsSummary);

export default router;
