import nodemailer from "nodemailer";
import InstallmentPlan from "../models/InstallmentPlan.js";

export const sendReminders = async () => {
  try {
    const today = new Date();
    const upcoming = new Date();
    upcoming.setDate(today.getDate() + 3); // remind 3 days before due

    const plans = await InstallmentPlan.find({
      "schedule.dueDate": { $lte: upcoming, $gte: today },
      "schedule.status": "Pending"
    });

    if (!plans.length) return;

    // configure transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // your Gmail
        pass: process.env.EMAIL_PASS  // app password
      },
    });

    for (const plan of plans) {
      for (const installment of plan.schedule) {
        if (
          installment.status === "Pending" &&
          installment.dueDate <= upcoming &&
          installment.dueDate >= today
        ) {
          await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: "studentemail@example.com", // replace with student’s email field later
            subject: "Installment Due Reminder",
            text: `Hello ${plan.studentId}, 
Your installment #${installment.installmentNumber} of Rs.${installment.amount} is due on ${installment.dueDate.toDateString()}.`,
          });
        }
      }
    }
    console.log("✅ Reminders sent!");
  } catch (err) {
    console.error("❌ Error sending reminders:", err);
  }
};
