// backend/models/InstallmentPlan.js
import mongoose from "mongoose";
const { Schema } = mongoose;

// One schedule item = one installment
const InstallmentItemSchema = new Schema(
  {
    installmentNumber: { type: Number, required: true },   // 1..N
    amount: { type: Number, required: true, min: 0 },      // auto-calculated
    dueDate: { type: Date, required: true },               // auto-calculated
    paidDate: { type: Date },                              // when student pays
    status: { 
      type: String, 
      enum: ["Pending", "Approved", "Overdue"], 
      default: "Pending" 
    },
    paymentMethod: { type: String, enum: ["Card", "Bank", "Cash"] },
    slipURL: { type: String },
  },
  { _id: false } // don’t create a new _id for each item
);

// Full installment plan schema
const InstallmentPlanSchema = new Schema(
  {
    studentId: { type: String, required: true },  // keep string like "S003"
    courseId: { type: String },                   // optional
    totalAmount: { type: Number, required: true, min: 0 },
    downPayment: { type: Number, default: 0, min: 0 },
    remainingAmount: { type: Number, required: true, min: 0 },
    totalInstallments: { type: Number, required: true, min: 1 },
    startDate: { type: Date, required: true },
    // Business flags
    adminApproved: { type: Boolean, default: false },
    downPaymentPaid: { type: Boolean, default: false },
    adminComment: { type: String },
    rejectionReason: { type: String },
    schedule: { type: [InstallmentItemSchema], required: true } // generated array
  },
  { timestamps: true }
);
const InstallmentPlan = mongoose.models.InstallmentPlan || mongoose.model("InstallmentPlan", InstallmentPlanSchema);
export default InstallmentPlan;
