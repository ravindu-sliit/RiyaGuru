// backend/validators/maintenanceValidator.js
import { body, param } from "express-validator";

// ✅ Create Maintenance Validation
export const createMaintenanceValidator = [
  body("vehicleId")
    .notEmpty().withMessage("Vehicle ID is required")
    .isMongoId().withMessage("Invalid Vehicle ID format"),

  body("serviceDate")
    .notEmpty().withMessage("Service date is required")
    .isISO8601().withMessage("Service date must be a valid date"),

  body("serviceType")
    .optional()
    .isString().withMessage("Service type must be a string")
    .isLength({ max: 100 }).withMessage("Service type cannot exceed 100 characters"),

  body("cost")
    .optional()
    .isFloat({ min: 0 }).withMessage("Cost must be a positive number"),

  body("description")
    .optional()
    .isString().withMessage("Description must be text"),
];

// ✅ Update Maintenance Validation
export const updateMaintenanceValidator = [
  param("id").isMongoId().withMessage("Invalid Maintenance ID"),

  body("vehicleId")
    .optional()
    .isMongoId().withMessage("Invalid Vehicle ID format"),

  body("serviceDate")
    .optional()
    .isISO8601().withMessage("Service date must be a valid date"),

  body("serviceType")
    .optional()
    .isString().withMessage("Service type must be a string")
    .isLength({ max: 100 }).withMessage("Service type cannot exceed 100 characters"),

  body("cost")
    .optional()
    .isFloat({ min: 0 }).withMessage("Cost must be a positive number"),

  body("description")
    .optional()
    .isString().withMessage("Description must be text"),
];

// ✅ Validate ID for GET & DELETE
export const maintenanceIdValidator = [
  param("id").isMongoId().withMessage("Invalid Maintenance ID"),
];
