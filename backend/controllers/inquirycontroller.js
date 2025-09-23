import Inquiry from "../models/Inquiry.js";

// Create
export const createInquiry = async (req, res) => {
  try {
    const { userId, subject, message } = req.body;
    const inquiry = await Inquiry.create({ userId, subject, message });
    res.status(201).json({ success: true, data: inquiry });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Read all
export const getAllInquiries = async (_req, res) => {
  try {
    const inquiries = await Inquiry.find().populate("userId", "name email");
    res.status(200).json({ success: true, data: inquiries });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Read one
export const getInquiryById = async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id).populate("userId", "name email");
    if (!inquiry) return res.status(404).json({ success: false, message: "Inquiry not found" });
    res.status(200).json({ success: true, data: inquiry });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Update (admin)
export const updateInquiry = async (req, res) => {
  try {
    const { status, response } = req.body;
    const updated = await Inquiry.findByIdAndUpdate(
      req.params.id,
      { status, response },
      { new: true }
    );

    if (!updated) return res.status(404).json({ success: false, message: "Inquiry not found" });
    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Delete
export const deleteInquiry = async (req, res) => {
  try {
    const del = await Inquiry.findByIdAndDelete(req.params.id);
    if (!del) return res.status(404).json({ success: false, message: "Inquiry not found" });
    res.status(200).json({ success: true, message: "Inquiry deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
