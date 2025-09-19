import Preference from "../models/PreferenceModel.js";
import Student from "../models/StudentModel.js";

// Add a new student preference
export const addPreference = async (req, res) => {
  try {
    const { studentId, vehicleCategory, vehicleType, schedulePref } = req.body;

    if (!studentId || !vehicleCategory || !vehicleType || !schedulePref) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if student exists
    const student = await Student.findOne({ studentId });
    if (!student) return res.status(404).json({ message: "Student not found" });

    // ✅ Check if preference already exists for this student
    const existingPreference = await Preference.findOne({ studentId });
    if (existingPreference) {
      return res.status(400).json({ message: "Preference for this student already exists" });
    }

    // Create preference (preferenceId will auto-generate)
    const preference = await Preference.create({ studentId, vehicleCategory, vehicleType, schedulePref });

    res.status(201).json({
      message: "Preference added successfully",
      preference
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while adding preference" });
  }
};

// Get all preferences
export const getAllPreferences = async (req, res) => {
  try {
    const preferences = await Preference.find();
    res.status(200).json({ preferences });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while fetching preferences" });
  }
};

// Get preference by studentId
export const getPreferenceByStudentId = async (req, res) => {
  try {
    const preference = await Preference.findOne({ studentId: req.params.studentId });
    if (!preference) return res.status(404).json({ message: "Preference not found" });
    res.status(200).json({ preference });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while fetching preference" });
  }
};

// Update preference
export const updatePreference = async (req, res) => {
  try {
    const { vehicleCategory, vehicleType, schedulePref } = req.body;

    const preference = await Preference.findOneAndUpdate(
      { studentId: req.params.studentId },
      { vehicleCategory, vehicleType, schedulePref },
      { new: true }
    );

    if (!preference) return res.status(404).json({ message: "Preference not found" });

    res.status(200).json({ message: "Preference updated successfully", preference });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while updating preference" });
  }
};

// Delete preference
export const deletePreference = async (req, res) => {
  try {
    const preference = await Preference.findOneAndDelete({ studentId: req.params.studentId });
    if (!preference) return res.status(404).json({ message: "Preference not found" });

    res.status(200).json({ message: "Preference deleted successfully", preference });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while deleting preference" });
  }
};
