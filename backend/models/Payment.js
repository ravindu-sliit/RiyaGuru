// backend/models/Payment.js
import mongoose from "mongoose";
const { Schema } = mongoose;

const paymentSchema = new Schema(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "UserModel", required: true },
    courseId: { type: Schema.Types.ObjectId, ref: "CourseModel" },
    amount: { type: Number, required: true, min: 0 },
    paymentType: { type: String, enum: ["Full", "Installment"], required: true },
    status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
    paymentMethod: { type: String, enum: ["Card", "Bank", "Cash"], required: true },
    slipURL: { type: String },
    receiptURL: { type: String },
    paidDate: { type: Date },
    adminComment: { type: String },
    installment: {
      planId: { type: Schema.Types.ObjectId, ref: "InstallmentPlan" },
      number: { type: Number },
    },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
);

const Payment = mongoose.model("Payment", paymentSchema);
export default Payment;
