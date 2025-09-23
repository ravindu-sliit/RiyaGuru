import nodemailer from "nodemailer";

export const sendOTPEmail = async (toEmail, otp) => {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: toEmail,
    subject: "Your OTP Code",
    text: `Your OTP code is: ${otp}. It expires in 5 minutes.`,
  };

  await transporter.sendMail(mailOptions);  
};

export const sendCertificateEmail = async (toEmail, studentName, courseName, filePath, verificationHash, certificateId) => {
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
