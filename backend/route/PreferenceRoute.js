import express from "express";
import { 
  addPreference,
  getAllPreferences,
  getPreferenceByStudentId,
  updatePreference,
  deletePreference
} from "../controllers/PreferenceController.js";

const router = express.Router();

// CRUD routes
router.post("/", addPreference); // Add preference
router.get("/", getAllPreferences); // Get all preferences
router.get("/:studentId", getPreferenceByStudentId); // Get preference by student
router.put("/:studentId", updatePreference); // Update preference
router.delete("/:studentId", deletePreference); // Delete preference

export default router;