import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { addLessonProgress, getLessonsByStudent, getAllLessonProgress, deleteLessonProgress, getLessonsByStudentAndCourse } from "../controllers/lessonProgressController.js";

const router = express.Router();

// Only authenticated instructors may add lessons
router.post("/add", protect, addLessonProgress);
// Filtered route must come before the generic student route
router.get("/:studentId/:courseName", getLessonsByStudentAndCourse);
router.get("/:studentId", getLessonsByStudent);
// routes/lessonProgressRoutes.js
// Require authentication to fetch all lesson progress — instructors will be scoped to their own records
router.get("/", protect, getAllLessonProgress);
router.delete("/:lessonId", deleteLessonProgress);


export default router;
