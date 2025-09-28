import nodemailer from "nodemailer";
import path from "path";

// ✅ configure transporter with your Gmail (or SMTP service)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "codestack80@gmail.com", // your Gmail
    pass: "wwij bmbk kxho naxj", // app password (not your real Gmail password!)
  },
});

export const sendBookingEmail = async (toEmail, booking, pdfPath) => {
  try {
    const mailOptions = {
      from: `"RiyaGuru.lk Driving School" <codestack80@gmail.com>`,
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
