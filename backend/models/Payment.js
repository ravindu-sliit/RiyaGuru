import mongoose from "mongoose";
const { Schema } = mongoose;

const paymentSchema = new Schema(
  {
    studentId: { type: String, required: true },
    courseName: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    paymentType: { type: String, enum: ["Full", "Installment"], required: true },
    status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
    paymentMethod: { type: String, enum: ["Card", "Bank", "Cash"], required: true },
    slipURL: { type: String },
    receiptURL: { type: String },
    paidDate: { type: Date },
    adminComment: { type: String },

    // ✅ New section for card payments
    cardDetails: {
      cardNumber: { type: String },
      cardHolder: { type: String },
      expiryDate: { type: String }, // MM/YY
      cvv: { type: String }
    }
  },
  { timestamps: true }
);

const Payment = mongoose.model("Payment", paymentSchema);
export default Payment;
