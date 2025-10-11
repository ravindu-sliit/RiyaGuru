import nodemailer from "nodemailer";
import path from "path";

// Use environment variables for credentials
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // your Gmail or SMTP user
    pass: process.env.EMAIL_PASS, // app password or SMTP password
  },
});

export const sendCertificateEmail = async (toEmail, student, certificate, pdfPath) => {
  try {
    const mailOptions = {
      from: `"RiyaGuru.lk Driving School" <${process.env.EMAIL_USER}>`,
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
