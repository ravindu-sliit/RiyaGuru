// controllers/reportController.js
import ProgressTracking from "../models/ProgressTracking.js";
import Certificate from "../models/Certificate.js";
import LessonProgress from "../models/LessonProgress.js";
import StudentCourse from "../models/StudentCourse.js";

// ✅ Completion rate by course
export const getCompletionRates = async (req, res) => {
  try {
    const results = await ProgressTracking.aggregate([
      {
        $group: {
          _id: "$course_name",
          total: { $sum: 1 },
          eligible: {
            $sum: {
              $cond: [{ $eq: ["$certificate_status", "Eligible"] }, 1, 0],
            },
          },
          issued: {
            $sum: {
              $cond: [{ $eq: ["$certificate_status", "Issued"] }, 1, 0],
            },
          },
        },
      },
      {
        $project: {
          course: "$_id",
          total: 1,
          eligibleRate: { $divide: ["$eligible", "$total"] },
          issuedRate: { $divide: ["$issued", "$total"] },
        },
      },
    ]);

    res.json({ completionRates: results });
  } catch (err) {
    res.status(500).json({ message: "Error fetching completion rates", error: err.message });
  }
};

import Course from "../models/Course.js";

// ✅ Avg days to complete course
export const getAverageCompletionTimes = async (req, res) => {
  try {
    const results = await LessonProgress.aggregate([
      { $match: { status: "Completed" } },
      {
        $group: {
          _id: { student: "$student_id", course: "$vehicle_type" },
          firstDate: { $min: "$date" },
          lastDate: { $max: "$date" },
          lessons: { $addToSet: "$lesson_number" },
        },
      },
      {
        $project: {
          course: "$_id.course",
          student: "$_id.student",
          days: {
            $divide: [{ $subtract: ["$lastDate", "$firstDate"] }, 1000 * 60 * 60 * 24],
          },
          completedLessons: { $size: "$lessons" },
        },
      },
    ]);

    res.json({ averageCompletionTimes: results });
  } catch (err) {
    res.status(500).json({ message: "Error fetching avg completion times", error: err.message });
  }
};
// ✅ Instructor performance

export const getInstructorPerformance = async (req, res) => {
  try {
    const results = await LessonProgress.aggregate([
      { $match: { status: "Completed" } },
      {
        $group: {
          _id: "$instructor_id",
          completedLessons: { $sum: 1 },
          uniqueStudents: { $addToSet: "$student_id" },
        },
      },
      {
        $project: {
          instructor: "$_id",
          completedLessons: 1,
          studentCount: { $size: "$uniqueStudents" },
        },
      },
      { $sort: { completedLessons: -1 } },
    ]);

    res.json({ instructorPerformance: results });
  } catch (err) {
    res.status(500).json({ message: "Error fetching instructor performance", error: err.message });
  }
};

// ✅ Student progress summary (all courses + certificates)
export const getStudentSummary = async (req, res) => {
  try {
    const { studentId } = req.params;

    // 1️⃣ Get all active enrollments
    const enrollments = await StudentCourse.find({ student_id: studentId, status: "Active" });

    if (!enrollments || enrollments.length === 0) {
      return res.status(404).json({ message: "No active enrollments found for this student" });
    }

    // 2️⃣ Build course summary
    const courses = await Promise.all(
      enrollments.map(async (enrollment) => {
        const courseName = enrollment.course_id;

        // Progress record if available
        const progress = await ProgressTracking.findOne({
          student_id: studentId,
          course_name: courseName,
        });

        // Certificate if available
        const cert = await Certificate.findOne({
          student_id: studentId,
          course_name: courseName,
          status: "Active",
        });

        // Last lesson if available
        const lastLesson = await LessonProgress.findOne({
          student_id: studentId,
          vehicle_type: courseName,
        }).sort({ date: -1 });

        return {
          course_name: courseName,
          total_lessons: progress ? progress.total_lessons : null,
          completed_lessons: progress ? progress.completed_lessons : 0,
          progress_percent: progress ? progress.progress_percent : 0,
          certificate_status: progress ? progress.certificate_status : "NotEligible",
          certificateId: cert ? cert.certificateId : null,
          certificate_file: cert ? cert.file_url : null,
          last_lesson: lastLesson
            ? {
                lesson_number: lastLesson.lesson_number,
                date: lastLesson.date,
                feedback: lastLesson.feedback,
              }
            : null,
        };
      })
    );

    // 3️⃣ Return student summary
    res.json({
      student_id: studentId,
      courses,
    });
  } catch (err) {
    console.error("Error fetching student summary:", err);
    res.status(500).json({ message: "Error fetching student summary", error: err.message });
  }
};