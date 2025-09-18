import express from "express";
import LessonProgress from "../models/LessonProgress.js";

const router = express.Router();

// Add lesson progress
router.post("/add", async (req, res) => {
  try {
    const newLesson = new LessonProgress(req.body);
    await newLesson.save();
    res.status(201).json({ message: "Lesson progress added", data: newLesson });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all lessons for a student
router.get("/:studentId", async (req, res) => {
  try {
    const lessons = await LessonProgress.find({ student_id: req.params.studentId });
    res.json(lessons);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;