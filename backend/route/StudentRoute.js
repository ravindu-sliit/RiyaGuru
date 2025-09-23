import express from "express";
import {
  getAllStudents,
  addStudent,
  getStudentById,
  updateStudent,
  deleteStudent,
  getMe,   // <-- add this
} from "../controllers/StudentController.js";
import { protect } from "../middleware/authMiddleware.js"; // <-- use JWT middleware
import StudentProfilePicUpload from "../middleware/StudentProfilePicUpload.js";

const router = express.Router();

router.get("/", getAllStudents);

// ✅ Logged-in student fetches their own profile
router.get("/me/profile", protect, getMe);

router.post("/", StudentProfilePicUpload.single("profilePic"), addStudent);
router.get("/:id", getStudentById);
router.put("/:id", StudentProfilePicUpload.single("profilePic"), updateStudent);
router.delete("/:id", deleteStudent);

export default router;
