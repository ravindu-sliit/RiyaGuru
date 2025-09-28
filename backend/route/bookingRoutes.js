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
  sendBookingEmailById,
} from "../controllers/bookingController.js";

const router = express.Router();

// Create booking
router.post("/", protect, createBooking);

// Logged-in student's bookings
router.get("/my", protect, getMyBookings);

// Logged-in student's courses
router.get("/my-courses", protect, getMyCourses);

// Get all bookings
router.get("/", protect, getBookings);

// Get booking by ID (⚠️ keep last to avoid conflicts)
router.get("/:id", protect, getBookingById);

// Update booking (date/time/etc.)
router.put("/:id", protect, updateBooking);

// Update booking status
router.put("/:id/status", protect, updateBookingStatus);

// Delete booking
router.delete("/:id", protect, deleteBooking);

// ✅ Send email for booking receipt
router.post("/:id/send-email", protect, sendBookingEmailById);

export default router;
