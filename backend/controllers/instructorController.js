// backend/controllers/instructorController.js
import Instructor from "../models/Instructor.js";
import User from "../models/UserModel.js";
import Counter from "../models/Counter.js";
import bcrypt from "bcryptjs";
import * as instructorService from "../services/instructorService.js";
import fs from "fs";
import path from "path";
import Booking from "../models/Booking.js";

// 🔹 Generate next InstructorID (I001, I002…)
const getNextInstructorId = async () => {
  const counter = await Counter.findOneAndUpdate(
    { id: "instructorId" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  const seqNum = counter.seq.toString().padStart(3, "0");
  return `I${seqNum}`;
};

// ✅ Create Instructor (with linked User and photo upload)
export const createInstructor = async (req, res) => {
  try {
    let {
      name,
      email,
      phone,
      address,
      licenseNumber,
      experienceYears,
      specialization,
      password,
      availability,
    } = req.body;

    // 🔹 Parse availability if frontend sent JSON string
    if (availability && typeof availability === "string") {
      try {
        availability = JSON.parse(availability);
      } catch (err) {
        availability = [];
      }
    }

    // ✅ Handle uploaded image (always store relative URL)
    const image = req.file ? `/uploads/instructors/${req.file.filename}` : null;

    // ✅ Generate unique instructorId
    const instructorId = await getNextInstructorId();

    // ✅ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Create user record
    const user = new User({
      userId: instructorId,
      email,
      password: hashedPassword,
      role: "Instructor",
    });
    await user.save();

    // ✅ Create instructor record
    const instructor = new Instructor({
      instructorId,
      name,
      email,
      phone,
      address,
      licenseNumber,
      experienceYears,
      specialization,
      availability: availability || [],
      image,
      userId: user._id,
    });
    await instructor.save();

    // ✅ Link back to user
    user.instructorId = instructor._id;
    await user.save();

    res.status(201).json({
      message: "Instructor created successfully",
      instructor,
      user,
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

// ✅ Update instructor (supports updating photo & availability)
export const updateInstructor = async (req, res) => {
  try {
    let data = req.body;

    // Parse availability if sent as JSON string
    if (data.availability && typeof data.availability === "string") {
      try {
        data.availability = JSON.parse(data.availability);
      } catch {
        data.availability = [];
      }
    }

    // ✅ Update photo if new file uploaded (delete old image if exists)
    if (req.file) {
      const instructor = await Instructor.findById(req.params.id);
      if (instructor && instructor.image && instructor.image.startsWith("/uploads/")) {
        const oldPath = path.join(process.cwd(), instructor.image);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      data.image = `/uploads/instructors/${req.file.filename}`;
    }

    const updated = await instructorService.updateInstructor(req.params.id, data);
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

// ✅ Get available instructors by date/time
export const getAvailableInstructors = async (req, res) => {
  try {
    const { date, time } = req.query;
    const available = await instructorService.getAvailableInstructors(date, time);
    res.json(available);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get instructors by status
export const getInstructorsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const validStatuses = ["Not-Active", "Active"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    const instructors = await instructorService.filterInstructorsByStatus(status);
    res.json(instructors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get logged-in instructor profile
export const getMyProfile = async (req, res) => {
  try {
    const instructor = await Instructor.findOne({ instructorId: req.user.userId });
    if (!instructor) return res.status(404).json({ message: "Instructor not found" });

    res.json({ instructor });
  } catch (err) {
    res.status(500).json({ message: "Error fetching instructor profile", error: err.message });
  }
};

// ✅ Get logged-in instructor bookings
export const getInstructorBookings = async (req, res) => {
  try {
    // find instructor by ID from JWT
    const instructor = await Instructor.findOne({ instructorId: req.user.userId });
    if (!instructor) {
      return res.status(404).json({ message: "Instructor not found" });
    }

    // fetch bookings using instructor name (because Booking stores names)
    const bookings = await Booking.find({ instructorName: instructor.name });

    res.json({ bookings });
  } catch (err) {
    res.status(500).json({ message: "Error fetching bookings", error: err.message });
  }
};
