import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    bookingId: { type: String, unique: true, required: true }, // e.g. B001
    userId: { type: String, required: true },                  // StudentId (e.g., S003)

    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: "Instructor", required: true },
    instructorId: { type: String, required: true },
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle", required: true },
    regNo: { type: String, required: true },
    course: { type: String, required: true }, // 🔹 store course name (Car, Motorcycle, ThreeWheeler, HeavyVehicle)

    date: { type: String, required: true }, // "2025-09-25"
    time: { type: String, required: true }, // "10:00-11:00"

   
    status: {
      type: String,
      enum: ["pending", "booked", "started", "completed", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;
