import * as bookingService from "../services/bookingService.js";

// ✅ Helper: Format booking objects consistently
const formatBooking = (b) => ({
  bookingId: b.bookingId, // main identifier now
  studentId: b.studentId,
  courseName: b.courseName,
  instructorName: b.instructorName,
  vehicleRegNo: b.vehicleRegNo,
  date: b.date,
  time: b.time,
  status: b.status,
  createdAt: b.createdAt,
  updatedAt: b.updatedAt,
});

// ✅ Create booking
export const createBooking = async (req, res) => {
  try {
    const { booking, pdfPath } = await bookingService.createBooking(req.body);

    res.status(201).json({
      message: "Booking created successfully",
      booking: formatBooking(booking),
      receipt: `${req.protocol}://${req.get("host")}/${pdfPath}`,
    });
  } catch (error) {
    console.error("Error in createBooking:", error);
    res.status(400).json({ message: error.message });
  }
};

// ✅ Get all bookings
export const getBookings = async (req, res) => {
  try {
    const bookings = await bookingService.getBookings();
    res.json({ bookings: bookings.map(formatBooking) });
  } catch (error) {
    console.error("Error in getBookings:", error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get booking by bookingId
export const getBookingById = async (req, res) => {
  try {
    const booking = await bookingService.getBookingById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (req.user?.role === "Student" && booking.studentId !== req.user.userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    res.json({ booking: formatBooking(booking) });
  } catch (error) {
    console.error("Error in getBookingById:", error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get logged-in instructor's bookings
export const getMyBookings = async (req, res) => {
  try {
    // 1. Find instructor by their userId
    const instructor = await Instructor.findOne({ instructorId: req.user.userId });
    if (!instructor) {
      return res.status(404).json({ message: "Instructor not found" });
    }

    // 2. Find bookings by instructor name (since booking table uses name)
    const bookings = await Booking.find({ instructorName: instructor.name });

    res.json({ bookings });
  } catch (err) {
    console.error("Error fetching instructor bookings:", err);
    res.status(500).json({ message: "Error fetching instructor bookings" });
  }
};

// ✅ Update booking status
export const updateBookingStatus = async (req, res) => {
  try {
    const updated = await bookingService.updateBookingStatus(
      req.params.id,
      req.body.status
    );
    if (!updated) return res.status(404).json({ message: "Booking not found" });
    res.json({
      message: "Booking status updated",
      booking: formatBooking(updated),
    });
  } catch (error) {
    console.error("Error in updateBookingStatus:", error);
    res.status(400).json({ message: error.message });
  }
};

// ✅ Delete booking
export const deleteBooking = async (req, res) => {
  try {
    const deleted = await bookingService.deleteBooking(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Booking not found" });
    res.json({ message: "Booking deleted successfully" });
  } catch (error) {
    console.error("Error in deleteBooking:", error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ Update booking
export const updateBooking = async (req, res) => {
  try {
    const booking = await bookingService.updateBooking(
      req.params.id,
      req.body
    );
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    res.json({
      message: "Booking updated successfully",
      booking: formatBooking(booking),
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

