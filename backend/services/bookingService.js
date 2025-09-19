import Booking from "../models/Booking.js";
import Instructor from "../models/Instructor.js";
import Vehicle from "../models/Vehicle.js";

// Create booking
export const createBooking = async (data) => {
  const { date, time, instructor, vehicle } = data;

  // Check conflicts
  const conflict = await Booking.findOne({
    date,
    time,
    $or: [{ instructor }, { vehicle }],
    status: "scheduled",
  });

  if (conflict) throw new Error("Instructor or vehicle already booked at this time.");

  const booking = new Booking(data);
  await booking.save();

  // Update statuses
  await Instructor.findByIdAndUpdate(instructor, { status: "unavailable" });
  await Vehicle.findByIdAndUpdate(vehicle, { status: "unavailable" });

  return booking;
};

// Get all bookings
export const getBookings = async () => {
  return await Booking.find()
    .populate("instructor", "name email phone")
    .populate("vehicle", "regNo model type status");
};

// Get booking by ID
export const getBookingById = async (id) => {
  return await Booking.findById(id)
    .populate("instructor", "name email phone")
    .populate("vehicle", "regNo model type status");
};

// Update booking (reschedule/change resources)
export const updateBooking = async (id, data) => {
  const booking = await Booking.findById(id);
  if (!booking) throw new Error("Booking not found");

  // Free old resources
  await Instructor.findByIdAndUpdate(booking.instructor, { status: "available" });
  await Vehicle.findByIdAndUpdate(booking.vehicle, { status: "available" });

  // Check conflicts
  const conflict = await Booking.findOne({
    date: data.date,
    time: data.time,
    $or: [{ instructor: data.instructor }, { vehicle: data.vehicle }],
    status: "scheduled",
    _id: { $ne: id },
  });

  if (conflict) throw new Error("Instructor or vehicle already booked at this time.");

  Object.assign(booking, data);
  await booking.save();

  // Update new statuses
  await Instructor.findByIdAndUpdate(data.instructor, { status: "unavailable" });
  await Vehicle.findByIdAndUpdate(data.vehicle, { status: "unavailable" });

  return booking;
};

// Cancel booking
export const cancelBooking = async (id) => {
  const booking = await Booking.findById(id);
  if (!booking) throw new Error("Booking not found");

  // Free resources
  await Instructor.findByIdAndUpdate(booking.instructor, { status: "available" });
  await Vehicle.findByIdAndUpdate(booking.vehicle, { status: "available" });

  booking.status = "canceled";
  await booking.save();
};

// Check availability
export const checkAvailability = async (date, time) => {
  const booked = await Booking.find({ date, time, status: "scheduled" });

  const bookedInstructors = booked.map((b) => b.instructor.toString());
  const bookedVehicles = booked.map((b) => b.vehicle.toString());

  const freeInstructors = await Instructor.find({
    _id: { $nin: bookedInstructors },
    status: "available",
  });

  const freeVehicles = await Vehicle.find({
    _id: { $nin: bookedVehicles },
    status: "available",
  });

  return { freeInstructors, freeVehicles };
};
