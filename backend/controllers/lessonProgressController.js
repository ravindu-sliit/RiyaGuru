// controllers/lessonProgressController.js
import LessonProgress from "../models/LessonProgress.js";
import ProgressTracking from "../models/ProgressTracking.js";
import { updateProgress } from "../helpers/progressHelper.js";

// ✅ Add new lesson progress (with validation)
export const addLessonProgress = async (req, res) => {
  try {
    // Only instructors or admins may add lesson progress
    if (!req.user || (req.user.role !== "Instructor" && req.user.role !== "Admin")) {
      return res.status(403).json({ message: "Only instructors or admins may add lesson progress" });
    }
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
    // If the caller is an Instructor, ensure they are adding for themselves
    if (req.user.role === "Instructor" && req.user.userId !== instructor_id) {
      return res.status(403).json({ message: "Instructors can only add lessons for themselves" });
    }

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
    // If the request is authenticated and the user is an Instructor, scope to their lessons
    if (req.user && req.user.role === "Instructor") {
      const lessons = await LessonProgress.find({ instructor_id: req.user.userId });
      return res.json(lessons);
    }

    // Otherwise (admin or unauthenticated), return all lessons
    const lessons = await LessonProgress.find();
    res.json(lessons);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Get lessons for a specific student + course (filtered)
export const getLessonsByStudentAndCourse = async (req, res) => {
  try {
    const { studentId, courseName } = req.params;
    const lessons = await LessonProgress.find({
      student_id: studentId,
      vehicle_type: courseName,
      status: "Completed",
    }).sort({ lesson_number: 1 });

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

