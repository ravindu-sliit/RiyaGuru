import mongoose from "mongoose";
import Preference from "./PreferenceModel.js";
import StudentCourse from "./StudentCourse.js";

const studentSchema = new mongoose.Schema({

  studentId: {
    type: String,
    unique: true
  },

  full_name: {
    type: String,
    required: true,
  },
  nic: {
    type: String, 
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  birthyear: {
    type: Number,
    required: true,
  },
  gender: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
   email: { // new field
    type: String,
    required: true,
    unique: true
  },
  password: { // new field
    type: String,
    
  },
});

// 🔹 Cascade delete middleware
studentSchema.post("findOneAndDelete", async function (doc) {
  if (!doc) return;
  const sid = doc.studentId;

  // Delete preferences linked to this student
  await Preference.deleteMany({ studentId: sid });

  // Delete student courses linked to this student
  await StudentCourse.deleteMany({ student_id: sid });
});

const Student = mongoose.model("Student", studentSchema);
export default Student;
