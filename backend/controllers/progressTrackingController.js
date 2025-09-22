// controllers/progressTrackingController.js
import ProgressTracking from "../models/ProgressTracking.js";
import { updateProgress } from "../helpers/progressHelper.js";

// ✅ Get progress for a student + course
export const getProgress = async (req, res) => {
  try {
    const { studentId, courseName } = req.params;

    const progress = await ProgressTracking.findOne({
      student_id: studentId,
      course_name: courseName,
    });

    res.json(progress || { message: "No progress found" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Manual update progress
export const manualUpdateProgress = async (req, res) => {
  try {
    const { studentId, courseName } = req.params;

    const progress = await updateProgress(studentId, courseName);

    res.json({ message: "Progress updated manually", data: progress });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Issue certificate
export const issueCertificate = async (req, res) => {
  try {
    const { studentId, courseName } = req.params;

    const tracking = await ProgressTracking.findOne({
      student_id: studentId,
      course_name: courseName,
    });

    if (!tracking || tracking.certificate_status !== "Eligible") {
      return res
        .status(400)
        .json({ message: "Student not eligible for certificate" });
    }

    tracking.certificate_status = "Issued";
    await tracking.save();

    res.json({
      message: "Certificate issued successfully",
      tracking,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Get all progress reports (for dashboard)
export const getAllProgress = async (req, res) => {
  try {
    const reports = await ProgressTracking.find();
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
