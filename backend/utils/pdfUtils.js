import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

export const generateBookingPDF = (booking, student, instructor, vehicle) => {
  return new Promise((resolve, reject) => {
    try {
      const uploadsDir = path.join("uploads");
      if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

      const filePath = path.join(uploadsDir, `booking_${booking.bookingId}.pdf`);
      const doc = new PDFDocument({
        size: "A4",
        margin: 40,
        info: {
          Title: `Booking Confirmation - ${booking.bookingId}`,
          Author: "RiyaGuru.lk Driving School",
          Subject: "Driving Lesson Booking Confirmation",
          Creator: "RiyaGuru.lk",
        },
      });

      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // Brand Colors
      const colors = {
        primary: "#F47C20",
        darkNavy: "#0A1A2F",
        white: "#FFFFFF",
        lightGray: "#F5F6FA",
        softBlue: "#2D74C4",
        green: "#28A745",
        red: "#DC3545",
        yellow: "#FFC107",
        textGray: "#6B7280",
        borderGray: "#E5E7EB",
      };

      // Sections
      drawHeader(doc, colors);
      drawBookingOverview(doc, booking, colors);
      drawInfoSection(doc, "STUDENT INFORMATION", [
        { label: "Full Name", value: student.full_name },
        { label: "NIC", value: student.nic },
        { label: "Phone", value: student.phone },
        { label: "Address", value: student.address || "Not provided" },
      ], colors);

      drawInfoSection(doc, "INSTRUCTOR INFORMATION", [
        { label: "Name", value: instructor.name },
        { label: "Phone", value: instructor.phone },
        { label: "Specialization", value: instructor.specialization },
        { label: "Experience", value: `${instructor.experienceYears || "N/A"} years` },
      ], colors);

      drawInfoSection(doc, "VEHICLE INFORMATION", [
        { label: "Registration", value: vehicle.regNo },
        { label: "Make & Model", value: `${vehicle.brand} ${vehicle.model}` },
        { label: "Type", value: vehicle.type },
        { label: "Fuel Type", value: vehicle.fuelType || "Not specified" },
      ], colors);

      drawImportantInformation(doc, colors);

      // If footer would overflow, move it to a new page
      if (doc.y > doc.page.height - 150) {
        doc.addPage();
      }
      drawFooter(doc, colors);

      doc.end();
      stream.on("finish", () => resolve(filePath));
    } catch (error) {
      reject(error);
    }
  });
};

/* ---------- HEADER ---------- */
function drawHeader(doc, colors) {
  doc.rect(0, 0, doc.page.width, 80).fill(colors.darkNavy);

  doc.fillColor(colors.primary)
    .fontSize(20)
    .font("Helvetica-Bold")
    .text("RiyaGuru.lk Driving School", 50, 30);

  doc.fillColor(colors.white)
    .fontSize(11)
    .text("Professional Driving Education", 50, 55);

  doc.fillColor(colors.white)
    .fontSize(13)
    .font("Helvetica-Bold")
    .text("BOOKING CONFIRMATION", doc.page.width - 220, 35);

  doc.fillColor(colors.lightGray)
    .fontSize(10)
    .text(new Date().toLocaleDateString(), doc.page.width - 220, 55);

  doc.y = 100;
}

/* ---------- BOOKING OVERVIEW ---------- */
function drawBookingOverview(doc, booking, colors) {
  const startY = doc.y;
  doc.rect(40, startY, doc.page.width - 80, 70)
    .fill(colors.white)
    .stroke(colors.borderGray);

  doc.fillColor(colors.darkNavy)
    .fontSize(14)
    .font("Helvetica-Bold")
    .text(`Booking #${booking.bookingId}`, 60, startY + 20);

  drawStatusBadge(doc, booking.status, colors, doc.page.width - 160, startY + 20);

  doc.fillColor(colors.primary)
    .fontSize(9)
    .text("DATE", 60, startY + 40);

  doc.fillColor(colors.darkNavy)
    .fontSize(11)
    .font("Helvetica-Bold")
    .text(new Date(booking.date).toLocaleDateString("en-GB"), 60, startY + 52);

  doc.fillColor(colors.primary)
    .fontSize(9)
    .text("TIME", 220, startY + 40);

  doc.fillColor(colors.darkNavy)
    .fontSize(11)
    .text(booking.time, 220, startY + 52);

  doc.y = startY + 90;
}

/* ---------- STATUS BADGE ---------- */
function drawStatusBadge(doc, status, colors, x, y) {
  const map = {
    booked: { bg: colors.green, text: "CONFIRMED" },
    confirmed: { bg: colors.green, text: "CONFIRMED" },
    pending: { bg: colors.yellow, text: "PENDING" },
    cancelled: { bg: colors.red, text: "CANCELLED" },
    completed: { bg: colors.softBlue, text: "COMPLETED" },
  };
  const config = map[status.toLowerCase()] || map.booked;

  const width = doc.widthOfString(config.text, { font: "Helvetica-Bold", size: 9 }) + 20;
  doc.rect(x, y, width, 18).fill(config.bg);

  doc.fillColor(colors.white)
    .fontSize(9)
    .font("Helvetica-Bold")
    .text(config.text, x + 8, y + 5);
}

/* ---------- INFO SECTIONS ---------- */
function drawInfoSection(doc, title, rows, colors) {
  const margin = 40;

  doc.rect(margin, doc.y, doc.page.width - margin * 2, 20)
    .fill(colors.lightGray)
    .stroke(colors.borderGray);

  doc.fillColor(colors.darkNavy)
    .fontSize(11)
    .font("Helvetica-Bold")
    .text(title, margin + 8, doc.y + 5);

  const rowHeight = 16;
  let currentY = doc.y + 25;

  rows.forEach((row, i) => {
    if (i % 2 === 0) {
      doc.rect(margin, currentY - 3, doc.page.width - margin * 2, rowHeight)
        .fill("#FAFBFC");
    }
    doc.fillColor(colors.textGray)
      .fontSize(9)
      .text(row.label + ":", margin + 8, currentY);

    doc.fillColor(colors.darkNavy)
      .fontSize(9)
      .font("Helvetica-Bold")
      .text(row.value, margin + 140, currentY);

    currentY += rowHeight;
  });

  doc.y = currentY + 5;
}

/* ---------- IMPORTANT INFO ---------- */
function drawImportantInformation(doc, colors) {
  const margin = 40;

  doc.fillColor(colors.primary)
    .fontSize(11)
    .font("Helvetica-Bold")
    .text("IMPORTANT INFORMATION", margin, doc.y);

  const items = [
    "Arrive 15 minutes before your lesson.",
    "Bring a valid photo ID.",
    "Contact us 24 hours before for rescheduling.",
    "Payment must be completed before lesson.",
    "Follow instructor safety guidelines.",
  ];

  let currentY = doc.y + 18;
  items.forEach((item) => {
    doc.circle(margin + 5, currentY + 4, 2).fill(colors.primary);
    doc.fillColor(colors.darkNavy)
      .fontSize(9)
      .text(item, margin + 15, currentY);
    currentY += 12;
  });

  doc.y = currentY + 10;
}

/* ---------- FOOTER ---------- */
function drawFooter(doc, colors) {
  const footerY = doc.page.height - 90;

  doc.rect(0, footerY, doc.page.width, 90).fill(colors.darkNavy);

  doc.fillColor(colors.white)
    .fontSize(12)
    .font("Helvetica-Bold");
   
  doc.fillColor(colors.primary)
    .fontSize(10)
    .font("Helvetica-Bold")
    .text("Thank you for choosing RiyaGuru.lk!", doc.page.width / 2 - 100, footerY + 35);
}
