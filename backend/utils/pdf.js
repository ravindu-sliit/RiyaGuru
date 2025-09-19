// backend/utils/pdf.js
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

export const generateReceipt = (payment) => {
  const doc = new PDFDocument();
  const receiptDir = path.join("receipts");
  if (!fs.existsSync(receiptDir)) {
    fs.mkdirSync(receiptDir);
  }

  const filePath = path.join(receiptDir, `receipt_${payment._id}.pdf`);
  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  // Header
  doc.fontSize(20).text("Payment Receipt", { align: "center" });
  doc.moveDown();

  // Payment details
  doc.fontSize(12).text(`Receipt No: ${payment._id}`);
  doc.text(`Student ID: ${payment.studentId}`);
  doc.text(`Course: ${payment.courseId || payment.courseName}`);
  doc.text(`Amount: Rs.${payment.amount.toFixed(2)}`);
  doc.text(`Payment Type: ${payment.paymentType}`);
  doc.text(`Payment Method: ${payment.paymentMethod}`);
  doc.text(`Status: ${payment.status}`);
  if (payment.paidDate) doc.text(`Paid Date: ${payment.paidDate}`);
  if (payment.adminComment) doc.text(`Admin Comment: ${payment.adminComment}`);

  doc.moveDown();
  doc.text("Thank you for your payment!", { align: "center" });

  doc.end();

  return filePath;
};
