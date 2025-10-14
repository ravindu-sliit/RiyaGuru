import express from "express";
import { generateAndEmailStudentReport } from "../controllers/studentReportController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Protected: students can request their own report; admins/instructors may request for others when authorized
router.post("/student/progress", protect, generateAndEmailStudentReport);

export default router;
