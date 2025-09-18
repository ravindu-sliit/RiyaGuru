import ProgressTracking from "../models/ProgressTracking.js";
import { updateProgress } from "../helpers/progressHelper.js";

// Get progress for a student course
export const getProgress = async (req, res) => {
  try {
    const progress = await ProgressTracking.findOne({ student_course_id: req.params.studentCourseId });
    res.json(progress);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Manual update progress
export const manualUpdateProgress = async (req, res) => {
  try {
    const progress = await updateProgress(req.params.studentCourseId);
    res.json({ message: "Progress updated manually", data: progress });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
