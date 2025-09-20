import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true }, // User's ID
  otp: { type: String, required: true },
  expiresAt: { type: Date, required: true }, // Expiration date/time
  verified: { type: Boolean, default: false }

}, { timestamps: true });

const OTP = mongoose.model("OTP", otpSchema);
export default OTP;
