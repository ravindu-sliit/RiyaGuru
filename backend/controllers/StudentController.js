import Student from "../models/StudentModel.js";
import Counter from "../models/Counter.js";
import User from "../models/UserModel.js";
import Preference from "../models/PreferenceModel.js";
import { sendEmail } from "../services/emailService.js";
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

function parseDuplicateKeyField(err) {
  if (err?.code !== 11000) return null;
  const kp = err?.keyPattern || {};
  if (kp.email === 1) return "email";
  if (kp.nic === 1) return "nic";
  if (kp.phone === 1) return "phone";
  const msg = String(err?.errmsg || "").toLowerCase();
  if (msg.includes("email")) return "email";
  if (msg.includes("nic")) return "nic";
  if (msg.includes("phone")) return "phone";
  return null;
}

// Add a new student (profile pic optional)
export const addStudent = async (req, res) => {
  const { full_name, nic, phone, birthyear, gender, address, email, password } = req.body;

  if (!email || !password) {
    unlinkIfExists(req?.file?.filename);
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const normalizedEmail = String(email).trim().toLowerCase();
    const normalizedNIC = String(nic || "").trim().toUpperCase();
    const normalizedPhone = String(phone || "").trim();

    // Unique checks
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      unlinkIfExists(req?.file?.filename);
      return res
        .status(409)
        .json({
          message: "This email is already registered. Please use another email or sign in.",
          field: "email",
        });
    }
    const existingStudentEmail = await Student.findOne({ email: normalizedEmail });
    if (existingStudentEmail) {
      unlinkIfExists(req?.file?.filename);
      return res
        .status(409)
        .json({
          message: "This email is already registered. Please use another email or sign in.",
          field: "email",
        });
    }
    const existingNic = await Student.findOne({ nic: normalizedNIC });
    if (existingNic) {
      unlinkIfExists(req?.file?.filename);
      return res
        .status(409)
        .json({
          message: "This NIC is already registered. Please check and try again.",
          field: "nic",
        });
    }
    const existingPhone = await Student.findOne({ phone: normalizedPhone });
    if (existingPhone) {
      unlinkIfExists(req?.file?.filename);
      return res
        .status(409)
        .json({
          message: "This phone number is already registered. Please use another number.",
          field: "phone",
        });
    }

    const counter = await Counter.findOneAndUpdate(
      { _id: "studentId" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    const studentId = `S${String(counter.seq).padStart(3, "0")}`;

    const hashedPassword = await bcrypt.hash(password, 10);
    const profilePicPath = req?.file?.filename || null;

    const student = new Student({
      studentId,
      full_name,
      nic: normalizedNIC,
      phone: normalizedPhone,
      birthyear,
      gender,
      address,
      email: normalizedEmail,
      profilePicPath,
    });
    await student.save();

    const user = new User({
      userId: studentId,
      name: full_name,
      role: "Student",
      email: normalizedEmail,
      password: hashedPassword,
    });
    await user.save();

    const profilePicUrl = profilePicPath
      ? `${req.protocol}://${req.get("host")}/uploads/studentProfPics/${profilePicPath}`
      : null;

    res.status(201).json({ student: { ...student.toObject(), profilePicUrl }, user });
  } catch (err) {
    unlinkIfExists(req?.file?.filename);
    const dupField = parseDuplicateKeyField(err);
    if (dupField) {
      const message =
        dupField === "email"
          ? "This email is already registered. Please use another email or sign in."
          : dupField === "nic"
          ? "This NIC is already registered. Please check and try again."
          : "This phone number is already registered. Please use another number.";
      return res.status(409).json({ message, field: dupField });
    }
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

    // Also include preference summary to the frontend
    const preference = await Preference.findOne({ studentId: req.params.id });

    const studentData = {
      ...student.toObject(),
      profilePicUrl,
      vehicleCategory: preference?.vehicleCategory || null,
      vehicleType: preference?.vehicleType || null,
      schedulePref: preference?.schedulePref || null,
    };

    res.status(200).json({ student: studentData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while fetching student" });
  }
};

// Update student (can also replace/add profile pic)
export const updateStudent = async (req, res) => {
  const { full_name, nic, phone, birthyear, gender, address, email, password } = req.body;

  try {
    const current = await Student.findOne({ studentId: req.params.id });
    if (!current) {
      unlinkIfExists(req?.file?.filename);
      return res.status(404).json({ message: "Student not found" });
    }

    const nextEmail = email ? String(email).trim().toLowerCase() : current.email;
    const nextNIC = nic ? String(nic).trim().toUpperCase() : current.nic;
    const nextPhone = phone ? String(phone).trim() : current.phone;

    // Uniqueness checks
    if (nextEmail !== current.email) {
      const emailTakenUser = await User.findOne({ email: nextEmail, userId: { $ne: req.params.id } });
      if (emailTakenUser) {
        unlinkIfExists(req?.file?.filename);
        return res.status(409).json({ message: "This email is already registered. Please use another email.", field: "email" });
      }
      const emailTakenStudent = await Student.findOne({ email: nextEmail, studentId: { $ne: req.params.id } });
      if (emailTakenStudent) {
        unlinkIfExists(req?.file?.filename);
        return res.status(409).json({ message: "This email is already registered. Please use another email.", field: "email" });
      }
    }

    if (nextNIC !== current.nic) {
      const nicTaken = await Student.findOne({ nic: nextNIC, studentId: { $ne: req.params.id } });
      if (nicTaken) {
        unlinkIfExists(req?.file?.filename);
        return res.status(409).json({ message: "This NIC is already registered. Please check and try again.", field: "nic" });
      }
    }

    if (nextPhone !== current.phone) {
      const phoneTaken = await Student.findOne({ phone: nextPhone, studentId: { $ne: req.params.id } });
      if (phoneTaken) {
        unlinkIfExists(req?.file?.filename);
        return res.status(409).json({ message: "This phone number is already registered. Please use another number.", field: "phone" });
      }
    }

    let hashedPassword;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    let profilePicPath = current.profilePicPath;
    if (req?.file?.filename) {
      if (profilePicPath) unlinkIfExists(profilePicPath);
      profilePicPath = req.file.filename;
    }

    const student = await Student.findOneAndUpdate(
      { studentId: req.params.id },
      {
        full_name,
        nic: nextNIC,
        phone: nextPhone,
        birthyear,
        gender,
        address,
        email: nextEmail,
        profilePicPath,
      },
      { new: true }
    );

    await User.findOneAndUpdate(
      { userId: req.params.id },
      { email: nextEmail, ...(hashedPassword && { password: hashedPassword }) },
      { new: true }
    );

    /**
     * ✅ Only send password-change email if:
     *   - a password was provided, AND
     *   - the authenticated actor is an Admin.
     * (Requires the route to be protected by JWT middleware.)
     */
    const actorRole = req.user?.role;
    const byAdmin = actorRole === "Admin";

    if (password && byAdmin) {
      try {
        const firstName =
          String(student?.full_name || "Student").split(" ")[0] || "Student";
        await sendEmail(
          nextEmail,
          "RiyaGuru LK – Your Password Was Reset",
          `Hello ${firstName},\n\nYour account password was reset by Admin.\n\nTemporary password: ${password}\n\nPlease sign in and change this password immediately from your profile settings.\n\nIf you did not expect this change, please contact support.\n\n— RiyaGuru Team`
        );
      } catch (e) {
        console.warn("Failed to send password reset email:", e?.message);
      }
    }

    const profilePicUrl = student.profilePicPath
      ? `${req.protocol}://${req.get("host")}/uploads/studentProfPics/${student.profilePicPath}`
      : null;

    res.status(200).json({ student: { ...student.toObject(), profilePicUrl } });
  } catch (err) {
    unlinkIfExists(req?.file?.filename);
    const dupField = parseDuplicateKeyField(err);
    if (dupField) {
      const message =
        dupField === "email"
          ? "This email is already registered. Please use another email."
          : dupField === "nic"
          ? "This NIC is already registered. Please check and try again."
          : "This phone number is already registered. Please use another number.";
      return res.status(409).json({ message, field: dupField });
    }
    console.error("Error updating student:", err);
    res.status(500).json({ message: "Server error while updating student" });
  }
};

// Delete only the student's profile picture
export const deleteProfilePic = async (req, res) => {
  try {
    const student = await Student.findOne({ studentId: req.params.id });
    if (!student) return res.status(404).json({ message: "Student not found" });

    if (student.profilePicPath) {
      unlinkIfExists(student.profilePicPath);
      student.profilePicPath = null;
      await student.save();
    }

    res.json({ message: "Profile picture removed" });
  } catch (err) {
    console.error("Error deleting profile pic:", err);
    res.status(500).json({ message: "Server error while deleting profile picture" });
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

// Get logged-in student's own details
export const getMe = async (req, res) => {
  try {
    const student = await Student.findOne({ studentId: req.user.userId });
    if (!student) return res.status(404).json({ message: "Student not found" });
    const profilePicUrl = student.profilePicPath
      ? `${req.protocol}://${req.get("host")}/uploads/studentProfPics/${student.profilePicPath}`
      : null;
    res.json({ student: { ...student.toObject(), profilePicUrl } });
  } catch (err) {
    res.status(500).json({ message: "Error fetching student profile", error: err.message });
  }
};
