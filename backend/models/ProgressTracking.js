import mongoose from "mongoose";

const progressTrackingSchema = new mongoose.Schema({
  student_course_id: { type: mongoose.Schema.Types.ObjectId, ref: "StudentCourses", required: true },
  total_lessons: { type: Number, required: true },
  completed_lessons: { type: Number, default: 0 },
  progress_percent: { type: Number, default: 0 },
  certificate_status: { type: String, enum: ["NotEligible", "Eligible", "Issued"], default: "NotEligible" },
  updated_at: { type: Date, default: Date.now },
});

const ProgressTracking = mongoose.model("ProgressTracking", progressTrackingSchema);
export default ProgressTracking;
