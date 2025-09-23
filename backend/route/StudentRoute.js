import express from "express";
import {
  getAllStudents,
  addStudent,
  getStudentById,
  updateStudent,
  deleteStudent,
} from "../controllers/StudentController.js";
import StudentProfilePicUpload from "../middleware/StudentProfilePicUpload.js"; // <-- NEW

const router = express.Router();

router.get("/", getAllStudents);

// profile pic optional on create
router.post("/", StudentProfilePicUpload.single("profilePic"), addStudent);

router.get("/:id", getStudentById);

// profile pic optional on update (replaces old file if provided)
router.put("/:id", StudentProfilePicUpload.single("profilePic"), updateStudent);

router.delete("/:id", deleteStudent);

export default router;
