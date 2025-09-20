import mongoose from "mongoose";
import "./Course.js";  

const bookingSchema = new mongoose.Schema(
  {
    bookingId: { type: String, unique: true, required: true },
    userId: { type: String, required: true }, // StudentId (e.g., S003)

    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: "Instructor", required: true },
    instructorId: { type: String, required: true },
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle", required: true },
    regNo: { type: String, required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },

    date: { type: String, required: true },
    time: { type: String, required: true },
    status: {
      type: String,
      enum: ["booked", "completed", "cancelled"],
      default: "booked",
    },
  },
  { timestamps: true }
);

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;
