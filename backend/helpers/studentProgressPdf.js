import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

export const generateStudentProgressPDF = async ({ student, courses, lessonsByCourse }) => {
  const reportsDir = path.join(process.cwd(), "uploads", "reports");
  if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });

  const fileName = `${student.studentId || student._id}_progress_${Date.now()}.pdf`;
  const filePath = path.join(reportsDir, fileName);

  const doc = new PDFDocument({ size: "A4", margin: 40, bufferPages: true });
  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  // Brand palette to match utils/pdfUtils.js
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

  // Header
  drawHeader(doc, colors);

  // Student Overview panel
  drawStudentOverview(doc, student, colors);

  // Course sections
  for (const course of courses) {
    const lessons = lessonsByCourse[course.course_name] || [];
    drawCourseSection(doc, course, lessons, colors);
  }

  // Ensure footer fits
  if (doc.y > doc.page.height - 120) doc.addPage();
  drawFooter(doc, colors);

  doc.end();
  await new Promise((resolve) => stream.on("finish", resolve));
  return filePath;
};

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
    .text("STUDENT PROGRESS REPORT", doc.page.width - 260, 35);

  doc.fillColor(colors.lightGray)
    .fontSize(10)
    .text(new Date().toLocaleDateString(), doc.page.width - 260, 55);

  doc.y = 100;
}

function drawStudentOverview(doc, student, colors) {
  const margin = 40;
  const startY = doc.y;
  const panelH = 90;

  doc.rect(margin, startY, doc.page.width - margin * 2, panelH)
    .fill(colors.white)
    .stroke(colors.borderGray);

  doc.fillColor(colors.darkNavy)
    .fontSize(14)
    .font("Helvetica-Bold")
    .text("Student Overview", margin + 20, startY + 16);

  const L = margin + 20;
  const baseY = startY + 40;

  const rows = [
    { label: "Name", value: student.full_name || student.fullName || "-" },
    { label: "Student ID", value: student.studentId || "-" },
    { label: "Email", value: student.email || "-" },
    { label: "Phone", value: student.phone || "-" },
  ];

  let x1 = L, x2 = L + 260;
  let y = baseY;
  const drawRow = (lbl, val, x, yy) => {
    doc.fillColor(colors.primary).fontSize(9).font("Helvetica-Bold").text(lbl.toUpperCase(), x, yy);
    doc.fillColor(colors.darkNavy).fontSize(10).font("Helvetica-Bold").text(String(val), x, yy + 12);
  };

  // 2 columns
  drawRow(rows[0].label, rows[0].value, x1, y);
  drawRow(rows[1].label, rows[1].value, x2, y);
  y += 30;
  drawRow(rows[2].label, rows[2].value, x1, y);
  drawRow(rows[3].label, rows[3].value, x2, y);

  // optional profile picture
  try {
    if (student.profilePicPath) {
      const p = path.join(process.cwd(), "uploads", "studentProfPics", student.profilePicPath);
      if (fs.existsSync(p)) doc.image(p, doc.page.width - margin - 70, startY + 10, { width: 60, height: 60, fit: [60, 60] });
    }
  } catch {}

  doc.y = startY + panelH + 16;
}

function drawCourseSection(doc, course, lessons, colors) {
  const margin = 40;

  // Section header bar
  doc.rect(margin, doc.y, doc.page.width - margin * 2, 20)
    .fill(colors.lightGray)
    .stroke(colors.borderGray);
  doc.fillColor(colors.darkNavy)
    .fontSize(11)
    .font("Helvetica-Bold")
    .text(course.course_name || "Course", margin + 8, doc.y + 5);

  // Summary row
  const startY = doc.y + 28;
  const rowH = 16;
  const summary = [
    { k: "PROGRESS", v: `${course.progress_percent || 0}%` },
    { k: "COMPLETED", v: `${course.completed_lessons || 0} / ${course.total_lessons || "-"}` },
    ...(course.certificateId ? [{ k: "CERTIFICATE", v: String(course.certificateId) }] : []),
  ];

  let y = startY;
  summary.forEach((item, i) => {
    if (i % 2 === 0) doc.rect(margin, y - 3, doc.page.width - margin * 2, rowH).fill("#FAFBFC");
    doc.fillColor(colors.primary).fontSize(9).text(item.k, margin + 8, y);
    doc.fillColor(colors.darkNavy).font("Helvetica-Bold").fontSize(10).text(item.v, margin + 120, y);
    y += rowH;
  });

  // Lessons table
  if (lessons.length > 0) {
    y += 6;
    doc.fillColor(colors.darkNavy).font("Helvetica-Bold").fontSize(11).text("Completed Lessons", margin + 8, y);
    y += 16;

    // table header
    const cols = [
      { title: "#", w: 40 },
      { title: "DATE", w: 150 },
      { title: "INSTRUCTOR", w: 180 },
      { title: "FEEDBACK", w: doc.page.width - margin * 2 - (40 + 150 + 180) },
    ];
    let x = margin;
    doc.fillColor(colors.lightGray).rect(margin, y - 2, doc.page.width - margin * 2, 18).fill(colors.lightGray).stroke(colors.borderGray);
    cols.forEach((c) => {
      doc.fillColor(colors.primary).fontSize(9).font("Helvetica-Bold").text(c.title, x + 6, y + 2);
      x += c.w;
    });
    y += 20;

    // rows
    lessons
      .slice()
      .sort((a, b) => a.lesson_number - b.lesson_number)
      .forEach((l, idx) => {
        if (y > doc.page.height - 90) {
          doc.addPage();
          y = 60; // top area for new page content
        }
        if (idx % 2 === 0) doc.rect(margin, y - 2, doc.page.width - margin * 2, 18).fill("#FFFFFF");
        let xRow = margin;
        const dateStr = l.date ? new Date(l.date).toLocaleString() : "-";
        const cells = [
          String(l.lesson_number ?? "-"),
          dateStr,
          String(l.instructor_id ?? "-"),
          truncate(String(l.feedback || "-"), 140),
        ];
        cells.forEach((val, i) => {
          doc.fillColor(colors.textGray).font("Helvetica").fontSize(9).text(val, xRow + 6, y);
          xRow += cols[i].w;
        });
        y += 18;
      });
  } else {
    y += 6;
    doc.fillColor(colors.textGray).fontSize(10).font("Helvetica").text("No completed lessons recorded.", margin + 8, y);
    y += 12;
  }

  // Divider
  doc.moveTo(margin, y + 8).lineTo(doc.page.width - margin, y + 8).strokeColor(colors.borderGray).stroke();
  doc.y = y + 16;
}

function drawFooter(doc, colors) {
  const footerY = doc.page.height - 90;
  doc.rect(0, footerY, doc.page.width, 90).fill(colors.darkNavy);
  doc.fillColor(colors.primary).fontSize(10).font("Helvetica-Bold").text(
    "Thank you for choosing RiyaGuru.lk!",
    doc.page.width / 2 - 100,
    footerY + 35
  );
}

function truncate(s, n) {
  if (!s) return s;
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}
