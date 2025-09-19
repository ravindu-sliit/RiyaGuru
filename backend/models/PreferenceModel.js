import mongoose from "mongoose";
import Counter from "./Counter.js"; // Existing counter for auto-increment

const preferenceSchema = new mongoose.Schema({
  preferenceId: {
    type: String,
    unique: true // PR001, PR002...
  },
  studentId: {
    type: String,
    required: true,
    unique: true,
    ref: "Student"
  },
  vehicleCategory: {
    type: String,
    required: true,
    enum: ["Light", "Heavy"]
  },
  vehicleType: {
  type: [String],
  enum: ["Van", "Bike", "ThreeWheeler", "Lorry"],
  required: true
},
  schedulePref: {
    type: String,
    required: true,
    enum: ["Weekday", "Weekend"]
  }
}, { timestamps: true });

// Auto-generate preferenceId before saving
preferenceSchema.pre("save", async function(next) {
  try {
    if (!this.preferenceId) {
      // Find the counter for preferenceId and increment
      const counter = await Counter.findOneAndUpdate(
        { _id: "preferenceId" },
        { $inc: { seq: 1 } },
        { new: true, upsert: true } // Create if doesn't exist
      );

      // Safety check in case counter is null
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
