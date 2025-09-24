// backend/validators/inquiryValidator.js
import { body, param } from "express-validator";

export const createInquiryValidator = [
  body("userId")
    .notEmpty().withMessage("User ID is required")
    .isMongoId().withMessage("Invalid User ID format"),
  body("subject")
    .notEmpty().withMessage("Subject is required")
    .isLength({ max: 150 }).withMessage("Subject cannot exceed 150 characters"),
  body("message")
    .notEmpty().withMessage("Message is required"),
];

export const updateInquiryValidator = [
  param("id").isMongoId().withMessage("Invalid Inquiry ID"),
  body("status")
    .optional()
    .isIn(["Pending", "In Progress", "Resolved"])
    .withMessage("Invalid status value"),
  body("response")
    .optional()
    .isString().withMessage("Response must be text"),
];

export const inquiryIdValidator = [
  param("id")
    .isMongoId().withMessage("Invalid Inquiry ID"),
];
