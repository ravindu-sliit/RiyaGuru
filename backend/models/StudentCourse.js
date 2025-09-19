 import mongoose from "mongoose";

const studentCourseSchema = new mongoose.Schema({
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
  course_id: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  enrollmentDate: { type: Date, default: Date.now },
  status: { 
    type: String, 
    enum: ["Active", "Completed", "Dropped"], 
    default: "Active" 
  }
});

const StudentCourse = mongoose.model("StudentCourse", studentCourseSchema);
export default StudentCourse;
