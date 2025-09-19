// backend/controllers/receiptController.js
import Payment from "../models/Payment.js";

export const getReceipt = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment || !payment.receiptURL) {
      return res.status(404).json({ message: "Receipt not found" });
    }
    return res.download(payment.receiptURL);
  } catch (err) {
    console.error(err);
    return res.status(400).json({ message: "Invalid ID" });
  }
};
