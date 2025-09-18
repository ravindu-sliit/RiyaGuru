// backend/controllers/paymentController.js
import Payment from "../models/Payment.js";

// GET /api/payments
export const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find().sort({ createdAt: -1 });
    return res.status(200).json({ payments });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// POST /api/payments
export const addPayment = async (req, res) => {
  const { studentId, courseId, amount, paymentType, paymentMethod, slipURL } = req.body;

  try {
    const payment = await Payment.create({
      studentId,
      courseId,
      amount,
      paymentType,
      paymentMethod,
      slipURL,
      status: "Pending",
    });
    return res.status(201).json({ payment });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unable to add payment" });
  }
};

// GET /api/payments/:id
export const getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ message: "Payment not found" });
    return res.status(200).json({ payment });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ message: "Invalid ID" });
  }
};

// PUT /api/payments/:id
export const updatePayment = async (req, res) => {
  const { amount, paymentType, paymentMethod, slipURL, adminComment } = req.body;

  try {
    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      { amount, paymentType, paymentMethod, slipURL, adminComment },
      { new: true, runValidators: true }
    );
    if (!payment) return res.status(404).json({ message: "Unable to update payment" });
    return res.status(200).json({ payment });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ message: "Invalid data or ID" });
  }
};

// PATCH /api/payments/:id/approve
export const approvePayment = async (req, res) => {
  const { adminComment } = req.body;
  try {
    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      { status: "Approved", paidDate: new Date(), adminComment },
      { new: true }
    );
    if (!payment) return res.status(404).json({ message: "Unable to approve payment" });
    return res.status(200).json({ payment });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ message: "Invalid ID" });
  }
};

// PATCH /api/payments/:id/reject
export const rejectPayment = async (req, res) => {
  const { adminComment } = req.body;
  try {
    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      { status: "Rejected", adminComment },
      { new: true }
    );
    if (!payment) return res.status(404).json({ message: "Unable to reject payment" });
    return res.status(200).json({ payment });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ message: "Invalid ID" });
  }
};

// DELETE /api/payments/:id
export const deletePayment = async (req, res) => {
  try {
    const payment = await Payment.findByIdAndDelete(req.params.id);
    if (!payment) return res.status(404).json({ message: "Unable to delete payment" });
    return res.status(200).json({ payment });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ message: "Invalid ID" });
  }
};
