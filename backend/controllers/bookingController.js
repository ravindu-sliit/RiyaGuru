import Booking from "../models/Booking.js";
import Instructor from "../models/Instructor.js";
import Vehicle from "../models/Vehicle.js";
import Counter from "../models/Counter.js";
import Student from "../models/StudentModel.js";
import StudentCourse from "../models/StudentCourse.js";
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
    const { instructorId, regNo, date, time, course } = req.body;
    const userId = req.user.userId; // e.g., S003

    // Fetch student
    const student = await Student.findOne({ studentId: userId });
    if (!student) return res.status(404).json({ message: "Student not found" });

    // ✅ Verify that student is enrolled in this course
    const enrolled = await StudentCourse.findOne({
      student_id: student._id,
      course_id: course,
      status: "Active",
    });
    if (!enrolled) {
      return res.status(403).json({ message: "You are not enrolled in this course" });
    }

    // Fetch instructor
    const instructor = await Instructor.findOne({ instructorId });
    if (!instructor) return res.status(404).json({ message: "Instructor not found" });

    // Fetch vehicle
    const vehicle = await Vehicle.findOne({ regNo });
    if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });

    // ✅ Prevent double booking (only date & time check)
    const existing = await Booking.findOne({ instructorId, regNo, date, time });
    if (existing) return res.status(400).json({ message: "Already booked at this time" });

    // Generate booking ID
    const bookingId = await getNextBookingId();

    // Save booking
    const booking = new Booking({
      bookingId,
      userId,
      student: student._id,
      instructor: instructor._id,
      instructorId,
      vehicle: vehicle._id,
      regNo,
      course,
      date,
      time,
      status: "booked",
    });
    await booking.save();

    // 🔴 THIS PART changes vehicle (and instructor) status
    instructor.status = "Active";
    await instructor.save();

    vehicle.status = "Active";   // <<---- HERE vehicle status is updated
    await vehicle.save();
    

    // Generate PDF receipt
    const pdfPath = await generateBookingPDF(booking, student, instructor, vehicle);

    res.status(201).json({
      message: "Booking created successfully",
      booking,
      pdf: `http://localhost:5000/${pdfPath}`,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get all bookings
export const getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("instructor", "instructorId name email phone")
      .populate("vehicle", "regNo model brand type")
      .populate("course", "name");
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get booking by ID
export const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("instructor", "instructorId name email phone specialization")
      .populate("vehicle", "regNo brand model type fuelType year")
      .populate("course", "name description");

    if (!booking) return res.status(404).json({ message: "Booking not found" });
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Update booking
export const updateBooking = async (req, res) => {
  try {
    const { instructorId, regNo, date, time, course } = req.body;
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    // Assign new instructor & vehicle
    const instructor = await Instructor.findOne({ instructorId });
    if (!instructor) return res.status(404).json({ message: "New instructor not found" });

    const vehicle = await Vehicle.findOne({ regNo });
    if (!vehicle) return res.status(404).json({ message: "New vehicle not found" });

    // ✅ Prevent double booking (ignore status, only date/time)
    const conflict = await Booking.findOne({
      date,
      time,
      $or: [{ instructorId }, { regNo }],
      _id: { $ne: booking._id },
    });
    if (conflict) return res.status(400).json({ message: "Already booked at this time" });

    booking.instructor = instructor._id;
    booking.instructorId = instructorId;
    booking.vehicle = vehicle._id;
    booking.regNo = regNo;
    booking.course = course;
    booking.date = date;
    booking.time = time;

    await booking.save();

    res.json({ message: "Booking updated successfully", booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Delete booking
export const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    await Booking.findByIdAndDelete(req.params.id);

    res.json({ message: "Booking deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Check availability (ONLY by date & time)
export const checkAvailability = async (req, res) => {
  try {
    const { date, time } = req.query;

    if (!date || !time) {
      return res.status(400).json({ message: "Date and time are required" });
    }

    const booked = await Booking.find({ date, time, status: "booked" });

    const bookedInstructors = booked.map((b) => b.instructorId);
    const bookedVehicles = booked.map((b) => b.regNo);

    const availableInstructors = await Instructor.find({
      instructorId: { $nin: bookedInstructors },
    });

    const availableVehicles = await Vehicle.find({
      regNo: { $nin: bookedVehicles },
    });

    res.json({ date, time, availableInstructors, availableVehicles });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get logged-in student’s courses
export const getMyCourses = async (req, res) => {
  try {
    const userId = req.user.userId; // e.g., S003
    const student = await Student.findOne({ studentId: userId });
    if (!student) return res.status(404).json({ message: "Student not found" });

    const enrollments = await StudentCourse.find({
      student_id: student._id,
      status: "Active",
    }).populate("course_id");

    const myCourses = enrollments.map((en) => ({
      _id: en.course_id._id,
      name: en.course_id.name,
      description: en.course_id.description,
      price: en.course_id.price,
      duration: en.course_id.duration,
      totalLessons: en.course_id.totalLessons,
      enrollmentDate: en.enrollmentDate,
      status: en.status,
    }));

    res.json(myCourses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
