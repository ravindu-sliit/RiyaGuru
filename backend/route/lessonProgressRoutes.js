import express from "express";
import { addLessonProgress, getLessonsByStudent } from "../controllers/lessonProgressController.js";

const router = express.Router();

router.post("/add", addLessonProgress);
router.get("/:studentId", getLessonsByStudent);

export default router;
