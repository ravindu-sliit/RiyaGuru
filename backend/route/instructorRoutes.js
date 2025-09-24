// backend/routes/instructorRoutes.js
import express from "express";
import * as instructorController from "../controllers/instructorController.js";
import upload from "../middleware/uploadMiddleware.js";
import { protect } from "../middleware/authMiddleware.js"; // ✅ named export

const router = express.Router();

// ✅ Availability by date/time
router.get("/availability/check", instructorController.getAvailableInstructors);

// ✅ Status filter
router.get("/status/:status", instructorController.getInstructorsByStatus);

// ✅ Create instructor (with photo upload)
router.post("/", upload.single("image"), instructorController.createInstructor);

// ✅ Logged-in instructor profile
router.get("/me", protect, instructorController.getMyProfile);

// ✅ Logged-in instructor bookings
router.get("/me/bookings", protect, instructorController.getInstructorBookings);

// ✅ CRUD
router.get("/", instructorController.getInstructors);
router.get("/:id", instructorController.getInstructorById);
router.put("/:id", upload.single("image"), instructorController.updateInstructor);
router.delete("/:id", instructorController.deleteInstructor);

export default router;
