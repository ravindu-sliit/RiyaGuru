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
      vehicle_type,   // this is your course name
      lesson_number,
      status,
      feedback,
    } = req.body;

    // 1️⃣ Prevent duplicate lesson numbers
    const existingLesson = await LessonProgress.findOne({
      student_id,
      vehicle_type,
      lesson_number,
    });
    if (existingLesson) {
      return res
        .status(400)
        .json({ message: `Lesson ${lesson_number} already recorded for ${vehicle_type}` });
    }

    // 2️⃣ Save the new lesson progress
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

    // 3️⃣ Auto update progress (creates ProgressTracking if missing)
    const progress = await updateProgress(student_id, vehicle_type);

    res.status(201).json({
      message: "✅ Lesson added and progress updated",
      data: { lesson: newLesson, progress },
    });
  } catch (error) {
    console.error("Error in addLessonProgress:", error);
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
// ✅ Delete a lesson progress entry and re-sync progress
export const deleteLessonProgress = async (req, res) => {
  try {
    const { lessonId } = req.params;

    // 1️⃣ Find the lesson first
    const lesson = await LessonProgress.findById(lessonId);
    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    // 2️⃣ Delete the lesson
    await LessonProgress.findByIdAndDelete(lessonId);

    // 3️⃣ Recalculate progress for this student + course
    const progress = await updateProgress(lesson.student_id, lesson.vehicle_type);

    res.json({
      message: "✅ Lesson deleted successfully and progress updated",
      deleted: lesson,
      updatedProgress: progress,
    });
  } catch (error) {
    console.error("Error in deleteLessonProgress:", error);
    res.status(500).json({ error: error.message });
  }
};

