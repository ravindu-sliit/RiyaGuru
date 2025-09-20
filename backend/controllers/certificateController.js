import mongoose from "mongoose";
import crypto from "crypto";
import Certificate from "../models/Certificate.js";
import ProgressTracking from "../models/ProgressTracking.js";
import Student from "../models/StudentModel.js";
import Course from "../models/Course.js";
import { renderCertificatePDF } from "../helpers/certificatePdf.js";

/**
 * Issue a certificate for a student & course
 * Flow:
 *  - Check ProgressTracking (must be Eligible)
 *  - Create Certificate doc (without hash yet)
 *  - Generate real hash
 *  - Render PDF with correct hash
 *  - Save updates (file_url + verification_hash)
 *  - Update ProgressTracking → Issued
 */
export const issueCertificate = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { studentId, courseName } = req.params;

    // 1️⃣ Check progress eligibility
    const tracking = await ProgressTracking.findOne({
      student_id: studentId,
      course_name: courseName,
    }).session(session);

    if (!tracking) {
      return res.status(404).json({ message: "Progress record not found" });
    }
    if (tracking.certificate_status !== "Eligible") {
      return res.status(400).json({ message: "Student not eligible for certificate" });
    }

    // 2️⃣ Gather student + course info
    const student = await Student.findOne({ studentId }).session(session);
    const course = await Course.findOne({ name: courseName }).session(session);
    if (!student || !course) {
      return res.status(404).json({ message: "Student or course not found" });
    }

    // 3️⃣ Create base certificate entry (no placeholder)
    let certificate = new Certificate({
      student_id: studentId,
      course_name: courseName,
      metadata: {
        progress_snapshot: {
          total_lessons: tracking.total_lessons,
          completed_lessons: tracking.completed_lessons,
          progress_percent: tracking.progress_percent,
        },
      },
    });

    // Save once so it gets a certificateId
    await certificate.save({ session });

    // 4️⃣ Generate the real hash using certificateId + issued_at
    const payload = JSON.stringify({
      certificateId: certificate.certificateId,
      student_id: studentId,
      course_name: courseName,
      issued_at: certificate.issued_at,
    });

    const verificationHash = crypto
      .createHash("sha256")
      .update(payload)
      .digest("hex");

    // 5️⃣ Render PDF with the correct hash
    const { filePath } = await renderCertificatePDF({
      certificate: { ...certificate.toObject(), verification_hash: verificationHash },
      student,
      course,
      verifyUrlBase: "https://your-domain.com/api/certificates/verify",
    });

    // 6️⃣ Update certificate with file_url + verification_hash
    certificate.file_url = filePath;
    certificate.verification_hash = verificationHash;
    await certificate.save({ session });

    // 7️⃣ Update progress tracking → Issued
    tracking.certificate_status = "Issued";
    await tracking.save({ session });

    await session.commitTransaction();
    res.json({ message: "Certificate issued", certificate });
  } catch (err) {
    await session.abortTransaction();
    res.status(500).json({ message: "Error issuing certificate", error: err.message });
  } finally {
    session.endSession();
  }
};

/**
 * Verify certificate (public)
 * URL: /api/certificates/verify?id=C001&hash=<sha256>
 */
export const verifyCertificate = async (req, res) => {
  try {
    const { id, hash } = req.query;
    const cert = await Certificate.findOne({ certificateId: id, status: "Active" });

    if (!cert) {
      return res.status(404).json({ valid: false, message: "Certificate not found" });
    }

    const valid = cert.verification_hash === hash;
    res.json({
      valid,
      certificateId: cert.certificateId,
      student_id: cert.student_id,
      course_name: cert.course_name,
      issued_at: cert.issued_at,
    });
  } catch (err) {
    res.status(500).json({ message: "Error verifying certificate", error: err.message });
  }
};

/**
 * Revoke a certificate (e.g., admin action)
 */
export const revokeCertificate = async (req, res) => {
  try {
    const { certificateId } = req.params;
    const cert = await Certificate.findOneAndUpdate(
      { certificateId },
      { status: "Revoked" },
      { new: true }
    );

    if (!cert) {
      return res.status(404).json({ message: "Certificate not found" });
    }

    res.json({ message: "Certificate revoked", certificate: cert });
  } catch (err) {
    res.status(500).json({ message: "Error revoking certificate", error: err.message });
  }
};
