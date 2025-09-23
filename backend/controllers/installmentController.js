import InstallmentPlan from "../models/InstallmentPlan.js";
import { installmentSchema } from "../validators/installmentValidation.js"; // <-- import validation

// POST /api/installments
export const createPlan = async (req, res) => {
  try {
    // 🔍 Validate input
    const { error } = installmentSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { studentId, courseId, totalAmount, downPayment, totalInstallments, startDate } = req.body;

    const remainingAmount = totalAmount - downPayment;
    if (remainingAmount < 0) {
      return res.status(400).json({ message: "Down payment cannot exceed total amount" });
    }

    const installmentAmount = remainingAmount / totalInstallments;

    // Generate schedule
    const schedule = [];
    const start = new Date(startDate);

    for (let i = 1; i <= totalInstallments; i++) {
      const dueDate = new Date(start);
      dueDate.setMonth(dueDate.getMonth() + i);

      schedule.push({
        installmentNumber: i,
        amount: installmentAmount,
        dueDate,
        status: "Pending"
      });
    }

    const plan = await InstallmentPlan.create({
      studentId,
      courseId,
      totalAmount,
      downPayment,
      remainingAmount,
      totalInstallments,
      startDate,
      schedule
    });

    return res.status(201).json({ plan });
  } catch (err) {
    console.error("❌ Error in createPlan:", err);
    return res.status(500).json({ message: "Unable to create plan" });
  }
};

// GET /api/installments
export const getAllPlans = async (req, res) => {
  try {
    const { studentId } = req.query;
    const filter = {};
    if (studentId) filter.studentId = studentId;

    const plans = await InstallmentPlan.find(filter).sort({ createdAt: -1 });
    return res.status(200).json({ plans });
  } catch (err) {
    console.error("❌ Error in getAllPlans:", err);
    return res.status(500).json({ message: "Unable to fetch plans" });
  }
};

// GET /api/installments/:id
export const getPlanById = async (req, res) => {
  try {
    const plan = await InstallmentPlan.findById(req.params.id);
    if (!plan) return res.status(404).json({ message: "Plan not found" });
    return res.status(200).json({ plan });
  } catch (err) {
    console.error("❌ Error in getPlanById:", err);
    return res.status(400).json({ message: "Invalid plan ID" });
  }
};

// PUT /api/installments/:id
export const updatePlan = async (req, res) => {
  try {
    const { totalAmount, downPayment, remainingAmount, totalInstallments, startDate } = req.body;

    // 🔍 Validation
    if (totalAmount <= 0) return res.status(400).json({ message: "Total amount must be positive" });
    if (downPayment < 0) return res.status(400).json({ message: "Down payment cannot be negative" });
    if (totalInstallments < 1 || totalInstallments > 12) {
      return res.status(400).json({ message: "Installments must be between 1 and 12" });
    }

    const plan = await InstallmentPlan.findByIdAndUpdate(
      req.params.id,
      { totalAmount, downPayment, remainingAmount, totalInstallments, startDate },
      { new: true, runValidators: true }
    );

    if (!plan) return res.status(404).json({ message: "Unable to update plan" });
    return res.status(200).json({ plan });
  } catch (err) {
    console.error("❌ Error in updatePlan:", err);
    return res.status(400).json({ message: "Invalid data or ID" });
  }
};

// PATCH /api/installments/:id/pay
export const payInstallment = async (req, res) => {
  try {
    const { installmentNumber, paymentMethod, slipURL } = req.body;

    if (!installmentNumber || installmentNumber < 1) {
      return res.status(400).json({ message: "Installment number is required and must be valid" });
    }

    const plan = await InstallmentPlan.findById(req.params.id);
    if (!plan) return res.status(404).json({ message: "Plan not found" });

    const item = plan.schedule.find(i => i.installmentNumber === Number(installmentNumber));
    if (!item) return res.status(404).json({ message: "Installment not found" });

    if (item.status === "Approved") {
      return res.status(400).json({ message: "This installment is already paid" });
    }

    item.status = "Approved";
    item.paidDate = new Date();
    if (paymentMethod) item.paymentMethod = paymentMethod;
    if (slipURL) item.slipURL = slipURL;

    plan.remainingAmount = Number(plan.remainingAmount) - Number(item.amount);
    if (plan.remainingAmount < 0) plan.remainingAmount = 0;

    await plan.save();
    return res.status(200).json({ plan });
  } catch (err) {
    console.error("❌ Error in payInstallment:", err);
    return res.status(400).json({ message: "Unable to mark installment as paid" });
  }
};
