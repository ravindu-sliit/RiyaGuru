import nodemailer from "nodemailer";
import path from "path";

// Prefer SMTP_* credentials; fallback to EMAIL_*
const smtpUser = process.env.SMTP_USER || process.env.EMAIL_USER;
const smtpPass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || "gmail",
  auth: {
    user: smtpUser,
    pass: smtpPass,
  },
});

export const sendCertificateEmail = async (toEmail, student, certificate, pdfPath) => {
  try {
    const fromUser = process.env.SMTP_USER || process.env.EMAIL_USER;
    const mailOptions = {
      from: `"RiyaGuru.lk Driving School" <${fromUser}>`,
      to: toEmail,
      subject: `Your Certificate - ${certificate.certificateId}`,
      text: `Hello ${student.full_name},\n\nCongratulations! Your certificate for ${certificate.course_name} is ready.\n\nCertificate ID: ${certificate.certificateId}\nIssued At: ${new Date(certificate.issued_at).toLocaleDateString()}\n\nPlease find the certificate attached. You can verify it online using the verification link provided in the certificate.\n\nRegards,\nRiyaGuru.lk`,
      attachments: [
        {
          filename: path.basename(pdfPath),
          path: path.resolve(pdfPath),
          contentType: "application/pdf",
        },
      ],
    };

    await transporter.sendMail(mailOptions);
    console.log(`📧 Certificate email sent to ${toEmail}`);
  } catch (err) {
    console.error("❌ Failed to send certificate email:", err?.message || err);
    throw err;
  }
};
