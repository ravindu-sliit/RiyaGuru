import express from "express";
import {
  getAllStudents,
  addStudent,
  getStudentById,
  updateStudent,
  deleteStudent,
  getMe,
  deleteProfilePic,   // ✅ added
} from "../controllers/StudentController.js";
import { protect } from "../middleware/authMiddleware.js";
import StudentProfilePicUpload from "../middleware/StudentProfilePicUpload.js";

const router = express.Router();

router.get("/", getAllStudents);

// Logged-in student fetches their own profile
router.get("/me/profile", protect, getMe);

router.post("/", StudentProfilePicUpload.single("profilePic"), addStudent);
router.get("/:id", getStudentById);
router.put("/:id", protect, StudentProfilePicUpload.single("profilePic"), updateStudent);

// ✅ New endpoint for deleting profile picture only
router.delete("/:id/profile-pic", deleteProfilePic);

router.delete("/:id", deleteStudent);

export default router;
