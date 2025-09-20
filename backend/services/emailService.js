import nodemailer from "nodemailer";

export const sendEmail = async (to, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 465,
      secure: true, // use SSL
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: `"RiyaGuru App" <${process.env.EMAIL_USER}>`,
      from: `"RiyaGuru Team" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text
    });

    console.log("Email sent to:", to);
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};
