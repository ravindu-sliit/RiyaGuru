import Student from "../models/StudentModel.js";
import Counter from "../models/Counter.js";
import User from "../models/UserModel.js";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const profPicsDir = path.join(__dirname, "..", "uploads", "studentProfPics");

function unlinkIfExists(filename) {
  if (!filename) return;
  const p = path.join(profPicsDir, filename);
  try {
    if (fs.existsSync(p)) fs.unlinkSync(p);
  } catch (e) {
    console.warn("Failed to delete file:", p, e?.message);
  }
}

// Add a new student (profile pic optional)
export const addStudent = async (req, res) => {
  const { full_name, nic, phone, birthyear, gender, address, email, password } = req.body;

  if (!email || !password) {
    // cleanup uploaded pic if any
    unlinkIfExists(req?.file?.filename);
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    // 1️⃣ Get next student sequence
    const counter = await Counter.findOneAndUpdate(
      { _id: "studentId" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    const studentId = `S${String(counter.seq).padStart(3, "0")}`; // S001, S002...

    // 2️⃣ Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3️⃣ Create student (store profilePicPath if uploaded)
    const profilePicPath = req?.file?.filename || null;

    const student = new Student({
      studentId,
      full_name,
      nic,
      phone,
      birthyear,
      gender,
      address,
      email,
      profilePicPath,
    });
    await student.save();

    // 4️⃣ Create user entry automatically
    const user = new User({
      userId: studentId,
      name: full_name,
      role: "Student",
      email,
      password: hashedPassword,
    });
    await user.save();

    // Build public URL if pic exists
    const profilePicUrl = profilePicPath
      ? `${req.protocol}://${req.get("host")}/uploads/studentProfPics/${profilePicPath}`
      : null;

    res.status(201).json({
      student: { ...student.toObject(), profilePicUrl },
      user,
    });
  } catch (err) {
    // in case of error, cleanup uploaded pic
    unlinkIfExists(req?.file?.filename);
    console.error("Error adding student:", err);
    res.status(500).json({ message: "Server error while adding student" });
  }
};

// Get all students
export const getAllStudents = async (req, res) => {
  try {
    const students = await Student.find();
    if (!students || students.length === 0) {
      return res.status(404).json({ message: "No students found" });
    }

    const data = students.map((s) => ({
      ...s.toObject(),
      profilePicUrl: s.profilePicPath
        ? `${req.protocol}://${req.get("host")}/uploads/studentProfPics/${s.profilePicPath}`
        : null,
    }));

    res.status(200).json({ students: data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while fetching students" });
  }
};

// Get student by ID
export const getStudentById = async (req, res) => {
  try {
    const student = await Student.findOne({ studentId: req.params.id });
    if (!student) return res.status(404).json({ message: "Student not found" });

    const profilePicUrl = student.profilePicPath
      ? `${req.protocol}://${req.get("host")}/uploads/studentProfPics/${student.profilePicPath}`
      : null;

    res.status(200).json({ student: { ...student.toObject(), profilePicUrl } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while fetching student" });
  }
};

// Update student (can also replace/add profile pic)
export const updateStudent = async (req, res) => {
  const { full_name, nic, phone, birthyear, gender, address, email, password } = req.body;

  try {
    // Hash password if provided (for User only; Student.password is not required)
    let hashedPassword;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    // Find current student
    const current = await Student.findOne({ studentId: req.params.id });
    if (!current) {
      // cleanup new upload if any
      unlinkIfExists(req?.file?.filename);
      return res.status(404).json({ message: "Student not found" });
    }

    // If a new pic is uploaded, delete the old file (if existed)
    let profilePicPath = current.profilePicPath;
    if (req?.file?.filename) {
      if (profilePicPath) unlinkIfExists(profilePicPath);
      profilePicPath = req.file.filename;
    }

    const student = await Student.findOneAndUpdate(
      { studentId: req.params.id },
      {
        full_name,
        nic,
        phone,
        birthyear,
        gender,
        address,
        email,
        profilePicPath,
      },
      { new: true }
    );

    // Update user entry as well
    const user = await User.findOneAndUpdate(
      { userId: req.params.id },
      {
        email,
        ...(hashedPassword && { password: hashedPassword }),
      },
      { new: true }
    );

    const profilePicUrl = student.profilePicPath
      ? `${req.protocol}://${req.get("host")}/uploads/studentProfPics/${student.profilePicPath}`
      : null;

    res.status(200).json({ student: { ...student.toObject(), profilePicUrl }, user });
  } catch (err) {
    // cleanup uploaded pic if update failed
    unlinkIfExists(req?.file?.filename);
    console.error("Error updating student:", err);
    res.status(500).json({ message: "Server error while updating student" });
  }
};

// Delete student (profile pic is removed by model post hook)
export const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findOneAndDelete({ studentId: req.params.id });
    const user = await User.findOneAndDelete({ userId: req.params.id });

    if (!student) return res.status(404).json({ message: "Student not found" });

    res.status(200).json({ message: "Student deleted successfully", student, user });
  } catch (err) {
    console.error("Error deleting student:", err);
    res.status(500).json({ message: "Server error while deleting student" });
  }
};

// ✅ Get logged-in student's own details
export const getMe = async (req, res) => {
  try {
    const student = await Student.findOne({ studentId: req.user.userId }); // userId == studentId

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const profilePicUrl = student.profilePicPath
      ? `${req.protocol}://${req.get("host")}/uploads/studentProfPics/${student.profilePicPath}`
      : null;

    res.json({ student: { ...student.toObject(), profilePicUrl } });
  } catch (err) {
    res.status(500).json({ message: "Error fetching student profile", error: err.message });
  }
};
