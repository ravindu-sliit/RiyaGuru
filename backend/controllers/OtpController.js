import OTP from "../models/OtpModel.js";
import User from "../models/UserModel.js";
import Student from "../models/StudentModel.js";
import { sendEmail } from "../services/emailService.js";

// Configure how long an OTP is valid (minutes)
const TTL_MINUTES = 1; // set to 10 in production if you prefer

// Generate and send OTP (signup/account verification)
export const generateOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Optional: friendly name
    const student = await Student.findOne({ studentId: user.userId });
    const firstName = student?.full_name?.split(" ")[0] || "Student";

    // ⛔ If an OTP already exists and has not expired, block re-send
    const now = new Date();
    const existing = await OTP.findOne({
      userId: user.userId,
      verified: false,
      expiresAt: { $gt: now },
    });

    if (existing) {
      const timeLeftSec = Math.max(
        1,
        Math.ceil((existing.expiresAt.getTime() - now.getTime()) / 1000)
      );
      // Provide a Retry-After header for clients that honor it
      res.set("Retry-After", String(timeLeftSec));
      return res.status(429).json({
        message: `An OTP has already been sent. Please try again in ${timeLeftSec} seconds.`,
        expiresAt: existing.expiresAt,
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Set expiration
    const expiresAt = new Date(Date.now() + TTL_MINUTES * 60 * 1000);

    // Upsert OTP for user (overwrites any expired/old record)
    await OTP.findOneAndUpdate(
      { userId: user.userId },
      { otp, expiresAt, verified: false },
      { upsert: true, new: true }
    );

    // Send OTP via email (keep TTL text in sync with TTL_MINUTES)
    await sendEmail(
      user.email,
      "RiyaGuru LK – Verify Your Email Address",
      `Hello ${firstName} !,

Thank you for registering with RiyaGuru App! To complete your registration, please verify your email address.

Your One-Time Password (OTP) is:

   ${otp}

This code is valid for ${TTL_MINUTES} minute${TTL_MINUTES > 1 ? "s" : ""}. Please do not share it with anyone.

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

    if (!email || !otp)
      return res.status(400).json({ message: "Email and OTP are required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const record = await OTP.findOne({ userId: user.userId });
    if (!record)
      return res
        .status(400)
        .json({ message: "No OTP found. Please request a new one." });

    if (record.expiresAt < new Date()) {
      return res.status(400).json({ message: "OTP has expired" });
    }

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

    // Optionally: delete after verification
    // await OTP.deleteOne({ userId: user.userId });

    res.status(200).json({ message: "OTP verified successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error verifying OTP" });
  }
};
