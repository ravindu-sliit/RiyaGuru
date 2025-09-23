import mongoose from "mongoose";
import Counter from "./Counter.js";

const bookingSchema = new mongoose.Schema(
  {
    bookingId: { type: String, unique: true }, // e.g. B001, B002, ...

    studentId: { type: String, ref: "Student", required: true },

    courseName: {
      type: String,
      enum: ["Car", "Motorcycle", "ThreeWheeler", "Van", "HeavyVehicle"],
      required: true,
    },

    instructorName: { type: String, required: true }, // selected by name
    vehicleRegNo: { type: String, required: true }, // selected by regNo

    date: { type: String, required: true }, // "YYYY-MM-DD"
    time: { type: String, required: true }, // "09:00-10:00"

    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Completed", "Cancelled"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

// 🔧 Auto-generate bookingId before saving
bookingSchema.pre("save", async function (next) {
  try {
    // Only assign if bookingId is missing (new doc)
    if (!this.bookingId) {
      const counter = await Counter.findOneAndUpdate(
        { _id: "bookingId" },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );

      this.bookingId = `B${String(counter.seq).padStart(3, "0")}`;
    }
    next();
  } catch (err) {
    next(err); // pass error to mongoose
  }
});

// ✅ Always include bookingId when converting to JSON
bookingSchema.set("toJSON", {
  transform: (doc, ret) => {
    ret.id = ret._id; // keep original id
    delete ret.__v;   // remove __v noise
    return ret;
  },
});

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;
