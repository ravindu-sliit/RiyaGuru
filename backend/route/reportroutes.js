// routes/reportRoutes.js
import express from "express";
import {
  generateReport,
  getAllReports,
  getMaintenanceAnalytics,
} from "../controllers/reportcontroller.js";

// ✅ Import the renamed PDF controller
import { generateMaintenancePDF } from "../controllers/maintenancepdfController.js";

const router = express.Router();

 //📌 Reports CRUD Routes
 
router.post("/", generateReport);   // Create new report entry
router.get("/", getAllReports);     // Fetch all reports

 //📊 Analytics Routes
 
router.get("/analytics/maintenance", getMaintenanceAnalytics); // Maintenance analytics by service type


 //📄 PDF Report Routes
 
router.get("/maintenance/pdf", generateMaintenancePDF); // Generate maintenance PDF

export default router;
