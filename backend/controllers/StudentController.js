import Student from "../models/StudentModel.js";
import Counter from "../models/Counter.js";
import User from "../models/UserModel.js";
import bcrypt from "bcryptjs";

// Add a new student
export const addStudent = async (req, res) => {
  const { full_name, nic, phone, birthyear, gender, address, email, password } = req.body;

  if (!email || !password) {
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

    // 3️⃣ Create student with auto-incremented ID
    const student = new Student({
      studentId,
      full_name,
      nic,
      phone,
      birthyear,
      gender,
      address,
      email,
      
    });
    await student.save();

    // 4️⃣ Create user entry automatically
    const user = new User({
      userId: studentId,
      name: full_name,
      role: "Student",
      email,
      password: hashedPassword
      password: hashedPassword,
      
    });
    await user.save();

    res.status(201).json({ student, user });
  } catch (err) {
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
    res.status(200).json({ students });
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
    res.status(200).json({ student });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while fetching student" });
  }
};

// Update student
export const updateStudent = async (req, res) => {
  const { full_name, nic, phone, birthyear, gender, address, email, password } = req.body;

  try {
    // Hash password if provided
    let hashedPassword;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
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
        ...(hashedPassword && { password: hashedPassword })
      },
      { new: true }
    );

    if (!student) return res.status(404).json({ message: "Student not found" });

    // Update user entry as well
    const user = await User.findOneAndUpdate(
      { userId: req.params.id },
      {
        email,
        ...(hashedPassword && { password: hashedPassword })
      },
      { new: true }
    );

    res.status(200).json({ student, user });
  } catch (err) {
    console.error("Error updating student:", err);
    res.status(500).json({ message: "Server error while updating student" });
  }
};

// Delete student
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




//Senithhhh
