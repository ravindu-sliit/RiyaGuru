import nodemailer from "nodemailer";
import path from "path";

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendBookingEmail = async (toEmail, booking, pdfPath) => {
  try {
    console.log("📧 Preparing to send booking email to:", toEmail);
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: toEmail, // recipient
      subject: `Booking Confirmation - ${booking.bookingId}`,
      text: `Hello,

Your booking (#${booking.bookingId}) has been confirmed.

Course: ${booking.course}
Date: ${new Date(booking.date).toLocaleDateString("en-GB")}
Time: ${booking.time}

Please find the booking confirmation attached as a PDF.

Thank you,
RiyaGuru.lk Driving School`,
      attachments: [
        {
          filename: `booking_${booking.bookingId}.pdf`,
          path: path.resolve(pdfPath), // absolute path
          contentType: "application/pdf",
        },
      ],
    };

    await transporter.sendMail(mailOptions);
    console.log(`📧 Email sent to ${toEmail}`);
  } catch (err) {
    console.error("❌ Failed to send email:", err);
    throw err;
  }
};
