// backend/controllers/installmentController.js
import InstallmentPlan from "../models/InstallmentPlan.js";

// POST /api/installments  -> Create a plan
export const createPlan = async (req, res) => {
  try {
    const {
      studentId,
      totalAmount,
      downPayment = 0,
      remainingAmount,
      totalInstallments,
      startDate,
      schedule
    } = req.body;

    if (!Array.isArray(schedule) || schedule.length === 0) {
      return res.status(400).json({ message: "Schedule is required and must have items" });
    }

    // Auto-calc remaining if not provided
    const remaining = typeof remainingAmount === "number"
      ? remainingAmount
      : (Number(totalAmount) - Number(downPayment));

    const plan = await InstallmentPlan.create({
      studentId,
      totalAmount,
      downPayment,
      remainingAmount: remaining,
      totalInstallments,
      startDate,
      schedule
    });

    return res.status(201).json({ plan });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unable to create installment plan" });
  }
};

// GET /api/installments  -> List plans (optional filters later)
export const getAllPlans = async (req, res) => {
  try {
    const { studentId } = req.query;
    const filter = {};
    if (studentId) filter.studentId = studentId;

    const plans = await InstallmentPlan.find(filter).sort({ createdAt: -1 });
    return res.status(200).json({ plans });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unable to fetch plans" });
  }
};

// GET /api/installments/:id -> Single plan
export const getPlanById = async (req, res) => {
  try {
    const plan = await InstallmentPlan.findById(req.params.id);
    if (!plan) return res.status(404).json({ message: "Plan not found" });
    return res.status(200).json({ plan });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ message: "Invalid plan ID" });
  }
};

// PUT /api/installments/:id -> Update plan totals/basic fields
export const updatePlan = async (req, res) => {
  try {
    const { totalAmount, downPayment, remainingAmount, totalInstallments, startDate } = req.body;
    const plan = await InstallmentPlan.findByIdAndUpdate(
      req.params.id,
      { totalAmount, downPayment, remainingAmount, totalInstallments, startDate },
      { new: true, runValidators: true }
    );
    if (!plan) return res.status(404).json({ message: "Unable to update plan" });
    return res.status(200).json({ plan });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ message: "Invalid data or ID" });
  }
};

// PATCH /api/installments/:id/pay -> Mark one installment as paid
export const payInstallment = async (req, res) => {
  try {
    const { installmentNumber, paymentMethod, slipURL } = req.body;
    const plan = await InstallmentPlan.findById(req.params.id);
    if (!plan) return res.status(404).json({ message: "Plan not found" });

    const item = plan.schedule.find(i => i.installmentNumber === Number(installmentNumber));
    if (!item) return res.status(404).json({ message: "Installment not found" });

    if (item.status === "Approved") {
      return res.status(400).json({ message: "This installment is already paid" });
    }

    // mark paid
    item.status = "Approved";
    item.paidDate = new Date();
    if (paymentMethod) item.paymentMethod = paymentMethod;
    if (slipURL) item.slipURL = slipURL;

    // reduce remaining
    plan.remainingAmount = Number(plan.remainingAmount) - Number(item.amount);
    if (plan.remainingAmount < 0) plan.remainingAmount = 0;

    await plan.save();
    return res.status(200).json({ plan });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ message: "Unable to mark installment as paid" });
  }
};
