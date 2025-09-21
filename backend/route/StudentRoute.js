import express from "express";
import {
  getAllStudents,
  addStudent,
  getStudentById,
  updateStudent,
  deleteStudent,
} from "../controllers/StudentController.js";

const router = express.Router();

router.get("/", getAllStudents);
router.post("/", addStudent);
router.get("/:id", getStudentById);
router.put("/:id", updateStudent);
router.delete("/:id", deleteStudent);

export default router;
