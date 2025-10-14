import Student from "../models/StudentModel.js";
import StudentCourse from "../models/StudentCourse.js";
import ProgressTracking from "../models/ProgressTracking.js";
import LessonProgress from "../models/LessonProgress.js";
import { generateStudentProgressPDF } from "../helpers/studentProgressPdf.js";
import { sendStudentReportEmail } from "../utils/sendReportEmail.js";

export const generateAndEmailStudentReport = async (req, res) => {
  try {
    // studentId should come from auth token (protect middleware sets req.user) or param
    const studentId = req.user?.userId || req.params.studentId;
    if (!studentId) return res.status(400).json({ message: "Student ID missing" });

    const student = await Student.findOne({ studentId });
    if (!student) return res.status(404).json({ message: "Student not found" });

    // Get courses (active enrollments)
    const enrollments = await StudentCourse.find({ student_id: studentId, status: "Active" });
    const courses = await Promise.all(
      enrollments.map(async (en) => {
        const progress = await ProgressTracking.findOne({ student_id: studentId, course_name: en.course_id });
        const cert = progress && progress.certificateId ? { certificateId: progress.certificateId } : null;
        return {
          course_name: en.course_id,
          total_lessons: progress?.total_lessons || null,
          completed_lessons: progress?.completed_lessons || 0,
          progress_percent: progress?.progress_percent || 0,
          certificateId: cert?.certificateId || null,
        };
      })
    );

    // For each course, fetch completed lessons
    const lessonsByCourse = {};
    for (const c of courses) {
      const lessons = await LessonProgress.find({ student_id: studentId, vehicle_type: c.course_name, status: "Completed" }).sort({ lesson_number: 1 });
      lessonsByCourse[c.course_name] = lessons.map((l) => ({ lesson_number: l.lesson_number, date: l.date, instructor_id: l.instructor_id, feedback: l.feedback }));
    }

    // Generate PDF
    const filePath = await generateStudentProgressPDF({ student, courses, lessonsByCourse });

  // Send email (may return { previewUrl } for ethereal)
  const result = await sendStudentReportEmail(student.email, student, filePath);

  const resp = { message: "Report generated and emailed", filePath };
  if (result?.previewUrl) resp.previewUrl = result.previewUrl;

  return res.json(resp);
  } catch (err) {
    console.error("Failed to generate/email report:", err);
    return res.status(500).json({ message: "Failed to generate/email report", error: err.message });
  }
};
