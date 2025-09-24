import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

export const generateBookingPDF = (booking, student, instructor, vehicle, course) => {
  const receiptsPath = path.join("uploads", "receipts");
  const filePath = path.join(receiptsPath, `${booking.bookingId}.pdf`);

  // Ensure folder exists
  if (!fs.existsSync(receiptsPath)) {
    fs.mkdirSync(receiptsPath, { recursive: true });
  }

  const doc = new PDFDocument({
    margin: 50,
    size: "A4",
    bufferPages: true,
  });

  doc.pipe(fs.createWriteStream(filePath));

  // Brand Colors
  const colors = {
    primary: "#F47C20",
    darkNavy: "#0A1A2F",
    white: "#FFFFFF",
    lightGray: "#F5F6FA",
    softBlue: "#2D74C4",
    yellowGold: "#FFC107",
    green: "#28A745",
    red: "#DC3545",
    textGray: "#6B7280",
    borderGray: "#E5E7EB",
  };

  // ---------- Header ----------
  const drawHeader = () => {
    doc.rect(0, 0, doc.page.width, 100).fill(colors.darkNavy);

    // Logo placeholder
    doc.fillColor(colors.primary)
      .rect(50, 30, 50, 50)
      .fill();

    doc.fillColor(colors.white)
      .fontSize(20)
      .font("Helvetica-Bold")
      .text("DS", 65, 50);

    doc.fillColor(colors.white)
      .fontSize(24)
      .text("DriveSchool", 130, 40);

    doc.fillColor(colors.lightGray)
      .fontSize(10)
      .text("Professional Driving Education", 130, 70);

    doc.fillColor(colors.white)
      .fontSize(16)
      .font("Helvetica-Bold")
      .text("BOOKING RECEIPT", doc.page.width - 200, 50, { align: "right", width: 150 });

    doc.y = 120;
  };

  // ---------- Status Badge ----------
  const drawStatusBadge = (status, x, y) => {
    let bgColor = colors.lightGray;
    let textColor = colors.textGray;

    switch (status.toLowerCase()) {
      case "confirmed":
        bgColor = colors.green;
        textColor = colors.white;
        break;
      case "pending":
        bgColor = colors.yellowGold;
        textColor = colors.darkNavy;
        break;
      case "cancelled":
        bgColor = colors.red;
        textColor = colors.white;
        break;
    }

    doc.roundedRect(x, y, 100, 25, 8).fill(bgColor);
    doc.fillColor(textColor)
      .fontSize(10)
      .font("Helvetica-Bold")
      .text(status.toUpperCase(), x + 10, y + 7);
  };

  // ---------- Section Header ----------
  const drawSectionHeader = (title) => {
    const currentY = doc.y;
    doc.rect(50, currentY, doc.page.width - 100, 30)
      .fill(colors.lightGray)
      .stroke(colors.borderGray);

    doc.fillColor(colors.darkNavy)
      .fontSize(13)
      .font("Helvetica-Bold")
      .text(title, 60, currentY + 8);

    doc.y = currentY + 40;
  };

  // ---------- Info Row ----------
  const drawInfoRow = (label, value) => {
    const currentY = doc.y;
    doc.fillColor(colors.textGray)
      .fontSize(11)
      .text(label + ":", 70, currentY);

    doc.fillColor(colors.darkNavy)
      .fontSize(11)
      .font("Helvetica-Bold")
      .text(value, 200, currentY);

    doc.y = currentY + 20;
  };

  // ---------- Divider ----------
  const drawDivider = () => {
    const currentY = doc.y;
    doc.strokeColor(colors.borderGray)
      .lineWidth(1)
      .moveTo(50, currentY)
      .lineTo(doc.page.width - 50, currentY)
      .stroke();
    doc.y = currentY + 15;
  };

  // ---------- Footer ----------
  const drawFooter = () => {
    const footerY = doc.page.height - 100;
    doc.rect(0, footerY, doc.page.width, 100).fill(colors.darkNavy);

    doc.fillColor(colors.white)
      .fontSize(10)
      .text("Contact Us:", 50, footerY + 20);

    doc.text("Phone: +94 77 123 4567", 50, footerY + 35);
    doc.text("Email: info@driveschool.lk", 50, footerY + 50);
    doc.text("Website: www.driveschool.lk", 50, footerY + 65);

    doc.fillColor(colors.lightGray)
      .fontSize(11)
      .font("Helvetica-Bold")
      .text("Thank you for choosing DriveSchool!", doc.page.width - 250, footerY + 30, {
        align: "right",
        width: 200,
      });

    doc.fillColor(colors.textGray)
      .fontSize(8)
      .text(`Generated on: ${new Date().toLocaleString()}`, doc.page.width - 250, footerY + 65, {
        align: "right",
        width: 200,
      });
  };

  // ---------------- Build PDF ----------------
  drawHeader();

  // Booking Details
  drawSectionHeader("BOOKING DETAILS");
  drawInfoRow("Booking ID", booking.bookingId);
  drawStatusBadge(booking.status, doc.page.width - 200, doc.y - 30);
  drawInfoRow("Date", booking.date);
  drawInfoRow("Time", booking.time);

  drawDivider();

  // Student Info
  drawSectionHeader("STUDENT INFORMATION");
  drawInfoRow("Full Name", student.full_name);
  drawInfoRow("Email", student.email);
  drawInfoRow("Phone", student.phone);

  drawDivider();

  // Course Info
  drawSectionHeader("COURSE DETAILS");
  drawInfoRow("Course Name", course.name);
  drawInfoRow("Duration", course.duration);
  drawInfoRow("Total Lessons", `${course.totalLessons} lessons`);
  if (course.price) drawInfoRow("Course Fee", `Rs. ${course.price.toLocaleString()}`);

  drawDivider();

  // Instructor Info
  drawSectionHeader("INSTRUCTOR DETAILS");
  drawInfoRow("Name", instructor.name);
  drawInfoRow("Phone", instructor.phone);
  drawInfoRow("Specialization", instructor.specialization);
  if (instructor.experience) drawInfoRow("Experience", `${instructor.experience} years`);

  drawDivider();

  // Vehicle Info
  drawSectionHeader("VEHICLE DETAILS");
  drawInfoRow("Registration No", vehicle.regNo);
  drawInfoRow("Brand & Model", `${vehicle.brand} ${vehicle.model}`);
  drawInfoRow("Type", vehicle.type);
  drawInfoRow("Fuel Type", vehicle.fuelType);

  drawDivider();

  // Notes
  drawSectionHeader("IMPORTANT INFORMATION");
  const notes = [
    "Please arrive 15 minutes before your scheduled lesson time.",
    "Bring a valid ID and any required documents.",
    "For rescheduling, contact us at least 24 hours in advance.",
    "Payment must be completed before the lesson begins.",
    "Follow all safety instructions provided by your instructor.",
  ];
  doc.fillColor(colors.textGray).fontSize(10);
  notes.forEach((note, i) => {
    doc.text(`${i + 1}. ${note}`, 70, doc.y);
    doc.moveDown(0.5);
  });

  drawFooter();

  doc.end();
  return filePath;
};

// ---------------- Example Usage ----------------
const booking = { bookingId: "B1234", status: "Confirmed", date: "2025-09-23", time: "10:00 AM" };
const student = { full_name: "John Doe", email: "john@example.com", phone: "1234567890" };
const instructor = { name: "Mr. Smith", phone: "9876543210", specialization: "Defensive Driving", experience: 10 };
const vehicle = { regNo: "ABC-1234", brand: "Toyota", model: "Corolla", type: "Car", fuelType: "Petrol" };
const course = { name: "Beginner Course", duration: "1 Month", totalLessons: 20, price: 25000 };

generateBookingPDF(booking, student, instructor, vehicle, course);
