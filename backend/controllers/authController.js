import User from "../models/UserModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// ✅ User Login
export const loginUser = async (req, res) => {
  try {
    // The frontend may send either an email or a numeric/alphanumeric ID (students/instructors sometimes use IDs)
    const { email, password } = req.body;
    const identifier = String(email || "").trim();

    // Find user by email OR userId (allow login using instructorId/userId)
    const user = await User.findOne({
      $or: [
        { email: identifier.toLowerCase() },
        { userId: identifier },
      ],
    });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    // Create JWT token
    const token = jwt.sign(
      { userId: user.userId, role: user.role },
      process.env.JWT_SECRET || "fallbackSecretKey",
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token,
      userId: user.userId,
      role: user.role
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }

};

