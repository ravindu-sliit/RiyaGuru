import Inquiry from "../models/Inquiry.js"; // use import, not require

// Create a new inquiry
export const createInquiry = async (req, res) => {
  try {
    const { userId, subject, message } = req.body;

    const inquiry = new Inquiry({ userId, subject, message });
    await inquiry.save();

    res.status(201).json({ success: true, data: inquiry });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get all inquiries
export const getAllInquiries = async (req, res) => {
  try {
    const inquiries = await Inquiry.find().populate("userId", "name email");
    res.status(200).json({ success: true, data: inquiries });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get inquiry by ID
export const getInquiryById = async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id).populate("userId", "name email");
    if (!inquiry) return res.status(404).json({ success: false, message: "Inquiry not found" });

    res.status(200).json({ success: true, data: inquiry });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update inquiry status/response
export const updateInquiry = async (req, res) => {
  try {
    const { status, response } = req.body;
    const inquiry = await Inquiry.findByIdAndUpdate(
      req.params.id,
      { status, response },
      { new: true }
    );
    if (!inquiry) return res.status(404).json({ success: false, message: "Inquiry not found" });

    res.status(200).json({ success: true, data: inquiry });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete an inquiry
export const deleteInquiry = async (req, res) => {
  try {
    const inquiry = await Inquiry.findByIdAndDelete(req.params.id);
    if (!inquiry) return res.status(404).json({ success: false, message: "Inquiry not found" });

    res.status(200).json({ success: true, message: "Inquiry deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
