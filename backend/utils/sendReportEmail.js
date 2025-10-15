import nodemailer from "nodemailer";
import path from "path";

// Sends a student report email. For local dev: if EMAIL_USER / EMAIL_PASS are not provided,
// this will create an Ethereal test account and return the preview URL which is useful for debugging.
export const sendStudentReportEmail = async (toEmail, student, filePath) => {
  let transporter;
  let isTestAccount = false;
  try {
    const smtpUser = process.env.SMTP_USER || process.env.EMAIL_USER;
    const smtpPass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
    if (smtpUser && smtpPass) {
      transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || "gmail",
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });
    } else {
      // Create ethereal test account for local development
      const testAccount = await nodemailer.createTestAccount();
      isTestAccount = true;
      transporter = nodemailer.createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      console.warn("EMAIL_USER not set — using Ethereal test account for email (no real email will be sent)");
    }

    const fromUser = process.env.SMTP_USER || process.env.EMAIL_USER || "ethereal@example.com";
    const mailOptions = {
      from: `"RiyaGuru.lk Driving School" <${fromUser}>`,
      to: toEmail,
      subject: `Your Progress Report - ${student.full_name || student.studentId}`,
      text: `Hello ${student.full_name || student.studentId},\n\nPlease find attached your progress report.\n\nRegards,\nRiyaGuru.lk`,
      attachments: [
        {
          filename: path.basename(filePath),
          path: path.resolve(filePath),
          contentType: "application/pdf",
        },
      ],
    };
    try {
      const info = await transporter.sendMail(mailOptions);
      if (isTestAccount) {
        const preview = nodemailer.getTestMessageUrl(info);
        console.log("Ethereal preview URL:", preview);
        return { previewUrl: preview };
      }
      return { messageId: info.messageId };
    } catch (sendErr) {
      console.error("Initial sendMail failed:", sendErr?.message || sendErr);
      // If auth failed and we weren't using a test account, try Ethereal fallback
      const isAuthError = String(sendErr?.code || "").toLowerCase().includes("eauth") || String(sendErr?.command || "").toLowerCase().includes("auth");
      if (!isTestAccount && isAuthError) {
        try {
          console.warn("SMTP auth failed, creating Ethereal test account and retrying sendMail...");
          const testAccount2 = await nodemailer.createTestAccount();
          const tstTransporter = nodemailer.createTransport({
            host: testAccount2.smtp.host,
            port: testAccount2.smtp.port,
            secure: testAccount2.smtp.secure,
            auth: {
              user: testAccount2.user,
              pass: testAccount2.pass,
            },
          });

          const info2 = await tstTransporter.sendMail(mailOptions);
          const preview2 = nodemailer.getTestMessageUrl(info2);
          console.log("Ethereal fallback preview URL:", preview2);
          return { previewUrl: preview2 };
        } catch (fallbackErr) {
          console.error("Ethereal fallback also failed:", fallbackErr?.message || fallbackErr);
          throw fallbackErr;
        }
      }
      throw sendErr;
    }
  } catch (err) {
    console.error("Failed to send student report email:", err?.message || err);
    // rethrow so callers can handle; include original error
    throw err;
  }
};
