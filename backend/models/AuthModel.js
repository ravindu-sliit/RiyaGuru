import mongoose from "mongoose";

const authSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  otpCode: { type: String, required: true },
  expiresAt: { type: Date, required: true },
});

const Auth = mongoose.model("Auth", authSchema);
export default Auth;
