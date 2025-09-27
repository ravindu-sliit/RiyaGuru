import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// options: { student, courseId }
export const generateReceipt = (payment, options = {}) => {
  const doc = new PDFDocument({ margin: 36, size: 'A4' });
  // Save under backend/uploads/receipts so it is served by /uploads/receipts
  const receiptDir = path.join(__dirname, "..", "uploads", "receipts");
  if (!fs.existsSync(receiptDir)) {
    fs.mkdirSync(receiptDir, { recursive: true });
  }

  const fileName = `receipt_${payment._id}.pdf`;
  const filePath = path.join(receiptDir, fileName);
  const stream = fs.createWriteStream(filePath);

  // Return a promise that resolves when the file is fully written
  const finished = new Promise((resolve, reject) => {
    stream.on("finish", () => {
      const publicPath = `/uploads/receipts/${fileName}`;
      resolve(publicPath);
    });
    stream.on("error", reject);
  });

  doc.pipe(stream);

  // Colors and helpers
  const colors = {
    primary: '#111827',
    secondary: '#374151',
    gray: '#6B7280',
    light: '#F3F4F6',
    border: '#E5E7EB',
    dark: '#111827',
    accent: '#4B5563', // used for dark header bars
    totalBar: '#374151',
    footer: '#1F2937'
  };
  const money = (v) => `Rs. ${Number(v || 0).toLocaleString('en-LK', { minimumFractionDigits: 2 })}`;
  const fmtDate = (d) => new Date(d || new Date()).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const pageW = doc.page.width, pageH = doc.page.height, margin = 36, contentW = pageW - margin * 2;
  const gutter = 16; // base spacing

  // Header: logo box (placeholder) and title/meta
  const headerY = margin;
  const logoBoxSize = 56;
  doc.rect(margin, headerY, logoBoxSize, logoBoxSize).fillColor(colors.light).fill().strokeColor(colors.border).stroke();
  doc.fillColor(colors.gray).font('Helvetica-Bold').fontSize(12).text('RG', margin, headerY + 18, { width: logoBoxSize, align: 'center' });

  // Company name under logo box
  doc.fillColor(colors.primary).font('Helvetica-Bold').fontSize(14).text('RiyaGuru Driving School', margin, headerY + logoBoxSize + 6);
  doc.font('Helvetica').fontSize(9).fillColor(colors.gray).text('123 Main Street, Colombo, Sri Lanka');
  doc.text('Phone: +94 11 234 5678  |  Email: info@riyaguru.lk');

  // Big title on the right
  doc.fillColor(colors.dark).font('Helvetica-Bold').fontSize(28).text('INVOICE', margin + contentW - 180, headerY + 4, { width: 180, align: 'right' });
  const shortId = String(payment?._id || '').slice(-8);
  const metaX = margin + contentW - 240;
  const metaY = headerY + 48;
  doc.font('Helvetica').fontSize(10).fillColor(colors.gray);
  doc.text(`Invoice No:`, metaX, metaY, { width: 100 });
  doc.text(`Invoice Date:`, metaX, metaY + 16, { width: 100 });
  doc.text(`${shortId}`, metaX + 100, metaY, { width: 140, align: 'right', continued: false });
  doc.text(`${fmtDate(payment?.createdAt)}`, metaX + 100, metaY + 16, { width: 140, align: 'right' });

  // Info boxes
  const rowY = headerY + logoBoxSize + 60;
  const colW = (contentW - gutter) / 2;
  const student = options?.student || null;
  const studentName = student?.full_name || student?.name || student?.email || 'N/A';
  const studentId = payment?.studentName || 'N/A';
  const courseId = options?.courseId || 'N/A';
  const courseName = payment?.courseName || 'N/A';

  // Left: Invoice to
  doc.fillColor(colors.primary).font('Helvetica-Bold').fontSize(12).text('INVOICE TO', margin, rowY);
  doc.font('Helvetica-Bold').fontSize(14).fillColor(colors.primary).text(studentName, margin, rowY + 18);
  doc.font('Helvetica').fontSize(10).fillColor(colors.gray).text(`Student ID: ${studentId}`);

  // Right: Payment/meta
  const rightX = margin + colW + gutter;
  doc.font('Helvetica').fontSize(10).fillColor(colors.gray).text('Payment Method', rightX, rowY);
  doc.fillColor(colors.primary).text('Account ID: 8766 4321 2345 6789', rightX, rowY + 14);
  doc.fillColor(colors.primary).text(`Account Name: ${studentName}`, rightX, rowY + 28);
  doc.fillColor(colors.primary).text(`Course: ${courseName} (${courseId})`, rightX, rowY + 42);

  // Items table
  const tableY = rowY + 72; const headerW = contentW; const startX = margin;
  const cols = [
    { x: startX, w: 40, title: '#', align: 'center' },
    { x: startX + 40, w: headerW - 40 - 220, title: 'DESCRIPTION', align: 'left' },
    { x: startX + headerW - 220, w: 80, title: 'PRICE', align: 'right' },
    { x: startX + headerW - 140, w: 60, title: 'QTY', align: 'right' },
    { x: startX + headerW - 80, w: 80, title: 'AMOUNT', align: 'right' },
  ];
  doc.rect(startX, tableY, headerW, 28).fillColor(colors.accent).fill();
  doc.fillColor('white').font('Helvetica-Bold').fontSize(11);
  cols.forEach(c => doc.text(c.title, c.x + 8, tableY + 8, { width: c.w - 16, align: c.align }));

  // Single item row
  const bodyY = tableY + 28; const rowH = 32;
  const amount = Number(payment?.amount || 0); const qty = 1; const unit = amount; const total = unit * qty;
  // zebra row background
  doc.rect(startX, bodyY, headerW, rowH).fillColor('#F9FAFB').fill().strokeColor(colors.border).stroke();
  doc.fillColor(colors.primary).font('Helvetica').fontSize(10);
  doc.text('01', cols[0].x, bodyY + 9, { width: cols[0].w, align: 'center' });
  doc.text(`${courseName} fee`, cols[1].x + 8, bodyY + 9, { width: cols[1].w - 16, align: 'left' });
  doc.text(money(unit), cols[2].x + 8, bodyY + 9, { width: cols[2].w - 16, align: 'right' });
  doc.text(String(qty), cols[3].x + 8, bodyY + 9, { width: cols[3].w - 16, align: 'right' });
  doc.text(money(total), cols[4].x + 8, bodyY + 9, { width: cols[4].w - 16, align: 'right' });

  // Summary panel
  const sumW = 260; const sumX = startX + headerW - sumW;
  // Anchor the bottom block (summary + terms + signature + footer) to the page bottom
  const boxesH = 120; // summary box height
  const termsH = 90;  // terms height
  const gap = 16;     // consistent gap
  const signatureH = 60; // signature area
  const footerBandH = 44; // bottom band
  const naturalSumY = bodyY + rowH + 20;
  const anchoredTopY = pageH - margin - (boxesH + gap + termsH + gap + signatureH + gap + footerBandH);
  const sumY = Math.max(naturalSumY, anchoredTopY);
  doc.roundedRect(sumX, sumY, sumW, boxesH, 8).fillColor(colors.light).fill().strokeColor(colors.border).stroke();
  const line = (label, value, y) => { doc.fillColor(colors.gray).fontSize(10).font('Helvetica').text(label, sumX + 14, y); doc.fillColor(colors.primary).font('Helvetica-Bold').text(value, sumX + sumW - 14 - 140, y, { width: 140, align: 'right' }); };
  const tax = Math.round(total * 0.05 * 100) / 100; const subtotal = total; const grand = subtotal + tax;
  line('Sub Total', money(subtotal), sumY + 16);
  line('Tax (5%)', money(tax), sumY + 36);
  // Total dark bar
  doc.roundedRect(sumX + 12, sumY + boxesH - 42, sumW - 24, 30, 6).fillColor(colors.totalBar).fill();
  doc.fillColor('white').font('Helvetica-Bold').fontSize(12).text('TOTAL', sumX + 20, sumY + boxesH - 34);
  doc.text(money(grand), sumX + 20, sumY + boxesH - 34, { width: sumW - 40, align: 'right' });

  // Terms box
  const termsX = startX, termsY = sumY, termsW = headerW - sumW - gap;
  doc.fillColor(colors.primary).font('Helvetica-Bold').fontSize(12).text('Total Due', termsX, termsY);
  doc.font('Helvetica-Bold').fontSize(22).fillColor(colors.primary).text(money(grand), termsX, termsY + 16);
  doc.fillColor(colors.gray).font('Helvetica').fontSize(9).text('Late charge for 10 days', termsX, termsY + 44);

  // Terms & Conditions section below
  const termsBlockY = sumY + boxesH + gap;
  doc.fillColor(colors.primary).font('Helvetica-Bold').fontSize(12).text('Terms & Conditions', startX, termsBlockY);
  doc.fillColor(colors.gray).font('Helvetica').fontSize(9).text('This receipt/invoice is generated electronically and valid without a signature. Payments are subject to verification and school policies. Keep this document for your records.', startX, termsBlockY + 16, { width: headerW });

  // Footer signature
  const footerY = termsBlockY + termsH + gap;
  doc.moveTo(startX, footerY).lineTo(startX + headerW, footerY).strokeColor(colors.border).stroke();
  doc.fillColor(colors.primary).font('Helvetica-Bold').fontSize(10).text('Authorized Signature:', startX, footerY + 12);
  doc.moveTo(startX, footerY + 36).lineTo(startX + 200, footerY + 36).strokeColor('#9ca3af').stroke();
  doc.font('Helvetica').fontSize(9).fillColor(colors.gray).text('RiyaGuru Driving School', startX, footerY + 42);

  // Bottom footer band
  const bandY = pageH - margin - footerBandH;
  doc.rect(0, bandY, pageW, footerBandH).fillColor(colors.footer).fill();
  doc.fillColor('#E5E7EB').font('Helvetica').fontSize(9);
  doc.text('+94 812 1234 1234  |  +94 812 5578 5678', margin, bandY + 14);
  doc.text('123 Lungmen, Kazu, Colombo, Sri Lanka', margin + contentW / 3, bandY + 14);
  doc.text('mail@riyaguru.lk', margin + (2 * contentW) / 3, bandY + 14);

  doc.end();

  return finished; // resolves to filePath
};
