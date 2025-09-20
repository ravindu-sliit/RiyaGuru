import express from "express";
import { addCourse } from "../controllers/courseController.js";

const router = express.Router();

// POST /api/courses
router.post("/", addCourse);

export default router;
