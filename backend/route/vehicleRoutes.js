import express from "express";
import * as vehicleController from "../controllers/vehicleController.js";
import upload from "../middleware/uploadMiddleware.js"; // ✅ multer

const router = express.Router();

// Availability (⚡ keep before `/:id` to avoid conflict)
router.get("/availability/check", vehicleController.getAvailableVehicles);

// ✅ Filter by status
router.get("/status/:status", vehicleController.getVehiclesByStatus);

// CRUD routes
router.post("/", upload.single("image"), vehicleController.createVehicle); // ✅ with image
router.get("/", vehicleController.getVehicles);
router.get("/:id", vehicleController.getVehicleById);
router.put("/:id", upload.single("image"), vehicleController.updateVehicle); // ✅ with image
router.delete("/:id", vehicleController.deleteVehicle);

export default router;
