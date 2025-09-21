// helpers/certificatePdf.js
import fs from "fs";
import path from "path";
import crypto from "crypto";
import PDFDocument from "pdfkit";
import QRCode from "qrcode";

export async function renderCertificatePDF({
  certificate,
  student,
  course,
  verifyUrlBase = "https://your-domain/verify",
}) {
  const payload = JSON.stringify({
    certificateId: certificate.certificateId,
    student_id: certificate.student_id,
    course_name: certificate.course_name,
    issued_at: certificate.issued_at,
  });
  const verificationHash = crypto.createHash("sha256").update(payload).digest("hex");

  const dir = path.join(process.cwd(), "uploads", "certificates");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const filePath = path.join(dir, `${certificate.certificateId}.pdf`);

  const verifyUrl = `${verifyUrlBase}?id=${certificate.certificateId}&hash=${verificationHash}`;
  const qrDataURL = await QRCode.toDataURL(verifyUrl);

  const doc = new PDFDocument({ size: "A4", layout: "landscape", margin: 50 });
  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  // Border
  doc.lineWidth(4).strokeColor("#2E86C1");
  doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40).stroke();

  // Title
  doc.fontSize(36).font("Times-Bold").fillColor("#154360");
  doc.text("Certificate of Completion", 0, 80, { align: "center" });

  // Student name
  doc.fontSize(28).font("Times-Bold").fillColor("black");
  doc.text(student.full_name, 0, 150, { align: "center", underline: true });

  // Course text
  doc.fontSize(18).font("Times-Roman").fillColor("#333");
  doc.text("has successfully completed the course:", 0, 200, { align: "center" });

  doc.fontSize(24).font("Times-BoldItalic").fillColor("#1A5276");
  doc.text(course.name, 0, 240, { align: "center" });

  // Body
  doc.fontSize(14).font("Times-Roman").fillColor("black");
  doc.text(
    "This certifies that the above student has successfully completed all required lessons " +
      "and is hereby awarded this certificate of achievement.",
    100,
    300,
    { width: doc.page.width - 200, align: "center" }
  );

  // Certificate Info
  doc.fontSize(12).fillColor("#555");
  doc.text(`Certificate ID: ${certificate.certificateId}`, 100, 380);
  doc.text(`Student ID: ${certificate.student_id}`, 100, 400);
  doc.text(`Issued At: ${new Date(certificate.issued_at).toLocaleDateString()}`, 100, 420);

  // QR Code bottom-right
  const qrBase64 = qrDataURL.split(",")[1];
  const qrBuffer = Buffer.from(qrBase64, "base64");
  const qrTmp = path.join(dir, `${certificate.certificateId}.png`);
  fs.writeFileSync(qrTmp, qrBuffer);

  doc.image(qrTmp, doc.page.width - 200, 350, { width: 120 });
  doc.fontSize(10).fillColor("#555");
  doc.text(`Verify at: ${verifyUrl}`, doc.page.width - 250, 480, {
    width: 200,
    align: "center",
  });

  // Signatures
  doc.fontSize(12).fillColor("black");
  doc.text("____________________", 100, 500, { align: "center" });
  doc.text("Instructor Signature", 100, 520, { align: "center" });

  doc.text("____________________", 400, 500, { align: "center" });
  doc.text("School Seal", 400, 520, { align: "center" });

  doc.end();
  await new Promise((resolve) => stream.on("finish", resolve));
  fs.unlinkSync(qrTmp);

  return { filePath, verificationHash };
}
