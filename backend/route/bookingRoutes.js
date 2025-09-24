import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createBooking,
  getBookings,
  getBookingById,
  getMyBookings,
  updateBooking,
  updateBookingStatus,
  getMyCourses,
  deleteBooking,
} from "../controllers/bookingController.js";

const router = express.Router();

// Create booking
router.post("/", protect, createBooking);

// Get logged-in user's bookings
router.get("/my", protect, getMyBookings);

// Get all bookings
router.get("/", protect, getBookings);

// Get booking by ID
router.get("/:id", protect, getBookingById);

// ✅ Update booking (date/time/etc.)
router.put("/:id", protect, updateBooking);

// Update booking status
router.put("/:id/status", protect, updateBookingStatus);

// Delete booking
router.delete("/:id", protect, deleteBooking);

router.put("/:id", protect, updateBooking);

router.get("/my-courses", protect, getMyCourses);

export default router;
