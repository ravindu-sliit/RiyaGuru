// backend/controllers/receiptController.js
import Payment from "../models/Payment.js";
import { generateReceipt } from "../utils/pdf.js";  // adjust path if needed
import path from "path";

export const downloadReceipt = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ message: "Payment not found" });
    if (payment.status !== "Approved") {
      return res.status(400).json({ message: "Receipt available only after approval" });
    }

    const filePath = generateReceipt(payment);

    return res.download(path.resolve(filePath));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to generate receipt" });
  }
};
