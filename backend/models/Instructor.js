// backend/models/Instructor.js
import mongoose from "mongoose";

const instructorSchema = new mongoose.Schema(
  {
    instructorId: { type: String, unique: true }, // Auto-generated: I001, I002 …
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    address: { type: String },
    licenseNumber: { type: String, required: true, unique: true },
    experienceYears: { type: Number, default: 0 },

    specialization: {
      type: String,
      enum: ["Car", "Motorcycle", "Threewheeler", "HeavyVehicle", "All"],
      default: "All",
    },

    rating: { type: Number, default: 0 }, // Avg rating from students

    status: {
      type: String,
      enum: ["Active", "Not-Active"],
      default: "Not-Active",
    },

    image: { type: String }, // path to uploaded photo (e.g. "/uploads/instructors/image.jpg")

    availability: [
      {
        date: { type: String }, // e.g., "2025-09-19"
        timeSlots: [String], // e.g., ["09:00-10:00", "10:00-11:00"]
      },
    ],

    joinedDate: { type: Date, default: Date.now },

    // 🔗 Linked to User table
    userId: { type: String, required: true },
  },
  { timestamps: true }
);

const Instructor = mongoose.model("Instructor", instructorSchema);

export default Instructor;
