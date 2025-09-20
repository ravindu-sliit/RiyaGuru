// controllers/reportController.js
import ProgressTracking from "../models/ProgressTracking.js";

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
import LessonProgress from "../models/LessonProgress.js";
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
