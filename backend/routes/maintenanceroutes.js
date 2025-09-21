import express from "express";
import {
  createMaintenance,
  getAllMaintenance,
  getMaintenanceById,
  updateMaintenance,
  deleteMaintenance,
} from "../controllers/maintenancecontroller.js";

const router = express.Router();

// CRUD routes
router.post("/", createMaintenance);
router.get("/", getAllMaintenance);
router.get("/:id", getMaintenanceById);
router.put("/:id", updateMaintenance);
router.delete("/:id", deleteMaintenance);

export default router;
