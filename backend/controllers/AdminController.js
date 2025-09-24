// controllers/AdminController.js
import Admin from "../models/AdminModel.js";
import Counter from "../models/Counter.js";
import User from "../models/UserModel.js";
import bcrypt from "bcryptjs";

// ✅ Add new admin
export const addAdmin = async (req, res) => {
  const { name, phone, email, password } = req.body;

  if (!email || !password || !name || !phone) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // 1️⃣ Generate adminId
    const counter = await Counter.findOneAndUpdate(
      { _id: "adminId" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    const adminId = `A${String(counter.seq).padStart(3, "0")}`; // A001, A002...

    // 2️⃣ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3️⃣ Save Admin
    const admin = new Admin({ adminId, name, phone, email });
    await admin.save();

    // 4️⃣ Create User entry
    const user = new User({
      userId: adminId,
      name,
      role: "Admin",
      email,
      password: hashedPassword,
    });
    await user.save();

    res.status(201).json({ admin, user });
  } catch (err) {
    console.error("Error adding admin:", err);
    res.status(500).json({ message: "Server error while adding admin" });
  }
};

// ✅ Get all admins
export const getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.find();
    res.status(200).json({ admins });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while fetching admins" });
  }
};

// ✅ Get admin by ID
export const getAdminById = async (req, res) => {
  try {
    const admin = await Admin.findOne({ adminId: req.params.id });
    if (!admin) return res.status(404).json({ message: "Admin not found" });
    res.status(200).json({ admin });
  } catch (err) {
    res.status(500).json({ message: "Server error while fetching admin" });
  }
};

// ✅ Update admin
export const updateAdmin = async (req, res) => {
  const { name, phone, email, password } = req.body;

  try {
    let hashedPassword;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const admin = await Admin.findOneAndUpdate(
      { adminId: req.params.id },
      { name, phone, email },
      { new: true }
    );

    if (!admin) return res.status(404).json({ message: "Admin not found" });

    // Update User entry
    const userUpdate = {
      email,
      ...(hashedPassword && { password: hashedPassword }),
    };
    const user = await User.findOneAndUpdate(
      { userId: req.params.id },
      userUpdate,
      { new: true }
    );

    res.status(200).json({ admin, user });
  } catch (err) {
    console.error("Error updating admin:", err);
    res.status(500).json({ message: "Server error while updating admin" });
  }
};

// ✅ Delete admin
export const deleteAdmin = async (req, res) => {
  try {
    const admin = await Admin.findOneAndDelete({ adminId: req.params.id });
    const user = await User.findOneAndDelete({ userId: req.params.id });

    if (!admin) return res.status(404).json({ message: "Admin not found" });

    res.status(200).json({ message: "Admin deleted successfully", admin, user });
  } catch (err) {
    console.error("Error deleting admin:", err);
    res.status(500).json({ message: "Server error while deleting admin" });
  }
};
