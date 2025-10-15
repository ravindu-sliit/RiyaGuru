import Preference from "../models/PreferenceModel.js";
import Student from "../models/StudentModel.js";
import StudentCourse from "../models/StudentCourse.js";

// Map vehicleType to courseId
const courseIdMap = {
  Car: "Car",
  Van: "Van",
  Motorcycle: "Motorcycle",
  ThreeWheeler: "ThreeWheeler",
  Heavy: "HeavyVehicle",
};

// Add a new student preference
export const addPreference = async (req, res) => {
  try {
    let { studentId, vehicleCategory, vehicleType, schedulePref } = req.body;

    // Basic presence checks
    if (!studentId || !vehicleCategory || !schedulePref) {
      return res.status(400).json({
        message: "studentId, vehicleCategory, and schedulePref are required",
      });
    }

    // Normalize by category
    if (vehicleCategory === "Heavy") {
      // Auto-select Heavy
      vehicleType = ["Heavy"];
    } else {
      // Light: ensure vehicleType is a non-empty array
      if (!vehicleType || !Array.isArray(vehicleType) || vehicleType.length === 0) {
        return res.status(400).json({
          message: "vehicleType is required for Light category",
        });
      }
    }

    // Check student exists
    const student = await Student.findOne({ studentId });
    if (!student) return res.status(404).json({ message: "Student not found" });

    // Ensure one preference per student
    const existingPreference = await Preference.findOne({ studentId });
    if (existingPreference) {
      return res.status(400).json({ message: "Preference for this student already exists" });
    }

    // Create preference
    const preference = await Preference.create({
      studentId,
      vehicleCategory,
      vehicleType,
      schedulePref,
    });

    // Create StudentCourse entries (use save() to trigger any hooks)
    for (const type of vehicleType) {
      const studentCourse = new StudentCourse({
        student_id: studentId,
        course_id: courseIdMap[type],
        status: "Active",
      });
      await studentCourse.save();
    }

    res.status(201).json({
      message: "Preference and StudentCourse records added successfully",
      preference,
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
    if (!preference) return res.status(404).json({ message: "Student preference not found. Set preference first." });
    res.status(200).json({ preference });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while fetching preference" });
  }
};

// Update preference
export const updatePreference = async (req, res) => {
  try {
    let { vehicleCategory, vehicleType, schedulePref } = req.body;

    // We need the current preference to infer category if not provided
    const current = await Preference.findOne({ studentId: req.params.studentId });
    if (!current) return res.status(404).json({ message: "Preference not found" });

    const targetCategory = vehicleCategory ?? current.vehicleCategory;

    if (targetCategory === "Heavy") {
      // Force Heavy
      vehicleType = ["Heavy"];
    } else {
      // Light: ensure provided types
      if (!vehicleType || !Array.isArray(vehicleType) || vehicleType.length === 0) {
        return res.status(400).json({ message: "vehicleType is required for Light category" });
      }
    }

    const preference = await Preference.findOneAndUpdate(
      { studentId: req.params.studentId },
      {
        vehicleCategory: targetCategory,
        vehicleType,
        ...(schedulePref !== undefined ? { schedulePref } : {}),
      },
      { new: true }
    );

    if (!preference) return res.status(404).json({ message: "Preference not found" });

    // Sync StudentCourse table: delete old and create new entries
    await StudentCourse.deleteMany({ student_id: req.params.studentId });

    for (const type of vehicleType) {
      const studentCourse = new StudentCourse({
        student_id: req.params.studentId,
        course_id: courseIdMap[type],
        status: "Active",
      });
      await studentCourse.save();
    }

    res.status(200).json({
      message: "Preference & StudentCourses updated successfully",
      preference,
    });
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

    // Remove related StudentCourse records
    await StudentCourse.deleteMany({ student_id: req.params.studentId });

    res.status(200).json({
      message: "Preference & StudentCourses deleted successfully",
      preference,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while deleting preference" });
  }
};
