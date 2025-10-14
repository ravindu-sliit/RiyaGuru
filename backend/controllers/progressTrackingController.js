// controllers/progressTrackingController.js
import ProgressTracking from "../models/ProgressTracking.js";
import LessonProgress from "../models/LessonProgress.js";
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
    // If authenticated as Instructor, return only their students' progress
    if (req.user && req.user.role === "Instructor") {
      // ProgressTracking stores student_id/course_name — we need to find progress where the instructor taught lessons
      // Simplest approach: find all ProgressTracking where latest instructor in lessons matches this instructor
      // We'll query ProgressTracking and filter by presence of lessons taught by this instructor
      const all = await ProgressTracking.find();
      // find students where at least one LessonProgress has instructor_id === req.user.userId
      const filtered = [];
      for (const p of all) {
        const has = await LessonProgress.exists({ student_id: p.student_id, vehicle_type: p.course_name, instructor_id: req.user.userId });
        if (has) filtered.push(p);
      }
      return res.json(filtered);
    }

    const reports = await ProgressTracking.find();
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
