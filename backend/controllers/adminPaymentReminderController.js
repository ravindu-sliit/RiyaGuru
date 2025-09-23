import { sendReminders } from "../utils/reminder.js";

// POST /api/admin/payments/reminders/run
export const runReminders = async (req, res) => {
  try {
    const result = await sendReminders();
    return res.status(200).json({
      message: "✅ Reminders sent successfully!",
      details: result || []
    });
  } catch (err) {
    console.error("❌ Error in runReminders:", err);
    return res.status(500).json({ message: "Failed to send reminders" });
  }
};
