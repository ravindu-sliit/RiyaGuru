import express from "express";
import {
  addStudentCourse,
  getAllStudentCourses,
  getCoursesByStudentId,
  updateStudentCourse,
  deleteStudentCourse
} from "../controllers/StudentCourseController.js";

const router = express.Router();

// POST /api/studentcourses
router.post("/", addStudentCourse);

// GET /api/studentcourses
router.get("/", getAllStudentCourses);

// GET /api/studentcourses/:student_id
router.get("/:student_id", getCoursesByStudentId);

// PUT /api/studentcourses/:student_id
router.put("/:student_id", updateStudentCourse);

// DELETE /api/studentcourses/:student_id/:course_id
router.delete("/:student_id/:course_id", deleteStudentCourse);

export default router;
