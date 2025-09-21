import mongoose from "mongoose";
import Counter from "./Counter.js";

const docSchema = new mongoose.Schema(
  {
    docId: { type: String, unique: true }, // DOC001...
    studentId: {
      type: String,
      required: true,
      ref: "Student",
      index: true,
      trim: true,
    },
    docType: {
      type: String,
      required: true,
      enum: ["NIC", "Driver_License"],
    },
    frontImagePath: { type: String, required: true },
    backImagePath: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

docSchema.index({ studentId: 1, docType: 1 }, { unique: true });

docSchema.pre("save", async function (next) {
  try {
    if (!this.docId) {
      const counter = await Counter.findOneAndUpdate(
        { _id: "docId" },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      if (!counter) throw new Error("Counter for docId not found");
      this.docId = `DOC${String(counter.seq).padStart(3, "0")}`;
    }
    next();
  } catch (err) {
    next(err);
  }
});

const Doc = mongoose.model("Doc", docSchema);
export default Doc;
