import mongoose from "mongoose";

const inquirySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // assumes you have a User model
    required: true,
  },
  subject: {
    type: String,
    maxlength: 150,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["Pending", "In Progress", "Resolved"],
    default: "Pending",
  },
  response: {
    type: String,
    default: "",
  },
}, {
  timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
});

const Inquiry = mongoose.model("Inquiry", inquirySchema);

export default Inquiry;
