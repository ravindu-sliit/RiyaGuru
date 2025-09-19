import express from "express";
import {
  addUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser
} from "../controllers/UserController.js";

const router = express.Router();

// Add a new user
router.post("/", addUser);

// Get all users
router.get("/", getAllUsers);

// Get user by ID
router.get("/:id", getUserById);

// Update user by ID
router.put("/:id", updateUser);

// Delete user by ID
router.delete("/:id", deleteUser);

export default router;
