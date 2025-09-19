import express from "express";
import {
  createBooking,
  getBookings,
  getBookingById,
  updateBooking,
  deleteBooking
} from "../controllers/bookingController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * @route   POST /api/bookings
 * @desc    Create booking (with PDF receipt) - Requires login
 */
router.post("/", protect, createBooking);

/**
 * @route   GET /api/bookings
 * @desc    Get all bookings - Requires login
 */
router.get("/", protect, getBookings);

/**
 * @route   GET /api/bookings/:id
 * @desc    Get booking by ID - Requires login
 */
router.get("/:id", protect, getBookingById);

/**
 * @route   PUT /api/bookings/:id
 * @desc    Update booking - Requires login
 */
router.put("/:id", protect, updateBooking);

/**
 * @route   DELETE /api/bookings/:id
 * @desc    Delete booking - Requires login
 */
router.delete("/:id", protect, deleteBooking);

export default router;
