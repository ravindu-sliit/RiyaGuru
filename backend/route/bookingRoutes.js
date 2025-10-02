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

// ✅ Create booking
router.post("/", protect, createBooking);

// ✅ Logged-in student's bookings
router.get("/my", protect, getMyBookings);

// ✅ Logged-in student's courses
router.get("/my-courses", protect, getMyCourses);

// ✅ Get all bookings (admin only)
router.get("/", protect, getBookings);

// ✅ Update booking (date/time/etc.)
router.put("/:id", protect, updateBooking);

// ✅ Update booking status (⚠️ must come BEFORE getById)
router.put("/:id/status", protect, updateBookingStatus);

// ✅ Delete booking
router.delete("/:id", protect, deleteBooking);

// ✅ Send email for booking receipt
router.post("/:id/send-email", protect, sendBookingEmailById);

// ✅ Get booking by ID (⚠️ must stay last to avoid conflicts)
router.get("/:id", protect, getBookingById);

export default router;
