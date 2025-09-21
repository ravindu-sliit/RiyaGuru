import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["Maintenance", "Booking", "Inquiry", "Finance"],
    required: true,
  },
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  details: {
    type: String,
  },
}, { timestamps: { createdAt: "createdAt" } });

const Report = mongoose.model("Report", reportSchema);

export default Report;
