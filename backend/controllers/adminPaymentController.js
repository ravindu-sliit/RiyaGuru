import Payment from "../models/Payment.js";
import { generateReceipt } from "../utils/pdf.js";

// PATCH /api/admin/payments/:id/approve
export const approvePayment = async (req, res) => {
  const { adminComment } = req.body;
  try {
    let payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ message: "Payment not found" });

    // update payment status
    payment.status = "Approved";
    payment.paidDate = new Date();
    if (adminComment) payment.adminComment = adminComment;

    // Generate and save receipt
    const filePath = generateReceipt(payment);
    payment.receiptURL = filePath;

    // If installment → adjust balance and next due date
    if (payment.paymentType === "Installment" && payment.balance > 0) {
      payment.balance = Math.max(0, payment.balance - payment.amount);

      if (payment.balance > 0) {
        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        payment.dueDate = nextMonth;
      }
    }

    await payment.save();
    return res.status(200).json({ payment });
  } catch (err) {
    console.error("❌ Error in approvePayment:", err);
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
    console.error("❌ Error in rejectPayment:", err);
    return res.status(400).json({ message: "Invalid ID" });
  }
};
