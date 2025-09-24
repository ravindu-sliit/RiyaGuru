// controllers/reportController.js
export const studentGenerateCertificate = async (req, res) => {
  try {
    const { studentId, courseName } = req.params;

    // 🔎 Check progress
    const tracking = await ProgressTracking.findOne({
      student_id: studentId,
      course_name: courseName,
    });

    if (!tracking) {
      return res.status(404).json({ message: "Progress not found" });
    }

    // 🚫 Not eligible yet
    if (!["Eligible", "Issued"].includes(tracking.certificate_status)) {
      return res.status(400).json({ message: "Student not yet eligible" });
    }

    // 👀 Already has certificate → return it
    let cert = await Certificate.findOne({
      student_id: studentId,
      course_name: courseName,
      status: "Active",
    });

    if (cert && cert.file_url) {
      return res.json({ message: "Certificate already available", certificate: cert });
    }

    // 🆕 No cert but eligible → generate one
    const student = await Student.findOne({ studentId });
    const course = await Course.findOne({ name: courseName });

    if (!student || !course) {
      return res.status(404).json({ message: "Student or course not found" });
    }

    // Create cert entry
    cert = new Certificate({
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
    await cert.save();

    // Hash + PDF
    const payload = JSON.stringify({
      certificateId: cert.certificateId,
      student_id: studentId,
      course_name: courseName,
      issued_at: cert.issued_at,
    });
    const hash = crypto.createHash("sha256").update(payload).digest("hex");

    const { filePath } = await renderCertificatePDF({
      certificate: { ...cert.toObject(), verification_hash: hash },
      student,
      course,
      verifyUrlBase: "https://your-domain.com/api/certificates/verify",
    });

    cert.verification_hash = hash;
    cert.file_url = filePath;
    await cert.save();

    // 🚀 Mark progress as "Issued"
    tracking.certificate_status = "Issued";
    await tracking.save();

    return res.json({ message: "Certificate generated", certificate: cert });
  } catch (err) {
    console.error("Error generating certificate:", err);
    res.status(500).json({ message: "Error generating certificate", error: err.message });
  }
};
