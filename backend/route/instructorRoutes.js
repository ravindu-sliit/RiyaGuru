import express from "express";
import * as instructorController from "../controllers/instructorController.js";

const router = express.Router();

// ✅ Availability by date/time
router.get("/availability/check", instructorController.getAvailableInstructors);

// ✅ Status-based check (⚡ must come before "/:id")
router.get("/status/:status", instructorController.getInstructorsByStatus);

// CRUD
router.post("/", instructorController.createInstructor);
router.get("/", instructorController.getInstructors);
router.get("/:id", instructorController.getInstructorById);
router.put("/:id", instructorController.updateInstructor);
router.delete("/:id", instructorController.deleteInstructor);

export default router;
