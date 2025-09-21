import mongoose from "mongoose";
const { Schema } = mongoose;

const paymentSchema = new Schema(
  {
    studentId: { type: String, required: true },
    studentCourseId: { type: String, required: true },  // 🔹 NEW: link to enrollment
    amount: { type: Number, required: true, min: 0 },
    paymentType: { type: String, enum: ["Full", "Installment"], required: true },
    status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
    paymentMethod: { type: String, enum: ["Card", "Bank", "Cash"], required: true },
    transactionId: { type: String },
    slipURL: { type: String },
    receiptURL: { type: String },
    paidDate: { type: Date },
    adminComment: { type: String },
    cardDetails: {
      cardNumber: String,
      cardHolder: String,
      expiryDate: String,
      cvv: String,
    },
  },
  { timestamps: true }
);


const Payment = mongoose.model("Payment", paymentSchema);
export default Payment;
