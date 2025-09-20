// models/LessonProgress.js
import mongoose from "mongoose";

const lessonProgressSchema = new mongoose.Schema({
  student_id: { type: String, required: true },         // e.g., "S001"
  instructor_id: { type: String, required: true },      // e.g., "I001"
  vehicle_type: { 
    type: String, 
    enum: ["Car", "Motorcycle", "ThreeWheeler", "HeavyVehicle"], 
    required: true 
  },
  lesson_number: { type: Number, required: true },
  status: { type: String, enum: ["Completed", "Pending"], default: "Completed" },
  feedback: { type: String },
  date: { type: Date, default: Date.now },
  student_course_id: { type: String, required: true }   // e.g., "SC001"
});

const LessonProgress = mongoose.model("LessonProgress", lessonProgressSchema);
export default LessonProgress;
