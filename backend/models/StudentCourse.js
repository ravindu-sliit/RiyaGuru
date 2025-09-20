import mongoose from "mongoose";
import Counter from "./Counter.js"; // Make sure you have a Counter model

const studentCourseSchema = new mongoose.Schema({
  student_course_id: { type: String, unique: true }, // SC001, SC002...
  student_id: { type: String, ref: "Student", required: true },
  course_id: { type: String, required: true },
  enrollmentDate: { type: Date, default: Date.now },
  status: { 
    type: String, 
    enum: ["Active", "Completed", "Dropped"], 
    default: "Active" 
  }
}, { timestamps: true });

// Auto-generate student_course_id before saving
studentCourseSchema.pre("save", async function(next) {
  try {
    if (!this.student_course_id) {
      const counter = await Counter.findOneAndUpdate(
        { _id: "student_course_id" },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );

      if (!counter) {
        throw new Error("Counter for student_course_id not found");
      }

      this.student_course_id = `SC${String(counter.seq).padStart(3, "0")}`;
    }
    next();
  } catch (err) {
    next(err);
  }
});

const StudentCourse = mongoose.model("StudentCourse", studentCourseSchema);
export default StudentCourse;
