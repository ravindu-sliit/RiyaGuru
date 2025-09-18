import mongoose from "mongoose";

const lessonProgressSchema = new mongoose.Schema({
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
  instructor_id: { type: mongoose.Schema.Types.ObjectId, ref: "Instructor", required: true },
  vehicle_type: { type: String, enum: ["Car", "Motorcycle", "ThreeWheeler", "HeavyVehicle"], required: true },
  lesson_number: { type: Number, required: true },
  status: { type: String, enum: ["Completed", "Pending"], default: "Completed" },
  feedback: { type: String },
  date: { type: Date, default: Date.now }
});

const LessonProgress = mongoose.model("LessonProgress", lessonProgressSchema);
export default LessonProgress;