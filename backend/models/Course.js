import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
  name: { type: String, required: true },              // e.g., Car, Motorcycle
  description: { type: String },
  price: { type: Number, required: true },             // course fee
  duration: { type: String },                            // e.g., "4 weeks", "10 lessons"
  totalLessons: { type: Number, required: true },      // e.g., 4, 10
  createdAt: { type: Date, default: Date.now }
});

const Course = mongoose.model("Course", courseSchema);
export default Course;
