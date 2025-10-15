import nodemailer from "nodemailer";

const createTransporter = () =>
  nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

export const sendOTPEmail = async (toEmail, otp) => {
  const transporter = createTransporter();
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: toEmail,
    subject: "Your OTP Code",
    text: `Your OTP code is: ${otp}. It expires in 5 minutes.`,
  };
  await transporter.sendMail(mailOptions);
};

// Send a notification when an admin resets a student's password
export const sendAdminPasswordResetEmail = async (toEmail, studentName, tempPassword) => {
  const transporter = createTransporter();
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: toEmail,
    subject: "Your RiyaGuru password was reset by an administrator",
    text: `Hello ${studentName || "Student"},\n\nYour account password has been reset by an administrator.\n\nTemporary password: ${tempPassword}\n\nFor security, please sign in and change this password immediately from your dashboard.\n\nIf you did not request this change, contact support immediately.`,
  };
  await transporter.sendMail(mailOptions);
};

export const sendCertificateEmail = async (
  toEmail,
  studentName,
  courseName,
  filePath,
  verificationHash,
  certificateId
) => {
  const transporter = createTransporter();
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: toEmail,
    subject: `🎓 Certificate Issued for ${courseName}`,
    text: `Dear ${studentName},\n\nCongratulations! Your certificate for ${courseName} has been issued.\n\nVerification Hash: ${verificationHash}\n\nVerify it here: https://your-domain.com/api/certificates/verify?id=${certificateId}&hash=${verificationHash}`,
    html: `
      <p>Dear <b>${studentName}</b>,</p>
      <p>Congratulations! Your certificate for <b>${courseName}</b> has been issued.</p>
      <p><b>Verification Hash:</b> ${verificationHash}</p>
      <p>You can <a href="https://your-domain.com/api/certificates/verify?id=${certificateId}&hash=${verificationHash}">verify your certificate here</a>.</p>
    `,
    attachments: [
      {
        filename: `${courseName}_certificate.pdf`,
        path: filePath, // absolute path to the generated PDF
      },
    ],
  };

  await transporter.sendMail(mailOptions);
};
