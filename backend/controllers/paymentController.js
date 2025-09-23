import Payment from "../models/Payment.js";
import { processCardPayment } from "../utils/gateway.js";
import { paymentSchema } from "../validators/paymentValidation.js";


// GET /api/payments
export const getAllPayments = async (req, res) => {
  try {
    const { status, from, to, studentName, courseName } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (from || to) {
      filter.createdAt = {
        ...(from ? { $gte: new Date(from) } : {}),
        ...(to ? { $lte: new Date(to) } : {}),
      };
    }
    if (studentName) filter.studentName = { $regex: studentName, $options: "i" };
    if (courseName) filter.courseName = { $regex: courseName, $options: "i" };

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
    // 🔍 Validate request body
    const { error } = paymentSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { studentName, courseName, amount, paymentType, paymentMethod, slipURL, cardDetails } = req.body;

    let paymentData = {
      studentName,
      courseName,
      amount,
      paymentType,
      paymentMethod,
      slipURL,
      status: "Pending",
    };

    // If Card → simulate transaction
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
    return res.status(200).json({ payment });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ message: "Invalid ID" });
  }
};


// PUT /api/payments/:id
export const updatePayment = async (req, res) => {
  try {
    // 🔍 Validate incoming data with Joi
    const { error } = paymentSchema.validate(req.body, { allowUnknown: true });
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { amount, paymentType, paymentMethod, slipURL, adminComment, cardDetails, studentName, courseName } = req.body;

    let updateData = { amount, paymentType, paymentMethod, slipURL, adminComment, studentName, courseName };

    // If Card → simulate transaction
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
    console.error("❌ Error in updatePayment:", err);
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
