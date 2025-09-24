import mongoose from "mongoose";
import Preference from "./PreferenceModel.js";
import StudentCourse from "./StudentCourse.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const profPicsDir = path.join(__dirname, "..", "uploads", "studentProfPics");

const studentSchema = new mongoose.Schema({
  studentId: {
    type: String,
    unique: true,
  },
  full_name: { type: String, required: true },
  nic: { type: String, required: true, unique: true },     // ✅ unique NIC
  phone: { type: String, required: true, unique: true },   // ✅ unique phone
  birthyear: { type: Number, required: true },
  gender: { type: String, required: true },
  address: { type: String, required: true },
  email: { type: String, required: true, unique: true },   // existing unique email
  password: { type: String },

  // optional profile picture (we store only the filename)
  profilePicPath: { type: String, default: null },
});

// 🔹 Cascade delete middleware
studentSchema.post("findOneAndDelete", async function (doc) {
  if (!doc) return;
  const sid = doc.studentId;

  // Delete preferences linked to this student
  await Preference.deleteMany({ studentId: sid });

  // Delete student courses linked to this student
  await StudentCourse.deleteMany({ student_id: sid });

  // Delete profile picture file if present
  if (doc.profilePicPath) {
    const filePath = path.join(profPicsDir, doc.profilePicPath);
    try {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    } catch (e) {
      console.warn("Failed to delete profile pic:", filePath, e?.message);
    }
  }
});

const Student = mongoose.model("Student", studentSchema);
export default Student;
