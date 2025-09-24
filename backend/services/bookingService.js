import Booking from "../models/Booking.js";

// ✅ Create booking
export const createBooking = async (data) => {
  const booking = new Booking(data);
  const saved = await booking.save();

  // Example: generate receipt path
  const pdfPath = `receipts/${saved.bookingId}.pdf`;
  return { booking: saved, pdfPath };
};

// ✅ Get all bookings
export const getBookings = async () => {
  return await Booking.find().sort({ createdAt: -1 });
};

// ✅ Get booking by bookingId
export const getBookingById = async (bookingId) => {
  return await Booking.findOne({ bookingId });
};

// ✅ Get bookings by studentId
export const getBookingsByStudent = async (studentId) => {
  return await Booking.find({ studentId }).sort({ createdAt: -1 });
};

// ✅ Update booking status by bookingId
export const updateBookingStatus = async (bookingId, status) => {
  return await Booking.findOneAndUpdate(
    { bookingId },
    { status },
    { new: true }
  );
};

// ✅ Delete booking by bookingId
export const deleteBooking = async (bookingId) => {
  return await Booking.findOneAndDelete({ bookingId });
};

// ✅ Update booking by bookingId
export const updateBooking = async (bookingId, data) => {
  return await Booking.findOneAndUpdate(
    { bookingId },
    data,
    { new: true }
  );
};
