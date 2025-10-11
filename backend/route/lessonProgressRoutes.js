import express from "express";
import { addLessonProgress, getLessonsByStudent, getAllLessonProgress, deleteLessonProgress, getLessonsByStudentAndCourse } from "../controllers/lessonProgressController.js";

const router = express.Router();

router.post("/add", addLessonProgress);
// Filtered route must come before the generic student route
router.get("/:studentId/:courseName", getLessonsByStudentAndCourse);
router.get("/:studentId", getLessonsByStudent);
// routes/lessonProgressRoutes.js
router.get("/", getAllLessonProgress);
router.delete("/:lessonId", deleteLessonProgress);


export default router;
