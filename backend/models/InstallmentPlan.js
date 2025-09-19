// backend/models/InstallmentPlan.js
import mongoose from "mongoose";
const { Schema } = mongoose;

const InstallmentItemSchema = new Schema(
  {
    installmentNumber: { type: Number, required: true },     // 1..N
    amount: { type: Number, required: true, min: 0 },
    dueDate: { type: Date, required: true },
    paidDate: { type: Date },
    status: { type: String, enum: ["Pending", "Approved", "Overdue"], default: "Pending" },
    paymentMethod: { type: String, enum: ["Card", "Bank", "Cash"] },
    slipURL: { type: String },
    receiptURL: { type: String }   // (optional – for mini-receipt later)
  },
  { _id: false }
);

const InstallmentPlanSchema = new Schema(
  {
    studentId: { type: String, required: true }, // keep as string to match your Payments style ("114")
    totalAmount: { type: Number, required: true, min: 0 },
    downPayment: { type: Number, default: 0, min: 0 },
    remainingAmount: { type: Number, required: true, min: 0 },
    totalInstallments: { type: Number, required: true, min: 1 },
    startDate: { type: Date, required: true },
    schedule: { type: [InstallmentItemSchema], required: true } // array of items
  },
  { timestamps: true }
);

const InstallmentPlan = mongoose.model("InstallmentPlan", InstallmentPlanSchema);
export default InstallmentPlan;
