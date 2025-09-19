// backend/models/Payment.js
import mongoose from "mongoose";
const { Schema } = mongoose;

const paymentSchema = new Schema(
  {
    studentId: { type: String, required: true },   // ✅ now accepts "114" or "abc123"
    courseId: { type: String },                    // ✅ optional string
    amount: { type: Number, required: true, min: 0 },
    paymentType: { type: String, enum: ["Full", "Installment"], required: true },
    status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
    paymentMethod: { type: String, enum: ["Card", "Bank", "Cash"], required: true },
    slipURL: { type: String },
    receiptURL: { type: String },
    paidDate: { type: Date },
    adminComment: { type: String }
  },
  { timestamps: true }
);

const Payment = mongoose.model("Payment", paymentSchema);
export default Payment;
