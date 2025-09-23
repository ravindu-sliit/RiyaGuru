import mongoose from "mongoose";
const { Schema } = mongoose;

const paymentSchema = new Schema(
  {
    studentName: { type: String, required: true },
    courseName: { 
      type: String, 
      enum: ["Car", "Van", "Heavy Vehicle", "Light Vehicle", "Motor Bicycle", "Three Wheeler"],
      required: true 
    },
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
