import mongoose from "mongoose";

const studentCourseSchema = new mongoose.Schema({
  student_course_id: { type: String, unique: true },   // e.g., SC001
  student_id: { type: String, required: true },        // e.g., S001
  course_name: {                                       // Car, Motorcycle, etc.
    type: String,
    enum: ["Car", "Motorcycle", "ThreeWheeler", "HeavyVehicle"],
    required: true
  },
  enrollmentDate: { type: Date, default: Date.now },
  status: { 
    type: String, 
    enum: ["Active", "Completed", "Dropped"], 
    default: "Active" 
  }
});

const StudentCourse = mongoose.model("StudentCourse", studentCourseSchema);
export default StudentCourse;