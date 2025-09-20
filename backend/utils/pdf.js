import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

export const generateReceipt = (payment, student = null) => {
  const doc = new PDFDocument({ margin: 50 });
  const receiptDir = path.join("receipts");
  if (!fs.existsSync(receiptDir)) {
    fs.mkdirSync(receiptDir);
  }

  const filePath = path.join(receiptDir, `receipt_${payment._id}.pdf`);
  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  // ===== HEADER =====
  doc
    .fontSize(22)
    .fillColor("#0056A6")
    .text("RiyaGuru Driving School", { align: "center" });
  doc
    .fontSize(10)
    .fillColor("black")
    .text("123 Main Street, Colombo, Sri Lanka", { align: "center" })
    .moveDown(1);

  // Divider
  doc.moveTo(50, 100).lineTo(550, 100).stroke();

  // ===== TITLE =====
  doc.fontSize(16).fillColor("black").text("PAYMENT RECEIPT", { align: "center" }).moveDown(2);

  // ===== STUDENT INFO =====
  doc.fontSize(12).text(`Student ID: ${payment.studentId}`);
  if (student) {
    doc.text(`Student Name: ${student.name || student.email}`);
  }
  doc.text(`Receipt ID: ${payment._id}`);
  doc.text(`Date: ${new Date(payment.createdAt).toLocaleDateString()}`);
  doc.moveDown(1);

  // ===== PAYMENT DETAILS =====
  doc.fontSize(12).fillColor("#0056A6").text("Payment Details", { underline: true }).moveDown(0.5);
  doc.fillColor("black");
  doc.text(`Course: ${payment.courseName || "N/A"}`);
  doc.text(`Amount: Rs.${payment.amount.toFixed(2)}`);
  doc.text(`Payment Type: ${payment.paymentType}`);
  doc.text(`Payment Method: ${payment.paymentMethod}`);
  doc.text(`Transaction ID: ${payment.transactionId || "N/A"}`);
  doc.text(`Status: ${payment.status}`);
  if (payment.paidDate) doc.text(`Paid Date: ${payment.paidDate}`);
  if (payment.adminComment) doc.text(`Admin Comment: ${payment.adminComment}`);

  // ===== FOOTER =====
  doc.moveDown(2);
  doc.fontSize(10).fillColor("gray").text("Thank you for your payment!", { align: "center" });

  doc.end();
  return filePath;
};
