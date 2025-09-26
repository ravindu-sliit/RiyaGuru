import express from "express";
import {
  createMaintenance,
  getAllMaintenance,
  getMaintenanceById,
  updateMaintenance,
  deleteMaintenance,
} from "../controllers/maintenancecontroller.js"; 

import { generateMaintenancePDF } from "../controllers/maintenancepdfController.js"; 

import {
  createMaintenanceValidator,
  updateMaintenanceValidator,
  maintenanceIdValidator,
} from "../validators/maintenanceValidator.js";

import validateRequest from "../middleware/validateRequest.js";

const router = express.Router();

//PDF route 
router.get("/pdf", generateMaintenancePDF);

// CRUD routes with validation
router.post("/", createMaintenanceValidator, validateRequest, createMaintenance);
router.get("/", getAllMaintenance);
router.get("/:id", maintenanceIdValidator, validateRequest, getMaintenanceById);
router.put("/:id", updateMaintenanceValidator, validateRequest, updateMaintenance);
router.delete("/:id", maintenanceIdValidator, validateRequest, deleteMaintenance);

export default router;
