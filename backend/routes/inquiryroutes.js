import express from "express";
import {
  createInquiry,
  getAllInquiries,
  getInquiryById,
  updateInquiry,
  deleteInquiry
} from "../controllers/inquirycontroller.js";

const router = express.Router();

// CRUD routes
router.post("/", createInquiry);        // Create inquiry
router.get("/", getAllInquiries);       // Get all inquiries
router.get("/:id", getInquiryById);     // Get single inquiry
router.put("/:id", updateInquiry);      // Update inquiry
router.delete("/:id", deleteInquiry);   // Delete inquiry

export default router;
