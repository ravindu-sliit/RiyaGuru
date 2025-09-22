import express from "express";
import {
  generateReport,
  getAllReports,
  getMaintenanceAnalytics,
} from "../controllers/reportcontroller.js";

import { generateMaintenancePDF } from "../controllers/pdfController.js"; //  import PDF controller

const router = express.Router();

// Reports CRUD
router.post("/", generateReport);
router.get("/", getAllReports);

// Analytics
router.get("/analytics/maintenance", getMaintenanceAnalytics);

// PDF Report
router.get("/maintenance/pdf", generateMaintenancePDF); // new route

export default router;
