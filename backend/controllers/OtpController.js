import OTP from "../models/OtpModel.js";
import User from "../models/UserModel.js";

import Student from "../models/StudentModel.js";

import { sendEmail } from "../services/emailService.js";

// Generate and send OTP
export const generateOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Find the student by the matching ID (User.userId === Student.studentId)
    const student = await Student.findOne({ studentId: user.userId });

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Set expiration (e.g., 10 minutes)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Upsert OTP for user
    await OTP.findOneAndUpdate(
    { userId: user.userId },
    { otp, expiresAt, verified: false },
    { upsert: true, new: true }
      { userId: user.userId },
      { otp, expiresAt, verified: false },
      { upsert: true, new: true }
    );

    
    //Build a friendly name for the email
    const firstName = student?.full_name?.split(" ")[0] || "Student";

    //${otp}

    // Send OTP via email
    await sendEmail(user.email, "Your OTP Code", `Your OTP is: ${otp}`);
    await sendEmail(
      user.email,

      "RiyaGuru LK – Verify Your Email Address",
      `Hello ${firstName} !,

Thank you for registering with RiyaGuru App! To complete your registration, please verify your email address.

Your One-Time Password (OTP) is:

   ${otp}

This code is valid for 10 minutes. Please do not share it with anyone.

If you did not try to register, you can safely ignore this email.

Best regards,
The RiyaGuru Team`
    );

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
    if (!email || !otp)
      return res.status(400).json({ message: "Email and OTP are required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const record = await OTP.findOne({ userId: user.userId });
    if (!record) return res.status(400).json({ message: "No OTP found. Please request a new one." });
    if (!record)
      return res
        .status(400)
        .json({ message: "No OTP found. Please request a new one." });

    if (record.expiresAt < new Date()) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    if (record.otp !== otp) return res.status(400).json({ message: "Invalid OTP" });
    if (record.otp !== otp)
      return res.status(400).json({ message: "Invalid OTP" });

     // ✅ Mark as verified (and optionally prevent reuse)
    await OTP.updateOne(
      { userId: user.userId },
      {
        $set: {
          verified: true,
          verifiedAt: new Date(),
          // Optional hardening to prevent reuse:
          otp: null,
          expiresAt: new Date(), // Immediately invalid
        },
      }
    );


    // OTP is valid → delete it after verification
    await OTP.deleteOne({ userId: user.userId });
    //await OTP.deleteOne({ userId: user.userId });

    res.status(200).json({ message: "OTP verified successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error verifying OTP" });
  }
};
