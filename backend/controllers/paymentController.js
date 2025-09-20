// backend/controllers/paymentController.js
import Payment from "../models/Payment.js";
import { processCardPayment } from "../utils/gateway.js"; // 👈 add this import

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
  const { studentId, courseId, courseName, amount, paymentType, paymentMethod, slipURL, cardDetails } = req.body;

  try {
    // ✅ Always approve Card payments
    let status = "Pending";
    let paidDate = null;
    let transactionId = null;

    if (paymentMethod === "Card") {
      // Basic validation
      if (
        !cardDetails?.cardNumber ||
        cardDetails.cardNumber.length !== 16 ||
        !cardDetails?.cvv ||
        (cardDetails.cvv.length !== 3 && cardDetails.cvv.length !== 4) ||
        !cardDetails?.expiryDate
      ) {
        return res.status(400).json({ message: "Invalid card details" });
      }

      // ✅ Always success for demo/viva
      status = "Approved";
      paidDate = new Date();
      transactionId = "TXN-" + Date.now();
    }

    const payment = await Payment.create({
      studentId,
      courseId,
      courseName,
      amount,
      paymentType,
      paymentMethod,
      slipURL,
      status,
      paidDate,
      transactionId,
      cardDetails,
    });

    // 📌 Generate receipt immediately for Card payments
if (paymentMethod === "Card" && status === "Approved") {
  const filePath = generateReceipt(payment);
  payment.receiptURL = filePath;
  await payment.save();
}

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
  const { amount, paymentType, paymentMethod, slipURL, adminComment, courseName, courseId, cardDetails } = req.body;

  try {
    const updateData = { amount, paymentType, paymentMethod, slipURL, adminComment, courseName, courseId };

    // If updating card details
    if (paymentMethod === "Card" && cardDetails) {
      const result = await processCardPayment(cardDetails, amount);
      if (!result.success) {
        return res.status(400).json({ message: result.message });
      }
      updateData.cardDetails = cardDetails;
      updateData.transactionId = result.transactionId;
      updateData.status = "Approved";
      updateData.paidDate = new Date();
    }

    const payment = await Payment.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
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
