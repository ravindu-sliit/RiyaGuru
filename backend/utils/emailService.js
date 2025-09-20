import nodemailer from "nodemailer";

export const sendOTPEmail = async (toEmail, otp) => {
  const transporter = nodemailer.createTransport({
    service: "Gmail", // or any email service you use
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
