import User from "../models/UserModel.js";
import Student from "../models/StudentModel.js";
import Preference from "../models/PreferenceModel.js";
import Instructor from "../models/Instructor.js"; 
// if you have an InstructorModel

// Add a new user (email & password from Student/Instructor/Admin)
export const addUser = async (req, res) => {
  try {
    const { userId, email, password } = req.body;

    if (!userId || !email || !password) {
      return res.status(400).json({ message: "userId, email and password are required" });
    }

    // Determine role based on ID prefix
    let role;
    if (userId.startsWith("S")) role = "Student";
    else if (userId.startsWith("I")) role = "Instructor";
    else if (userId.startsWith("A")) role = "Admin";
    else return res.status(400).json({ message: "Invalid ID prefix" });

    // Check if user already exists
    const existingUser = await User.findOne({ userId });
    if (existingUser) {
      return res.status(400).json({ message: "User with this ID already exists" });
    }

    // Hash password
    const bcrypt = await import("bcrypt");
    const hashedPassword = await bcrypt.default.hash(password, 10);

    // Create new user
    const user = new User({ userId, role, email, password: hashedPassword });
    await user.save();

    res.status(201).json({ user });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while adding user" });
  }
};

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    if (!users || users.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }
    res.status(200).json({ users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while fetching users" });
  }
};

// Get user by ID
export const getUserById = async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.params.id });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while fetching user" });
  }
};

// Update user
export const updateUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    let updateData = { email };
    if (password) {
      const bcrypt = await import("bcrypt");
      const hashedPassword = await bcrypt.default.hash(password, 10);
      updateData.password = hashedPassword;
    }

    const user = await User.findOneAndUpdate(
      { userId: req.params.id },
      updateData,
      { new: true }
    );

    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while updating user" });
  }
};

// Delete user and corresponding student/instructor
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findOneAndDelete({ userId: req.params.id });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Delete corresponding student or instructor
    if (user.userId.startsWith("S")) {
      await Student.findOneAndDelete({ studentId: user.userId });

      // ✅ Also delete preferences linked to this student
      await Preference.deleteMany({ studentId: user.userId });
    } 
  
    else if (user.userId.startsWith("I")) {
      await Instructor.findOneAndDelete({ instructorId: user.userId });
    }
    // Admins may not have a separate table

    res.status(200).json({ message: "User and corresponding data deleted successfully", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while deleting user" });
  }
};
