import express from "express";
import {
  createInquiry,
  getAllInquiries,
  getInquiryById,
  updateInquiry,
  deleteInquiry
} from "../controllers/inquirycontroller.js";

import {
  createInquiryValidator,
  updateInquiryValidator,
  inquiryIdValidator
} from "../validators/inquiryValidator.js";

import validateRequest from "../middleware/validateRequest.js";

const router = express.Router();

// CRUD routes with validation
router.post("/", createInquiryValidator, validateRequest, createInquiry);
router.get("/", getAllInquiries);
router.get("/:id", inquiryIdValidator, validateRequest, getInquiryById);
router.put("/:id", updateInquiryValidator, validateRequest, updateInquiry);
router.delete("/:id", inquiryIdValidator, validateRequest, deleteInquiry);

export default router;
