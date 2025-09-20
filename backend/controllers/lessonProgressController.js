// controllers/lessonProgressController.js
import LessonProgress from "../models/LessonProgress.js";
import { updateProgress } from "../helpers/progressHelper.js";

// ✅ Add new lesson progress
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

    // auto update progress for the course
    const progress = await updateProgress(student_course_id);

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
    const lessons = await LessonProgress.find({ student_id: req.params.studentId })
      .populate("instructor_id", "name email")
      .populate("student_course_id", "course_id status");
    res.json(lessons);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};