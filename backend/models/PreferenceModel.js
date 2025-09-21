import mongoose from "mongoose";
import Counter from "./Counter.js"; // Existing counter for auto-increment

const preferenceSchema = new mongoose.Schema(
  {
    preferenceId: {
      type: String,
      unique: true, // PR001, PR002...
    },
    studentId: {
      type: String,
      required: true,
      unique: true,
      ref: "Student",
      trim: true,
    },
    vehicleCategory: {
      type: String,
      required: true,
      enum: ["Light", "Heavy"],
    },
    vehicleType: {
      type: [String],
      enum: ["Car", "Van", "Motorcycle", "ThreeWheeler", "Heavy"],
      // Required only when category is Light
      required: function () {
        return this.vehicleCategory !== "Heavy";
      },
      // If Light, array must be non-empty
      validate: {
        validator: function (v) {
          if (this.vehicleCategory === "Heavy") return true;
          return Array.isArray(v) && v.length > 0;
        },
        message: "vehicleType is required and must be a non-empty array for Light category",
      },
    },
    schedulePref: {
      type: String,
      required: true,
      enum: ["Weekday", "Weekend"],
    },
  },
  { timestamps: true }
);

// Auto-generate preferenceId before saving
preferenceSchema.pre("save", async function (next) {
  try {
    if (!this.preferenceId) {
      const counter = await Counter.findOneAndUpdate(
        { _id: "preferenceId" },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );

      if (!counter) {
        throw new Error("Counter for preferenceId not found or could not be created");
      }

      this.preferenceId = `PR${String(counter.seq).padStart(3, "0")}`;
    }
    next();
  } catch (err) {
    next(err);
  }
});

const Preference = mongoose.model("Preference", preferenceSchema);
export default Preference;
