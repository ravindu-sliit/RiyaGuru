import express from "express";
import { addLessonProgress, getLessonsByStudent, getAllLessonProgress, deleteLessonProgress, } from "../controllers/lessonProgressController.js";

const router = express.Router();

router.post("/add", addLessonProgress);
router.get("/:studentId", getLessonsByStudent);
// routes/lessonProgressRoutes.js
router.get("/", getAllLessonProgress);
router.delete("/:lessonId", deleteLessonProgress);


export default router;
