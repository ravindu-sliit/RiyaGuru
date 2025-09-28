import InstallmentPlan from "../models/InstallmentPlan.js";
import User from "../models/UserModel.js";
import { sendEmail } from "../services/emailService.js";

// Helper: get student email by plan.studentId
async function getStudentEmailByStudentId(studentId) {
  if (!studentId) return null;
  try {
    const user = await User.findOne({ userId: studentId });
    return user?.email || null;
  } catch {
    return null;
  }
}

// PATCH /api/admin/installments/:id/approve
export const approvePlan = async (req, res) => {
  const { adminComment } = req.body;
  try {
    const plan = await InstallmentPlan.findByIdAndUpdate(
      req.params.id,
      { adminApproved: true, adminComment: adminComment || undefined },
      { new: true }
    );
    if (!plan) return res.status(404).json({ message: "Plan not found" });

    // Email student
    const email = await getStudentEmailByStudentId(plan.studentId);
    if (email) {
      const subject = `Installment Plan Approved - ${plan.courseId || ''}`.trim();
      const lines = [
        `Hi,`,
        `Your installment plan has been approved by admin.`,
        plan.courseId ? `Course: ${plan.courseId}` : null,
        `Total: ${plan.totalAmount}`,
        adminComment ? `Admin note: ${adminComment}` : null,
      ].filter(Boolean);
      try { await sendEmail(email, subject, lines.join("\n")); } catch {}
    }

    return res.status(200).json({ plan });
  } catch (err) {
    console.error("❌ Error in approvePlan:", err);
    return res.status(400).json({ message: "Invalid ID" });
  }
};

// PATCH /api/admin/installments/:id/reject
export const rejectPlan = async (req, res) => {
  const { reason } = req.body; // reason required
  try {
    const plan = await InstallmentPlan.findByIdAndUpdate(
      req.params.id,
      { adminApproved: false, rejectionReason: reason || "Rejected by admin" },
      { new: true }
    );
    if (!plan) return res.status(404).json({ message: "Plan not found" });

    const email = await getStudentEmailByStudentId(plan.studentId);
    if (email) {
      const subject = `Installment Plan Rejected - ${plan.courseId || ''}`.trim();
      const lines = [
        `Hi,`,
        `Your installment plan was rejected.`,
        plan.courseId ? `Course: ${plan.courseId}` : null,
        reason ? `Reason: ${reason}` : `Reason: Not specified`,
        `Please update and resubmit your plan.`,
      ].filter(Boolean);
      try { await sendEmail(email, subject, lines.join("\n")); } catch {}
    }

    return res.status(200).json({ plan });
  } catch (err) {
    console.error("❌ Error in rejectPlan:", err);
    return res.status(400).json({ message: "Invalid ID" });
  }
};
