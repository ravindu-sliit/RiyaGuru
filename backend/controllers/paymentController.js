import Payment from "../models/Payment.js";
import StudentCourse from "../models/StudentCourse.js";
import { processCardPayment } from "../utils/gateway.js";

// GET /api/payments
export const getAllPayments = async (req, res) => {
  try {
    const { studentCourseId, status, from, to } = req.query;
    const filter = { studentId: req.user.userId };

    if (studentCourseId) filter.studentCourseId = studentCourseId;
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
  try {
    const studentId = req.user.userId;
    const { studentCourseId, amount, paymentType, paymentMethod, slipURL, cardDetails } = req.body;

    // 🔹 Check enrollment first
    const enrollment = await StudentCourse.findById(studentCourseId);
    if (!enrollment) return res.status(404).json({ message: "Enrollment not found" });

    // Always create with Pending status
    let paymentData = {
      studentId,
      studentCourseId,
      amount,
      paymentType,
      paymentMethod,
      slipURL,
      status: "Pending",
    };

    // If Card, run dummy gateway just to simulate transactionId
    if (paymentMethod === "Card" && cardDetails) {
      const result = await processCardPayment(cardDetails, amount);
      if (!result.success) {
        return res.status(400).json({ message: result.message });
      }
      paymentData.transactionId = result.transactionId;
      paymentData.cardDetails = cardDetails;
    }

    const payment = await Payment.create(paymentData);
    return res.status(201).json({ payment });
  } catch (err) {
    console.error("❌ Error in addPayment:", err);
    return res.status(500).json({ message: "Unable to add payment" });
  }
};

// GET /api/payments/:id
export const getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ message: "Payment not found" });
    if (payment.studentId !== req.user.userId && req.user.role !== "Admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }
    return res.status(200).json({ payment });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ message: "Invalid ID" });
  }
};

// PUT /api/payments/:id
export const updatePayment = async (req, res) => {
  try {
    const { amount, paymentType, paymentMethod, slipURL, adminComment, cardDetails } = req.body;
    let updateData = { amount, paymentType, paymentMethod, slipURL, adminComment };

    if (paymentMethod === "Card" && cardDetails) {
      const result = await processCardPayment(cardDetails, amount);
      if (!result.success) {
        return res.status(400).json({ message: result.message });
      }
      updateData.cardDetails = cardDetails;
      updateData.transactionId = result.transactionId;
    }

    const payment = await Payment.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

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
