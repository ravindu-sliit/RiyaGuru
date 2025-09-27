// backend/controllers/receiptController.js
import Payment from "../models/Payment.js";
import { generateReceipt } from "../utils/pdf.js";  // adjust path if needed
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import Student from "../models/StudentModel.js";
import StudentCourse from "../models/StudentCourse.js";

export const downloadReceipt = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ message: "Payment not found" });
    if (payment.status !== "Approved") {
      return res.status(400).json({ message: "Receipt available only after approval" });
    }

    // Enrich with student and enrollment details
    const studentId = payment.studentName; // we store studentId in studentName
    const student = studentId
      ? await Student.findOne({ studentId }).lean().exec()
      : null;

    // Try to find matching enrollment to get course_id by courseName
    let courseId = null;
    if (studentId) {
      const enrollments = await StudentCourse.find({ student_id: studentId }).lean().exec();
      const norm = (s) => String(s || "").trim().toLowerCase();
      const target = norm(payment.courseName);
      const found = enrollments.find((e) => {
        const cn = norm(e.course_name || e.courseId || e.title);
        return cn === target || cn.includes(target) || target.includes(cn);
      });
      if (found) courseId = found.course_id || found.courseId || null;
    }

    // Prefer existing stored receiptURL if present
    let publicPath = payment.receiptURL;

    // Helper: map public /uploads/... path to filesystem path under backend/
    const toFsPath = (p) => {
      if (!p) return null;
      // If absolute and exists, use it
      if (path.isAbsolute(p) && fs.existsSync(p)) return p;
      // Otherwise treat as public path like /uploads/receipts/...
      const clean = p.replace(/^\/+/, "");
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);
      return path.join(__dirname, "..", clean);
    };

    let fsPath = publicPath ? toFsPath(publicPath) : null;
    if (!fsPath || !fs.existsSync(fsPath)) {
      // Generate new receipt; function returns public path like /uploads/receipts/...
      publicPath = await generateReceipt(payment, { student, courseId });
      payment.receiptURL = publicPath;
      await payment.save();
      fsPath = toFsPath(publicPath);
    }

    if (!fsPath || !fs.existsSync(fsPath)) {
      return res.status(500).json({ message: "Receipt file missing after generation" });
    }

    return res.download(fsPath);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to generate receipt" });
  }
};
