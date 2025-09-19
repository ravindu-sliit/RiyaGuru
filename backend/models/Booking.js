import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    bookingId: { type: String, unique: true }, // e.g. B001
    userId: { type: String, required: true }, // who booked (from login)
    
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: "Instructor", required: true },
    instructorId: { type: String, required: true },
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle", required: true },
    regNo: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    status: { type: String, enum: ["booked", "completed", "cancelled"], default: "booked" }
  },
  { timestamps: true }
);

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;
