// controllers/lessonProgressController.js
import LessonProgress from "../models/LessonProgress.js";
import ProgressTracking from "../models/ProgressTracking.js";
import { updateProgress } from "../helpers/progressHelper.js";

// ✅ Add new lesson progress (with validation)
export const addLessonProgress = async (req, res) => {
  try {
    const {
      student_id,
      student_course_id,
      instructor_id,
      vehicle_type,
      lesson_number,
      status,
      feedback,
    } = req.body;

    // 1️⃣ Get student's progress record
    const tracking = await ProgressTracking.findOne({ student_id, course_name: vehicle_type });
    if (!tracking) {
      return res.status(400).json({ message: "Progress record not found for this student/course" });
    }

    // 2️⃣ Prevent duplicate lesson numbers
    const existingLesson = await LessonProgress.findOne({ student_id, vehicle_type, lesson_number });
    if (existingLesson) {
      return res.status(400).json({ message: `Lesson ${lesson_number} already recorded` });
    }

    // 3️⃣ Prevent adding more lessons than allowed
    if (tracking.completed_lessons >= tracking.total_lessons) {
      return res.status(400).json({ message: "All lessons already completed for this course" });
    }

    // 4️⃣ Save the new lesson progress
    const newLesson = new LessonProgress({
      student_id,
      student_course_id,
      instructor_id,
      vehicle_type,
      lesson_number,
      status,
      feedback,
    });
    await newLesson.save();

    // 5️⃣ Auto update progress (caps at 100%)
    const progress = await updateProgress(student_id, vehicle_type);

    res.status(201).json({
      message: "Lesson added and progress updated",
      data: { lesson: newLesson, progress },
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// ✅ Get all lessons for a student
export const getLessonsByStudent = async (req, res) => {
  try {
    const lessons = await LessonProgress.find({ student_id: req.params.studentId });
    res.json(lessons);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Get all lesson progress records
export const getAllLessonProgress = async (req, res) => {
  try {
    const lessons = await LessonProgress.find();
    res.json(lessons);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Delete a lesson progress entry
export const deleteLessonProgress = async (req, res) => {
  try {
    const { lessonId } = req.params;

    const deleted = await LessonProgress.findByIdAndDelete(lessonId);

    if (!deleted) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    res.json({ message: "Lesson deleted successfully", deleted });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
