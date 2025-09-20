// helpers/certificatePdf.js
import fs from "fs";
import path from "path";
import crypto from "crypto";
import PDFDocument from "pdfkit";
import QRCode from "qrcode";

/**
 * Render a certificate PDF, return { filePath, verificationHash }.
 * 
 * @param {Object} opts
 * @param {Object} opts.certificate - Certificate document (already created in DB)
 * @param {Object} opts.student - Student document
 * @param {Object} opts.course - Course document
 * @param {string} opts.verifyUrlBase - Base URL for public verification
 */
export async function renderCertificatePDF({ certificate, student, course, verifyUrlBase = "https://your-domain/verify" }) {
  // 1️⃣ Create a stable payload to hash
  const payload = JSON.stringify({
    certificateId: certificate.certificateId,
    student_id: certificate.student_id,
    course_name: certificate.course_name,
    issued_at: certificate.issued_at,
  });
  const verificationHash = crypto.createHash("sha256").update(payload).digest("hex");

  // 2️⃣ Prepare output dir + file path
  const dir = path.join(process.cwd(), "uploads", "certificates");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const filePath = path.join(dir, `${certificate.certificateId}.pdf`);

  // 3️⃣ Create QR code for verification link
  const verifyUrl = `${verifyUrlBase}?id=${certificate.certificateId}&hash=${verificationHash}`;
  const qrDataURL = await QRCode.toDataURL(verifyUrl);

  // 4️⃣ Generate PDF
  const doc = new PDFDocument({ size: "A4", margin: 50 });
  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  // Header
  doc.fontSize(26).text("Diving School Certificate", { align: "center" });
  doc.moveDown(1.5);

  // Core details
  doc.fontSize(14).text(`Certificate ID: ${certificate.certificateId}`);
  doc.text(`Student: ${student.full_name} (${certificate.student_id})`);
  doc.text(`Course: ${course.name}`);
  doc.text(`Issued At: ${new Date(certificate.issued_at).toLocaleDateString()}`);
  doc.moveDown(1);

  // Body
  doc.fontSize(12).text(
    "This certifies that the student has successfully completed all required lessons " +
    "and is hereby awarded this certificate of achievement.",
    { align: "left" }
  );

  // Add QR code image
  const qrBase64 = qrDataURL.split(",")[1];
  const qrBuffer = Buffer.from(qrBase64, "base64");
  const qrTmp = path.join(dir, `${certificate.certificateId}.png`);
  fs.writeFileSync(qrTmp, qrBuffer);

  doc.moveDown(2);
  doc.image(qrTmp, { fit: [120, 120], align: "left" });
  doc.fontSize(10).text(`Verify at: ${verifyUrl}`);

  // Finish
  doc.end();
  await new Promise((resolve) => stream.on("finish", resolve));
  fs.unlinkSync(qrTmp);

  return { filePath, verificationHash };
}
