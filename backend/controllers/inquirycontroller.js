import Inquiry from "../models/Inquiry.js";
import User from "../models/UserModel.js";
import { sendInquiryResolvedEmail } from "../services/inquiryEmailService.js";

// Create inquiry
export const createInquiry = async (req, res) => {
  try {
    const { userId, subject, message } = req.body;
    const inquiry = await Inquiry.create({ userId, subject, message });
    res.status(201).json({ success: true, data: inquiry });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Read all inquiries
export const getAllInquiries = async (_req, res) => {
  try {
    const inquiries = await Inquiry.find().populate("userId", "name email userId");
    res.status(200).json({ success: true, data: inquiries });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Read one inquiry using ID 
export const getInquiryById = async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id).populate("userId", "name email userId");
    if (!inquiry) return res.status(404).json({ success: false, message: "Inquiry not found" });
    res.status(200).json({ success: true, data: inquiry });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Update inquiry (admin) — sends email only when transitioning to Resolved
export const updateInquiry = async (req, res) => {
  try {
    const { status, response } = req.body;

    // 1) Load current inquiry to compare old/new status
    const current = await Inquiry.findById(req.params.id).populate(
      "userId",
      "email userId name"
    );
    if (!current) {
      return res.status(404).json({ success: false, message: "Inquiry not found" });
    }

    const wasResolved = current.status === "Resolved";
    const willBeResolved = status === "Resolved" && !wasResolved;

    // 2) Update
    const updated = await Inquiry.findByIdAndUpdate(
      req.params.id,
      { status, response },
      { new: true }
    ).populate("userId", "email userId name");

    // 3) Possibly send email
    let emailSent = false;
    if (willBeResolved) {
      const email = updated?.userId?.email || current?.userId?.email;
      const displayName =
        updated?.userId?.name ||
        updated?.userId?.userId ||
        current?.userId?.userId ||
        "Student";

      if (email) {
        try {
          console.log("[Mail] Sending resolution email to:", email);
          emailSent = await sendInquiryResolvedEmail(
            email,
            displayName,
            current.subject,
            response || "Your inquiry has been marked as resolved."
          );
        } catch (mailErr) {
          console.error("[Mail] Failed to send resolution email:", mailErr.message);
        }
      } else {
        console.warn("[Mail] Skipped sending email: no email on user for inquiry", req.params.id);
      }
    }

    res.status(200).json({ success: true, data: updated, emailSent });
  } catch (err) {
    console.error("Error updating inquiry:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// Delete inquiry
export const deleteInquiry = async (req, res) => {
  try {
    const del = await Inquiry.findByIdAndDelete(req.params.id);
    if (!del) return res.status(404).json({ success: false, message: "Inquiry not found" });
    res.status(200).json({ success: true, message: "Inquiry deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
