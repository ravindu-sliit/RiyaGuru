import express from "express";
import * as vehicleController from "../controllers/vehicleController.js";

const router = express.Router();

// Availability (⚡ keep before `/:id` to avoid conflict)
router.get("/availability/check", vehicleController.getAvailableVehicles);

// ✅ Filter by status (available / unavailable / maintenance)
router.get("/status/:status", vehicleController.getVehiclesByStatus);

// CRUD routes
router.post("/", vehicleController.createVehicle);
router.get("/", vehicleController.getVehicles);
router.get("/:id", vehicleController.getVehicleById);
router.put("/:id", vehicleController.updateVehicle);
router.delete("/:id", vehicleController.deleteVehicle);

export default router;
