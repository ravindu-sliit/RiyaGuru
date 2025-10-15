import express from "express";
import {
  getAllStudents,
  addStudent,
  getStudentById,
  updateStudent,
  deleteStudent,
  getMe,
  deleteProfilePic,
} from "../controllers/StudentController.js";
import { protect } from "../middleware/authMiddleware.js";
import StudentProfilePicUpload from "../middleware/StudentProfilePicUpload.js";

const router = express.Router();

// Public list (you may lock this down later if needed)
router.get("/", getAllStudents);

// Logged-in student fetches their own profile
router.get("/me/profile", protect, getMe);

// Create student (profile pic optional)
router.post("/", StudentProfilePicUpload.single("profilePic"), addStudent);

// Get single student (public fetch by id)
router.get("/:id", getStudentById);

// ✅ Update student (needs JWT so we can know role; required for email-on-admin change)
router.put(
  "/:id",
  protect,
  StudentProfilePicUpload.single("profilePic"),
  updateStudent
);

// ✅ Delete only the student's profile picture (protect recommended)
router.delete("/:id/profile-pic", protect, deleteProfilePic);

// ✅ Delete student (protect recommended)
router.delete("/:id", protect, deleteStudent);

export default router;
