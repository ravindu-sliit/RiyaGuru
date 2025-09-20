import OTP from "../models/OtpModel.js";
import User from "../models/UserModel.js";
import { sendEmail } from "../services/emailService.js";

// Generate and send OTP
export const generateOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Set expiration (e.g., 10 minutes)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Upsert OTP for user
    await OTP.findOneAndUpdate(
    { userId: user.userId },
    { otp, expiresAt, verified: false },
    { upsert: true, new: true }
    );

    

    // Send OTP via email
    await sendEmail(user.email, "Your OTP Code", `Your OTP is: ${otp}`);

    res.status(200).json({ message: "OTP sent to email" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error generating OTP" });
  }
};

// Verify OTP
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: "Email and OTP are required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const record = await OTP.findOne({ userId: user.userId });
    if (!record) return res.status(400).json({ message: "No OTP found. Please request a new one." });

    if (record.expiresAt < new Date()) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    if (record.otp !== otp) return res.status(400).json({ message: "Invalid OTP" });

    // OTP is valid → delete it after verification
    await OTP.deleteOne({ userId: user.userId });

    res.status(200).json({ message: "OTP verified successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error verifying OTP" });
  }
};
