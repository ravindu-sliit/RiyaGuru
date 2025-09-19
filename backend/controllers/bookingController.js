import Booking from "../models/Booking.js";
import Instructor from "../models/Instructor.js";
import Vehicle from "../models/Vehicle.js";
import Counter from "../models/Counter.js";
import Student from "../models/StudentModel.js"; // ✅ use Student model instead of User
import { generateBookingPDF } from "../utils/pdfUtils.js"; 

// Auto increment Booking ID
const getNextBookingId = async () => {
  const counter = await Counter.findOneAndUpdate(
    { id: "bookingId" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  const seqNum = counter.seq.toString().padStart(3, "0");
  return `B${seqNum}`;
};

// ✅ Create Booking
export const createBooking = async (req, res) => {
  try {
    const { instructorId, regNo, date, time } = req.body;
    const userId = req.user.userId; // from login token (example: S003)

    // ✅ Fetch student from Student table
    const student = await Student.findOne({ studentId: userId });
    if (!student) return res.status(404).json({ message: "Student not found" });

    // Fetch instructor
    const instructor = await Instructor.findOne({ instructorId });
    if (!instructor) return res.status(404).json({ message: "Instructor not found" });

    // Fetch vehicle
    const vehicle = await Vehicle.findOne({ regNo });
    if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });

    // Prevent double booking
    const existing = await Booking.findOne({ instructorId, regNo, date, time });
    if (existing) return res.status(400).json({ message: "Already booked at this time" });

    // Generate booking ID
    const bookingId = await getNextBookingId();

    // Save booking
    const booking = new Booking({
      bookingId,
      userId, // this is Student.studentId
      instructor: instructor._id,
      instructorId,
      vehicle: vehicle._id,
      regNo,
      date,
      time
    });
    await booking.save();

    // Update instructor & vehicle availability
    instructor.status = "unavailable";
    await instructor.save();
    vehicle.status = "unavailable";
    await vehicle.save();

    // ✅ Generate PDF receipt with student details
    const pdfPath = await generateBookingPDF(booking, student, instructor, vehicle);

    res.status(201).json({
      message: "Booking created successfully",
      booking,
      pdf: `http://localhost:5000/${pdfPath}`
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get All Bookings
export const getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("instructor", "instructorId name email phone")
      .populate("vehicle", "regNo model brand type");
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get Booking by ID
export const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("instructor", "instructorId name email phone specialization")
      .populate("vehicle", "regNo brand model type fuelType year");

    if (!booking) return res.status(404).json({ message: "Booking not found" });
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Update Booking
export const updateBooking = async (req, res) => {
  try {
    const { instructorId, regNo, date, time } = req.body;
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    // Restore old availability
    await Instructor.findByIdAndUpdate(booking.instructor, { status: "available" });
    await Vehicle.findByIdAndUpdate(booking.vehicle, { status: "available" });

    // Assign new instructor & vehicle
    const instructor = await Instructor.findOne({ instructorId });
    if (!instructor) return res.status(404).json({ message: "New instructor not found" });

    const vehicle = await Vehicle.findOne({ regNo });
    if (!vehicle) return res.status(404).json({ message: "New vehicle not found" });

    booking.instructor = instructor._id;
    booking.instructorId = instructorId;
    booking.vehicle = vehicle._id;
    booking.regNo = regNo;
    booking.date = date;
    booking.time = time;

    await booking.save();

    instructor.status = "unavailable";
    await instructor.save();
    vehicle.status = "unavailable";
    await vehicle.save();

    res.json({ message: "Booking updated successfully", booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Delete Booking
export const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    // Restore availability
    await Instructor.findByIdAndUpdate(booking.instructor, { status: "available" });
    await Vehicle.findByIdAndUpdate(booking.vehicle, { status: "available" });

    await Booking.findByIdAndDelete(req.params.id);

    res.json({ message: "Booking deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Check availability of instructors & vehicles
export const checkAvailability = async (req, res) => {
  try {
    const { date, time } = req.query;

    if (!date || !time) {
      return res.status(400).json({ message: "Date and time are required" });
    }

    // Get already booked instructors & vehicles for given slot
    const booked = await Booking.find({ date, time });

    const bookedInstructors = booked.map(b => b.instructorId);
    const bookedVehicles = booked.map(b => b.regNo);

    // Get available instructors (status = available and not already booked)
    const availableInstructors = await Instructor.find({
      instructorId: { $nin: bookedInstructors },
      status: "available"
    });

    // Get available vehicles (status = available and not already booked)
    const availableVehicles = await Vehicle.find({
      regNo: { $nin: bookedVehicles },
      status: "available"
    });

    res.json({
      date,
      time,
      availableInstructors,
      availableVehicles
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
