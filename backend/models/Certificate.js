// models/Certificate.js
import mongoose from "mongoose";
import Counter from "./Counter.js";

const certificateSchema = new mongoose.Schema({
  certificateId: { type: String, unique: true },              // e.g., C001
  student_id: { type: String, required: true, index: true },  // e.g., "S001"
  course_name: {
    type: String,
    enum: ["Car", "Motorcycle", "ThreeWheeler", "HeavyVehicle"],
    required: true,
    index: true,
  },
  issued_at: { type: Date, default: Date.now },
  status: { type: String, enum: ["Active", "Revoked"], default: "Active" },

  // where the generated PDF ends up (local path or S3 URL)
  file_url: { type: String },

  // sha256(payload) for quick public verification
  verification_hash: { type: String, required: true },

  // track re-issues if you support them later
  reissue_of: { type: String },

  // snapshot data for audits/analytics
  metadata: {
    instructor_id: { type: String },
    progress_snapshot: {
      total_lessons: Number,
      completed_lessons: Number,
      progress_percent: Number,
    },
  },
}, { timestamps: true });

// One active certificate per student+course
certificateSchema.index(
  { student_id: 1, course_name: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: "Active" } }
);

// Auto-increment certificateId using Counter
certificateSchema.pre("save", async function (next) {
  try {
    if (!this.certificateId) {
      const counter = await Counter.findOneAndUpdate(
        { _id: "certificateId" },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      this.certificateId = `C${String(counter.seq).padStart(3, "0")}`;
    }
    next();
  } catch (err) {
    next(err);
  }
});

const Certificate = mongoose.model("Certificate", certificateSchema);
export default Certificate;
