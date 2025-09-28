// route/vehicleRoutes.js
import express from "express";
import * as vehicleController from "../controllers/vehicleController.js";
import vehicleUpload from "../middleware/vehicleuploads.js"; // ✅ vehicle-specific upload

const router = express.Router();

// ✅ Availability check (keep before /:id to avoid conflict)
router.get("/availability/check", vehicleController.getAvailableVehicles);

// ✅ Filter by status
router.get("/status/:status", vehicleController.getVehiclesByStatus);

// ✅ CRUD routes
router.get("/", vehicleController.getVehicles);
router.get("/:id", vehicleController.getVehicleById);
router.delete("/:id", vehicleController.deleteVehicle);

// ✅ Create & Update with vehicle image upload
router.post("/", vehicleUpload.single("image"), vehicleController.createVehicle);
router.put("/:id", vehicleUpload.single("image"), vehicleController.updateVehicle);

export default router;
