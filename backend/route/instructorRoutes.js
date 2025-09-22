// backend/routes/instructorRoutes.js
import express from "express";
import * as instructorController from "../controllers/instructorController.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Availability by date/time
router.get("/availability/check", instructorController.getAvailableInstructors);

// Status filter
router.get("/status/:status", instructorController.getInstructorsByStatus);

// Create instructor (with photo upload)
router.post("/", upload.single("image"), instructorController.createInstructor);

// CRUD
router.get("/", instructorController.getInstructors);
router.get("/:id", instructorController.getInstructorById);
router.put("/:id", upload.single("image"), instructorController.updateInstructor);
router.delete("/:id", instructorController.deleteInstructor);

export default router;
