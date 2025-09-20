// models/ProgressTracking.js
import mongoose from "mongoose";

const progressTrackingSchema = new mongoose.Schema({
  student_id: { type: String, required: true },            // e.g., "S001"
  course_name: {                                           // "Car", "Motorcycle", "ThreeWheeler", "HeavyVehicle"
    type: String,
    enum: ["Car", "Motorcycle", "ThreeWheeler", "HeavyVehicle"],
    required: true
  },
  total_lessons: { type: Number, required: true },
  completed_lessons: { type: Number, default: 0 },
  progress_percent: { type: Number, default: 0 },
  certificate_status: { 
    type: String, 
    enum: ["NotEligible", "Eligible", "Issued"], 
    default: "NotEligible" 
  },
  updated_at: { type: Date, default: Date.now },
});

const ProgressTracking = mongoose.model("ProgressTracking", progressTrackingSchema);
export default ProgressTracking;
