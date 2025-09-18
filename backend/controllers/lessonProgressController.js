import LessonProgress from "../models/LessonProgress.js";
import { updateProgress } from "../helpers/progressHelper.js";

// Add new lesson progress
export const addLessonProgress = async (req, res) => {
  try {
    const newLesson = new LessonProgress(req.body);
    await newLesson.save();

    // auto update progress after adding lesson
    const progress = await updateProgress(req.body.student_id);

    res.status(201).json({ 
      message: "Lesson added and progress updated", 
      data: { lesson: newLesson, progress } 
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all lessons for a student
export const getLessonsByStudent = async (req, res) => {
  try {
    const lessons = await LessonProgress.find({ student_id: req.params.studentId });
    res.json(lessons);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
