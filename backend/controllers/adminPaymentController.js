import Payment from "../models/Payment.js";
import { generateReceipt } from "../utils/pdf.js";
import { sendEmail } from "../services/emailService.js";

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

    // Generate and save receipt (await to get string path)
    const filePath = await generateReceipt(payment);
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

    // Notify student via email (if we have an email)
    if (payment.studentEmail) {
      const subject = `Payment Approved - ${payment.courseName}`;
      const lines = [
        `Hi,`,
        `Your payment has been approved.`,
        `Course: ${payment.courseName}`,
        `Amount: ${payment.amount}`,
        payment.receiptURL ? `Receipt: ${payment.receiptURL}` : null,
        adminComment ? `Admin note: ${adminComment}` : null,
      ].filter(Boolean);
      try { await sendEmail(payment.studentEmail, subject, lines.join("\n")); } catch {}
    }

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

    // Notify student
    if (payment.studentEmail) {
      const subject = `Payment Rejected - ${payment.courseName}`;
      const lines = [
        `Hi,`,
        `Your payment was rejected.`,
        `Course: ${payment.courseName}`,
        `Amount: ${payment.amount}`,
        adminComment ? `Reason: ${adminComment}` : null,
      ];
      // Method-specific guidance (no model changes)
      if (payment.paymentMethod === "Card") {
        lines.push(
          `If your card was charged, a refund will be initiated by the office. Please allow 5-7 business days.`,
          `If you don't see the refund in that time, contact the office with this payment reference.`
        );
      } else if (payment.paymentMethod === "Bank") {
        lines.push(
          `If you already transferred funds, please visit or contact the office to arrange a refund using your slip reference.`,
          `If no funds were received, you may re-submit with a valid slip.`
        );
      } else if (payment.paymentMethod === "Cash") {
        lines.push(
          `Please visit the office regarding any refund or to settle corrections.`
        );
      }
      lines.push(`Please re-submit the payment with corrections.`);
      try { await sendEmail(payment.studentEmail, subject, lines.filter(Boolean).join("\n")); } catch {}
    }

    return res.status(200).json({ payment });
  } catch (err) {
    console.error("❌ Error in rejectPayment:", err);
    return res.status(400).json({ message: "Invalid ID" });
  }
};
