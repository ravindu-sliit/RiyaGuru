import Booking from "../models/Booking.js";
import Instructor from "../models/Instructor.js";
import Vehicle from "../models/Vehicle.js";
import Counter from "../models/Counter.js";
import Student from "../models/StudentModel.js";
import StudentCourse from "../models/StudentCourse.js";
import { generateBookingPDF } from "../utils/pdfUtils.js";

// 🔹 Auto increment Booking ID
const getNextBookingId = async () => {
  const counter = await Counter.findOneAndUpdate(
    { id: "bookingId" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return `B${counter.seq.toString().padStart(3, "0")}`;
};

// ✅ Create Booking
export const createBooking = async (req, res) => {
  try {
    const { instructorId, regNo, date, time, course } = req.body;
    const userId = req.user.userId; // e.g., "S003"
    console.log(`User ID ${userId}`);
    // 🔹 Fetch student
    const student = await Student.findOne({ studentId: userId });
    if (!student) return res.status(404).json({ message: "Student not found" });

    // 🔹 Verify student is enrolled in requested course (string match)
    const enrolled = await StudentCourse.findOne({
      student_id: student.studentId, // use studentId string
      course_id: course, // e.g., "Motorcycle"
      status: "Active",
    });

    if (!enrolled) {
      return res
        .status(403)
        .json({ message: `You are not enrolled in ${course}` });
    }

    // 🔹 Fetch instructor
    const instructor = await Instructor.findOne({ instructorId });
    if (!instructor)
      return res.status(404).json({ message: "Instructor not found" });

    // 🔹 Fetch vehicle
    const vehicle = await Vehicle.findOne({ regNo });
    if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });

    // 🔹 Prevent double booking
    const existing = await Booking.findOne({ instructorId, regNo, date, time });
    if (existing)
      return res.status(400).json({ message: "Already booked at this time" });

    // 🔹 Generate booking ID
    const bookingId = await getNextBookingId();

    // 🔹 Save booking
    const booking = new Booking({
      bookingId,
      userId,
      student: student._id,
      instructor: instructor._id,
      instructorId,
      vehicle: vehicle._id,
      regNo,
      course, // store course name string
      date,
      time,
      status: "booked",
    });
    await booking.save();

    // THIS PART changes vehicle (and instructor) status
    instructor.status = "Active";
    await instructor.save();

    vehicle.status = "Active"; //vehicle status is updated
    await vehicle.save();

    // 🔹 Generate PDF receipt
    const pdfPath = await generateBookingPDF(
      booking,
      student,
      instructor,
      vehicle
    );

    res.status(201).json({
      message: "Booking created successfully",
      booking,
      pdf: `http://localhost:5001/${pdfPath}`,
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
      .populate("vehicle", "regNo model brand type");
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
      .populate("vehicle", "regNo brand model type fuelType year");

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

    // 🔹 Fetch instructor
    const instructor = await Instructor.findOne({ instructorId });
    if (!instructor)
      return res.status(404).json({ message: "New instructor not found" });

    // 🔹 Fetch vehicle
    const vehicle = await Vehicle.findOne({ regNo });
    if (!vehicle)
      return res.status(404).json({ message: "New vehicle not found" });

    // 🔹 Check enrollment again
    const student = await Student.findOne({ studentId: booking.userId });
    const enrolled = await StudentCourse.findOne({
      student_id: student.studentId,
      course_id: course,
      status: "Active",
    });

    if (!enrolled) {
      return res
        .status(403)
        .json({ message: `You are not enrolled in ${course}` });
    }

    // 🔹 Prevent double booking
    const conflict = await Booking.findOne({
      date,
      time,
      $or: [{ instructorId }, { regNo }],
      _id: { $ne: booking._id },
    });
    if (conflict)
      return res.status(400).json({ message: "Already booked at this time" });

    booking.instructor = instructor._id;
    booking.instructorId = instructorId;
    booking.vehicle = vehicle._id;
    booking.regNo = regNo;
    booking.course = course; // store course name string
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

// ✅ Check availability (only enrolled courses)
export const checkAvailability = async (req, res) => {
  try {
    const { date, time } = req.query;
    const userId = req.user.userId;

    if (!date || !time) {
      return res.status(400).json({ message: "Date and time are required" });
    }

    const student = await Student.findOne({ studentId: userId });
    if (!student) return res.status(404).json({ message: "Student not found" });

    // 🔹 Get enrolled courses (course_id are names: "Car", "Motorcycle")
    const enrollments = await StudentCourse.find({
      student_id: student.studentId,
      status: "Active",
    });

    const allowedTypes = enrollments.map((e) => e.course_id);

    const booked = await Booking.find({ date, time, status: "booked" });
    const bookedInstructors = booked.map((b) => b.instructorId);
    const bookedVehicles = booked.map((b) => b.regNo);

    const availableInstructors = await Instructor.find({
      instructorId: { $nin: bookedInstructors },
    });

    const availableVehicles = await Vehicle.find({
      regNo: { $nin: bookedVehicles },
      type: { $in: allowedTypes }, // only vehicles matching enrolled course names
    });

    res.json({
      date,
      time,
      allowedTypes,
      availableInstructors,
      availableVehicles,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get logged-in student’s courses
export const getMyCourses = async (req, res) => {
  try {
    const userId = req.user.userId;
    const student = await Student.findOne({ studentId: userId });
    if (!student) return res.status(404).json({ message: "Student not found" });

    const enrollments = await StudentCourse.find({
      student_id: student.studentId,
      status: "Active",
    });

    const myCourses = enrollments.map((en) => ({
      name: en.course_id, // course name string
      enrollmentDate: en.enrollmentDate,
      status: en.status,
    }));

    res.json(myCourses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body; // e.g., "completed", "cancelled"
    const booking = await Booking.findById(req.params.id)
      .populate("instructor")
      .populate("vehicle");

    if (!booking) return res.status(404).json({ message: "Booking not found" });

    // Allowed statuses
    const allowedStatuses = ["booked", "completed", "cancelled"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Allowed: ${allowedStatuses.join(", ")}`,
      });
    }

    booking.status = status;
    await booking.save();

    // 🔹 If completed/cancelled, free instructor & vehicle
    if (["completed", "cancelled"].includes(status)) {
      if (booking.instructor) {
        booking.instructor.status = "Available";
        await booking.instructor.save();
      }
      if (booking.vehicle) {
        booking.vehicle.status = "Available";
        await booking.vehicle.save();
      }
    }

    res.json({
      message: `Booking status updated to '${status}'`,
      booking,
    });
  } catch (error) {
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