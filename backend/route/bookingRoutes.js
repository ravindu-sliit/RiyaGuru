import express from "express";
import {
  createBooking,
  getBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
  checkAvailability,
  getMyCourses,
} from "../controllers/bookingController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/my-courses", protect, getMyCourses);
router.get("/availability/check", protect, checkAvailability);

router.post("/", protect, createBooking);
router.get("/", protect, getBookings);
router.get("/:id", protect, getBookingById);
router.put("/:id", protect, updateBooking);
router.delete("/:id", protect, deleteBooking);

export default router;
