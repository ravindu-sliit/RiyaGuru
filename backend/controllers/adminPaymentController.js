// backend/controllers/adminPaymentController.js
import Payment from "../models/Payment.js";
import { generateReceipt } from "../utils/pdf.js";

// PATCH /api/admin/payments/:id/approve
export const approvePayment = async (req, res) => {
  const { adminComment } = req.body;
  try {
    let payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ message: "Unable to approve payment" });

    payment.status = "Approved";
    payment.paidDate = new Date();
    if (adminComment) payment.adminComment = adminComment;

    const filePath = generateReceipt(payment);   // writes receipts/receipt_<id>.pdf
    payment.receiptURL = filePath;

    await payment.save();
    return res.status(200).json({ payment });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ message: "Invalid ID" });
  }
};

// PATCH /api/admin/payments/:id/reject
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
