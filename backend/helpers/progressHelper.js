// helpers/progressHelper.js
import ProgressTracking from "../models/ProgressTracking.js";
import LessonProgress from "../models/LessonProgress.js";
import Course from "../models/Course.js";

export const updateProgress = async (studentId, courseName) => {
  // 1️⃣ Find the course (e.g., Car, Motorcycle)
  const course = await Course.findOne({ name: courseName });
  if (!course) throw new Error("Course not found");

  const totalLessons = course.totalLessons;

  // 2️⃣ Count completed lessons for this student + course
  const completedLessons = await LessonProgress.countDocuments({
    student_id: studentId,
    vehicle_type: courseName,
    status: "Completed",
  });

  // 3️⃣ Find or create a ProgressTracking record
  let progress = await ProgressTracking.findOne({ student_id: studentId, course_name: courseName });
  if (!progress) {
    progress = new ProgressTracking({
      student_id: studentId,
      course_name: courseName,
      total_lessons: totalLessons,
    });
  }

  // 4️⃣ Update values
  progress.completed_lessons = completedLessons;
  progress.progress_percent = Math.round((completedLessons / totalLessons) * 100);
  progress.certificate_status = progress.progress_percent === 100 ? "Eligible" : "NotEligible";
  progress.updated_at = new Date();

  await progress.save();
  return progress;
};
