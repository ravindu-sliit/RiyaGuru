// src/validation/inquiryValidation.js

/**
 * Validate the inquiry form fields.
 * @param {Object} form - The form data.
 * @param {string} form.userId - The selected/entered user ID.
 * @param {string} form.subject - The subject of the inquiry.
 * @param {string} form.message - The inquiry message.
 * @returns {Object} errors - An object with error messages for invalid fields.
 */
export const validateInquiryForm = (form) => {
  const errors = {};

  // Validate User ID
  if (!form.userId || form.userId.trim() === "") {
    errors.userId = "Please enter a valid User ID or code.";
  }

  // Validate Subject (min 3 characters)
  if (!form.subject || form.subject.trim().length < 3) {
    errors.subject = "Subject is required (min 3 characters).";
  }

  // Validate Message (min 5 characters)
  if (!form.message || form.message.trim().length < 5) {
    errors.message = "Message is required (min 5 characters).";
  }

  return errors;
};

/**
 * Extra: Status validation for Admin updating inquiry status.
 * @param {string} status - The selected inquiry status.
 * @returns {string|null} error - Error message if invalid, otherwise null.
 */
export const validateInquiryStatus = (status) => {
  const allowed = ["Pending", "In Progress", "Resolved"];
  if (!allowed.includes(status)) {
    return "Invalid status selected.";
  }
  return null;
};
