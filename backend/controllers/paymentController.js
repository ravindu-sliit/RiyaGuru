// backend/controllers/paymentController.js
import Payment from "../models/Payment.js";

// GET /api/payments  (supports ?studentId=&status=&from=&to=)
export const getAllPayments = async (req, res) => {
  try {
    const { studentId, status, from, to } = req.query;
    const filter = {};
    if (studentId) filter.studentId = studentId;
    if (status) filter.status = status;
    if (from || to) {
      filter.createdAt = {
        ...(from ? { $gte: new Date(from) } : {}),
        ...(to ? { $lte: new Date(to) } : {}),
      };
    }
    const payments = await Payment.find(filter).sort({ createdAt: -1 });
    return res.status(200).json({ payments });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// POST /api/payments
export const addPayment = async (req, res) => {
  const { studentId, courseId, courseName, amount, paymentType, paymentMethod, slipURL } = req.body;
  try {
    const payment = await Payment.create({
      studentId,
      courseId,
      courseName,
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
  const { amount, paymentType, paymentMethod, slipURL, adminComment, courseName, courseId } = req.body;
  try {
    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      { amount, paymentType, paymentMethod, slipURL, adminComment, courseName, courseId },
      { new: true, runValidators: true }
    );
    if (!payment) return res.status(404).json({ message: "Unable to update payment" });
    return res.status(200).json({ payment });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ message: "Invalid data or ID" });
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
