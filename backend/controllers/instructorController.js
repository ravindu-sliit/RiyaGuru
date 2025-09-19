import Instructor from "../models/Instructor.js";
import User from "../models/UserModel.js";
import Counter from "../models/Counter.js";
import bcrypt from "bcryptjs";
import * as instructorService from "../services/instructorService.js";

// 🔹 Generate next InstructorID (A001, A002…)
const getNextInstructorId = async () => {
  const counter = await Counter.findOneAndUpdate(
    { id: "instructorId" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  const seqNum = counter.seq.toString().padStart(3, "0");
  return `A${seqNum}`;
};

// ✅ Create Instructor (also creates linked User)
export const createInstructor = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      address,
      licenseNumber,
      experienceYears,
      specialization,
      password,
      availability
    } = req.body;

    const instructorId = await getNextInstructorId();
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user record
    const user = new User({
      userId: instructorId,
      email,
      password: hashedPassword,
      role: "Instructor"
    });
    await user.save();

    // Create instructor record
    const instructor = new Instructor({
      instructorId,
      name,
      email,
      phone,
      address,
      licenseNumber,
      experienceYears,
      specialization,
      availability,
      userId: user._id
    });
    await instructor.save();

    user.instructorId = instructor._id;
    await user.save();

    res.status(201).json({
      message: "Instructor created successfully",
      instructor,
      user
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ✅ Get all instructors
export const getInstructors = async (req, res) => {
  try {
    const instructors = await instructorService.getInstructors();
    res.json(instructors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get instructor by ID
export const getInstructorById = async (req, res) => {
  try {
    const instructor = await instructorService.getInstructorById(req.params.id);
    if (!instructor) return res.status(404).json({ message: "Instructor not found" });
    res.json(instructor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Update instructor
export const updateInstructor = async (req, res) => {
  try {
    const updated = await instructorService.updateInstructor(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: "Instructor not found" });
    res.json({ message: "Instructor updated successfully", updated });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ✅ Delete instructor
export const deleteInstructor = async (req, res) => {
  try {
    const deleted = await instructorService.deleteInstructor(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Instructor not found" });

    await User.findByIdAndDelete(deleted.userId);
    res.json({ message: "Instructor and linked User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get available instructors by date/time (ignores status)
export const getAvailableInstructors = async (req, res) => {
  try {
    const { date, time } = req.query;
    const available = await instructorService.getAvailableInstructors(date, time);
    res.json(available);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get instructors only by status
export const getInstructorsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const validStatuses = ["available", "unavailable"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const instructors = await instructorService.filterInstructorsByStatus(status);
    res.json(instructors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
