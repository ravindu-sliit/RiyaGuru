import Booking from "../models/Booking.js";
import Instructor from "../models/Instructor.js";
import Vehicle from "../models/Vehicle.js";

// Create booking
export const createBooking = async (data) => {
  const { date, time, instructor, vehicle } = data;

  // Only check conflicts by date & time
  const conflict = await Booking.findOne({
    date,
    time,
    $or: [{ instructor }, { vehicle }],
    status: "booked",
  });

  if (conflict) throw new Error("Instructor or vehicle already booked at this time.");

  const booking = new Booking(data);
  await booking.save();
  return booking;
};

// Get all bookings
export const getBookings = async () => {
  return await Booking.find()
    .populate("instructor", "name email phone")
    .populate("vehicle", "regNo model type")
    .populate("course", "name");
};

// Get booking by ID
export const getBookingById = async (id) => {
  return await Booking.findById(id)
    .populate("instructor", "name email phone")
    .populate("vehicle", "regNo model type")
    .populate("course", "name");
};

// Update booking
export const updateBooking = async (id, data) => {
  const booking = await Booking.findById(id);
  if (!booking) throw new Error("Booking not found");

  const conflict = await Booking.findOne({
    date: data.date,
    time: data.time,
    $or: [{ instructor: data.instructor }, { vehicle: data.vehicle }],
    status: "booked",
    _id: { $ne: id },
  });

  if (conflict) throw new Error("Instructor or vehicle already booked at this time.");

  Object.assign(booking, data);
  await booking.save();
  return booking;
};

// Cancel booking
export const cancelBooking = async (id) => {
  const booking = await Booking.findById(id);
  if (!booking) throw new Error("Booking not found");

  booking.status = "cancelled";
  await booking.save();
};

// Check availability (ignore status)
export const checkAvailability = async (date, time) => {
  const booked = await Booking.find({ date, time, status: "booked" });

  const bookedInstructors = booked.map((b) => b.instructor.toString());
  const bookedVehicles = booked.map((b) => b.vehicle.toString());

  const freeInstructors = await Instructor.find({
    _id: { $nin: bookedInstructors },
  });

  const freeVehicles = await Vehicle.find({
    _id: { $nin: bookedVehicles },
  });

  return { freeInstructors, freeVehicles };
};
