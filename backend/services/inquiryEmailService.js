// services/inquiryEmailService.js
import nodemailer from "nodemailer";

// Gmail SMTP using App Password (2-Step Verification required)
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // 465 = SSL
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify once on boot so you see clear logs if creds/connection are wrong
(async () => {
  try {
    await transporter.verify();
    console.log("[Mail] SMTP transporter verified and ready.");
  } catch (err) {
    console.error("[Mail] SMTP verification FAILED:", err.message);
  }
})();

export const sendInquiryResolvedEmail = async (
  userEmail,
  userName,
  inquirySubject,
  adminResponse
) => {
  const subject = `Your Inquiry: ${inquirySubject} - Resolved`;

  const text = `Dear ${userName},
We're pleased to inform you that your inquiry regarding "${inquirySubject}" has been resolved by our support team.

Response from support:
${adminResponse || 'No additional details provided.'}

If you have any further questions, please don't hesitate to contact us.

Best regards,
RiyaGuru Support Team`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px;">
        <h2 style="color: #4a6baf;">Inquiry Resolved</h2>
        <p>Dear ${userName},</p>
        <p>We're pleased to inform you that your inquiry regarding <strong>${inquirySubject}</strong> has been resolved by our support team.</p>

        <div style="background-color: #fff; padding: 15px; border-left: 4px solid #4a6baf; margin: 15px 0;">
          <p style="margin: 0; color: #495057;"><strong>Response from support:</strong></p>
          <p style="margin: 10px 0 0 0; color: #212529;">${adminResponse || 'No additional details provided.'}</p>
        </div>

        <p>If you have any further questions, please don't hesitate to contact us.</p>

        <p>Best regards,<br><strong>RiyaGuru Support Team</strong></p>

        <div style="margin-top: 20px; padding-top: 10px; border-top: 1px solid #dee2e6; font-size: 12px; color: #6c757d;">
          <p>This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    </div>
  `;

  try {
    const info = await transporter.sendMail({
      from: `"RiyaGuru Support" <${process.env.EMAIL_USER}>`, // must match EMAIL_USER
      to: userEmail,
      subject,
      text,
      html,
    });
    console.log(`[Mail] Resolution email sent to ${userEmail}. MessageID: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error("[Mail] Error sending inquiry resolution email:", error.message);
    return false;
  }
};
